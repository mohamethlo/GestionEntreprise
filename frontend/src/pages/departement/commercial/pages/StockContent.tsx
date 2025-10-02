import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, AlertCircle, Tag, DollarSign, Search, Filter, MoreHorizontal, PackageMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Types
interface Article {
  id: string;
  nom: string;
  reference: string;
  description: string;
  categorie: string;
  quantite: number;
  unite: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  fournisseur: string;
  emplacement: string;
  imageUrl?: string;
  imageFile?: File | null;
  dateAjout: string;
  statut: 'En stock' | 'Stock faible' | 'Rupture';
}

interface SortieStockForm {
  quantite: number;
  raison: string;
}

interface AjustementStockForm {
  nouvelleQuantite: number;
}

// Données de test pour les sélecteurs
const categories = [
  'Électronique', 'Informatique', 'Bureautique', 'Mobilier', 'Fournitures', 'Autre'
];

const unites = [
  'Pièce', 'Kg', 'Litre', 'Mètre', 'Paquet', 'Carton', 'Boîte'
];

const fournisseurs = [
  'Fournisseur A', 'Fournisseur B', 'Fournisseur C', 'Autre'
];

const emplacements = [
  'Entrepôt A', 'Entrepôt B', 'Bureau', 'Rayon 1', 'Rayon 2', 'Stockage extérieur'
];

