from flask import request,jsonify
from flask_restful import Resource
from server.service.models import db,Image
from sqlalchemy import func
from datetime import datetime

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
        violated_image_paths = []
        obstacle_images_paths = []
        for row in rows:
            if row.violated_img_paths != None:
                violated_image_paths.extend(row.violated_img_paths)
            if row.obstacle_img_paths != None:
                obstacle_images_paths.extend(row.obstacle_img_paths)
        return jsonify(violated_image_paths,obstacle_images_paths)