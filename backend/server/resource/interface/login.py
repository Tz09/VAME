from flask import request,jsonify,make_response
from flask_restful import Resource
from server.service.models import User
from server.service.flask_extension import bcrpyt
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required

url = [('Login','/login')]
 
class Login(Resource):
    
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return jsonify(logged_in_as=current_user)

    def post(self):
        username = request.json["username"]
        password = request.json["password"]

        user = User.query.filter_by(username=username).first()

        if user is None:
            data = {"message":"Username Not Found."}
            status_code = 401
            response = make_response(jsonify(data),status_code)
            return response
        elif not bcrpyt.check_password_hash(user.password,password):
            data = {"message":"Wrong Password."}
            status_code = 401
            response = make_response(jsonify(data),status_code)
            return response
        else:
            access_token = create_access_token(identity=username)
            response = {"access_token":access_token}
            return jsonify(response)