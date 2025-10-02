import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, FileText, User, Phone, MessageSquare, UserCog } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Devis {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  commentaire: string;
  dateCreation: string;
  statut: 'en_attente' | 'assigné' | 'traité' | 'refusé';
  technicien?: {
    id: string;
    nom: string;
  };
}

const techniciens = [
  { id: '1', nom: 'Jean Dupont' },
  { id: '2', nom: 'Marie Martin' },
  { id: '3', nom: 'Pierre Durand' },
  { id: '4', nom: 'Sophie Petit' },
];

const DevisContent = () => {
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [currentDevisId, setCurrentDevisId] = useState<string | null>(null);
  const [selectedTechnicien, setSelectedTechnicien] = useState('');
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    commentaire: "",
  });

  const handleOpen = (devis: Devis | null = null) => {
    if (devis) {
      setFormData({
        nom: devis.nom,
        prenom: devis.prenom,
        telephone: devis.telephone,
        commentaire: devis.commentaire,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentDevisId) {
      // Mise à jour d'un devis existant
      setDevisList(
        devisList.map((devis) =>
          devis.id === currentDevisId
            ? {
                ...devis,
                ...formData,
              }
            : devis
        )
      );
      Swal.fire({
        title: "Succès !",
        text: "Le devis a été mis à jour avec succès.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    } else {
      // Création d'un nouveau devis
      const newDevis: Devis = {
        id: Date.now().toString(),
        dateCreation: new Date().toISOString(),
        statut: 'en_attente',
        ...formData,
      };
      setDevisList([...devisList, newDevis]);
      Swal.fire({
        title: "Succès !",
        text: "Le devis a été créé avec succès.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setDevisList(devisList.filter((devis) => devis.id !== id));
        Swal.fire({
          title: "Supprimé !",
          text: "Le devis a été supprimé.",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      }
    });
  };

  const handleAssign = (id: string) => {
    setCurrentDevisId(id);
    setSelectedTechnicien('');
    setOpenAssign(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedTechnicien) {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez sélectionner un technicien",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setDevisList(
      devisList.map((devis) =>
        devis.id === currentDevisId
          ? {
              ...devis,
              statut: 'assigné',
              technicien: techniciens.find(t => t.id === selectedTechnicien),
            }
          : devis
      )
    );

    setOpenAssign(false);
    Swal.fire({
      title: "Succès !",
      text: "Le technicien a été assigné avec succès.",
      icon: "success",
      confirmButtonColor: "#3b82f6",
    });
  };

  const getStatusBadge = (status: Devis['statut']) => {
    const statusMap = {
      'en_attente': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'assigné': { label: 'Assigné', color: 'bg-blue-100 text-blue-800' },
      'traité': { label: 'Traité', color: 'bg-green-100 text-green-800' },
      'refusé': { label: 'Refusé', color: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${statusInfo.color} hover:${statusInfo.color}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des Devis</h2>
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
          {devisList.length === 0 ? (
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
                    <TableHead>Technicien</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devisList.map((devis) => (
                    <TableRow key={devis.id}>
                      <TableCell className="font-medium">{devis.nom}</TableCell>
                      <TableCell>{devis.prenom}</TableCell>
                      <TableCell>{devis.telephone}</TableCell>
                      <TableCell>{getStatusBadge(devis.statut)}</TableCell>
                      <TableCell>
                        {devis.technicien?.nom || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(devis.dateCreation).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpen(devis)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssign(devis.id)}
                          disabled={devis.statut === 'assigné' || devis.statut === 'traité'}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(devis.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
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
              {currentDevisId ? "Modifier le Devis" : "Créer un Devis"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Nom du client"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  placeholder="Prénom du client"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea
                id="commentaire"
                placeholder="Détails supplémentaires..."
                value={formData.commentaire}
                onChange={(e) =>
                  setFormData({ ...formData, commentaire: e.target.value })
                }
                rows={4}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {currentDevisId ? "Mettre à jour" : "Créer le devis"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'assignation de technicien */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigner un technicien</DialogTitle>
            <DialogDescription>
              Sélectionnez un technicien à assigner à ce devis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="technicien">Technicien *</Label>
              <Select 
                value={selectedTechnicien} 
                onValueChange={setSelectedTechnicien}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un technicien" />
                </SelectTrigger>
                <SelectContent>
                  {techniciens.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.nom}
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
            >
              Annuler
            </Button>
            <Button 
              onClick={handleAssignSubmit}
              disabled={!selectedTechnicien}
            >
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevisContent;