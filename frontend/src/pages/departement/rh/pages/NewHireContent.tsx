import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  FileText,
  Edit,
  Trash2,
  Download,
  Loader2,
  Filter,
  Search,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Sparkles
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import apiClient from '@/api/axiosConfig';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Configuration API
const API_BASE_URL = "http://localhost:5000";
const AUTH_TOKEN_KEY = 'authToken';
const useAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

interface Candidature {
  id: number;
  nom: string;
  poste: string;
  domaine: string;
  email: string;
  telephone: string;
  fichier_nom: string;
  fichier_path: string;
  date_depot: string;
  status: 'nouveau' | 'en_cours' | 'accepte' | 'refuse';
  user_id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface Stats {
  total: number;
  par_domaine: Record<string, number>;
  par_status: Record<string, number>;
}

const NewHireContent = () => {
  const token = useAuthToken();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState<Candidature[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentCandidatureId, setCurrentCandidatureId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtreDomaine, setFiltreDomaine] = useState("Tous");
  const [filtreStatus, setFiltreStatus] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    poste: "",
    domaine: "",
    email: "",
    telephone: "",
  });

  const domaines = ["Informatique", "Ressources Humaines", "Marketing", "Finance", "Commercial", "Autre"];
  const statusOptions = ["nouveau", "en_cours", "accepte", "refuse"];

  // Animation stats
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    nouveau: 0,
    en_cours: 0,
    accepte: 0,
    refuse: 0
  });

  // ------------------- Fetch candidatures -------------------
  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/candidatures/`;
      const params: Record<string, string> = {};
      if (filtreDomaine !== "Tous") params.domaine = filtreDomaine;
      if (filtreStatus !== "Tous") params.status = filtreStatus;

      const response = await apiClient.get<ApiResponse<Candidature[]>>(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success && response.data.data) {
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime()
        );
        setCandidatures(sorted);
        setFilteredCandidatures(sorted);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Impossible de charger les candidatures', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally { 
      setLoading(false); 
    }
  }, [token, filtreDomaine, filtreStatus]);

  // ------------------- Fetch stats -------------------
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<Stats>>(`${API_BASE_URL}/api/candidatures/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
        
        // Animation des stats
        setTimeout(() => {
          setAnimatedStats({
            total: response.data.data?.total || 0,
            nouveau: response.data.data?.par_status.nouveau || 0,
            en_cours: response.data.data?.par_status.en_cours || 0,
            accepte: response.data.data?.par_status.accepte || 0,
            refuse: response.data.data?.par_status.refuse || 0
          });
        }, 300);
      }
    } catch (error) { 
      console.error(error); 
    }
  }, [token]);

  useEffect(() => { 
    fetchCandidatures(); 
    fetchStats(); 
  }, [fetchCandidatures, fetchStats]);

  // ------------------- Filtrage par nom -------------------
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidatures(candidatures);
    } else {
      const filtered = candidatures.filter(candidature =>
        candidature.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.domaine.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidatures(filtered);
    }
  }, [searchTerm, candidatures]);

  // ------------------- Modal gestion -------------------
  const handleOpen = (candidature: Candidature | null = null) => {
    if(candidature) {
      setFormData({
        nom: candidature.nom,
        poste: candidature.poste,
        domaine: candidature.domaine,
        email: candidature.email,
        telephone: candidature.telephone
      });
      setCurrentCandidatureId(candidature.id);
    } else {
      setFormData({nom:"",poste:"",domaine:"",email:"",telephone:""});
      setSelectedFile(null);
      setCurrentCandidatureId(null);
    }
    setOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file && file.size <= 5*1024*1024) {
      setSelectedFile(file);
      // Animation de confirmation
      const input = e.target;
      input.classList.add('file-upload-success');
      setTimeout(() => input.classList.remove('file-upload-success'), 2000);
    } else if(file) {
      Swal.fire({
        title:'Erreur', 
        text:'Le fichier ne doit pas dépasser 5MB', 
        icon:'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if(currentCandidatureId) {
        await apiClient.put(`${API_BASE_URL}/api/candidatures/${currentCandidatureId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }
        });
        Swal.fire({
          title:'Succès', 
          text:'Candidature mise à jour', 
          icon:'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
      } else {
        if(!selectedFile) { 
          Swal.fire({
            title:'Erreur', 
            text:'Veuillez sélectionner un CV', 
            icon:'error',
            background: '#1f2937',
            color: 'white',
            confirmButtonColor: '#3b82f6'
          }); 
          return; 
        }
        const formToSend = new FormData();
        Object.entries(formData).forEach(([k,v])=>formToSend.append(k,v));
        formToSend.append("fichier", selectedFile);
        await apiClient.post(`${API_BASE_URL}/api/candidatures/`, formToSend, { headers:{ Authorization:`Bearer ${token}` } });
        Swal.fire({
          title:'Succès', 
          text:'Candidature créée', 
          icon:'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
      }
      setOpen(false);
      setFormData({nom:"",poste:"",domaine:"",email:"",telephone:""});
      setSelectedFile(null);
      setCurrentCandidatureId(null);
      await fetchCandidatures();
      await fetchStats();
    } catch(error) {
      console.error(error);
      Swal.fire({
        title:'Erreur', 
        text:'Erreur lors de la soumission', 
        icon:'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // ------------------- Download -------------------
  const handleDownload = async (id:number, nom:string) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/api/candidatures/${id}/download`, {
        headers:{ Authorization:`Bearer ${token}` },
        responseType:'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href=url; 
      link.setAttribute('download',`${nom}_CV.pdf`);
      document.body.appendChild(link); 
      link.click(); 
      link.remove();
    } catch(error) { 
      console.error(error); 
      Swal.fire({
        title:'Erreur', 
        text:'Impossible de télécharger le CV', 
        icon:'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      }); 
    }
  };

  // ------------------- Delete -------------------
  const handleDelete = async (id:number) => {
    const result = await Swal.fire({
      title:'Êtes-vous sûr?', 
      text:"Vous ne pourrez pas revenir en arrière!", 
      icon:'warning', 
      showCancelButton:true, 
      confirmButtonText:'Oui, supprimer!', 
      cancelButtonText:'Annuler',
      background: '#1f2937',
      color: 'white',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });
    if(result.isConfirmed){
      try {
        await apiClient.delete(`${API_BASE_URL}/api/candidatures/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
        Swal.fire({
          title:'Supprimé!',
          text:'Candidature supprimée',
          icon:'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        }); 
        await fetchCandidatures(); 
        await fetchStats();
      } catch(error){ 
        console.error(error); 
        Swal.fire({
          title:'Erreur', 
          text:'Erreur suppression', 
          icon:'error',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#3b82f6'
        }); 
      }
    }
  };

  // ------------------- Update status -------------------
  const handleStatusChange = async (id:number, newStatus:string) => {
    try {
      await apiClient.put(`${API_BASE_URL}/api/candidatures/${id}/status`, { status: newStatus }, { headers:{ Authorization:`Bearer ${token}` } });
      setCandidatures(prev => prev.map(c => c.id===id ? {...c,status:newStatus} : c));
      await fetchStats();
      Swal.fire({
        title:'Succès', 
        text:`Statut changé en ${newStatus}`, 
        icon:'success',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#10b981'
      });
    } catch(error){ 
      console.error(error); 
      Swal.fire({
        title:'Erreur', 
        text:'Impossible de changer le statut', 
        icon:'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const formatDate = (dateString:string) => format(new Date(dateString), 'PPP à HH:mm', {locale:fr});
  
  const getStatusBadge = (status:string) => {
    switch(status){
      case 'nouveau': 
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">Nouveau</Badge>;
      case 'en_cours': 
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">En cours</Badge>;
      case 'accepte': 
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">Accepté</Badge>;
      case 'refuse': 
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">Refusé</Badge>;
      default: 
        return <Badge variant="outline">Inconnu</Badge>;
    }
  }

  const getDomaineColor = (domaine: string) => {
    const colors: { [key: string]: string } = {
      'Informatique': 'from-blue-500 to-cyan-500',
      'Ressources Humaines': 'from-purple-500 to-pink-500',
      'Marketing': 'from-green-500 to-emerald-500',
      'Finance': 'from-yellow-500 to-orange-500',
      'Commercial': 'from-red-500 to-rose-500',
      'Autre': 'from-gray-500 to-slate-500'
    };
    return colors[domaine] || 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* En-tête avec animation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <Users className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="transform hover:translate-x-1 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestion des Candidatures
            </h2>
            <p className="text-gray-600 mt-1">Recrutez les meilleurs talents pour votre entreprise</p>
          </div>
        </div>
        <Button 
          onClick={() => handleOpen()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" style={{color:"white"}}
        >
          <UserPlus className="h-4 w-4" style={{color:"white"}}/>
          Nouvelle Candidature
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Candidatures */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold mt-2">{animatedStats.total}</p>
                <p className="text-blue-100 text-xs mt-1">Candidatures</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nouveaux */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Nouveaux</p>
                <p className="text-3xl font-bold mt-2">{animatedStats.nouveau}</p>
                <p className="text-cyan-100 text-xs mt-1">En attente</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* En cours */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">En cours</p>
                <p className="text-3xl font-bold mt-2">{animatedStats.en_cours}</p>
                <p className="text-yellow-100 text-xs mt-1">En évaluation</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptés */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Acceptés</p>
                <p className="text-3xl font-bold mt-2">{animatedStats.accepte}</p>
                <p className="text-green-100 text-xs mt-1">Validés</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refusés */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Refusés</p>
                <p className="text-3xl font-bold mt-2">{animatedStats.refuse}</p>
                <p className="text-red-100 text-xs mt-1">Non retenus</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres avec animations */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 mb-8 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filtres</span>
            </div>
            
            <div className="relative w-full lg:w-64 group" style={{color:"black"}}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" style={{color:"black"}}/>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <Select value={filtreDomaine} onValueChange={setFiltreDomaine}>
              <SelectTrigger className="w-full lg:w-64 border-gray-300 hover:border-blue-400 transition-colors duration-300 bg-white/50 backdrop-blur-sm" style={{color:"black"}}>
                <SelectValue placeholder="Domaine" style={{color:"black"}}/>
              </SelectTrigger>
              <SelectContent className="border-0 shadow-xl bg-white/95 backdrop-blur-sm" style={{color:"black"}}>
                <SelectItem value="Tous" className="hover:bg-blue-50 transition-colors" style={{color:"black"}}>Tous les domaines</SelectItem>
                {domaines.map(d => (
                  <SelectItem key={d} value={d} className="hover:bg-blue-50 transition-colors">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtreStatus} onValueChange={setFiltreStatus}>
              <SelectTrigger className="w-full lg:w-64 border-gray-300 hover:border-blue-400 transition-colors duration-300 bg-white/50 backdrop-blur-sm" style={{color:"black"}}>
                <SelectValue placeholder="Statut" style={{color:"black"}}/>
              </SelectTrigger>
              <SelectContent className="border-0 shadow-xl bg-white/95 backdrop-blur-sm" style={{color:"black"}}>
                <SelectItem value="Tous" className="hover:bg-blue-50 transition-colors" style={{color:"black"}}>Tous les statuts</SelectItem>
                {statusOptions.map(s => (
                  <SelectItem key={s} value={s} className="hover:bg-blue-50 transition-colors">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFiltreDomaine("Tous");
                setFiltreStatus("Tous");
                setSearchTerm("");
              }}
              className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau principal */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            Liste des Candidatures
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
              {filteredCandidatures.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
              </div>
            </div>
          ) : filteredCandidatures.length === 0 ? (
            <div className="text-center py-16">
              <div className="animate-bounce mb-4">
                <FileText className="h-16 w-16 text-gray-400 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {candidatures.length === 0 ? "Aucune candidature" : "Aucun résultat"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {candidatures.length === 0 
                  ? "Commencez par ajouter votre première candidature pour constituer votre base de talents."
                  : "Aucune candidature ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                }
              </p>
              {candidatures.length === 0 && (
                <Button 
                  onClick={() => handleOpen()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter une candidature
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                    <TableHead className="font-semibold text-gray-900">Candidat</TableHead>
                    <TableHead className="font-semibold text-gray-900">Poste</TableHead>
                    <TableHead className="font-semibold text-gray-900">Domaine</TableHead>
                    <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatures.map((candidature, index) => (
                    <TableRow 
                      key={candidature.id}
                      className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md border-b border-gray-50"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        color: "black"
                      }}
                      onMouseEnter={() => setHoveredCard(candidature.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getDomaineColor(candidature.domaine)} rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {candidature.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {candidature.nom}
                            </p>
                            <p className="text-sm text-gray-500">{candidature.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium group-hover:text-gray-700 transition-colors">
                        {candidature.poste}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`border-2 bg-white/80 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 ${getDomaineColor(candidature.domaine).replace('from-', 'border-').replace('to-', 'text-')}`}
                        >
                          {candidature.domaine}
                        </Badge>
                      </TableCell>
                      <TableCell className="group-hover:text-gray-700 transition-colors">
                        {candidature.telephone}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2" style={{color:"white"}}>
                          {getStatusBadge(candidature.status)}
                          <Select 
                            value={candidature.status} 
                            onValueChange={(newStatus) => handleStatusChange(candidature.id, newStatus)}
                          >
                            <SelectTrigger className="h-8 w-28 border-gray-300 hover:border-blue-400 transition-colors duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-0 shadow-xl bg-white/95 backdrop-blur-sm" style={{color:"black"}}>
                              {statusOptions.map(s => (
                                <SelectItem 
                                  key={s} 
                                  value={s}
                                  className="hover:bg-blue-50 transition-colors"
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="group-hover:text-gray-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(candidature.date_depot)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 transition-all duration-300">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                            onClick={() => handleDownload(candidature.id, candidature.nom)}
                            title="Télécharger CV"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                            onClick={() => handleOpen(candidature)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                            onClick={() => handleDelete(candidature.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal avec animations */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl transform transition-all duration-300">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentCandidatureId ? 'Modifier la candidature' : 'Nouvelle candidature'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {currentCandidatureId ? 'Modifiez les informations de la candidature' : 'Remplissez les informations et téléversez le CV du candidat'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {['nom', 'poste', 'domaine', 'email', 'telephone'].map((field, i) => {
                if (field === 'domaine') {
                  return (
                    <div key={i} className="grid grid-cols-4 items-center gap-4 group">
                      <Label htmlFor={field} className="text-right font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        Domaine
                      </Label>
                      <Select 
                        value={formData.domaine} 
                        onValueChange={(val) => setFormData({...formData, domaine: val})} 
                        required
                      >
                        <SelectTrigger className="col-span-3 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300">
                          <SelectValue placeholder="Choisir un domaine" />
                        </SelectTrigger>
                        <SelectContent className="border-0 shadow-lg bg-white">
                          {domaines.map(d => (
                            <SelectItem key={d} value={d} className="hover:bg-blue-50 focus:bg-blue-50 transition-colors">
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                } else {
                  return (
                    <div key={i} className="grid grid-cols-4 items-center gap-4 group">
                      <Label htmlFor={field} className="text-right font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </Label>
                      <Input 
                        id={field} 
                        value={(formData as any)[field]} 
                        onChange={(e) => setFormData({...formData, [field]: e.target.value})} 
                        className="col-span-3 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300"
                        required 
                      />
                    </div>
                  )
                }
              })}
              {!currentCandidatureId && (
                <div className="grid grid-cols-4 items-center gap-4 group">
                  <Label htmlFor="fichier" className="text-right font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    CV
                  </Label>
                  <div className="col-span-3">
                    <Input 
                      id="fichier" 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange} 
                      required
                      className="border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-300"
                    />
                    {selectedFile && (
                      <p className="text-xs text-green-600 mt-1 animate-pulse">
                        ✓ Fichier sélectionné: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="border-t border-gray-100 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentCandidatureId ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>{currentCandidatureId ? 'Mettre à jour' : 'Créer'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .file-upload-success {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default NewHireContent;