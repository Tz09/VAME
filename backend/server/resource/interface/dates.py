from flask import request,jsonify,make_response
from flask_restful import Resource
from server.service.models import db,Image
from server.service.flask_extension import ma
import base64
import os
from sqlalchemy import func
from datetime import datetime
import json
url = [('Dates','/dates')]

class Dates(Resource):
    def get(self):
        dates = db.session.query(func.date(Image.time)).distinct().all()
        result = [d[0].strftime('%Y-%m-%d') for d in dates]
        return jsonify(result)
    
    def post(self):
        date_str = request.json.get('date')
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        rows = Image.query.filter(func.date(Image.time) == date).all()
        image_paths = []
        for row in rows:
            image_paths.extend(row.img_paths)
        return jsonify(image_paths)