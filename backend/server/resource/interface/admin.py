from flask import jsonify,make_response,session,request
from flask_restful import Resource
from server.service.models import User,db

url = [('Admin','/admin')]

class Admin(Resource):
    def get(self):
        user_id = session.get("userid")

        if not user_id:
            status_code = 401
            data = {"error":user_id}
            response = make_response(jsonify(data),status_code)
            return response
        else:
            user = User.query.filter_by(id=user_id).first()
            is_admin=False
            if user and user.is_admin:
                is_admin = True
            
            if is_admin:
                return jsonify({
                    "message":"True"
                })
            else:
                return jsonify({
                    "message":"False"
                })
    
    