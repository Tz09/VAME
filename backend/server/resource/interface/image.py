from flask import request,jsonify,make_response
from flask_restful import Resource
from server.service.models import db,Image
from server.service.flask_extension import ma
import base64
import os
import json
url = [('Image','/image')]

class ImageInfoSchema(ma.Schema):
    class Meta:
        fields = ('time','img_paths')

image_info_schema = ImageInfoSchema(many=True)

class Image(Resource):
    def post(self):
        img_path = request.json.get('img_path')
        image_data = []
        if img_path != None:
            i = 0
            for image in img_path:
                image_path = f'{image}'
                if not os.path.exists(image_path):
                    image_data.append({'error': 'Image not found'})
                    continue
                with open(image_path, 'rb') as f:
                    image_data.append({'id': i, 'data': base64.b64encode(f.read()).decode('utf-8')})
                i+=1
            return jsonify({'images': image_data})
