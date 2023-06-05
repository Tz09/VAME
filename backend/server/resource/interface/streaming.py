import cv2
import torch
import yaml
import time
import os
import numpy as np
import torch.backends.cudnn as cudnn
from datetime import datetime
from flask_restful import Resource
from flask import Response,request,jsonify
from ai.models.experimental import attempt_load
from ai.utils.general import check_img_size,non_max_suppression,scale_coords
from ai.utils.datasets import letterbox
from ai.utils.plots import plot_one_box
from ai.utils.torch_utils import select_device
from server import app
from server.service.models import db,Image

url = [('Streaming','/streaming')]
 
with open('setting.yaml') as f:
    setting = yaml.safe_load(f)

# Initialize the model and some variable for model
device = 'cuda' if torch.cuda.is_available() else 'cpu'
device = select_device(device)
img_size = setting["ai"]["img_size"]
iou_thres = setting["ai"]["iou_thres"]
conf_thres = setting["ai"]["conf_thres"]
model = attempt_load(setting["ai"]["weight_file"],map_location=device)
stride = int(model.stride.max())
imgsz = check_img_size(img_size, s=stride)  # check img_size
image_path = setting["image_file"]
# Run inference
if device.type != 'cpu':
    model(torch.zeros(1, 3, imgsz, imgsz).to(device).type_as(next(model.parameters())))  # run once

# Append New Label 
names = model.module.names if hasattr(model, 'module') else model.names
names.extend(['violated','obstacle'])
# ['chair', 'people', 'white shoe', 'violated','obstacle]
colors = [[0, 165, 255],[79,185,72],[0,128,255],[0,0,255],[255,128,0]]

# Initialize the camera and global variable
camera = cv2.VideoCapture(0)
global crop_flag,last_crop_time,switch,roi
crop_flag = True
last_crop_time = time.time()
switch = 1
roi=[]

