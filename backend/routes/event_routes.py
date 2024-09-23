from flask import Blueprint, request, jsonify
from app import db
from models.event import Event
from utils.decorators import jwt_required_decorator
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

event_bp = Blueprint('events', __name__)

@event_bp.route('/', methods=['POST'])
@jwt_required_decorator
def create_event():
    data = request.get_json()
   
    if not data or not data.get('title') or not data.get('datetime'):
        return jsonify({'message': 'Title and datetime are required.'}), 400
   
    try:
        event_datetime = datetime.fromisoformat(data['datetime'])
    except ValueError:
        return jsonify({'message': 'Invalid datetime format.'}), 400
   
    new_event = Event(
        title=data['title'],
        datetime=event_datetime,
        description=data.get('description', ''),
        user_id=get_jwt_identity(),
        reminder=data.get('reminder', True)  # Default to True if not provided
    )
   
    db.session.add(new_event)
    db.session.commit()
   
    return jsonify({'event': new_event.to_dict()}), 201

@event_bp.route('/', methods=['GET'])
@jwt_required_decorator
def get_events():
    user_id = get_jwt_identity()
    events = Event.query.filter_by(user_id=user_id).all()
    events_list = [event.to_dict() for event in events]
    return jsonify({'events': events_list}), 200

@event_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required_decorator
def update_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.filter_by(id=event_id, user_id=user_id).first()
   
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
   
    data = request.get_json()
   
    if data.get('title'):
        event.title = data['title']
    if data.get('datetime'):
        try:
            event.datetime = datetime.fromisoformat(data['datetime'])
        except ValueError:
            return jsonify({'message': 'Invalid datetime format.'}), 400
    if 'description' in data:
        event.description = data['description']
    if 'reminder' in data:
        event.reminder = bool(data['reminder'])  # Convert to boolean
   
    db.session.commit()
   
    return jsonify({'event': event.to_dict()}), 200

@event_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required_decorator
def delete_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.filter_by(id=event_id, user_id=user_id).first()
   
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
   
    db.session.delete(event)
    db.session.commit()
   
    return jsonify({'message': 'Event deleted successfully.'}), 200