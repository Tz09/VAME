import shutil
import os
from flask import request,jsonify
from flask_restful import Resource
from server.service.models import db,Image
from sqlalchemy import func
from datetime import datetime
from server.service.models import setting

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

    def delete(self):
        dates = request.json.get('date')
        target_dates = [datetime.strptime(date_str, '%Y-%m-%d').date() for date_str in dates]
        rows_to_delete = Image.query.filter(Image.time.cast(db.Date).in_(target_dates)).all()
        if rows_to_delete:
            for row in rows_to_delete:
                db.session.delete(row)

            # Commit the changes to the database
            db.session.commit()
            image_path = setting["image_file"]
            for date in target_dates:
                year = date.strftime('%Y')
                month = date.strftime('%m')
                day = date.strftime('%d')
                folder_path =os.path.join(image_path, year,month,day)
                if os.path.exists(folder_path):
                    shutil.rmtree(folder_path)
                else:
                    pass

            return jsonify({"message":"Remove Successful."})
        else:
            return jsonify({"message":"No Data Found."})