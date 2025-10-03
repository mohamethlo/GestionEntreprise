import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, AlertCircle, Tag, DollarSign, Search, Filter, MoreHorizontal, PackageMinus, Loader2 } from "lucide-react";
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
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";

// Configuration API
const API_BASE_URL = "http://localhost:5000";
const AUTH_TOKEN_KEY = 'authToken';

const useAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Article {
  id: number;
  name: string;
  reference: string;
  description: string;
  category_id: number | null;
  category_name: string | null;
  quantity: number;
  unit: string;
  prix_achat: number;
  prix_vente: number;
  seuil_alerte: number;
  fournisseur: string;
  emplacement: string;
  image_path: string | null;
  is_low_stock: boolean;
  created_at: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface SortieStockForm {
  quantity: number;
  reason: string;
}

interface AjustementStockForm {
  quantity: number;
}

const unites = ['Pièce', 'Kg', 'Litre', 'Mètre', 'Paquet', 'Carton', 'Boîte'];

const StockContent = () => {
  const token = useAuthToken();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openSortie, setOpenSortie] = useState(false);
  const [openAjustement, setOpenAjustement] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sortieForm, setSortieForm] = useState<SortieStockForm>({ quantity: 0, reason: '' });
  const [ajustementForm, setAjustementForm] = useState<AjustementStockForm>({ quantity: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    description: "",
    category_id: "none", // Au lieu de ""
    quantity: 0,
    unit: "Pièce",
    prix_achat: 0,
    prix_vente: 0,
    seuil_alerte: 5,
    fournisseur: "",
    emplacement: ""
  });

  // Récupérer la liste des articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Article[]>>(
        `${API_BASE_URL}/api/inventory` ,
        {
          headers: { Authorization: `Bearer ${token}`  }
        }
      );
      
      if (response.data.success && response.data.data) {
        setArticles(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger la liste des articles',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Récupérer la liste des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<Category[]>>(
        `${API_BASE_URL}/api/inventory/categories` ,
        {
          headers: { Authorization: `Bearer ${token}`  }
        }
      );
      
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  // Calcul des statistiques
  const totalArticles = articles.length; // Compte le nombre d'articles uniques
  const stockFaible = articles.filter(article => article.is_low_stock).length;
  const categoriesUniques = [...new Set(articles.map(article => article.category_name).filter(Boolean))].length;
  const valeurTotale = articles.reduce((sum, article) => sum + (article.quantity * article.prix_achat), 0);

  // Filtrage des articles
  const filteredArticles = articles.filter(article => {
    const matchSearch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || article.category_id?.toString() === filterCategory;
    return matchSearch && matchCategory;
  });

  // Gestion du changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  // Gestion de l'ouverture du formulaire
  const handleOpen = (article: Article | null = null) => {
    setPreviewImage(null);
    setSelectedImage(null);
    if (article) {
      setFormData({
        name: article.name,
        reference: article.reference,
        description: article.description,
        category_id: article.category_id?.toString() || "",
        quantity: article.quantity,
        unit: article.unit,
        prix_achat: article.prix_achat,
        prix_vente: article.prix_vente,
        seuil_alerte: article.seuil_alerte,
        fournisseur: article.fournisseur,
        emplacement: article.emplacement
      });
      setCurrentArticleId(article.id);
    } else {
      setFormData({
        name: "",
        reference: "",
        description: "",
        category_id: "",
        quantity: 0,
        unit: "Pièce",
        prix_achat: 0,
        prix_vente: 0,
        seuil_alerte: 5,
        fournisseur: "",
        emplacement: ""
      });
      setCurrentArticleId(null);
    }
    setOpen(true);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('reference', formData.reference);
      formDataToSend.append('description', formData.description);
      if (formData.category_id) formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('quantity', formData.quantity.toString());
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('prix_achat', formData.prix_achat.toString());
      formDataToSend.append('prix_vente', formData.prix_vente.toString());
      formDataToSend.append('seuil_alerte', formData.seuil_alerte.toString());
      formDataToSend.append('fournisseur', formData.fournisseur);
      formDataToSend.append('emplacement', formData.emplacement);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const url = currentArticleId 
        ? `${API_BASE_URL}/api/inventory/${currentArticleId}` 
        : `${API_BASE_URL}/api/inventory`;
      
      const method = currentArticleId ? 'put' : 'post';
      
      const response = await axios[method]<ApiResponse<any>>(
        url,
        formDataToSend,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      
      if (response.data.success) {
        await fetchArticles();
        
        Swal.fire({
          title: 'Succès!',
          text: `L'article a été ${currentArticleId ? 'mis à jour' : 'créé'} avec succès.`,
          icon: 'success',
        });
        
        setOpen(false);
        setCurrentArticleId(null);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      Swal.fire({
        title: 'Erreur',
        text: `Une erreur est survenue lors de ${currentArticleId ? 'la mise à jour' : 'la création'} de l'article`,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchArticles();
        
        Swal.fire({
          title: "Supprimé !",
          text: "L'article a été supprimé du stock.",
          icon: "success",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la suppression',
          icon: 'error',
        });
      }
    }
  };

  // Gestion de l'ajustement du stock
  const handleOpenAjustement = (article: Article) => {
    setSelectedArticle(article);
    setAjustementForm({ quantity: article.quantity });
    setOpenAjustement(true);
  };

  const handleSubmitAjustement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    setIsSubmitting(true);
    try {
      const response = await axios.patch<ApiResponse<any>>(
        `${API_BASE_URL}/api/inventory/${selectedArticle.id}/quantity`,
        { quantity: ajustementForm.quantity },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      if (response.data.success) {
        await fetchArticles();
        setOpenAjustement(false);
        Swal.fire({
          title: 'Succès!',
          text: 'Le stock a été mis à jour avec succès.',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajustement:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajustement du stock',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la sortie de stock
  const handleOpenSortie = (article: Article) => {
    setSelectedArticle(article);
    setSortieForm({ quantity: 0, reason: '' });
    setOpenSortie(true);
  };

  const handleSortieStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || sortieForm.quantity <= 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/inventory/${selectedArticle.id}/outbound`,
        { 
          quantity: sortieForm.quantity,
          reason: sortieForm.reason
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      );

      if (response.data.success) {
        await fetchArticles();
        setOpenSortie(false);
        Swal.fire({
          title: "Succès !",
          text: `Sortie de stock effectuée pour ${sortieForm.quantity} ${selectedArticle.unit}(s)`,
          icon: "success",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la sortie de stock:", error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (article: Article) => {
    if (article.quantity === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (article.is_low_stock) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Stock faible</Badge>;
    }
    return <Badge variant="default">En stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Gestion du Stock</h2>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
            <p className="text-xs text-muted-foreground">Articles en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockFaible}</div>
            <p className="text-xs text-muted-foreground">Articles sous le seuil d'alerte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesUniques}</div>
            <p className="text-xs text-muted-foreground">Catégories différentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valeurTotale.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">Valeur totale du stock</p>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((categorie) => (
                <SelectItem key={categorie.id} value={categorie.id.toString()}>
                    {categorie.name}
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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
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
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.image_path ? (
                          <img
                            src={`${API_BASE_URL}/${article.image_path}`}
                            alt={article.name}
                            className="h-10 w-10 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{article.reference}</TableCell>
                      <TableCell className="font-medium">{article.name}</TableCell>
                      <TableCell>{article.category_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        {article.quantity} {article.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(article)}
                      </TableCell>
                      <TableCell className="text-right">{article.prix_achat.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-right">{article.prix_vente.toLocaleString()} FCFA</TableCell>
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
                              <DropdownMenuItem onClick={() => handleOpenAjustement(article)}>
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
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Nom de l'article"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  placeholder="Référence de l'article"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Catégorie</Label>
                <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                    {/* Option pour "Aucune catégorie" avec une valeur non vide */}
                    <SelectItem value="none">Aucune catégorie</SelectItem>
                    {categories.map((categorie) => (
                        <SelectItem key={categorie.id} value={categorie.id.toString()}>
                        {categorie.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
             </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
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
                <Label htmlFor="prix_achat">Prix d'achat (FCFA) *</Label>
                <Input
                  id="prix_achat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prix_achat}
                  onChange={(e) => setFormData({ ...formData, prix_achat: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix_vente">Prix de vente (FCFA) *</Label>
                <Input
                  id="prix_vente"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prix_vente}
                  onChange={(e) => setFormData({ ...formData, prix_vente: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seuil_alerte">Seuil d'alerte *</Label>
                <Input
                  id="seuil_alerte"
                  type="number"
                  min="0"
                  value={formData.seuil_alerte}
                  onChange={(e) => setFormData({ ...formData, seuil_alerte: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  placeholder="Nom du fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emplacement">Emplacement</Label>
                <Input
                  id="emplacement"
                  placeholder="Emplacement dans le stock"
                  value={formData.emplacement}
                  onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de l'article..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: JPG, PNG, WEBP. Taille maximale: 2MB
                </p>
                {(previewImage || (selectedArticle?.image_path && !previewImage)) && (
                  <div className="mt-2">
                    <img
                      src={previewImage || `${API_BASE_URL}/${selectedArticle?.image_path}`}
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
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              Modifiez la quantité en stock pour {selectedArticle?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAjustement}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Nouvelle quantité
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={ajustementForm.quantity}
                  onChange={(e) => setAjustementForm({
                    ...ajustementForm,
                    quantity: Number(e.target.value)
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenAjustement(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
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
              Enregistrez une sortie de stock pour {selectedArticle?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSortieStock}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantité à sortir
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedArticle?.quantity}
                  className="col-span-3"
                  value={sortieForm.quantity}
                  onChange={(e) => setSortieForm({
                    ...sortieForm,
                    quantity: Number(e.target.value)
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Raison
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Raison de la sortie (facultatif)"
                  className="col-span-3"
                  value={sortieForm.reason}
                  onChange={(e) => setSortieForm({
                    ...sortieForm,
                    reason: e.target.value
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenSortie(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !sortieForm.quantity || sortieForm.quantity <= 0}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer la sortie
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockContent;
