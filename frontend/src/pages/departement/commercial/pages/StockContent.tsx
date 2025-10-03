import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Edit, Trash2, Package, AlertCircle, Tag, DollarSign, Search, Filter, MoreHorizontal, 
  PackageMinus, Loader2, Warehouse, TrendingUp, BarChart3, Sparkles, Zap, ArrowUpDown,
  Eye, EyeOff, Calculator, MapPin, Truck, Calendar, Shield, Crown
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("all");
  const [showFinancials, setShowFinancials] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    description: "",
    category_id: "none",
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
        `${API_BASE_URL}/api/inventory`,
        {
          headers: { Authorization: `Bearer ${token}` }
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
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Récupérer la liste des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<Category[]>>(
        `${API_BASE_URL}/api/inventory/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
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
  const totalArticles = articles.length;
  const stockFaible = articles.filter(article => article.is_low_stock).length;
  const categoriesUniques = [...new Set(articles.map(article => article.category_name).filter(Boolean))].length;
  const valeurTotale = articles.reduce((sum, article) => sum + (article.quantity * article.prix_achat), 0);
  const valeurVenteTotale = articles.reduce((sum, article) => sum + (article.quantity * article.prix_vente), 0);
  const margeTotale = valeurVenteTotale - valeurTotale;

  // Filtrage des articles
  const filteredArticles = articles.filter(article => {
    const matchSearch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || filterCategory === "all" || article.category_id?.toString() === filterCategory;
    const matchTab = activeTab === "all" || 
                    (activeTab === "low_stock" && article.is_low_stock) ||
                    (activeTab === "out_of_stock" && article.quantity === 0) ||
                    (activeTab === "in_stock" && article.quantity > 0 && !article.is_low_stock);
    
    return matchSearch && matchCategory && matchTab;
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
      if (formData.category_id && formData.category_id !== "none") {
        formDataToSend.append('category_id', formData.category_id);
      }
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
      
      const response = await axios[method]<ApiResponse<unknown>>(
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
          title: '✅ Succès!',
          text: `L'article a été ${currentArticleId ? 'mis à jour' : 'créé'} avec succès.`,
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 2000
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
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "⚠️ Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: '#fff',
      color: '#1f2937',
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchArticles();
        
        Swal.fire({
          title: "🗑️ Supprimé !",
          text: "L'article a été supprimé du stock.",
          icon: "success",
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 1500
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la suppression',
          icon: 'error',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#ef4444'
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
      const response = await axios.patch<ApiResponse<unknown>>(
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
          title: '✅ Succès!',
          text: 'Le stock a été mis à jour avec succès.',
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajustement:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajustement du stock',
        icon: 'error',
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
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
      const response = await axios.post<ApiResponse<unknown>>(
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
          title: "✅ Succès !",
          text: `Sortie de stock effectuée pour ${sortieForm.quantity} ${selectedArticle.unit}(s)`,
          icon: "success",
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la sortie de stock:", error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error',
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (article: Article) => {
    if (article.quantity === 0) {
      return { 
        color: "from-red-500 to-pink-600", 
        label: "Rupture", 
        icon: <AlertCircle className="h-3 w-3" /> 
      };
    }
    if (article.is_low_stock) {
      return { 
        color: "from-orange-500 to-amber-600", 
        label: "Stock faible", 
        icon: <AlertCircle className="h-3 w-3" /> 
      };
    }
    return { 
      color: "from-green-500 to-emerald-600", 
      label: "En stock", 
      icon: <Package className="h-3 w-3" /> 
    };
  };

  const calculateMarge = (prix_achat: number, prix_vente: number) => {
    return prix_vente - prix_achat;
  };

  const calculateMargePercentage = (prix_achat: number, prix_vente: number) => {
    if (prix_achat === 0) return 0;
    return ((prix_vente - prix_achat) / prix_achat) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Animé */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
                  <Warehouse className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  Gestion du Stock
                </h1>
                <p className="text-blue-100 text-lg">Gérez votre inventaire et optimisez vos stocks</p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleOpen()}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Nouvel Article
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: "Total Articles", 
            value: totalArticles, 
            icon: Package, 
            color: "from-blue-500 to-cyan-500",
            description: "Articles en stock"
          },
          { 
            label: "Stock Faible", 
            value: stockFaible, 
            icon: AlertCircle, 
            color: "from-orange-500 to-amber-500",
            description: "Sous le seuil d'alerte"
          },
          { 
            label: "Catégories", 
            value: categoriesUniques, 
            icon: Tag, 
            color: "from-purple-500 to-pink-500",
            description: "Catégories différentes"
          },
          { 
            label: "Valeur Totale", 
            value: valeurTotale.toLocaleString() + " FCFA", 
            icon: DollarSign, 
            color: "from-green-500 to-emerald-500",
            description: "Valeur d'achat du stock"
          }
        ].map((stat, index) => (
          <Card 
            key={stat.label}
            className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: `${(typeof stat.value === 'number' ? (stat.value / Math.max(totalArticles, 1)) * 100 : 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cartes Financières */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Valeur de Vente</p>
                <p className="text-2xl font-bold text-green-900">{valeurVenteTotale.toLocaleString()} FCFA</p>
                <p className="text-xs text-green-700">Valeur totale au prix de vente</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Marge Totale</p>
                <p className="text-2xl font-bold text-blue-900">{margeTotale.toLocaleString()} FCFA</p>
                <p className="text-xs text-blue-700">Bénéfice potentiel total</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Taux de Marge</p>
                <p className="text-2xl font-bold text-purple-900">
                  {valeurTotale > 0 ? ((margeTotale / valeurTotale) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-purple-700">Marge moyenne sur le stock</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de Recherche et Filtres */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900 rounded-xl py-3">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl">
                  <SelectItem value="all" className="hover:bg-gray-100">📦 Toutes les catégories</SelectItem>
                  {categories.map((categorie) => (
                    <SelectItem key={categorie.id} value={categorie.id.toString()} className="hover:bg-blue-50">
                      {categorie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFinancials(!showFinancials)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {showFinancials ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showFinancials ? "Cacher finances" : "Voir finances"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs pour les statuts */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl mb-8">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-1">
              <TabsTrigger value="all" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <Package className="h-4 w-4" />
                Tous ({totalArticles})
              </TabsTrigger>
              <TabsTrigger value="in_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <Package className="h-4 w-4" />
                En stock ({articles.filter(a => a.quantity > 0 && !a.is_low_stock).length})
              </TabsTrigger>
              <TabsTrigger value="low_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                Stock faible ({stockFaible})
              </TabsTrigger>
              <TabsTrigger value="out_of_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                Rupture ({articles.filter(a => a.quantity === 0).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des Articles */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
            Inventaire des Articles
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
              {filteredArticles.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement de l'inventaire...</h3>
              <p className="text-gray-600">Préparation de vos données de stock</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Package className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600 mb-6">
                {articles.length === 0 ? "Commencez par ajouter votre premier article !" : "Aucun résultat pour votre recherche"}
              </p>
              {articles.length === 0 && (
                <Button 
                  onClick={() => handleOpen()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter le Premier Article
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Article
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    {showFinancials && (
                      <>
                        <TableHead className="text-right">Prix Achat</TableHead>
                        <TableHead className="text-right">Prix Vente</TableHead>
                        <TableHead className="text-right">Marge</TableHead>
                      </>
                    )}
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Emplacement
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article, index) => {
                    const statusConfig = getStatusConfig(article);
                    const marge = calculateMarge(article.prix_achat, article.prix_vente);
                    const margePercentage = calculateMargePercentage(article.prix_achat, article.prix_vente);
                    
                    return (
                      <TableRow 
                        key={article.id}
                        className="group hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.01]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {article.image_path ? (
                                <img
                                  src={`${API_BASE_URL}/api/inventory/uploads/${article.image_path.replace('uploads/', '')}`}
                                  alt={article.name}
                                  className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              {article.is_low_stock && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {article.name}
                              </div>
                              {article.description && (
                                <div className="text-sm text-gray-600 truncate max-w-[200px]">
                                  {article.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {article.reference}
                          </code>
                        </TableCell>
                        <TableCell>
                          {article.category_name ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {article.category_name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-gray-900">
                              {article.quantity} {article.unit}
                            </span>
                            {article.seuil_alerte > 0 && (
                              <span className="text-xs text-gray-500">
                                Seuil: {article.seuil_alerte}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`px-3 py-1 text-xs font-bold border-0 text-white bg-gradient-to-r ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </TableCell>
                        {showFinancials && (
                          <>
                            <TableCell className="text-right">
                              <div className="font-semibold text-gray-900">
                                {article.prix_achat.toLocaleString()} FCFA
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-semibold text-green-600">
                                {article.prix_vente.toLocaleString()} FCFA
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-semibold text-blue-600">
                                  {marge.toLocaleString()} FCFA
                                </span>
                                <span className={`text-xs ${margePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {margePercentage >= 0 ? '+' : ''}{margePercentage.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {article.emplacement || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpen(article)}
                              className="h-8 w-8 p-0 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-700 hover:scale-110 transition-all duration-200"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-white border-gray-300 rounded-xl shadow-lg">
                                <DropdownMenuItem 
                                  onClick={() => handleOpenAjustement(article)}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-blue-50"
                                >
                                  <Package className="h-4 w-4 text-blue-600" />
                                  Ajuster le stock
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenSortie(article)}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-orange-50"
                                >
                                  <PackageMinus className="h-4 w-4 text-orange-600" />
                                  Sortir du stock
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50"
                                  onClick={() => handleDelete(article.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue Ajout/Édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                {currentArticleId ? "✨ Modifier l'Article" : "🚀 Nouvel Article"}
              </DialogTitle>
            </DialogHeader>
            
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Informations de base
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Nom de l'article *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nom de l'article"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-sm font-semibold text-gray-700">
                      Référence
                    </Label>
                    <Input
                      id="reference"
                      placeholder="Référence unique"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category_id" className="text-sm font-semibold text-gray-700">
                      Catégorie
                    </Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="none">Aucune catégorie</SelectItem>
                        {categories.map((categorie) => (
                          <SelectItem key={categorie.id} value={categorie.id.toString()} className="focus:bg-blue-50">
                            {categorie.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Stock et Prix
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                        Quantité *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                        Unité
                      </Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {unites.map((unite) => (
                            <SelectItem key={unite} value={unite} className="focus:bg-blue-50">
                              {unite}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="prix_achat" className="text-sm font-semibold text-gray-700">
                        Prix d'achat *
                      </Label>
                      <Input
                        id="prix_achat"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prix_achat}
                        onChange={(e) => setFormData({ ...formData, prix_achat: Number(e.target.value) })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prix_vente" className="text-sm font-semibold text-gray-700">
                        Prix de vente *
                      </Label>
                      <Input
                        id="prix_vente"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prix_vente}
                        onChange={(e) => setFormData({ ...formData, prix_vente: Number(e.target.value) })}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seuil_alerte" className="text-sm font-semibold text-gray-700">
                      Seuil d'alerte *
                    </Label>
                    <Input
                      id="seuil_alerte"
                      type="number"
                      min="0"
                      value={formData.seuil_alerte}
                      onChange={(e) => setFormData({ ...formData, seuil_alerte: Number(e.target.value) })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:col-span-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Fournisseur et Emplacement
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur" className="text-sm font-semibold text-gray-700">
                      Fournisseur
                    </Label>
                    <Input
                      id="fournisseur"
                      placeholder="Nom du fournisseur"
                      value={formData.fournisseur}
                      onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emplacement" className="text-sm font-semibold text-gray-700">
                      Emplacement
                    </Label>
                    <Input
                      id="emplacement"
                      placeholder="Emplacement dans le stock"
                      value={formData.emplacement}
                      onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:col-span-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  Description et Image
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Description détaillée de l'article..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                      Image de l'article
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formats acceptés: JPG, PNG, WEBP. Taille maximale: 2MB
                    </p>
                    {(previewImage || (selectedArticle?.image_path && !previewImage)) && (
                      <div className="mt-2">
                        <img
                          src={previewImage || `${API_BASE_URL}/${selectedArticle?.image_path}`}
                          alt="Aperçu de l'image"
                          className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Zap className="h-4 w-4 mr-2" />
                {currentArticleId ? "💫 Mettre à jour" : "✨ Créer l'article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajustement de stock */}
      <Dialog open={openAjustement} onOpenChange={setOpenAjustement}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ajuster le Stock
              </DialogTitle>
              <DialogDescription className="text-green-100">
                Modifiez la quantité en stock pour {selectedArticle?.name}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmitAjustement} className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                  Nouvelle quantité *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={ajustementForm.quantity}
                  onChange={(e) => setAjustementForm({
                    ...ajustementForm,
                    quantity: Number(e.target.value)
                  })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Stock actuel: {selectedArticle?.quantity} {selectedArticle?.unit}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenAjustement(false)}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Package className="h-4 w-4 mr-2" />
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de sortie de stock */}
      <Dialog open={openSortie} onOpenChange={setOpenSortie}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-orange-600 to-amber-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <PackageMinus className="h-5 w-5" />
                Sortie de Stock
              </DialogTitle>
              <DialogDescription className="text-orange-100">
                Enregistrez une sortie de stock pour {selectedArticle?.name}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSortieStock} className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                  Quantité à sortir *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedArticle?.quantity}
                  value={sortieForm.quantity}
                  onChange={(e) => setSortieForm({
                    ...sortieForm,
                    quantity: Number(e.target.value)
                  })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500">
                  Stock disponible: {selectedArticle?.quantity} {selectedArticle?.unit}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">
                  Raison de la sortie
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Décrivez la raison de cette sortie de stock..."
                  value={sortieForm.reason}
                  onChange={(e) => setSortieForm({
                    ...sortieForm,
                    reason: e.target.value
                  })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 min-h-[80px] resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenSortie(false)}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !sortieForm.quantity || sortieForm.quantity <= 0}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <PackageMinus className="h-4 w-4 mr-2" />
                Enregistrer la sortie
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant Info pour remplacer AlertCircle dans le dialogue d'ajustement
const Info = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default StockContent;