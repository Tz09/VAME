import base64
import os
from flask import request,jsonify
from flask_restful import Resource
from datetime import datetime
from server.service.flask_extension import ma

url = [('Image','/image')]

class ImageInfoSchema(ma.Schema):
    class Meta:
        fields = ('time','img_paths')

image_info_schema = ImageInfoSchema(many=True)

class Image(Resource):
    def post(self):
        img_paths = request.json.get('img_path')
        violated_image_paths = img_paths[0]
        obstacle_image_paths = img_paths[1]
        violated_image_data = []
        obstacle_image_data = []
        if violated_image_paths != None:
            i = 0
            for path in violated_image_paths:
                image_path = f'{path}'
                date_str = (os.path.splitext(os.path.basename(image_path))[0]).split("_")[0]
                dt = datetime.strptime(date_str,"%d%m%Y%H%M%S")
                time_12h = dt.strftime("%I.%M%p").lower()
                if not os.path.exists(image_path):
                    violated_image_data.append({'error': 'Image not found','time':time_12h})
                    continue
                with open(image_path, 'rb') as f:
                    violated_image_data.append({'id': i, 'data': base64.b64encode(f.read()).decode('utf-8'),'time':time_12h})
                i+=1
        if obstacle_image_paths != None:
            i = 0
            for path in obstacle_image_paths:
                image_path = f'{path}'
                date_str = (os.path.splitext(os.path.basename(image_path))[0]).split("_")[0]
                dt = datetime.strptime(date_str,"%d%m%Y%H%M%S")
                time_12h = dt.strftime("%I.%M%p").lower()
                if not os.path.exists(image_path):
                    obstacle_image_data.append({'error': 'Image not found','time':time_12h})
                    continue
                with open(image_path, 'rb') as f:
                    obstacle_image_data.append({'id': i, 'data': base64.b64encode(f.read()).decode('utf-8'),'time':time_12h})
                i+=1

        return jsonify({'violated_images': violated_image_data},{'obstacle_images':obstacle_image_data})
