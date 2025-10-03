import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Edit, Trash2, FileText, User, Phone, MessageSquare, UserCog, Loader2, 
  Users, Calendar, Sparkles, Zap, Filter, Search, BadgeCheck, Clock, MapPin,
  ArrowUpDown, Crown, Target, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
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
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
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
        await fetchDevis();
        
        Swal.fire({
          title: '✅ Succès!',
          text: `Le devis a été ${currentDevisId ? 'mis à jour' : 'créé'} avec succès.`,
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 2000
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
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '⚠️ Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      background: '#fff',
      color: '#1f2937',
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/devis/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchDevis();
        
        Swal.fire({
          title: '🗑️ Supprimé!',
          text: 'Le devis a été supprimé avec succès.',
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 1500
        });
      } catch (error) {
        console.error("Erreur lors de la suppression du devis:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la suppression du devis',
          icon: 'error',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#ef4444'
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
        await fetchDevis();
        
        setOpenAssign(false);
        setSelectedTechnicien('');
        setCurrentDevisId(null);
        
        Swal.fire({
          title: '✅ Succès!',
          text: 'Le technicien a été assigné avec succès.',
          icon: 'success',
          background: '#fff',
          color: '#1f2937',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du technicien:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'assignation du technicien',
        icon: 'error',
        background: '#fff',
        color: '#1f2937',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const getStatusConfig = (status: Devis['status']) => {
    const config = {
      en_attente: { 
        color: "from-orange-500 to-amber-600", 
        icon: <Clock className="h-3 w-3" />,
        label: "En attente"
      },
      assigned: { 
        color: "from-blue-500 to-cyan-600", 
        icon: <UserCog className="h-3 w-3" />,
        label: "Assigné"
      },
      completed: { 
        color: "from-green-500 to-emerald-600", 
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: "Terminé"
      },
      refused: { 
        color: "from-red-500 to-pink-600", 
        icon: <XCircle className="h-3 w-3" />,
        label: "Refusé"
      }
    };
    return config[status] || config.en_attente;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  // Filtrage des devis
  const filteredDevis = devisList.filter(devis => {
    const matchesSearch = 
      devis.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.telephone?.includes(searchTerm) ||
      devis.commentaire?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || devis.status === statusFilter;
    const matchesTab = activeTab === "all" || devis.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Statistiques
  const stats = {
    total: devisList.length,
    en_attente: devisList.filter(d => d.status === 'en_attente').length,
    assigned: devisList.filter(d => d.status === 'assigned').length,
    completed: devisList.filter(d => d.status === 'completed').length,
    refused: devisList.filter(d => d.status === 'refused').length,
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
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  Gestion des Devis
                </h1>
                <p className="text-blue-100 text-lg">Gérez vos demandes de devis et assignations</p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleOpen()}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau Devis
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {[
          { label: "Total Devis", value: stats.total, icon: FileText, color: "from-blue-500 to-cyan-500" },
          { label: "En Attente", value: stats.en_attente, icon: Clock, color: "from-orange-500 to-amber-500" },
          { label: "Assignés", value: stats.assigned, icon: UserCog, color: "from-purple-500 to-pink-500" },
          { label: "Terminés", value: stats.completed, icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
          { label: "Refusés", value: stats.refused, icon: XCircle, color: "from-red-500 to-rose-500" }
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
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: `${(stat.value / Math.max(stats.total, 1)) * 100}%` }}
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
                placeholder="Rechercher un devis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900 rounded-xl py-3">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl">
                  <SelectItem value="all" className="hover:bg-gray-100">📋 Tous les statuts</SelectItem>
                  <SelectItem value="en_attente" className="hover:bg-orange-50">⏳ En attente</SelectItem>
                  <SelectItem value="assigned" className="hover:bg-blue-50">👤 Assigné</SelectItem>
                  <SelectItem value="completed" className="hover:bg-green-50">✅ Terminé</SelectItem>
                  <SelectItem value="refused" className="hover:bg-red-50">❌ Refusé</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-1">
              <TabsTrigger value="all" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <FileText className="h-4 w-4" />
                Tous ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="en_attente" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <Clock className="h-4 w-4" />
                En attente ({stats.en_attente})
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <UserCog className="h-4 w-4" />
                Assignés ({stats.assigned})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                Terminés ({stats.completed})
              </TabsTrigger>
              <TabsTrigger value="refused" className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                <XCircle className="h-4 w-4" />
                Refusés ({stats.refused})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des Devis */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
            Liste des Devis
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
              {filteredDevis.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des devis...</h3>
              <p className="text-gray-600">Préparation de vos demandes de devis</p>
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <FileText className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun devis trouvé</h3>
              <p className="text-gray-600 mb-6">
                {devisList.length === 0 ? "Commencez par créer votre premier devis !" : "Aucun résultat pour votre recherche"}
              </p>
              {devisList.length === 0 && (
                <Button 
                  onClick={() => handleOpen()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer le Premier Devis
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
                        <User className="h-4 w-4" />
                        Client
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </div>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date de création
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        Assigné à
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevis.map((devis, index) => (
                    <TableRow 
                      key={devis.id}
                      className="group hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 bg-opacity-10">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {devis.prenom} {devis.nom}
                            </div>
                            <div className="text-sm text-gray-600">
                              {devis.commentaire && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MessageSquare className="h-3 w-3 text-gray-400" />
                                  <span className="truncate max-w-[200px]">{devis.commentaire}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4 text-blue-600" />
                          {devis.telephone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-3 py-1 text-xs font-bold border-0 text-white bg-gradient-to-r ${getStatusConfig(devis.status).color}`}
                        >
                          {getStatusConfig(devis.status).icon}
                          <span className="ml-1">{getStatusConfig(devis.status).label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          {formatDate(devis.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {devis.assigned_user ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-green-100 rounded-full">
                              <UserCog className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {devis.assigned_user.prenom} {devis.assigned_user.nom}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-sm">Non assigné</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpen(devis)}
                            disabled={loading}
                            className="h-8 w-8 p-0 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssign(devis.id)}
                            disabled={devis.status !== 'en_attente' || loading}
                            className="h-8 w-8 p-0 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 hover:scale-110 transition-all duration-200"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(devis.id)}
                            disabled={devis.status !== 'en_attente' || loading}
                            className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Dialogue Ajout/Édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                {currentDevisId ? "✨ Modifier le Devis" : "🚀 Nouveau Devis"}
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

          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm font-semibold text-gray-700">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700">
                  Téléphone *
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commentaire" className="text-sm font-semibold text-gray-700">
                  Commentaire
                </Label>
                <Textarea
                  id="commentaire"
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="Décrivez la demande du client..."
                />
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
                {currentDevisId ? "💫 Mettre à jour" : "✨ Créer le devis"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'Assignation */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Assigner un Technicien
              </DialogTitle>
              <DialogDescription className="text-green-100">
                Sélectionnez un technicien à assigner à ce devis.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <Label htmlFor="technicien" className="text-sm font-semibold text-gray-700">
                Technicien *
              </Label>
              <Select 
                value={selectedTechnicien} 
                onValueChange={setSelectedTechnicien}
              >
                <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Sélectionner un technicien" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {techniciens.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id} className="focus:bg-green-50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        {tech.prenom} {tech.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setOpenAssign(false)}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleAssignSubmit}
                disabled={!selectedTechnicien || isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assignation...
                  </>
                ) : (
                  <>
                    <UserCog className="h-4 w-4 mr-2" />
                    Assigner
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevisContent;