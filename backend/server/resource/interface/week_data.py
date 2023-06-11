from flask import jsonify
from flask_restful import Resource
from server.service.models import db,Image
from sqlalchemy import func
from datetime import datetime, timedelta

url = [('Week_data','/week_data')]

class Week_data(Resource):
    def get(self):
        today = datetime.now().date()
        start_of_week = today - timedelta(days=today.weekday())

        weekly_data = (
            db.session.query(
                func.trim(func.to_char(Image.time, 'Day')).label('day'),  # Get the day name and remove empty spaces
                func.count(func.nullif(Image.violated_img_paths, None)).label('violated'),   # Count the non-null violated_img_paths
                func.count(func.nullif(Image.obstacle_img_paths, None)).label('obstacle')    # Count the non-null obstacle_img_paths
            )
            .filter(Image.time >= start_of_week)
            .group_by(func.to_char(Image.time, 'Day'))
            .all()
        )
        
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_data_structure = []

        weekly_data_dict = {day: {'name': day, 'violated': 0, 'obstacle': 0} for day in days_of_week}

        for row in weekly_data:
            day = row.day
            weekly_data_dict[day] = {'name': day, 'violated': row.violated, 'obstacle': row.obstacle}

        weekly_data_structure = list(weekly_data_dict.values())

        return jsonify(weekly_data_structure)