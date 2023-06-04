from flask import jsonify
from flask_restful import Resource
from server.service.models import Image
from datetime import date

url = [('Obstacle','/obstacle')]

class Obstacle(Resource):
    def get(self):
        # Get the current date
        today = date.today()
        # Count the rows with violated_img_paths for today
        count = Image.query.filter(Image.time >= today, Image.obstacle_img_paths != None).count()
        return jsonify(count)
    