const StockContent = () => {
  // État pour la liste des articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [open, setOpen] = useState(false);
  const [openSortie, setOpenSortie] = useState(false);
  const [openAjustement, setOpenAjustement] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sortieForm, setSortieForm] = useState<SortieStockForm>({ quantite: 0, raison: '' });
  const [ajustementForm, setAjustementForm] = useState<AjustementStockForm>({ nouvelleQuantite: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: "",
    reference: "",
    description: "",
    categorie: "",
    quantite: 0,
    unite: "",
    prixAchat: 0,
    prixVente: 0,
    seuilAlerte: 5, // Valeur par défaut
    fournisseur: "",
    emplacement: "",
    imageUrl: ""
  });

  // Calcul des statistiques
  const totalArticles = articles.reduce((sum, article) => sum + article.quantite, 0);
  const stockFaible = articles.filter(article => article.quantite <= article.seuilAlerte).length;
  const categoriesUniques = [...new Set(articles.map(article => article.categorie))].length;
  const valeurTotale = articles.reduce((sum, article) => sum + (article.quantite * article.prixAchat), 0);

  // Gestion du changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  // Gestion de l'ajustement du stock
  const handleAjustementStock = (article: Article) => {
    setSelectedArticle(article);
    setAjustementForm({ nouvelleQuantite: article.quantite });
    setOpenAjustement(true);
  };

  const handleSubmitAjustement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    setArticles(articles.map(article => {
      if (article.id === selectedArticle.id) {
        const updatedArticle = {
          ...article,
          quantite: ajustementForm.nouvelleQuantite,
          statut: updateStatut(ajustementForm.nouvelleQuantite, article.seuilAlerte)
        };
        return updatedArticle;
      }
      return article;
    }));

    setOpenAjustement(false);
    Swal.fire({
      title: 'Succès!',
      text: 'Le stock a été mis à jour avec succès.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  // Mise à jour du statut en fonction de la quantité
  const updateStatut = (quantite: number, seuilAlerte: number): 'En stock' | 'Stock faible' | 'Rupture' => {
    if (quantite === 0) return 'Rupture';
    if (quantite <= seuilAlerte) return 'Stock faible';
    return 'En stock';
  };


  // Gestion de l'ouverture du formulaire de sortie de stock
  const handleOpenSortie = (article: Article) => {
    setSelectedArticle(article);
    setSortieForm({ quantite: 0, raison: '' });
    setOpenSortie(true);
  };

  // Gestion de l'ouverture du formulaire d'ajustement de stock
  const handleOpenAjustement = (article: Article) => {
    setSelectedArticle(article);
    setAjustementForm({ nouvelleQuantite: article.quantite });
    setOpenAjustement(true);
  };

  // Gestion de la sortie de stock
  const handleSortieStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || sortieForm.quantite <= 0) return;
    
    const updatedArticles = articles.map(article => {
      if (article.id === selectedArticle.id) {
        const nouvelleQuantite = article.quantite - sortieForm.quantite;
        return {
          ...article,
          quantite: nouvelleQuantite,
          statut: updateStatut(nouvelleQuantite, article.seuilAlerte)
        };
      }
      return article;
    });
    
    setArticles(updatedArticles);
    setOpenSortie(false);
    
    Swal.fire({
      title: "Succès !",
      text: `Sortie de stock effectuée pour ${sortieForm.quantite} ${selectedArticle.unite}(s)`,
      icon: "success",
      confirmButtonColor: "#3b82f6",
    });
  };

  // Gestion de la soumission du formulaire d'ajustement de stock
  const handleAjustementStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || ajustementForm.nouvelleQuantite < 0) return;
    
    const updatedArticles = articles.map(article => {
      if (article.id === selectedArticle.id) {
        return {
          ...article,
          quantite: ajustementForm.nouvelleQuantite,
          statut: updateStatut(ajustementForm.nouvelleQuantite, article.seuilAlerte)
        };
      }
      return article;
    });
    
    setArticles(updatedArticles);
    setOpenAjustement(false);
    
    Swal.fire({
      title: "Succès !",
      text: "Stock ajusté avec succès",
      icon: "success",
      confirmButtonColor: "#3b82f6",
    });
  };


  // Gestion de l'ouverture du formulaire (ajout/édition)
  const handleOpen = (article: Article | null = null) => {
    setPreviewImage(null);
    if (article) {
      setFormData({
        nom: article.nom,
        reference: article.reference,
        description: article.description,
        categorie: article.categorie,
        quantite: article.quantite,
        unite: article.unite,
        prixAchat: article.prixAchat,
        prixVente: article.prixVente,
        seuilAlerte: article.seuilAlerte,
        fournisseur: article.fournisseur,
        emplacement: article.emplacement,
        imageUrl: article.imageUrl || ""
      });
      setCurrentArticleId(article.id);
    } else {
      setFormData({
        nom: "",
        reference: "",
        description: "",
        categorie: "",
        quantite: 0,
        unite: "",
        prixAchat: 0,
        prixVente: 0,
        seuilAlerte: 5,
        fournisseur: "",
        emplacement: "",
        imageUrl: ""
      });
      setCurrentArticleId(null);
    }
    setOpen(true);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si une image est requise pour les nouveaux articles
    if (!currentArticleId && !formData.imageUrl) {
      Swal.fire({
        title: "Image requise",
        text: "Veuillez ajouter une image pour l'article",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    
    // Si c'est une nouvelle image locale, convertir en base64
    if (previewImage && !formData.imageUrl.startsWith('data:')) {
      setFormData(prev => ({ ...prev, imageUrl: previewImage }));
      return; // La soumission se fera au prochain appel suite à la mise à jour de l'état
    }
    
    if (currentArticleId) {
      // Mise à jour d'un article existant
      setArticles(
        articles.map((article) =>
          article.id === currentArticleId
            ? {
                ...article,
                ...formData,
                quantite: Number(formData.quantite),
                prixAchat: Number(formData.prixAchat),
                prixVente: Number(formData.prixVente),
                seuilAlerte: Number(formData.seuilAlerte),
                statut: updateStatut(Number(formData.quantite), Number(formData.seuilAlerte))
              }
            : article
        )
      );
      Swal.fire({
        title: "Succès !",
        text: "L'article a été mis à jour avec succès.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    } else {
      // Création d'un nouvel article
      const newArticle: Article = {
        id: Date.now().toString(),
        dateAjout: new Date().toISOString(),
        statut: updateStatut(Number(formData.quantite), Number(formData.seuilAlerte)),
        ...formData,
        quantite: Number(formData.quantite),
        prixAchat: Number(formData.prixAchat),
        prixVente: Number(formData.prixVente),
        seuilAlerte: Number(formData.seuilAlerte)
      };
      setArticles([...articles, newArticle]);
      Swal.fire({
        title: "Succès !",
        text: "L'article a été ajouté au stock avec succès.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });
    }
    setOpen(false);
  };

  // Gestion de la suppression d'un article
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
        setArticles(articles.filter((article) => article.id !== id));
        Swal.fire({
          title: "Supprimé !",
          text: "L'article a été supprimé du stock.",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      }
    });
  };

  // Vérification du statut du stock
  const getStockStatus = (quantite: number, seuilAlerte: number) => {
    if (quantite === 0) return { class: "text-red-600 font-medium", text: "Rupture" };
    if (quantite <= seuilAlerte) return { class: "text-amber-600 font-medium", text: "Stock faible" };
    return { class: "text-green-600 font-medium", text: "En stock" };
  };

  // Obtenir la classe CSS pour le badge de statut
  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case 'Rupture':
        return 'bg-red-100 text-red-800';
      case 'Stock faible':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestion du Stock</h2>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {/* Dialogue d'ajustement de stock */}
      <Dialog open={openAjustement} onOpenChange={setOpenAjustement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster le stock</DialogTitle>
            <DialogDescription>
              Ajustez la quantité en stock pour {selectedArticle?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAjustement}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nouvelleQuantite" className="text-right">
                  Nouvelle quantité
                </Label>
                <Input
                  id="nouvelleQuantite"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={ajustementForm.nouvelleQuantite}
                  onChange={(e) => setAjustementForm({
                    ...ajustementForm,
                    nouvelleQuantite: Number(e.target.value)
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAjustement(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de sortie de stock */}
      <Dialog open={openSortie} onOpenChange={setOpenSortie}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sortie de stock</DialogTitle>
            <DialogDescription>
              Enregistrer une sortie de stock pour {selectedArticle?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSortieStock}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantiteSortie" className="text-right">
                  Quantité à sortir
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="quantiteSortie"
                    type="number"
                    min="1"
                    max={selectedArticle?.quantite}
                    value={sortieForm.quantite}
                    onChange={(e) => setSortieForm({
                      ...sortieForm,
                      quantite: Number(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Stock actuel: {selectedArticle?.quantite} {selectedArticle?.unite}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="raisonSortie" className="text-right">
                  Raison
                </Label>
                <Input
                  id="raisonSortie"
                  className="col-span-3"
                  value={sortieForm.raison}
                  onChange={(e) => setSortieForm({
                    ...sortieForm,
                    raison: e.target.value
                  })}
                  placeholder="Ex: Vente, Perte, Don, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenSortie(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!sortieForm.quantite || !sortieForm.raison}>
                Enregistrer la sortie
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              Articles en stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockFaible}</div>
            <p className="text-xs text-muted-foreground">
              Articles sous le seuil d'alerte
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesUniques}</div>
            <p className="text-xs text-muted-foreground">
              Catégories différentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valeurTotale.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Valeur totale du stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un article..."
            className="w-full pl-8"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrer par catégorie" />
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

      {/* Tableau des articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Liste des Articles en Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun article en stock</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un article.</p>
              <div className="mt-6">
                <Button onClick={() => handleOpen()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un article
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Prix d'achat</TableHead>
                    <TableHead className="text-right">Prix de vente</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt={article.nom}
                            className="h-10 w-10 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{article.reference}</TableCell>
                      <TableCell className="font-medium">{article.nom}</TableCell>
                      <TableCell>{article.categorie}</TableCell>
                      <TableCell className="text-right">
                        {article.quantite} {article.unite}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={article.statut === 'En stock' ? 'default' : 
                                  article.statut === 'Stock faible' ? 'secondary' : 'destructive'}
                          className={article.statut === 'Stock faible' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                        >
                          {article.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{article.prixAchat.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-right">{article.prixVente.toLocaleString()} FCFA</TableCell>
                      <TableCell>{article.emplacement}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpen(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleAjustementStock(article)}>
                                <Package className="mr-2 h-4 w-4" />
                                Ajuster le stock
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenSortie(article)}>
                                <PackageMinus className="mr-2 h-4 w-4" />
                                Sortir du stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(article.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Formulaire d'ajout/modification */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentArticleId ? "Modifier l'article" : "Ajouter un article au stock"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Nom de l'article"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  placeholder="Référence de l'article"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie *</Label>
                <Select
                  value={formData.categorie}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categorie: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
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
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité *</Label>
                <Input
                  id="quantite"
                  type="number"
                  min="0"
                  value={formData.quantite}
                  onChange={(e) =>
                    setFormData({ ...formData, quantite: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unite">Unité</Label>
                <Select
                  value={formData.unite}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unite: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {unites.map((unite) => (
                      <SelectItem key={unite} value={unite}>
                        {unite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixAchat">Prix d'achat (FCFA) *</Label>
                <Input
                  id="prixAchat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prixAchat}
                  onChange={(e) =>
                    setFormData({ ...formData, prixAchat: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixVente">Prix de vente (FCFA) *</Label>
                <Input
                  id="prixVente"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prixVente}
                  onChange={(e) =>
                    setFormData({ ...formData, prixVente: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seuilAlerte">Seuil d'alerte *</Label>
                <Input
                  id="seuilAlerte"
                  type="number"
                  min="0"
                  value={formData.seuilAlerte}
                  onChange={(e) =>
                    setFormData({ ...formData, seuilAlerte: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  placeholder="Nom du fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) =>
                    setFormData({ ...formData, fournisseur: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emplacement">Emplacement</Label>
                <Input
                  id="emplacement"
                  placeholder="Emplacement dans le stock"
                  value={formData.emplacement}
                  onChange={(e) =>
                    setFormData({ ...formData, emplacement: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de l'article..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imageUpload">Image de l'article</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: JPG, PNG, WEBP. Taille maximale: 2MB
                </p>
                {(previewImage || formData.imageUrl) && (
                  <div className="mt-2">
                    <img
                      src={previewImage || formData.imageUrl}
                      alt="Aperçu de l'image"
                      className="h-32 w-32 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
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
                {currentArticleId ? "Mettre à jour" : "Ajouter l'article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajustement de stock */}
      <Dialog open={openAjustement} onOpenChange={setOpenAjustement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster le stock</DialogTitle>
            <DialogDescription>
              Modifiez la quantité en stock pour {selectedArticle?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAjustement}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nouvelleQuantite" className="text-right">
                  Nouvelle quantité
                </Label>
                <Input
                  id="nouvelleQuantite"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={ajustementForm.nouvelleQuantite}
                  onChange={(e) => setAjustementForm({
                    ...ajustementForm,
                    nouvelleQuantite: Number(e.target.value)
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAjustement(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockContent;