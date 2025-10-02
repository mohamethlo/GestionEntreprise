import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, X, Download, Upload, Trash2, Edit, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
type Category = 'Transport' | 'Carburant' | 'Repas' | 'Hébergement' | 'Matériel' | 'Formation' | 'Salaire' | 'Loyer' | 'Facture eau' | 'Facture sonatel' | "Main d'oeuvre mécanicien" | 'Autre';

interface Depense {
  id: string;
  titre: string;
  description: string;
  montant: number;
  categorie: Category;
  date: Date;
  facture: string | null;
  type: 'depense' | 'approvisionnement';
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateCreation: Date;
  dateModification?: Date;
}

const categories: Category[] = [
  'Transport', 
  'Carburant', 
  'Repas', 
  'Hébergement', 
  'Matériel', 
  'Formation', 
  'Salaire', 
  'Loyer', 
  'Facture eau', 
  'Facture sonatel', 
  "Main d'oeuvre mécanicien", 
  'Autre'
];

const DakarContent = () => {
  // États
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [openDepense, setOpenDepense] = useState(false);
  const [openApprovisionnement, setOpenApprovisionnement] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [viewingDepense, setViewingDepense] = useState<Depense | null>(null);
  
  // États pour le formulaire de dépense
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    montant: 0,
    categorie: '' as Category | '',
    date: format(new Date(), 'yyyy-MM-dd'),
    facture: null as File | null,
  });

  // États pour le formulaire d'approvisionnement
  const [approvisionnementData, setApprovisionnementData] = useState({
    montant: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Calcul des totaux
  const totalDepenses = depenses
    .filter(d => d.type === 'depense')
    .reduce((sum, depense) => sum + depense.montant, 0);

  const totalApprovisionnements = depenses
    .filter(d => d.type === 'approvisionnement')
    .reduce((sum, appro) => sum + appro.montant, 0);

  const solde = totalApprovisionnements - totalDepenses;

  // Filtrer les dépenses par mois
  const filteredDepenses = depenses.filter(depense => {
    const depenseDate = new Date(depense.date);
    const depenseMonth = format(depenseDate, 'yyyy-MM');
    return depenseMonth === selectedMonth;
  });

  // Gestion des dépenses
  const handleAddDepense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || !formData.montant || !formData.categorie) return;
    
    const newDepense: Depense = {
      id: editingDepense ? editingDepense.id : Date.now().toString(),
      titre: formData.titre,
      description: formData.description,
      montant: Number(formData.montant),
      categorie: formData.categorie as Category,
      date: new Date(formData.date),
      facture: formData.facture ? (formData.facture instanceof File ? URL.createObjectURL(formData.facture) : formData.facture) : null,
      type: 'depense',
      statut: editingDepense ? editingDepense.statut : 'en_attente',
      dateCreation: editingDepense ? editingDepense.dateCreation : new Date(),
      dateModification: new Date()
    };

    setDepenses([...depenses, newDepense]);
    setOpenDepense(false);
    resetForm();
  };

  // Gestion des approvisionnements
  const handleAddApprovisionnement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvisionnementData.montant) return;
    
    const newApprovisionnement: Depense = {
      id: `appro-${Date.now()}`,
      titre: 'Approvisionnement',
      description: 'Approvisionnement en caisse',
      montant: Number(approvisionnementData.montant),
      categorie: 'Autre',
      date: new Date(approvisionnementData.date),
      facture: null,
      type: 'approvisionnement',
      statut: 'approuve',
      dateCreation: new Date(),
      dateModification: new Date(),
    };

    setDepenses([...depenses, newApprovisionnement]);
    setOpenApprovisionnement(false);
    setApprovisionnementData({ montant: 0, date: format(new Date(), 'yyyy-MM-dd') });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      montant: 0,
      categorie: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      facture: null,
    });
    setEditingDepense(null);
  };

  // Gestion du téléchargement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, facture: e.target.files[0] });
    }
  };

  // Modifier une dépense
  const handleEdit = (depense: Depense) => {
    setEditingDepense(depense);
    setFormData({
      titre: depense.titre,
      description: depense.description,
      montant: depense.montant,
      categorie: depense.categorie,
      date: format(depense.date, 'yyyy-MM-dd'),
      facture: depense.facture as any,
    });
    setOpenDepense(true);
  };

  // Supprimer une dépense
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer cette dépense ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      setDepenses(depenses.filter(d => d.id !== id));
      
      await Swal.fire({
        title: 'Supprimé !',
        text: 'La dépense a été supprimée avec succès.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Changer le statut d'une dépense
  const handleStatusChange = async (id: string, newStatus: 'approuve' | 'rejete') => {
    const statusText = newStatus === 'approuve' ? 'approuver' : 'rejeter';
    const result = await Swal.fire({
      title: `Confirmer l'action`,
      text: `Voulez-vous vraiment ${statusText} cette dépense ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Oui, ${statusText}`,
      cancelButtonText: 'Annuler',
      confirmButtonColor: newStatus === 'approuve' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      setDepenses(depenses.map(depense => 
        depense.id === id 
          ? { ...depense, statut: newStatus, dateModification: new Date() } 
          : depense
      ));
      
      await Swal.fire({
        title: newStatus === 'approuve' ? "Dépense approuvée" : "Dépense rejetée",
        text: newStatus === 'approuve' 
          ? "La dépense a été approuvée avec succès."
          : "La dépense a été rejetée.",
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Afficher les détails d'une dépense
  const handleViewDetails = (depense: Depense) => {
    setViewingDepense(depense);
  };

  return (
    <div className="space-y-6">
      <DepenseDetails 
        depense={viewingDepense} 
        onClose={() => setViewingDepense(null)} 
      />
      {/* En-tête avec les boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Dépenses - Dakar</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les dépenses et les approvisionnements pour la région de Dakar
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setOpenDepense(true)}
            className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle dépense
          </Button>
          <Button 
            variant="outline"
            onClick={() => setOpenApprovisionnement(true)}
            className="border-primary text-primary hover:bg-primary/10 flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Approvisionnement
          </Button>
        </div>
      </div>

      {/* Filtre par mois */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="month-filter">Mois :</Label>
          <Input
            id="month-filter"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: fr })}
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approvisionnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalApprovisionnements.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalDepenses.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {solde >= 0 ? 'Bénéfices' : 'Pertes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(solde).toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des opérations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-[100px]">Facture</TableHead>
                <TableHead className="w-[150px]">Statut</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepenses.length > 0 ? (
                filteredDepenses.map((depense) => (
                  <TableRow key={depense.id}>
                    <TableCell>{format(new Date(depense.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        depense.type === 'approvisionnement' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {depense.type === 'approvisionnement' ? 'Approvisionnement' : 'Dépense'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{depense.titre}</TableCell>
                    <TableCell>{depense.categorie}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      depense.type === 'approvisionnement' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {depense.type === 'approvisionnement' ? '+' : '-'} {depense.montant.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {depense.facture && (
                        <a 
                          href={depense.facture} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Voir</span>
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          depense.statut === 'approuve' 
                            ? 'bg-green-100 text-green-800' 
                            : depense.statut === 'rejete'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {depense.statut === 'approuve' ? 'Approuvé' : depense.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(depense)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {depense.type === 'depense' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(depense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(depense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {depense.statut === 'en_attente' && (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={() => handleStatusChange(depense.id, 'approuve')}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => handleStatusChange(depense.id, 'rejete')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune opération enregistrée pour ce mois.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout de dépense */}
      <Dialog open={openDepense} onOpenChange={(open) => {
        if (!open) resetForm();
        setOpenDepense(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDepense ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepense}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Titre de la dépense"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée de la dépense"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="montant">Montant (FCFA) *</Label>
                    <Input
                      id="montant"
                      type="number"
                      value={formData.montant || ''}
                      onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie *</Label>
                    <Select
                      value={formData.categorie}
                      onValueChange={(value) => setFormData({ ...formData, categorie: value as Category })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((categorie) => (
                          <SelectItem key={categorie} value={categorie}>
                            {categorie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date de dépense</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facture">Facture (PDF ou image)</Label>
                    <Input
                      id="facture"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDepense(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer la dépense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formulaire d'approvisionnement */}
      <Dialog open={openApprovisionnement} onOpenChange={(open) => {
        if (!open) setApprovisionnementData({ montant: 0, date: format(new Date(), 'yyyy-MM-dd') });
        setOpenApprovisionnement(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvel approvisionnement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddApprovisionnement}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appro-montant">Montant (FCFA) *</Label>
                  <Input
                    id="appro-montant"
                    type="number"
                    value={approvisionnementData.montant || ''}
                    onChange={(e) => 
                      setApprovisionnementData({ 
                        ...approvisionnementData, 
                        montant: Number(e.target.value) 
                      })
                    }
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appro-date">Date *</Label>
                  <Input
                    id="appro-date"
                    type="date"
                    value={approvisionnementData.date}
                    onChange={(e) => 
                      setApprovisionnementData({ 
                        ...approvisionnementData, 
                        date: e.target.value 
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenApprovisionnement(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer l'approvisionnement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant pour afficher les détails d'une dépense
const DepenseDetails = ({ 
  depense, 
  onClose 
}: { 
  depense: Depense | null; 
  onClose: () => void;
}) => {
  if (!depense) return null;

  return (
    <Dialog open={!!depense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Détails de la dépense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Titre</p>
              <p className="font-medium">{depense.titre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="font-medium">{depense.montant.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="font-medium">{depense.categorie}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(depense.date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Facture</p>
              <p className="font-medium">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  depense.statut === 'approuve' 
                    ? 'bg-green-100 text-green-800' 
                    : depense.statut === 'rejete'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {depense.statut === 'approuve' ? 'Approuvé' : depense.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="font-medium">{format(new Date(depense.dateCreation), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            {depense.dateModification && (
              <div>
                <p className="text-sm text-muted-foreground">Dernière modification</p>
                <p className="font-medium">{format(new Date(depense.dateModification), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium whitespace-pre-line">{depense.description || 'Aucune description'}</p>
          </div>
          {depense.facture && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Facture</p>
              <a 
                href={depense.facture} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir la facture
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DakarContent;