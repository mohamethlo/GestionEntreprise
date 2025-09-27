# routes/client.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.client import Client
from datetime import datetime

client_bp = Blueprint("client", __name__, url_prefix="/api/clients")


# --- Utilitaire de sérialisation ---
def serialize_client(client: Client):
    return {
        "id": client.id,
        "nom": client.nom,
        "prenom": client.prenom,
        "entreprise": client.entreprise,
        "email": client.email,
        "telephone": client.telephone,
        "adresse": client.adresse,
        "ville": client.ville,
        "code_postal": client.code_postal,
        "type_client": client.type_client,
        "assigned_to": client.assigned_to,
        "is_blacklisted": client.is_blacklisted,
        "note_conversion": client.note_conversion,
        "created_at": client.created_at.isoformat() if client.created_at else None,
    }


# ➤ Créer un client
@client_bp.route("/", methods=["POST"])
@jwt_required()
def create_client():
    data = request.get_json()

    if not data or not data.get("nom") or not data.get("telephone"):
        return jsonify({"msg": "Nom et téléphone sont obligatoires."}), 400

    if Client.telephone_exists(data["telephone"]):
        return jsonify({"msg": "Un client avec ce numéro existe déjà."}), 400

    client = Client(
        nom=data["nom"],
        prenom=data.get("prenom"),
        entreprise=data.get("entreprise"),
        email=data.get("email"),
        telephone=data.get("telephone"),
        adresse=data.get("adresse"),
        ville=data.get("ville"),
        code_postal=data.get("code_postal"),
        type_client=data.get("type_client", "prospect"),
        assigned_to=data.get("assigned_to")
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({"msg": "Client créé avec succès", "client": serialize_client(client)}), 201


# ➤ Récupérer tous les clients avec filtres + pagination + tri
@client_bp.route("/", methods=["GET"])
@jwt_required()
def get_clients():
    query = Client.query

    # --- Filtres ---
    if nom := request.args.get("nom"):
        query = query.filter(Client.nom.ilike(f"%{nom}%"))
    if ville := request.args.get("ville"):
        query = query.filter(Client.ville.ilike(f"%{ville}%"))
    if type_client := request.args.get("type_client"):
        query = query.filter(Client.type_client == type_client)
    if assigned_to := request.args.get("assigned_to"):
        query = query.filter(Client.assigned_to == assigned_to)

    # --- Tri ---
    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc")
    if hasattr(Client, sort_by):
        sort_attr = getattr(Client, sort_by)
        query = query.order_by(sort_attr.asc() if order == "asc" else sort_attr.desc())

    # --- Pagination ---
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages,
        "clients": [serialize_client(c) for c in pagination.items]
    }), 200


# ➤ Récupérer un client par ID
@client_bp.route("/<int:client_id>", methods=["GET"])
@jwt_required()
def get_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"msg": "Client non trouvé"}), 404
    return jsonify(serialize_client(client)), 200


# ➤ Modifier un client
@client_bp.route("/<int:client_id>", methods=["PUT"])
@jwt_required()
def update_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"msg": "Client non trouvé"}), 404

    data = request.get_json()
    for field in ["nom", "prenom", "entreprise", "email", "telephone",
                  "adresse", "ville", "code_postal", "type_client", "assigned_to"]:
        if field in data:
            setattr(client, field, data[field])

    db.session.commit()
    return jsonify({"msg": "Client mis à jour avec succès", "client": serialize_client(client)}), 200


# ➤ Supprimer un client
@client_bp.route("/<int:client_id>", methods=["DELETE"])
@jwt_required()
def delete_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"msg": "Client non trouvé"}), 404

    db.session.delete(client)
    db.session.commit()
    return jsonify({"msg": "Client supprimé avec succès"}), 200


# ➤ Conversion prospect → client
@client_bp.route("/<int:client_id>/convert", methods=["POST"])
@jwt_required()
def convert_prospect(client_id):
    current_user_id = get_jwt_identity()
    client = Client.query.get(client_id)

    if not client:
        return jsonify({"msg": "Client non trouvé"}), 404
    if client.type_client == "client":
        return jsonify({"msg": "Ce client est déjà un client."}), 400

    data = request.get_json() or {}
    client.type_client = "client"
    client.note_conversion = data.get("note_conversion")
    client.converted_by_id = current_user_id

    db.session.commit()
    return jsonify({"msg": "Prospect converti en client avec succès", "client": serialize_client(client)}), 200


# ➤ Blacklister un client
@client_bp.route("/<int:client_id>/blacklist", methods=["POST"])
@jwt_required()
def blacklist_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"msg": "Client non trouvé"}), 404
    if client.is_blacklisted:
        return jsonify({"msg": "Ce client est déjà dans la blacklist."}), 400

    client.is_blacklisted = True
    client.date_blacklisted = datetime.utcnow()
    db.session.commit()

    return jsonify({"msg": "Client ajouté à la blacklist", "client": serialize_client(client)}), 200
