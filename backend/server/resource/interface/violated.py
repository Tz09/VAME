from flask import request,jsonify
from flask_restful import Resource
from server.service.models import db,Image
from sqlalchemy import func
from datetime import date

url = [('Violated','/violated')]

class Violated(Resource):
    def get(self):
        # Get the current date
        today = date.today()
        # Count the rows with violated_img_paths for today
        count = Image.query.filter(Image.time >= today, Image.violated_img_paths != None).count()
        return jsonify(count)
    