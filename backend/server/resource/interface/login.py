from flask import request,jsonify,make_response,session
from flask_restful import Resource
from server.service.models import User
from server.service.flask_extension import bcrpyt

url = [('Login','/login')]
 
class Login(Resource):

    def get(self):
        user_id = session.get("userid")

        if not user_id:
            status_code = 401
            data = {"error":user_id}
            response = make_response(jsonify(data),status_code)
            return response
        else:
            user = User.query.filter_by(id=user_id).first()
            return jsonify({
                "id":user.id,
                "username":user.username
            })
        
    def post(self):
        json = request.get_json()
        username = json.get("username")
        password = json.get("password")

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
            session["userid"] = user.id
            data = {
                "id":user.id,
                "username":user.username
            }
            response = jsonify(data)
            return response
        