# routes/attendance.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, time
from geopy.distance import geodesic

from extensions import db
from models import Attendance, WorkLocation, User, justification as Justification
from models.justification import Justification

attendance_bp = Blueprint("attendance_bp", __name__)

# -------------------------
# Obtenir l'historique du pointage de l'utilisateur connecté
# -------------------------
@attendance_bp.route("/", methods=["GET"])
@jwt_required()
def get_attendance():
    user_id = get_jwt_identity()
    
    # Récupérer tous les enregistrements sans pagination pour le frontend
    attendances = (
        Attendance.query.filter_by(user_id=user_id)
        .order_by(Attendance.date.desc())
        .all()
    )

    data = [
        {
            "id": a.id,
            "date": a.date.isoformat(),
            "check_in": a.check_in.isoformat() if a.check_in else None,
            "check_out": a.check_out.isoformat() if a.check_out else None,
            "check_in_location": a.check_in_location,
            "check_out_location": a.check_out_location,
            "is_late": a.is_late,
            "has_justification": a.has_justification,
        }
        for a in attendances
    ]

    return jsonify(data), 200

# -------------------------
# Vérifier si l'utilisateur est en retard
# -------------------------
@attendance_bp.route("/check_late", methods=["POST"])
@jwt_required()
def check_late():
    """Vérifie si l'heure actuelle dépasse 9h15"""
    current_time = datetime.now().time()
    heure_limite = time(9, 15)
    
    is_late = current_time > heure_limite
    
    return jsonify({
        "success": True,
        "is_late": is_late,
        "current_time": current_time.strftime("%H:%M:%S"),
        "limit_time": "09:15:00"
    }), 200

# -------------------------
# Enregistrer une entrée (check-in) avec gestion du retard
# -------------------------
@attendance_bp.route("/check_in", methods=["POST"])
@jwt_required()
def check_in():
    user_id = get_jwt_identity()
    data = request.get_json()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    location_name = data.get("location_name")
    justification_commentaire = data.get("justification")

    if latitude is None or longitude is None:
        return jsonify({"success": False, "message": "Coordonnées manquantes"}), 400

    # Vérifier si l'utilisateur est en retard
    current_time = datetime.now().time()
    heure_limite = time(9, 15)
    is_late = current_time > heure_limite

    # CORRECTION : Vérifier si justification est fournie (pas None et pas vide)
    has_justification = bool(justification_commentaire and justification_commentaire.strip())

    # Si en retard et pas de justification fournie, demander une justification
    if is_late and not has_justification:
        return jsonify({
            "success": False,
            "need_justification": True,
            "message": "Vous êtes en retard. Veuillez fournir une justification.",
            "current_time": current_time.strftime("%H:%M:%S")
        }), 400

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
            return jsonify({
                "success": False,
                "need_zone_name": True,
                "message": "Aucune zone trouvée, veuillez saisir un nom."
            }), 400
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

    # CORRECTION : Utiliser has_justification au lieu de la vérification directe
    if today_attendance:
        today_attendance.check_in = datetime.utcnow()
        today_attendance.check_in_location = found_location.name
        today_attendance.check_in_lat = latitude
        today_attendance.check_in_lng = longitude
        today_attendance.work_location_id = found_location.id
        today_attendance.is_late = is_late
        today_attendance.has_justification = is_late and has_justification
    else:
        today_attendance = Attendance(
            user_id=user_id,
            date=date.today(),
            check_in=datetime.utcnow(),
            check_in_location=found_location.name,
            check_in_lat=latitude,
            check_in_lng=longitude,
            work_location_id=found_location.id,
            is_late=is_late,
            has_justification=is_late and has_justification
        )
        db.session.add(today_attendance)

    db.session.commit()

    # CORRECTION : Enregistrer la justification seulement si elle existe et n'est pas vide
    if is_late and has_justification:
        justification = Justification(
            user_id=user_id,
            attendance_id=today_attendance.id,
            commentaire=justification_commentaire.strip(),
            statut='en_attente'
        )
        db.session.add(justification)
        db.session.commit()

    message = f"Pointage enregistré à {found_location.name}."
    if is_late:
        if has_justification:
            message += " (Retard enregistré avec justification)"
        else:
            message += " (Retard sans justification)"

    return jsonify({
        "success": True,
        "message": message,
        "is_late": is_late,
        "has_justification": has_justification,
        "check_in_time": today_attendance.check_in.isoformat() if today_attendance.check_in else None
    }), 201

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

    # Vérifier si l'utilisateur est dans la même zone que l'entrée
    if today_attendance.check_in_location and location_name != today_attendance.check_in_location:
        return jsonify({
            "success": False, 
            "message": f"Zone de sortie différente de l'entrée. Entrée: {today_attendance.check_in_location}, Sortie: {location_name}"
        }), 400

    today_attendance.check_out = datetime.utcnow()
    today_attendance.check_out_location = location_name
    today_attendance.check_out_lat = latitude
    today_attendance.check_out_lng = longitude

    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Pointage de sortie enregistré avec succès",
        "check_out_time": today_attendance.check_out.isoformat() if today_attendance.check_out else None
    }), 200

