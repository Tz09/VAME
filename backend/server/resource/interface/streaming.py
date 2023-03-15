import cv2
import yolov7
from flask_restful import Resource
from flask import Response

url = [('Streaming','/streaming')]
 
cap = cv2.VideoCapture(0)
model = yolov7.load_model()
def gen_frames():
    while True:
        success,frame = cap.read()
        if not success:
            break
        else:
            ret,buffer = cv2.imencode('.jpg',frame)
            frame=buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

class Streaming(Resource):
    def get(self):
        return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
