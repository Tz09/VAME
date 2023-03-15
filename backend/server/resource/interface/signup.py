from flask import request,jsonify,make_response
from flask_restful import Resource
from server import bcrpyt
from server.service.models import db,User

url = [('Signup','/signup')]

class Signup(Resource):
    def get(self):
        return "Register Active"

    def post(self):
        json = request.get_json()
        username = json.get("username")
        password = json.get("password")
        
        if username.strip() == "":
            status_code = 401
            data = {"message":"Invalid username value."}
            response = make_response(jsonify(data),status_code)
            return response
        
        if password.strip() == "":
            status_code = 401
            data = {"message":"Invalid password."}
            response = make_response(jsonify(data),status_code)
            return response
  
        user_exists = User.query.filter_by(username=username).first() is not None
 
        if user_exists:
            status_code = 401
            data = {"message":"User already exists."}
            response = make_response(jsonify(data),status_code)
            return response
        else:
            hashed_password = bcrpyt.generate_password_hash(password).decode('utf-8')
            new_user = User(username=username,password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return jsonify({
                "username":new_user.username,
                "password": new_user.password
            })