# -------------------------
# Obtenir les justifications (admin)
# -------------------------
@attendance_bp.route("/justifications", methods=["GET"])
@jwt_required()
def get_justifications():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    statut = request.args.get("statut")

    query = Justification.query
    if statut:
        query = query.filter_by(statut=statut)

    pagination = query.order_by(Justification.date_justification.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    data = [
        {
            "id": j.id,
            "user_id": j.user_id,
            "user_name": f"{j.user.nom} {j.user.prenom}",
            "attendance_id": j.attendance_id,
            "date": j.attendance.date.isoformat(),
            "commentaire": j.commentaire,
            "date_justification": j.date_justification.isoformat(),
            "statut": j.statut
        }
        for j in pagination.items
    ]

    return jsonify({
        "success": True,
        "justifications": data,
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total
    }), 200

# -------------------------
# Approuver/Rejeter une justification (admin)
# -------------------------
@attendance_bp.route("/justifications/<int:justification_id>/status", methods=["PUT"])
@jwt_required()
def update_justification_status(justification_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    data = request.get_json()
    new_status = data.get("statut")

    if new_status not in ["approuvé", "rejeté"]:
        return jsonify({"success": False, "message": "Statut invalide"}), 400

    justification = Justification.query.get(justification_id)
    if not justification:
        return jsonify({"success": False, "message": "Justification introuvable"}), 404

    justification.statut = new_status
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Justification {new_status}",
        "justification_id": justification_id,
        "new_status": new_status
    }), 200

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
            # Vérifier le retard basé sur l'heure de check_in ou le champ is_late
            if attendance.is_late or (attendance.check_in and attendance.check_in.time() > heure_limite):
                retards.append({"id": user.id, "name": user_name})
        else:
            absents.append({"id": user.id, "name": user_name})

    return jsonify({
        "success": True,
        "date": today.isoformat(),
        "presents": presents,
        "absents": absents,
        "retards": retards,
        "count": {
            "presents": len(presents),
            "absents": len(absents),
            "retards": len(retards),
            "total": len(users)
        }
    }), 200

# -------------------------
# Obtenir le statut du pointage du jour
# -------------------------
@attendance_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_attendance():
    user_id = get_jwt_identity()
    today = date.today()
    
    today_attendance = Attendance.query.filter_by(user_id=user_id, date=today).first()
    
    if not today_attendance:
        return jsonify({
            "success": True,
            "has_attendance": False,
            "check_in": None,
            "check_out": None,
            "is_late": False,
            "has_justification": False
        }), 200
    
    return jsonify({
        "success": True,
        "has_attendance": True,
        "check_in": today_attendance.check_in.isoformat() if today_attendance.check_in else None,
        "check_out": today_attendance.check_out.isoformat() if today_attendance.check_out else None,
        "check_in_location": today_attendance.check_in_location,
        "check_out_location": today_attendance.check_out_location,
        "is_late": today_attendance.is_late,
        "has_justification": today_attendance.has_justification
    }), 200

