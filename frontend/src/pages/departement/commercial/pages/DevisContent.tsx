import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, FileText, User, Phone, MessageSquare, UserCog, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Configuration API
const API_BASE_URL = "http://localhost:5000";
const AUTH_TOKEN_KEY = 'authToken';

// Récupère le token JWT depuis le localStorage
const useAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

interface User {
  id: string;
  username: string;
  nom: string;
  prenom: string;
}

interface Devis {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  commentaire: string;
  created_at: string;
  status: 'en_attente' | 'assigned' | 'completed' | 'refused';
  user_id: string;
  assigned_to?: string;
  assigned_user?: User;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const DevisContent = () => {
  const token = useAuthToken();
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [techniciens, setTechniciens] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [currentDevisId, setCurrentDevisId] = useState<number | null>(null);
  const [selectedTechnicien, setSelectedTechnicien] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    commentaire: "",
  });

  // Récupérer la liste des devis
  const fetchDevis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Devis[]>>(
        `${API_BASE_URL}/api/devis`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.data) {
        setDevisList(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des devis:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger la liste des devis',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Récupérer la liste des techniciens
  const fetchTechniciens = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<User[]>>(
        `${API_BASE_URL}/api/users/techniciens`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.data) {
        setTechniciens(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchDevis();
    fetchTechniciens();
  }, [fetchDevis, fetchTechniciens]);

  const handleOpen = (devis: Devis | null = null) => {
    if (devis) {
      setFormData({
        nom: devis.nom || "",
        prenom: devis.prenom || "",
        telephone: devis.telephone || "",
        commentaire: devis.commentaire || "",
      });
      setCurrentDevisId(devis.id);
    } else {
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        commentaire: "",
      });
      setCurrentDevisId(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = currentDevisId 
        ? `${API_BASE_URL}/api/devis/${currentDevisId}`
        : `${API_BASE_URL}/api/devis`;
      
      const method = currentDevisId ? 'put' : 'post';
      
      const response = await axios[method]<ApiResponse<Devis>>(
        url,
        formData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        await fetchDevis(); // Rafraîchir la liste des devis
        
        Swal.fire({
          title: 'Succès!',
          text: `Le devis a été ${currentDevisId ? 'mis à jour' : 'créé'} avec succès.`,
          icon: 'success',
        });
        
        setOpen(false);
        setFormData({
          nom: "",
          prenom: "",
          telephone: "",
          commentaire: "",
        });
        setCurrentDevisId(null);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du devis:", error);
      Swal.fire({
        title: 'Erreur',
        text: `Une erreur est survenue lors de ${currentDevisId ? 'la mise à jour' : 'la création'} du devis`,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/devis/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchDevis(); // Rafraîchir la liste des devis
        
        Swal.fire(
          'Supprimé!',
          'Le devis a été supprimé avec succès.',
          'success'
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du devis:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la suppression du devis',
          icon: 'error',
        });
      }
    }
  };

  const handleAssign = (id: number) => {
    setCurrentDevisId(id);
    setOpenAssign(true);
  };

  const handleAssignSubmit = async () => {
    if (!currentDevisId || !selectedTechnicien) return;
    
    try {
      const response = await axios.put<ApiResponse<Devis>>(
        `${API_BASE_URL}/api/devis/${currentDevisId}/assign`,
        { assigned_to: selectedTechnicien },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        await fetchDevis(); // Rafraîchir la liste des devis
        
        setOpenAssign(false);
        setSelectedTechnicien('');
        setCurrentDevisId(null);
        
        Swal.fire({
          title: 'Succès!',
          text: 'Le technicien a été assigné avec succès.',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du technicien:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'assignation du technicien',
        icon: 'error',
      });
    }
  };

  const getStatusBadge = (status: Devis['status']) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Assigné</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>;
      case 'refused':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Devis</h1>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Devis
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Liste des Devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : devisList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer un devis.</p>
              <div className="mt-6">
                <Button onClick={() => handleOpen()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Devis
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devisList.map((devis) => (
                    <TableRow key={devis.id}>
                      <TableCell>{devis.nom}</TableCell>
                      <TableCell>{devis.prenom}</TableCell>
                      <TableCell>{devis.telephone}</TableCell>
                      <TableCell>{getStatusBadge(devis.status)}</TableCell>
                      <TableCell>{formatDate(devis.created_at)}</TableCell>
                      <TableCell>
                        {devis.assigned_user ? (
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            {devis.assigned_user.prenom} {devis.assigned_user.nom}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpen(devis)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(devis.id)}
                            disabled={devis.status !== 'en_attente'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleAssign(devis.id)}
                            disabled={devis.status !== 'en_attente'}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout/édition de devis */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentDevisId ? 'Modifier le devis' : 'Nouveau devis'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="commentaire" className="text-right mt-2">
                  Commentaire
                </Label>
                <Textarea
                  id="commentaire"
                  value={formData.commentaire}
                  onChange={(e) =>
                    setFormData({ ...formData, commentaire: e.target.value })
                  }
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentDevisId ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>{currentDevisId ? 'Mettre à jour' : 'Créer'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'assignation de technicien */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assigner un technicien</DialogTitle>
            <DialogDescription>
              Sélectionnez un technicien à assigner à ce devis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technicien" className="text-right">
                Technicien
              </Label>
              <Select 
                value={selectedTechnicien} 
                onValueChange={setSelectedTechnicien}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un technicien" />
                </SelectTrigger>
                <SelectContent>
                  {techniciens.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.prenom} {tech.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenAssign(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={() => handleAssignSubmit()}
              disabled={!selectedTechnicien || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assignation...
                </>
              ) : (
                'Assigner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevisContent;