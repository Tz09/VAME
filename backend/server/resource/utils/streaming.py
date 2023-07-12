import cv2
import torch
import time
import os
import numpy as np
import torch.backends.cudnn as cudnn
from datetime import datetime
from threading import Thread,Lock
from server.ai.models.experimental import attempt_load
from server.ai.utils.general import check_img_size,non_max_suppression,scale_coords
from server.ai.utils.datasets import letterbox
from server.ai.utils.plots import plot_one_box
from server.ai.utils.torch_utils import select_device
from server import app
from server.service.models import db,Image,setting

class StreamingThread:
    def __init__(self,dataset):
        self.device = select_device('cuda' if torch.cuda.is_available() else 'cpu')
        self.img_size = setting["ai"]["img_size"]
        self.iou_thres = setting["ai"]["iou_thres"]
        self.conf_thres = setting["ai"]["conf_thres"]
        self.model = attempt_load(setting["ai"]["weight_file"],map_location=self.device)
        self.stride = int(self.model.stride.max())
        self.imgsz = check_img_size(self.img_size, s=self.stride)  # check img_size
        self.image_path = setting["image_file"]
        self.names = self.model.module.names if hasattr(self.model, 'module') else self.model.names
        self.names.extend(['violated','obstacle'])
        # ['chair', 'people', 'white shoe', 'violated','obstacle]
        self.colors = [[0, 165, 255],[79,185,72],[0,128,255],[0,0,255],[255,128,0]]
        self.roi=[]
        self.roi_lock = Lock()
        self.processed_frame = None
        self.dataset = dataset
        self.stopped = False
        self.t = Thread(target=self.generate, args=())
        self.t.daemon = True

    def generate(self):
        self.violated_crop_flag,self.obstacle_crop_flag = True,True
        violated_last_crop_time,obstacle_last_crop_time = time.time(),time.time()
        while True:
            current_time = time.time()
            if current_time - violated_last_crop_time >= setting["ai"]["time"]:
                self.violated_crop_flag = True
                violated_last_crop_time = current_time
            if current_time - obstacle_last_crop_time >= setting["ai"]["time"]:
                self.obstacle_crop_flag = True
                obstacle_last_crop_time = current_time

            if self.dataset.stopped == False:
                self.processed_frame = self.detect()
            else:
                break

    def detect(self):
        with self.roi_lock:
            roi = self.roi

        with torch.no_grad():
            cudnn.benchmark = True
            half = False
            
            if self.device.type != 'cpu':
                self.model(torch.zeros(1, 3, self.imgsz, self.imgsz).to(self.device).type_as(next(self.model.parameters())))  # run once
            
            old_img_w = old_img_h = self.img_size
            old_img_b = 1
            
            for path,img,im0s,vid_cap in self.dataset:
                img = torch.from_numpy(img).to(self.device)
                img = img.half() if half else img.float()  # uint8 to fp16/32
                img /= 255.0  # 0 - 255 to 0.0 - 1.0
                if img.ndimension() == 3:
                    img = img.unsqueeze(0)

                # Warmup
                if self.device.type != 'cpu' and (old_img_b != img.shape[0] or old_img_h != img.shape[2] or old_img_w != img.shape[3]):
                    old_img_b = img.shape[0]
                    old_img_h = img.shape[2]
                    old_img_w = img.shape[3]

                # Inference
                with torch.no_grad():   # Calculating gradients would cause a GPU memory leak
                    pred = self.model(img)[0]

                pred = non_max_suppression(pred, self.conf_thres, self.iou_thres)
                for i, det in enumerate(pred):  # detections per image
                    s, im0 = '', im0s[i].copy()
            
                    num_people = 0
                    num_violated = 0
                    num_obstacle = 0

                    if len(det):
                        # Rescale boxes from img_size to im0 size
                        det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0.shape).round()
                        arr_det = det.cpu().numpy()
                        
                        # Get People and White Shoe Array
                        object = arr_det[(np.where(arr_det[:,-1] == 0))]
                        people = arr_det[(np.where(arr_det[:,-1] == 1))]
                        white_shoe = arr_det[(np.where(arr_det[:,-1] == 2))]

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
                            inside_x = np.logical_or(np.logical_and(object[:,0] >= roi[0], object[:,0] <= roi[2]), np.logical_and(object[:,2] >= roi[0], object[:,2] <= roi[2]))
                            inside_y = np.logical_or(np.logical_and(object[:,1] >= roi[1], object[:,1] <= roi[3]), np.logical_and(object[:,3] >= roi[1], object[:,3] <= roi[3]))
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
                            s += f"{n} {self.names[int(c)]}{'s' * (n > 1)}, "  # add to string

                        if (len(violated_image) > 0 or len(obstacle_image) > 0):
                            violated_img_paths = []
                            obstacle_img_paths = []
                            dt = datetime.now()
                            year = str(dt.year)
                            month = str(dt.month).zfill(2)
                            day = str(dt.day).zfill(2)
                            str_dt = dt.strftime("%d%m%Y%H%M%S")

                            violated_det = torch.from_numpy(violated_image)
                            obstacle_det = torch.from_numpy(obstacle_image)

                            if self.violated_crop_flag and len(violated_det) > 0:
                                self.violated_crop_flag = False
                                violated_image_dir = os.path.join(self.image_path, year, month, day,'violated')
                                if not os.path.exists(violated_image_dir):
                                    os.makedirs(violated_image_dir)
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

                            if self.obstacle_crop_flag and len(obstacle_det) > 0:
                                self.obstacle_crop_flag = False
                                obstacle_image_dir = os.path.join(self.image_path, year, month, day,'obstacle')
                                if not os.path.exists(obstacle_image_dir):
                                    os.makedirs(obstacle_image_dir)
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
                            label = f'{self.names[int(cls)]} {conf:.2f}'
                            plot_one_box(xyxy, im0, label=label, color=self.colors[int(cls)], line_thickness=1)

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
        
    def change_roi(self,roi):
        self.roi = roi
    
    def start(self):
        self.stopped=False
        self.t.start()

    def stop(self):
        self.stopped = True 

    def get_processed_frame(self):
        return self.processed_frame

    