from flask import Blueprint, request, jsonify
from app import db
from models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta
from flask_cors import cross_origin
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@cross_origin(origins="http://192.168.1.75:5000")
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required.'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists.'}), 409
    
    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully.'}), 201

@auth_bp.route('/login', methods=['POST'])
@cross_origin(origins="http://192.168.1.75:5000")  # Update this to match your client's origin
def login():
    print("Login route accessed")
    print(f"Request method: {request.method}")
    print(f"Request headers: {request.headers}")
    print(f"Request data: {request.data}")
   
    try:
        data = request.get_json()
        print(f"Parsed JSON data: {data}")
       
        if not data:
            print("No JSON data received")
            return jsonify({'message': 'No data received', 'error': 'missing_data'}), 400
       
        username = data.get('username')
        password = data.get('password')
        print(f"Username received: {username}")
        print(f"Password received: {'*' * len(password) if password else None}")
       
        if not username or not password:
            print(f"Missing username or password. Received keys: {data.keys()}")
            return jsonify({'message': 'Username and password are required.', 'error': 'missing_credentials'}), 400
       
        user = User.query.filter_by(username=username).first()
       
        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=1))
            response = jsonify({'access_token': access_token, 'username': user.username})
            print(f"Successful login. Response: {response.data}")
            return response, 200
        elif user:
            print("Incorrect password")
            return jsonify({'message': 'Invalid credentials.', 'error': 'invalid_password'}), 401
        else:
            print("User not found")
            return jsonify({'message': 'Invalid credentials.', 'error': 'user_not_found'}), 401
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'An unexpected error occurred.', 'error': 'server_error'}), 500
