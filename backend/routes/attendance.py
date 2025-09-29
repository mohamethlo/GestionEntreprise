# routes/attendance.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, time
from geopy.distance import geodesic

from extensions import db
from models import Attendance, WorkLocation, User

attendance_bp = Blueprint("attendance_bp", __name__)

# -------------------------
# Obtenir l'historique du pointage de l'utilisateur connecté
# -------------------------
@attendance_bp.route("/", methods=["GET"])
@jwt_required()
def get_attendance():
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pagination = (
        Attendance.query.filter_by(user_id=user_id)
        .order_by(Attendance.date.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    attendances = pagination.items

    data = [
        {
            "id": a.id,
            "date": a.date.isoformat(),
            "check_in": a.check_in.isoformat() if a.check_in else None,
            "check_out": a.check_out.isoformat() if a.check_out else None,
            "check_in_location": a.check_in_location,
            "check_out_location": a.check_out_location,
        }
        for a in attendances
    ]

    return jsonify({
        "success": True,
        "data": data,
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total
    }), 200

# -------------------------
# Enregistrer une entrée (check-in)
# -------------------------
@attendance_bp.route("/check_in", methods=["POST"])
@jwt_required()
def check_in():
    user_id = get_jwt_identity()
    data = request.get_json()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    location_name = data.get("location_name")

    if latitude is None or longitude is None:
        return jsonify({"success": False, "message": "Coordonnées manquantes"}), 400

    RAYON = 100
    work_locations = WorkLocation.query.filter_by(is_active=True).all()
    found_location = None

    for loc in work_locations:
        distance = geodesic((latitude, longitude), (loc.latitude, loc.longitude)).meters
        if distance <= RAYON:
            found_location = loc
            break

    if not found_location:
        if not location_name or not location_name.strip():
            return jsonify({"success": False, "need_zone_name": True, "message": "Aucune zone trouvée, veuillez saisir un nom."}), 400
        if WorkLocation.query.filter_by(name=location_name.strip()).first():
            return jsonify({"success": False, "message": "Ce nom existe déjà."}), 400
        found_location = WorkLocation(
            name=location_name.strip(),
            latitude=latitude,
            longitude=longitude,
            radius=RAYON,
            is_active=True,
            type="chantier"
        )
        db.session.add(found_location)
        db.session.commit()

    today_attendance = Attendance.query.filter_by(user_id=user_id, date=date.today()).first()

    if today_attendance and today_attendance.check_in:
        return jsonify({"success": False, "message": "Déjà pointé aujourd'hui"}), 400

    if today_attendance:
        today_attendance.check_in = datetime.utcnow()
        today_attendance.check_in_location = found_location.name
        today_attendance.check_in_lat = latitude
        today_attendance.check_in_lng = longitude
        today_attendance.work_location_id = found_location.id
    else:
        today_attendance = Attendance(
            user_id=user_id,
            check_in=datetime.utcnow(),
            check_in_location=found_location.name,
            check_in_lat=latitude,
            check_in_lng=longitude,
            work_location_id=found_location.id
        )
        db.session.add(today_attendance)

    db.session.commit()
    return jsonify({"success": True, "message": f"Pointage enregistré à {found_location.name}."}), 201

# -------------------------
# Enregistrer une sortie (check-out)
# -------------------------
@attendance_bp.route("/check_out", methods=["POST"])
@jwt_required()
def check_out():
    user_id = get_jwt_identity()
    data = request.get_json()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    location_name = data.get("location", "Position inconnue")

    today_attendance = Attendance.query.filter_by(user_id=user_id, date=date.today()).first()

    if not today_attendance or not today_attendance.check_in:
        return jsonify({"success": False, "message": "Vous devez d'abord pointer votre entrée"}), 400
    if today_attendance.check_out:
        return jsonify({"success": False, "message": "Déjà pointé la sortie aujourd'hui"}), 400
    if location_name != today_attendance.check_in_location:
        return jsonify({"success": False, "message": "Zone de sortie différente de l'entrée."}), 400

    today_attendance.check_out = datetime.utcnow()
    today_attendance.check_out_location = location_name
    today_attendance.check_out_lat = latitude
    today_attendance.check_out_lng = longitude

    db.session.commit()
    return jsonify({"success": True, "message": "Pointage de sortie enregistré avec succès"}), 200

# -------------------------
# Statistiques du jour
# -------------------------
@attendance_bp.route("/stats/today", methods=["GET"])
@jwt_required()
def today_stats():
    today = date.today()
    heure_limite = time(9, 15)

    users = User.query.filter_by(is_active=True).all()
    attendances_today = {a.user_id: a for a in Attendance.query.filter_by(date=today).all()}

    presents, absents, retards = [], [], []

    for user in users:
        attendance = attendances_today.get(user.id)
        user_name = f"{user.nom} {user.prenom}"
        if attendance and attendance.check_in:
            presents.append({"id": user.id, "name": user_name})
            if attendance.check_in.time() > heure_limite:
                retards.append({"id": user.id, "name": user_name})
        else:
            absents.append({"id": user.id, "name": user_name})

    return jsonify({
        "success": True,
        "date": today.isoformat(),
        "presents": presents,
        "absents": absents,
        "retards": retards,
        "count": {"presents": len(presents), "absents": len(absents), "retards": len(retards), "total": len(users)}
    }), 200

# -------------------------
# Historique d’un utilisateur spécifique (admin)
# -------------------------
@attendance_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_attendance(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pagination = (
        Attendance.query.filter_by(user_id=user_id)
        .order_by(Attendance.date.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    attendances = pagination.items

    data = [
        {
            "id": a.id,
            "date": a.date.isoformat(),
            "check_in": a.check_in.isoformat() if a.check_in else None,
            "check_out": a.check_out.isoformat() if a.check_out else None,
            "check_in_location": a.check_in_location,
            "check_out_location": a.check_out_location,
        }
        for a in attendances
    ]

    return jsonify({
        "success": True,
        "user_id": user_id,
        "attendances": data,
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total
    }), 200

# -------------------------
# Historique de tous les utilisateurs (admin)
# -------------------------
@attendance_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_attendance():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    date_filter = request.args.get("date")

    query = Attendance.query
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(Attendance.date == filter_date)
        except ValueError:
            return jsonify({"success": False, "message": "Format de date invalide (YYYY-MM-DD)."}), 400

    pagination = query.order_by(Attendance.date.desc()).paginate(page=page, per_page=per_page, error_out=False)
    attendances = pagination.items

    data = [
        {
            "id": a.id,
            "user_id": a.user_id,
            "user_name": f"{a.user.nom} {a.user.prenom}" if a.user else "Inconnu",
            "date": a.date.isoformat(),
            "check_in": a.check_in.isoformat() if a.check_in else None,
            "check_out": a.check_out.isoformat() if a.check_out else None,
            "check_in_location": a.check_in_location,
            "check_out_location": a.check_out_location,
        }
        for a in attendances
    ]

    return jsonify({
        "success": True,
        "attendances": data,
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total
    }), 200
