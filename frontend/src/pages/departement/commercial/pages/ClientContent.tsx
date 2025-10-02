import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, User, Loader2, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// --- CONFIGURATION API & AUTHENTIFICATION ---
const API_BASE_URL = "http://localhost:5000"; 

const CLIENT_ENDPOINT = `${API_BASE_URL}/api/clients/`;

// NOTE: REMPLACEZ CETTE LOGIQUE PAR VOTRE VRAI CONTEXTE D'AUTH.
const useAuthToken = () => {
    // ⚠️ ATTENTION : Remplacez par une logique d'authentification réelle (ex: un hook de contexte)
    return localStorage.getItem('authToken') || 'YOUR_VALID_JWT_TOKEN'; 
};
// --- FIN CONFIGURATION API & AUTHENTIFICATION ---

// Interface client calquée sur la réponse de l'API Flask
interface Client {
  id: number; 
  nom: string;
  prenom: string | null;
  entreprise: string | null;
  email: string;
  telephone: string;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  type_client: string; 
  created_at: string;
  // Champs non API mais utiles pour l'affichage
  nomCompletDisplay: string;
}

const ClientContent = () => {
  const token = useAuthToken();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // formData qui correspond aux champs nécessaires pour l'API POST/PUT
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    entreprise: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    identifiantFiscal: "", 
  });

  // Fonction utilitaire pour obtenir les en-têtes d'authentification
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Réinitialiser les données du formulaire
  const resetFormData = () => {
    setFormData({
      nom: "", prenom: "", entreprise: "", email: "", telephone: "", 
      adresse: "", identifiantFiscal: "", ville: "", code_postal: ""
    });
  };

  // 1. Récupération des clients (GET)
  const fetchClients = useCallback(async () => {
    if (!token || token === 'YOUR_VALID_JWT_TOKEN') {
      Swal.fire("Authentification", "Veuillez remplacer 'YOUR_VALID_JWT_TOKEN' par un jeton valide.", "error");
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(CLIENT_ENDPOINT, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        throw new Error("Accès non autorisé. Jeton JWT invalide ou expiré.");
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: response.statusText }));
        throw new Error(errorData.msg || "Erreur lors de la récupération des clients.");
      }

      const data = await response.json();
      
      const clientList = Array.isArray(data.clients) ? data.clients : [];

      // Adaptater les données API pour l'affichage
      const adaptedClients = clientList.map((c: any) => ({
        ...c,
        nomCompletDisplay: c.entreprise || `${c.nom} ${c.prenom || ''}`, 
      }));
      
      setClients(adaptedClients);
    } catch (error: any) {
      console.error("Erreur Fetch Clients:", error);
      Swal.fire("Erreur de l'API", error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // 2. Création/Modification d'un client (POST/PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token === 'YOUR_VALID_JWT_TOKEN') return Swal.fire("Erreur", "Jeton d'authentification manquant.", "error");

    if (!formData.nom || !formData.telephone) {
      Swal.fire("Erreur de formulaire", "Le Nom et le Téléphone sont obligatoires.", "warning");
      return;
    }

    setIsSubmitting(true);
    const isNew = editingId === null;
    const url = isNew ? CLIENT_ENDPOINT : `${CLIENT_ENDPOINT}${editingId}`; 
    const method = isNew ? "POST" : "PUT";
    let successMsg = isNew ? "Client ajouté avec succès." : "Client mis à jour avec succès.";

    // Corps de la requête correspondant exactement aux champs API
    const dataToSend = {
      nom: formData.nom,
      prenom: formData.prenom || null,
      entreprise: formData.entreprise || null,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse || null,
      ville: formData.ville || null,
      code_postal: formData.code_postal || null,
      type_client: 'prospect', // Par défaut
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || `Erreur ${response.status} lors de l'opération.`);
      }

      setOpen(false);
      setEditingId(null);
      resetFormData();
      await fetchClients(); 
      Swal.fire("Succès !", successMsg, "success");
    } catch (error: any) {
      console.error("Erreur API Enregistrement:", error);
      Swal.fire("Erreur", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Suppression d'un client (DELETE)
  const handleDelete = (id: number) => {
    if (!token || token === 'YOUR_VALID_JWT_TOKEN') return Swal.fire("Erreur", "Jeton d'authentification manquant.", "error");

    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible et supprimera le client !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await fetch(`${CLIENT_ENDPOINT}${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          
          if (!response.ok) {
            const result = await response.json().catch(() => ({ msg: response.statusText }));
            throw new Error(result.msg || `Erreur ${response.status} lors de la suppression.`);
          }

          setClients(prevClients => prevClients.filter(c => c.id !== id));
          Swal.fire("Supprimé !", "Le client a été supprimé.", "success");
        } catch (error: any) {
          console.error("Erreur suppression:", error);
          Swal.fire("Erreur", error.message, "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };
  
  // 4. Ouvrir le formulaire d'ajout/modification (avec récupération des données pour l'édition)
  const handleOpen = async (client: Client | null = null) => {
    
    // ⚠️ Modification ici : Le contrôle de token n'est nécessaire que si on édite (car on fait un fetch)
    if (client && (!token || token === 'YOUR_VALID_JWT_TOKEN')) {
        return Swal.fire("Erreur", "Jeton d'authentification manquant pour l'édition.", "error");
    }

    if (client) {
      setLoading(true);
      try {
        // Récupérer les détails complets par ID pour l'édition
        const response = await fetch(`${CLIENT_ENDPOINT}${client.id}`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error("Erreur lors du chargement des détails du client.");
        const fullClientData = await response.json();
        
        setFormData({
          nom: fullClientData.nom || '',
          prenom: fullClientData.prenom || '',
          entreprise: fullClientData.entreprise || '',
          email: fullClientData.email || '',
          telephone: fullClientData.telephone || '',
          adresse: fullClientData.adresse || '',
          ville: fullClientData.ville || '',
          code_postal: fullClientData.code_postal || '',
          identifiantFiscal: "", 
        });
        setEditingId(client.id);
        setOpen(true);
      } catch (error: any) {
        console.error("Erreur chargement édition:", error);
        Swal.fire("Erreur", error.message, "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Nouveau client : réinitialiser le formulaire et OUVRIR
      resetFormData();
      setEditingId(null);
      setOpen(true); // <--- Ceci est l'action clé pour l'ouverture
    }
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des Clients</h2>
        <Button onClick={() => handleOpen()} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Liste des Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un client.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom/Entreprise</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nomCompletDisplay}</TableCell>
                      <TableCell>
                        <Badge variant={client.type_client === 'client' ? 'default' : 'secondary'}>
                          {client.type_client.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.prenom || client.nom}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.telephone}</TableCell>
                      <TableCell>
                        {new Date(client.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpen(client)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier le Client" : "Ajouter un Client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="nom">Nom/Raison Sociale *</Label>
                <Input
                  id="nom"
                  placeholder="Nom ou Raison Sociale"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              
              {/* Prénom */}
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom (Contact)</Label>
                <Input
                  id="prenom"
                  placeholder="Prénom de la personne de contact"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </div>
              
              {/* Entreprise (optionnel) */}
              <div className="space-y-2">
                <Label htmlFor="entreprise">Entreprise</Label>
                <Input
                  id="entreprise"
                  placeholder="Nom de l'entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                />
              </div>

              {/* Identifiant Fiscal (conservé pour le front) */}
              <div className="space-y-2">
                <Label htmlFor="identifiantFiscal">Identifiant Fiscal</Label>
                <Input
                  id="identifiantFiscal"
                  placeholder="N° d'identification fiscale"
                  value={formData.identifiantFiscal}
                  onChange={(e) => setFormData({ ...formData, identifiantFiscal: e.target.value })}
                />
              </div>
              
              {/* Adresse */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="adresse">Adresse complète</Label>
                <Input
                  id="adresse"
                  placeholder="Adresse complète (rue, bâtiment...)"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>
              
              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                />
              </div>
              
              {/* Code Postal */}
              <div className="space-y-2">
                <Label htmlFor="code_postal">Code Postal</Label>
                <Input
                  id="code_postal"
                  placeholder="Code Postal"
                  value={formData.code_postal}
                  onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); resetFormData(); }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Mettre à jour" : "Ajouter le client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientContent;