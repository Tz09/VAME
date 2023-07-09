import cv2
import torch
import time
import os
import numpy as np
import threading
import torch.backends.cudnn as cudnn
from datetime import datetime
from flask_restful import Resource
from flask import Response,request,jsonify
from server.ai.models.experimental import attempt_load
from server.ai.utils.general import check_img_size,non_max_suppression,scale_coords
from server.ai.utils.datasets import letterbox,LoadStreams
from server.ai.utils.plots import plot_one_box
from server.ai.utils.torch_utils import select_device
from server.service.models import db,Image,setting
from server.resource.utils.streaming import StreamingThread

url = [('Streaming','/streaming')]
dataset = LoadStreams(sources=setting["ai"]["source"], img_size=setting["ai"]["img_size"])
streaming = StreamingThread(dataset)
streaming.start()

def get_frame():
    while True:
        processed_frame = streaming.get_processed_frame()
        if processed_frame is None:
            continue
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
class Streaming(Resource):
    def get(self):
        return Response(get_frame(),
                        mimetype='multipart/x-mixed-replace; boundary=frame')
    
    def post(self):
        global dataset, streaming
        data = request.get_json()
        if 'camera' in data:
            if dataset is not None and not dataset.stopped:
                dataset.stop()
                streaming.stop()
                dataset = None
                streaming = None
                return jsonify({'message': 'Stopped'})
            else:
                dataset = LoadStreams(sources=setting["ai"]["source"], img_size=setting["ai"]["img_size"])
                streaming = StreamingThread(dataset)
                streaming.start()
                return jsonify({'message': 'Started'})
        elif 'roi' in data:
            roi_coordinates = request.json.get('roi')
            if streaming is not None:
                streaming.change_roi(roi_coordinates)
                return jsonify({'message': 'Variables updated'})