import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Edit, Trash2, Package, Search, Filter, Sparkles, Zap, 
  TrendingUp, DollarSign, AlertCircle, Truck, BarChart3, Loader2,
  ArrowUpDown, Eye, Warehouse, Target, Crown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Product {
  id: string;
  designation: string;
  quantite: number;
  seuilAlerte: number;
  prixUnitaire: number;
  fournisseur: string;
  imageUrl?: string;
}

const API_URL = "http://localhost:5000/api/products"; 

const ProductContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    designation: string;
    quantite: number;
    seuilAlerte: number;
    prixUnitaire: number;
    fournisseur: string;
    imageFile: File | null;
  }>({
    designation: "",
    quantite: 0,
    seuilAlerte: 5,
    prixUnitaire: 0,
    fournisseur: "",
    imageFile: null,
  });

  // 🔹 Charger la liste des produits au montage
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();

      // 🔹 Mapping : Les noms de champs correspondent aux clés du backend Flask
      const mappedProducts = data.map((p: any) => ({
        id: String(p.id),
        designation: p.name,
        quantite: p.quantity,
        seuilAlerte: p.alert_quantity,
        prixUnitaire: p.unit_price,
        fournisseur: p.supplier,
        imageUrl: p.image_path ? `http://localhost:5000/${p.image_path}` : null, 
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger la liste des produits',
        icon: 'error',
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imageFile: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpen = (product: Product | null = null) => {
    if (product) {
      setCurrentProductId(product.id);
      setFormData({
        designation: product.designation,
        quantite: product.quantite,
        seuilAlerte: product.seuilAlerte,
        prixUnitaire: product.prixUnitaire,
        fournisseur: product.fournisseur,
        imageFile: null,
      });
      setPreviewImage(product.imageUrl || null);
    } else {
      setCurrentProductId(null);
      setFormData({
        designation: "",
        quantite: 0,
        seuilAlerte: 5,
        prixUnitaire: 0,
        fournisseur: "",
        imageFile: null,
      });
      setPreviewImage(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    // Clés alignées sur le modèle Flask
    form.append("name", formData.designation);
    form.append("quantity", String(formData.quantite)); 
    form.append("alert_quantity", String(formData.seuilAlerte));
    form.append("unit_price", String(formData.prixUnitaire));
    form.append("supplier", formData.fournisseur); 
    if (formData.imageFile) form.append("image", formData.imageFile); 

    try {
      if (currentProductId) {
        await fetch(`${API_URL}/${currentProductId}`, {
          method: "PUT",
          body: form,
        });
        Swal.fire({
          title: '✅ Succès!',
          text: "Produit mis à jour avec succès",
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          body: form,
        });
        Swal.fire({
          title: '✅ Succès!',
          text: "Produit ajouté avec succès",
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      }

      setOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Erreur sauvegarde produit:", error);
      Swal.fire({
        title: 'Erreur!',
        text: "Impossible d'enregistrer le produit",
        icon: 'error',
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "⚠️ Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
      background: '#fff',
      color: '#1f2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          Swal.fire({
            title: "🗑️ Supprimé!",
            text: "Le produit a été supprimé.",
            icon: "success",
            background: '#fff',
            color: '#1f2937',
            confirmButtonColor: '#10b981',
            timer: 1500
          });
          fetchProducts();
        } catch (error) {
          console.error("Erreur suppression:", error);
          Swal.fire({
            title: 'Erreur!',
            text: "Impossible de supprimer le produit",
            icon: 'error',
            background: '#fff',
            color: '#1f2937',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
  };

  // 🔹 Fonction d'aide pour le statut
  const getProductStatus = (quantite: number, seuilAlerte: number) => {
    if (quantite === 0) return { 
      label: "Rupture", 
      color: "from-red-500 to-pink-600",
      icon: <AlertCircle className="h-3 w-3" />
    };
    if (quantite <= seuilAlerte)
      return {
        label: "Stock faible",
        color: "from-orange-500 to-amber-600",
        icon: <AlertCircle className="h-3 w-3" />
      };
    return { 
      label: "En stock", 
      color: "from-green-500 to-emerald-600",
      icon: <Package className="h-3 w-3" />
    };
  };

  // Calcul des statistiques
  const totalProducts = products.length;
  const stockFaible = products.filter(p => p.quantite > 0 && p.quantite <= p.seuilAlerte).length;
  const ruptureStock = products.filter(p => p.quantite === 0).length;
  const valeurTotale = products.reduce((sum, product) => sum + (product.quantite * product.prixUnitaire), 0);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchSearch = product.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTab = activeTab === "all" || 
                    (activeTab === "in_stock" && product.quantite > product.seuilAlerte) ||
                    (activeTab === "low_stock" && product.quantite > 0 && product.quantite <= product.seuilAlerte) ||
                    (activeTab === "out_of_stock" && product.quantite === 0);
    
    return matchSearch && matchTab;
  });

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
                  <Package className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  Gestion des Produits
                </h1>
                <p className="text-blue-100 text-lg">Gérez votre catalogue produits et optimisez vos stocks</p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleOpen()}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau Produit
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: "Total Produits", 
            value: totalProducts, 
            icon: Package, 
            color: "from-blue-500 to-cyan-500",
            description: "Produits en catalogue"
          },
          { 
            label: "Stock Faible", 
            value: stockFaible, 
            icon: AlertCircle, 
            color: "from-orange-500 to-amber-500",
            description: "Sous le seuil d'alerte"
          },
          { 
            label: "Rupture", 
            value: ruptureStock, 
            icon: AlertCircle, 
            color: "from-red-500 to-rose-500",
            description: "Produits épuisés"
          },
          { 
            label: "Valeur Totale", 
            value: valeurTotale.toLocaleString() + " FCFA", 
            icon: DollarSign, 
            color: "from-green-500 to-emerald-500",
            description: "Valeur du stock"
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
                  style={{ width: `${(typeof stat.value === 'number' ? (stat.value / Math.max(totalProducts, 1)) * 100 : 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barre de Recherche et Filtres */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setActiveTab("all");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Réinitialiser
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
                Tous ({totalProducts})
              </TabsTrigger>
              <TabsTrigger value="in_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <Package className="h-4 w-4" />
                En stock ({products.filter(p => p.quantite > p.seuilAlerte).length})
              </TabsTrigger>
              <TabsTrigger value="low_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                Stock faible ({stockFaible})
              </TabsTrigger>
              <TabsTrigger value="out_of_stock" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                Rupture ({ruptureStock})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des Produits */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
            Catalogue des Produits
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
              {filteredProducts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement du catalogue...</h3>
              <p className="text-gray-600">Préparation de vos produits</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Package className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 ? "Commencez par ajouter votre premier produit !" : "Aucun résultat pour votre recherche"}
              </p>
              {products.length === 0 && (
                <Button 
                  onClick={() => handleOpen()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter le Premier Produit
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
                        Produit
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Prix Unitaire</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Fournisseur
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const quantite = Number(product.quantite) || 0;
                    const prixUnitaire = Number(product.prixUnitaire) || 0;
                    const fournisseur = (product.fournisseur && String(product.fournisseur).trim() !== '') ? product.fournisseur : "-";
                    const status = getProductStatus(quantite, product.seuilAlerte ?? 5);
                    
                    return (
                      <TableRow 
                        key={product.id}
                        className="group hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.01]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.designation ?? "Produit"}
                                  className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              {quantite <= product.seuilAlerte && quantite > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                              )}
                              {quantite === 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {product.designation ?? "-"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Seuil: {product.seuilAlerte}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-gray-900">
                              {quantite}
                            </span>
                            <span className="text-xs text-gray-500">
                              Seuil: {product.seuilAlerte}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge 
                            className={`px-3 py-1 text-xs font-bold border-0 text-white bg-gradient-to-r ${status.color}`}
                          >
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="font-semibold text-green-600">
                            {prixUnitaire.toLocaleString('fr-FR', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            FCFA
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Truck className="h-4 w-4 text-blue-600" />
                            {fournisseur}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpen(product)}
                              className="h-8 w-8 p-0 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

      {/* Formulaire */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                {currentProductId ? "✨ Modifier le Produit" : "🚀 Nouveau Produit"}
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Informations du produit
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-sm font-semibold text-gray-700">
                      Désignation *
                    </Label>
                    <Input
                      id="designation"
                      value={formData.designation ?? ""} 
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fournisseur" className="text-sm font-semibold text-gray-700">
                      Fournisseur
                    </Label>
                    <Input
                      id="fournisseur"
                      value={formData.fournisseur ?? ""} 
                      onChange={(e) =>
                        setFormData({ ...formData, fournisseur: e.target.value })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                      <Label htmlFor="quantite" className="text-sm font-semibold text-gray-700">
                        Quantité *
                      </Label>
                      <Input
                        id="quantite"
                        type="number"
                        min="0"
                        value={formData.quantite} 
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantite: Number(e.target.value),
                          })
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seuilAlerte" className="text-sm font-semibold text-gray-700">
                        Seuil d'alerte *
                      </Label>
                      <Input
                        id="seuilAlerte"
                        type="number"
                        min="0"
                        value={formData.seuilAlerte}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seuilAlerte: Number(e.target.value),
                          })
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prixUnitaire" className="text-sm font-semibold text-gray-700">
                      Prix Unitaire (FCFA) *
                    </Label>
                    <Input
                      id="prixUnitaire"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prixUnitaire}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prixUnitaire: Number(e.target.value),
                        })
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:col-span-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Image du produit
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Image du produit
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formats acceptés: JPG, PNG, WEBP
                    </p>
                  </div>
                  
                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage}
                        alt="Aperçu"
                        className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                      />
                    </div>
                  )}
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
                {currentProductId ? "💫 Mettre à jour" : "✨ Créer le produit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductContent;