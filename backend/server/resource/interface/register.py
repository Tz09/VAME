from server import bcrpyt
from flask import request,abort,jsonify
from flask_restful import Resource
from server.service.models import db,User

url = [('Register','/register')]

class Register(Resource):
    def get(self):
        return "Register Active"

    def post(self):
        username = request.json["username"]
        password = request.json["password"]

        user_exists = User.query.filter_by(username=username).first() is not None

        if user_exists:
            return jsonify({"error":"User already exists"})
        
        hashed_password = bcrpyt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username,password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "username":new_user.username,
            "password": new_user.password
        })