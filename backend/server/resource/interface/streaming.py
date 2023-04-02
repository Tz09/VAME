import cv2
import torch
import yaml
import time
import numpy as np
from flask_restful import Resource
from flask import Response
from numpy import random
from ai.models.experimental import attempt_load
from ai.utils.general import check_img_size,non_max_suppression,scale_coords
from ai.utils.datasets import letterbox
from ai.utils.plots import plot_one_box
from ai.utils.torch_utils import select_device

url = [('Streaming','/streaming')]
 
cap = cv2.VideoCapture(0)

with open('setting.yaml') as f:
    setting = yaml.safe_load(f)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
device = select_device(device)
img_size = setting["ai"]["img_size"]
iou_thres = setting["ai"]["iou_thres"]
conf_thres = setting["ai"]["conf_thres"]

with torch.no_grad():
    model = attempt_load(setting["ai"]["weight_file"],map_location=device)

def detect(image):

    stride = int(model.stride.max())  # model stride
    imgsz = check_img_size(img_size, s=stride)  # check img_size
    half = device.type != 'cpu'

    # Run inference
    if device.type != 'cpu':
        model(torch.zeros(1, 3, imgsz, imgsz).to(device).type_as(next(model.parameters())))  # run once

    # Append
    # img0s = cv2.imread(image)
    startTime = 0
    img0s = image
    img = letterbox(img0s,img_size,stride=stride)[0]

    # Convert
    img = img[:,:,::-1].transpose(2,0,1)
    img = np.ascontiguousarray(img)

    # Append New Label 
    names = model.module.names if hasattr(model, 'module') else model.names
    names.append('violated')
    colors = [[random.randint(0, 255) for _ in range(3)] for _ in names]

    img = torch.from_numpy(img).to(device)
    img = img.half() if half else img.float()  # uint8 to fp16/32
    img /= 255.0  # 0 - 255 to 0.0 - 1.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)
    
    # Inference
    with torch.no_grad():   # Calculating gradients would cause a GPU memory leak
        pred = model(img)[0]

    pred = non_max_suppression(pred, conf_thres, iou_thres)

    for i, det in enumerate(pred):  # detections per image
        s, im0 = '', img0s
        gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
        num_people = 0
        num_violated = 0
        if len(det):

            # Rescale boxes from img_size to im0 size
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0.shape).round()
            arr_det = det.cpu().numpy()
            
            # Get People and White Shoe Array
            people = arr_det[(np.where(arr_det[:,-1] == 0))]
            num_people = len(people)
            white_shoe = arr_det[(np.where(arr_det[:,-1] == 1))]
            # Loop through people 
            for i in people:
                for j in white_shoe:
                    # White Shoe Top Left X coordinate is smaller than People Top Left X Coordinate and Larger than People Btm Right Coordinate
                    if j[0] > i[0] and j[0] < i[2]:
                        if j[1] > i[1] and j[1] < i[3]:
                            i[5] = 2.0
                            num_violated += 1
                            break

            relabel_det = torch.from_numpy(np.array(np.concatenate((people,white_shoe))))

            for c in relabel_det[:, -1].unique():
                n = (relabel_det[:, -1] == c).sum()  # detections per class
                s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

            # Write results
            for *xyxy, conf, cls in reversed(relabel_det):
                label = f'{names[int(cls)]} {conf:.2f}'
                plot_one_box(xyxy, im0, label=label, color=colors[int(cls)], line_thickness=1)

        text1 = "People Detected: {}".format(num_people)
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        thickness = 2
        text_size1, _ = cv2.getTextSize(text1,font,font_scale,thickness)
        text_x1 = im0.shape[1] - text_size1[0] - 10  # 10 pixels from the right edge
        text_y1 = text_size1[1] + 10

        text2 = "Violated Detected: {}".format(num_violated)
        text_size2,_ = cv2.getTextSize(text2,font,font_scale,thickness)
        text_x2 = im0.shape[1] - text_size2[0] - 10  # 10 pixels from the right edge
        text_y2 = text_y1 + text_size1[1] + 10

        cv2.putText(im0, text1, (text_x1, text_y1), font, font_scale, (0, 255, 0), thickness)
        cv2.putText(im0,text2, (text_x2, text_y2), font, font_scale, (0, 0,255), thickness)

        # currentTime = time.time()
        # print(currentTime)
        # fps = 1/(currentTime-startTime)
        # startTime = currentTime
        # cv2.putText(im0,"FPS: " + str(int(fps)), (20,70), cv2.FONT_HERSHEY_PLAIN,2,(0,255,0),(2))
                    
    return im0

def gen_frames():
    count=0
    while True:
        success,frame = cap.read()
        if not success:
            break
        else:
            count +=1
            if count % 6 == 0:
                result = detect(frame)
                ret,buffer = cv2.imencode('.png',result)
                frame = buffer.tobytes()
                count=0
            # else:
            #     ret,buffer = cv2.imencode('.png',frame)
            #     frame = buffer.tobytes()
                yield (b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

class Streaming(Resource):
    def get(self):
        return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
        
    
    