# Prediction for each frame
def detect(frame):
    global model
    global crop_flag
    global roi
    with torch.no_grad():
        cudnn.benchmark = True
        half = False
           
        # Padded resize
        img = letterbox(frame, img_size,stride)[0]
        # Convert
        img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, to 3x416x416
        img = np.ascontiguousarray(img)

        img = torch.from_numpy(img).to(device)
        img = img.half() if half else img.float()  # uint8 to fp16/32
        img /= 255.0  # 0 - 255 to 0.0 - 1.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)
            
        old_img_w = old_img_h = img_size
        old_img_b = 1
            
        # Warmup
        if device.type != 'cpu' and (old_img_b != img.shape[0] or old_img_h != img.shape[2] or old_img_w != img.shape[3]):
            old_img_b = img.shape[0]
            old_img_h = img.shape[2]
            old_img_w = img.shape[3]

        # Inference
        with torch.no_grad():   # Calculating gradients would cause a GPU memory leak
            pred = model(img)[0]

        pred = non_max_suppression(pred, conf_thres, iou_thres)
        for i, det in enumerate(pred):  # detections per image
            s, im0 = '', frame
        
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
            num_people = 0
            num_violated = 0
            num_obstacle = 0

            if len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0.shape).round()
                arr_det = det.cpu().numpy()
                
                # Get People and White Shoe Array
                people = arr_det[(np.where(arr_det[:,-1] == 1))]
                white_shoe = arr_det[(np.where(arr_det[:,-1] == 2))]
                object = arr_det[(np.where(arr_det[:,-1] == 0))]

                for i in range(len(people)):
                    # find the indices of white shoes that violate the person's boundaries
                    violated_indices = np.where((white_shoe[:, 0] > people[i, 0]) &
                                                (white_shoe[:, 0] < people[i, 2]) &
                                                (white_shoe[:, 1] > people[i, 1]) &
                                                (white_shoe[:, 1] < people[i, 3]))[0]
                    
                    # update the label for the person if there are any violations
                    if len(violated_indices) > 0:
                        people[i,5] = 3.0
                        num_violated += 1

                if len(roi) > 0:
                    roi = np.array(roi)
                    inside_x = np.logical_and(object[:,0] >= roi[0],object[:,2] <= roi[2])
                    inside_y = np.logical_and(object[:,1] >= roi[1],object[:,3] <= roi[3])
                    inside_roi = np.logical_and(inside_x,inside_y)
                    if np.any(inside_roi):
                        object[:,5][inside_roi] = 4.0

                result = np.concatenate([arr for arr in [people, white_shoe, object] if arr.size > 0], axis=0)
                violated_image = result[(result[:,5] == 3)]  
                obstacle_image = result[(result[:,5] == 4)]
                relabel_det = torch.from_numpy(result)

                num_people = len(people)
                num_violated = len(violated_image)
                num_obstacle = len(obstacle_image)

                for c in relabel_det[:, -1].unique():
                    n = (relabel_det[:, -1] == c).sum()  # detections per class
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                if crop_flag and (len(violated_image) > 0 or len(obstacle_image) > 0):
                    crop_flag = False
                    violated_img_paths = []
                    obstacle_img_paths = []
                    dt = datetime.now()
                    year = str(dt.year)
                    month = str(dt.month).zfill(2)
                    day = str(dt.day).zfill(2)
                    violated_image_dir = os.path.join(image_path, year, month, day,'violated')
                    obstacle_image_dir = os.path.join(image_path, year, month, day,'obstacle')
                    if not os.path.exists(violated_image_dir):
                        os.makedirs(violated_image_dir)
                    if not os.path.exists(obstacle_image_dir):
                        os.makedirs(obstacle_image_dir)
                    str_dt = dt.strftime("%d%m%Y%H%M%S")

                    violated_det = torch.from_numpy(violated_image)
                    obstacle_det = torch.from_numpy(obstacle_image)
                    if len(violated_det) > 0:
                        count = 1
                        for *xyxy,conf,cls in violated_det:
                            x,y,w,h=int(xyxy[0]), int(xyxy[1]), int(xyxy[2] - xyxy[0]), int(xyxy[3] - xyxy[1])                   
                            img_ = im0.astype(np.uint8)
                            crop_img=img_[y:y+ h, x:x + w]      
                            crop_img = cv2.resize(crop_img,(480,480))
                            filename=f'{str_dt}_{count}.png'
                            filepath=os.path.join(violated_image_dir, filename)
                            filepath = filepath.replace('\\','/')
                            cv2.imwrite(filepath, crop_img)
                            violated_img_paths.append(filepath)
                            count+=1
                    if len(obstacle_det) > 0:
                        count = 1
                        for *xyxy,conf,cls in obstacle_det:
                            x,y,w,h=int(xyxy[0]), int(xyxy[1]), int(xyxy[2] - xyxy[0]), int(xyxy[3] - xyxy[1])                   
                            img_ = im0.astype(np.uint8)
                            crop_img=img_[y:y+ h, x:x + w]      
                            crop_img = cv2.resize(crop_img,(480,480))
                            filename=f'{str_dt}_{count}.png'
                            filepath=os.path.join(obstacle_image_dir, filename)
                            filepath = filepath.replace('\\','/')
                            cv2.imwrite(filepath, crop_img)
                            obstacle_img_paths.append(filepath)
                            count+=1
                    with app.app_context():
                        # Store time and image_path into database
                        if not obstacle_img_paths:
                            obstacle_img_paths = None
                        if not violated_img_paths:
                            violated_img_paths = None
                        new_image = Image(time=dt,violated_img_paths=violated_img_paths,obstacle_img_paths=obstacle_img_paths)
                        db.session.add(new_image)
                        db.session.commit()

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
            cv2.putText(im0,text1, (text_x1, text_y1), font, font_scale, (0, 255, 0), thickness)
            cv2.putText(im0,text2, (text_x2, text_y2), font, font_scale, (0, 0,255), thickness)

            text3 = "Obstacle Detected: {}".format(num_obstacle)
            text_size3,_ = cv2.getTextSize(text3,font,font_scale,thickness)
            text_x3 = im0.shape[1] - text_size3[0] - 10  # 10 pixels from the right edge
            text_y3 = text_y2 + text_size2[1] + 10
            cv2.putText(im0,text1, (text_x1, text_y1), font, font_scale, (0, 255, 0), thickness)
            cv2.putText(im0,text2, (text_x2, text_y2), font, font_scale, (0, 0,255), thickness)
            cv2.putText(im0,text3,(text_x3, text_y3), font, font_scale, (255, 0,0), thickness)
            if (len(roi) > 0):
                cv2.rectangle(im0,(roi[0],roi[1]),(roi[2],roi[3]),(0,255,0),1)
        return im0
    
def gen_frames():
    global crop_flag,last_crop_time
    while True:
        success,frame = camera.read()
        if success:
            current_time = time.time()
            if current_time - last_crop_time >= 60:
                crop_flag = True
                last_crop_time = current_time
            frame = detect(frame)
            try:
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            except Exception as e:
                pass
        else:
            pass

class Streaming(Resource):
    def get(self):
        return Response(gen_frames(),
                        mimetype='multipart/x-mixed-replace; boundary=frame')
    
    def post(self):
        global switch,camera,roi
        data = request.get_json()
        if 'camera' in data:
            if(switch==1):
                switch=0
                camera.release()
                cv2.destroyAllWindows()
            else:
                camera = cv2.VideoCapture(0)
                switch=1
        elif 'roi' in data:
            roi_coordinates = request.json.get('roi')
            roi = roi_coordinates
            # Bounding Box Reset
            if roi == [None,None,None,None]:
                roi = []
        return jsonify({'message': 'Variables updated'})