# -------------------------
# Historique d'un utilisateur spécifique (admin)
# -------------------------
@attendance_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_attendance(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    attendances = (
        Attendance.query.filter_by(user_id=user_id)
        .order_by(Attendance.date.desc())
        .all()
    )

    data = [
        {
            "id": a.id,
            "date": a.date.isoformat(),
            "check_in": a.check_in.isoformat() if a.check_in else None,
            "check_out": a.check_out.isoformat() if a.check_out else None,
            "check_in_location": a.check_in_location,
            "check_out_location": a.check_out_location,
            "is_late": a.is_late,
            "has_justification": a.has_justification,
        }
        for a in attendances
    ]

    return jsonify({
        "success": True,
        "user_id": user_id,
        "attendances": data
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

    date_filter = request.args.get("date")
    user_id_filter = request.args.get("user_id")

    query = Attendance.query
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(Attendance.date == filter_date)
        except ValueError:
            return jsonify({"success": False, "message": "Format de date invalide (YYYY-MM-DD)."}), 400
    
    if user_id_filter:
        try:
            user_id = int(user_id_filter)
            query = query.filter(Attendance.user_id == user_id)
        except ValueError:
            return jsonify({"success": False, "message": "ID utilisateur invalide."}), 400

    attendances = query.order_by(Attendance.date.desc()).limit(100).all()

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
            "is_late": a.is_late,
            "has_justification": a.has_justification,
        }
        for a in attendances
    ]

    return jsonify({
        "success": True,
        "attendances": data
    }), 200

# -------------------------
# Supprimer un pointage (admin)
# -------------------------
@attendance_bp.route("/<int:attendance_id>", methods=["DELETE"])
@jwt_required()
def delete_attendance(attendance_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    attendance = Attendance.query.get(attendance_id)
    if not attendance:
        return jsonify({"success": False, "message": "Pointage introuvable"}), 404

    # Supprimer les justifications associées
    Justification.query.filter_by(attendance_id=attendance_id).delete()
    
    db.session.delete(attendance)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Pointage supprimé avec succès"
    }), 200

# -------------------------
# Mettre à jour un pointage (admin)
# -------------------------
@attendance_bp.route("/<int:attendance_id>", methods=["PUT"])
@jwt_required()
def update_attendance(attendance_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role.name.lower() != "administrateur":
        return jsonify({"success": False, "message": "Accès refusé"}), 403

    attendance = Attendance.query.get(attendance_id)
    if not attendance:
        return jsonify({"success": False, "message": "Pointage introuvable"}), 404

    data = request.get_json()
    
    # Champs modifiables
    if 'check_in' in data and data['check_in']:
        try:
            attendance.check_in = datetime.fromisoformat(data['check_in'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"success": False, "message": "Format de date/heure d'entrée invalide"}), 400
    
    if 'check_out' in data and data['check_out']:
        try:
            attendance.check_out = datetime.fromisoformat(data['check_out'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"success": False, "message": "Format de date/heure de sortie invalide"}), 400
    
    if 'check_in_location' in data:
        attendance.check_in_location = data['check_in_location']
    
    if 'check_out_location' in data:
        attendance.check_out_location = data['check_out_location']
    
    if 'is_late' in data:
        attendance.is_late = bool(data['is_late'])
    
    if 'has_justification' in data:
        attendance.has_justification = bool(data['has_justification'])

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Pointage mis à jour avec succès",
        "attendance": {
            "id": attendance.id,
            "date": attendance.date.isoformat(),
            "check_in": attendance.check_in.isoformat() if attendance.check_in else None,
            "check_out": attendance.check_out.isoformat() if attendance.check_out else None,
            "check_in_location": attendance.check_in_location,
            "check_out_location": attendance.check_out_location,
            "is_late": attendance.is_late,
            "has_justification": attendance.has_justification,
        }
    }), 200