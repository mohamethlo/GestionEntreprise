// src/components/rh/pages/RhDocumentsContent.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, Upload, FileSignature, FileText, Download, Search, MoreVertical, Users, Calendar, Eye, Loader2, Plus, Trash2, ChevronRight, Home, BarChart3, Sparkles, Minus, TrendingUp, Info, Check } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import apiClient from '@/api/axiosConfig';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const API_BASE_URL = "http://localhost:5000";
const AUTH_TOKEN_KEY = 'authToken';

const useAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

interface RhFolder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  document_count: number;
  created_by: string;
  creator_name: string;
  created_at: string;
}

interface RhDocument {
  id: number;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_size_formatted: string;
  folder_id?: number;
  folder_name?: string;
  uploaded_by: string;
  uploader_name: string;
  description?: string;
  downloads: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  total_documents: number;
  total_size: number;
  total_size_formatted: string;
  documents_this_month: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const RhDocumentsContent = () => {
  const token = useAuthToken();
  const [folders, setFolders] = useState<RhFolder[]>([]);
  const [documents, setDocuments] = useState<RhDocument[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<RhDocument[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [currentFolder, setCurrentFolder] = useState<RhFolder | null>(null);
  
  const [folderFormData, setFolderFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-100 text-blue-600 border-blue-200",
    icon: "Folder",
  });

  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    description: "",
    folder_id: "",
  });

  const fetchFolders = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<RhFolder[]>>(`${API_BASE_URL}/api/rh-documents/folders`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success && response.data.data) setFolders(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Impossible de charger les dossiers', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    }
  }, [token]);

  const fetchDocuments = useCallback(async (folderId?: number) => {
    try {
      const url = folderId 
        ? `${API_BASE_URL}/api/rh-documents/documents?folder_id=${folderId}`
        : `${API_BASE_URL}/api/rh-documents/documents`;
      const response = await apiClient.get<ApiResponse<RhDocument[]>>(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success && response.data.data) setDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Impossible de charger les documents', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    }
  }, [token]);

  const fetchRecentDocuments = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<RhDocument[]>>(`${API_BASE_URL}/api/rh-documents/documents/recent?limit=3`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success && response.data.data) setRecentDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents récents:", error);
    }
  }, [token]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<Statistics>>(`${API_BASE_URL}/api/rh-documents/statistics`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success && response.data.data) setStatistics(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  }, [token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchFolders(), 
        fetchDocuments(), 
        fetchRecentDocuments(), 
        fetchStatistics()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchFolders, fetchDocuments, fetchRecentDocuments, fetchStatistics]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/rh-documents/folders`, 
        folderFormData, 
        { 
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      if (response.data.success) {
        await fetchFolders();
        setOpenFolderModal(false);
        setFolderFormData({ 
          name: "", 
          description: "", 
          color: "bg-blue-100 text-blue-600 border-blue-200", 
          icon: "Folder" 
        });
        Swal.fire({ 
          title: 'Succès!', 
          text: 'Le dossier a été créé avec succès.', 
          icon: 'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Une erreur est survenue lors de la création du dossier', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({ ...prev, name: file.name }));
      }
      // Animation de confirmation
      const input = e.target;
      input.classList.add('file-upload-success');
      setTimeout(() => input.classList.remove('file-upload-success'), 2000);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire({
        title: 'Erreur', 
        text: 'Veuillez sélectionner un fichier', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);
      
      if (uploadFormData.folder_id && uploadFormData.folder_id !== '' && uploadFormData.folder_id !== 'none') {
        formData.append('folder_id', uploadFormData.folder_id);
      }
      
      const response = await apiClient.post<ApiResponse<RhDocument>>(
        `${API_BASE_URL}/api/rh-documents/documents/upload`, 
        formData, 
        { 
          headers: { 
            'Content-Type': 'multipart/form-data', 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      if (response.data.success) {
        await Promise.all([
          fetchDocuments(selectedFolder || undefined), 
          fetchRecentDocuments(), 
          fetchStatistics(), 
          fetchFolders()
        ]);
        closeUploadModal();
        Swal.fire({ 
          title: 'Succès!', 
          text: 'Le document a été uploadé avec succès.', 
          icon: 'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Une erreur est survenue lors de l\'upload du document', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (documentId: number, documentName: string) => {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/api/rh-documents/documents/${documentId}/download`, 
        { 
          headers: { Authorization: `Bearer ${token}` }, 
          responseType: 'blob' 
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      await Promise.all([fetchDocuments(selectedFolder || undefined), fetchRecentDocuments()]);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      Swal.fire({ 
        title: 'Erreur', 
        text: 'Une erreur est survenue lors du téléchargement', 
        icon: 'error',
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleDeleteDocument = async (id: number) => {
    const result = await Swal.fire({ 
      title: 'Êtes-vous sûr?', 
      text: "Le document sera définitivement supprimé!", 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#6b7280', 
      confirmButtonText: 'Oui, supprimer!', 
      cancelButtonText: 'Annuler',
      background: '#1f2937',
      color: 'white'
    });
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`${API_BASE_URL}/api/rh-documents/documents/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        await Promise.all([
          fetchDocuments(selectedFolder || undefined), 
          fetchRecentDocuments(), 
          fetchStatistics(), 
          fetchFolders()
        ]);
        Swal.fire({
          title: 'Supprimé!', 
          text: 'Le document a été supprimé.', 
          icon: 'success',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          title: 'Erreur', 
          text: 'Une erreur est survenue lors de la suppression', 
          icon: 'error',
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleViewFolder = async (folder: RhFolder) => {
    setSelectedFolder(folder.id);
    setCurrentFolder(folder);
    await fetchDocuments(folder.id);
  };

  const handleBackToRoot = async () => {
    setSelectedFolder(null);
    setCurrentFolder(null);
    await fetchDocuments();
  };

  const openUploadModalWithFolder = (folderId?: number) => {
    setSelectedFile(null);
    setUploadFormData({
      name: "",
      description: "",
      folder_id: folderId ? folderId.toString() : ""
    });
    setOpenUploadModal(true);
  };

  const closeUploadModal = () => {
    setOpenUploadModal(false);
    setSelectedFile(null);
    setUploadFormData({ name: "", description: "", folder_id: "" });
  };

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = { 
      'FileSignature': FileSignature, 
      'FileText': FileText, 
      'Folder': Folder 
    };
    return icons[iconName] || Folder;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* En-tête avec animations */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
  <div className="flex items-center gap-4 mb-4 lg:mb-0">
    <div className="relative">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-3 group relative overflow-hidden">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Folder className="h-7 w-7 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
      </div>
      {/* Point d'activité */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
    </div>
    
    <div className="transform hover:translate-x-2 transition-transform duration-500">
      <h2 className="text-4xl font-bold text-gray-900 hover:text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text transition-all duration-500">
        Bibliothèque de Documents RH
      </h2>
      <p className="text-gray-600 mt-2 text-lg hover:text-gray-700 transition-colors duration-300 flex items-center gap-2">
        <span>Gérez et organisez tous vos documents ressources humaines</span>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
      </p>
    </div>
  </div>
  
  <div className="flex gap-3">
    <Button 
      variant="outline" 
      className="flex items-center gap-3 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-lg text-white font-semibold px-5 py-2.5 rounded-xl group/btn"
      onClick={() => fetchDocuments(selectedFolder || undefined)}
    >
      <div className="p-1.5 bg-blue-100 rounded-lg group-hover/btn:bg-blue-200 transition-colors duration-300">
        <Search className="h-4 w-4 text-blue-600" />
      </div>
      Actualiser
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover/btn:opacity-100 animate-pulse transition-opacity duration-300" />
    </Button>
    
    <Button 
      className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-400 transform hover:-translate-y-1 text-white font-semibold px-5 py-2.5 rounded-xl group/btn relative overflow-hidden"
      onClick={() => openUploadModalWithFolder(selectedFolder || undefined)}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-blue-500/0 group-hover/btn:from-blue-500/10 group-hover/btn:via-indigo-500/10 group-hover/btn:to-blue-500/10 transition-all duration-500" />
      
      <div className="p-1.5 bg-white/20 rounded-lg group-hover/btn:bg-white/30 transition-colors duration-300 relative z-10">
        <Upload className="h-4 w-4" />
      </div>
      <span className="relative z-10">Uploader un Fichier</span>
      
      {/* Indicateur d'action */}
      <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover/btn:opacity-100 animate-ping transition-opacity duration-300 absolute right-3" />
    </Button>
  </div>
</div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToRoot} 
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:bg-blue-50 rounded-full px-3"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
            {currentFolder.name}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
            </div>
            <p className="mt-4 text-gray-600">Chargement de votre bibliothèque...</p>
          </div>
        </div>
      ) : (
        <>
          {!currentFolder && (
            <>
              {/* Carte d'introduction */}
              <Card className="border border-gray-200 shadow-xl mb-8 bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden group">
  {/* Effet de fond animé subtil */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/2 group-hover:via-indigo-500/2 group-hover:to-purple-500/2 transition-all duration-700" />
  
  {/* Élément décoratif en coin */}
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-indigo-500/5 rounded-bl-3xl transform group-hover:scale-150 transition-transform duration-500" />
  
  <CardContent className="p-8 relative z-10">
    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <Folder className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 group-hover:text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text transition-all duration-400">
            Centralisez vos documents RH
          </h3>
        </div>
        <p className="text-gray-600 max-w-2xl text-lg leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          Téléchargez, organisez et partagez en toute sécurité vos documents ressources humaines. 
          Supporte PDF, DOCX, XLSX et plus encore.
        </p>
        
        {/* Badges de formats supportés */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['PDF', 'DOCX', 'XLSX', 'Images', 'TXT'].map((format, index) => (
            <span 
              key={format}
              className="bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200 font-medium transform group-hover:scale-105 transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {format}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 flex-shrink-0">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-lg text-white font-semibold px-6 py-3 rounded-xl group/btn"
          onClick={() => setOpenFolderModal(true)}
        >
          <div className="p-1.5 bg-blue-100 rounded-lg group-hover/btn:bg-blue-200 transition-colors duration-300">
            <Plus className="h-4 w-4 text-blue-600" />
          </div>
          Nouveau Dossier
        </Button>
        
        <Button 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-400 transform hover:-translate-y-1 text-white font-semibold px-6 py-3 rounded-xl group/btn"
          onClick={() => openUploadModalWithFolder()}
        >
          <div className="p-1.5 bg-white/20 rounded-lg group-hover/btn:bg-white/30 transition-colors duration-300">
            <Upload className="h-4 w-4" />
          </div>
          Nouveau Document
        </Button>
      </div>
    </div>
  </CardContent>
  
  {/* Barre de progression décorative en bas */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover:scale-x-100" />
</Card>

              {/* Grille des dossiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {folders.map((folder) => {
                  const IconComponent = getIconComponent(folder.icon);
                  return (
                    <Card 
  key={folder.id} 
  className="border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white relative overflow-hidden hover:scale-105"
  onClick={() => handleViewFolder(folder)}
>
  {/* Effet de fond animé avec dégradé coloré */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/3 group-hover:via-purple-500/3 group-hover:to-pink-500/3 transition-all duration-700" />
  
  {/* Élément décoratif en coin */}
  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/5 to-purple-500/5 rounded-bl-2xl transform group-hover:scale-150 transition-transform duration-500" />
  
  <CardContent className="p-6 relative z-10">
    <div className="flex items-center justify-between mb-5">
      <div className="relative">
        <div className={`p-4 rounded-2xl ${folder.color} border-2 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-400 shadow-lg relative overflow-hidden`}>
          {/* Effet de brillance sur l'icône */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <IconComponent className="h-7 w-7 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        {/* Badge décoratif */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg transform group-hover:scale-150 transition-transform duration-300" />
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-x-4 group-hover:translate-x-0 hover:bg-gray-100 hover:shadow-md text-gray-600 rounded-full h-9 w-9 p-0"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
    
    {/* Nom du dossier */}
    <h3 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text transition-all duration-400 transform group-hover:translate-x-2">
      {folder.name}
    </h3>
    
    {/* Description (si disponible) */}
    {folder.description && (
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
        {folder.description}
      </p>
    )}
    
    <div className="flex justify-between items-center">
      {/* Compteur de documents */}
      <div className="flex items-center gap-2">
        <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300 transform group-hover:scale-105">
          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
            {folder.document_count}
          </span>
          <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors duration-300 ml-1">
            {folder.document_count === 1 ? 'document' : 'documents'}
          </span>
        </div>
      </div>
      
      {/* Bouton d'action */}
<div className="flex items-center gap-2">
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg transform hover:scale-110 transition-transform duration-300 flex items-center gap-1.5 cursor-pointer">
    <Eye className="h-3 w-3" />
    Explorer
  </div>
  {/* Indicateur de flèche */}
  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
</div>
    </div>
    
    {/* Informations supplémentaires */}
    <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Créé par {folder.creator_name}
        </span>
        <span className="text-gray-400">
          {format(new Date(folder.created_at), 'dd/MM/yy')}
        </span>
      </div>
    </div>
  </CardContent>
  
  {/* Barre de progression décorative en bas */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover:scale-x-100" />
</Card>
                  );
                })}
              </div>

              {/* Section documents récents et statistiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Documents récents */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm relative overflow-hidden group">
  {/* Effet de brillance */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-indigo-500/5 transition-all duration-700" />
  
  <CardHeader className="pb-4 border-b border-blue-100/50 relative z-10">
    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
        <Calendar className="h-5 w-5 text-white" />
      </div>
      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Documents Récents
      </span>
      {recentDocuments.length > 0 && (
        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {recentDocuments.length}
        </span>
      )}
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-4 pt-6 relative z-10">
    {recentDocuments.length === 0 ? (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-float" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-20 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun document récent</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Les documents que vous téléchargez apparaîtront ici pour un accès rapide
        </p>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-white"
          onClick={() => openUploadModalWithFolder()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Ajouter un document
        </Button>
      </div>
    ) : (
      recentDocuments.map((doc, index) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-blue-50/50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group/item relative overflow-hidden"
          onClick={() => handleDownloadDocument(doc.id, doc.name)}
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'slideInUp 0.6s ease-out forwards'
          }}
        >
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover/item:from-blue-500/3 group-hover/item:via-cyan-500/3 group-hover/item:to-blue-500/3 transition-all duration-500" />
          
          <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-md transform group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-300">
                <FileText className="h-5 w-5 text-white" />
              </div>
              {/* Badge de type de fichier */}
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold transform group-hover/item:scale-125 transition-transform duration-300">
                {doc.file_type}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 group-hover/item:text-blue-700 transition-colors duration-300 truncate">
                {doc.name}
              </p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="text-xs text-gray-600 flex items-center gap-1.5 transition-colors duration-300 group-hover/item:text-blue-600 bg-blue-50/50 px-2 py-1 rounded-full border border-blue-100">
                  <Calendar className="h-3 w-3" />
                  {formatDate(doc.created_at)}
                </span>
                <span className="text-xs text-gray-600 transition-colors duration-300 group-hover/item:text-cyan-600 bg-cyan-50/50 px-2 py-1 rounded-full border border-cyan-100">
                  {doc.file_size_formatted}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            {/* Compteur de téléchargements */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-full border border-green-200 group-hover/item:scale-110 transition-transform duration-300">
              <Download className="h-3 w-3 text-green-600" />
              <span className="text-xs font-bold text-green-700">
                {doc.downloads}
              </span>
            </div>
            
            {/* Bouton de téléchargement */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-10 p-0 opacity-0 group-hover/item:opacity-100 transition-all duration-400 transform translate-x-4 group-hover/item:translate-x-0 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg text-gray-600 hover:text-white"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleDownloadDocument(doc.id, doc.name); 
              }}
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Indicateur de nouveau document */}
            {index === 0 && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  NOUVEAU
                </div>
              </div>
            )}
          </div>

          {/* Barre de progression décorative */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover/item:scale-x-100" />
        </div>
      ))
    )}
  </CardContent>

  {/* Élément décoratif en bas */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

  <style jsx>{`
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  `}</style>
</Card>

                {/* Statistiques et actions rapides */}
                <div className="space-y-6">
                  {/* Statistiques */}
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm relative overflow-hidden group">
  {/* Effet de brillance */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-blue-500/0 group-hover:from-green-500/5 group-hover:via-emerald-500/5 group-hover:to-blue-500/5 transition-all duration-700" />
  
  <CardHeader className="pb-3 relative z-10">
    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
        <BarChart3 className="h-5 w-5 text-white" />
      </div>
      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        Statistiques
      </span>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-4 relative z-10">
    {statistics && (
      <>
        {/* Total des documents */}
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-100/80 hover:to-cyan-100/80 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-lg group/item relative overflow-hidden">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover/item:from-blue-500/3 group-hover/item:via-cyan-500/3 group-hover/item:to-blue-500/3 transition-all duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md transform group-hover/item:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium group-hover/item:text-blue-700 transition-colors duration-300">
              Total des documents
            </span>
          </div>
          <span className="font-bold text-gray-900 text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover/item:scale-110 transition-transform duration-300">
            {statistics.total_documents}
          </span>
        </div>

        {/* Espace utilisé */}
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-lg group/item relative overflow-hidden">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover/item:from-purple-500/3 group-hover/item:via-pink-500/3 group-hover/item:to-purple-500/3 transition-all duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md transform group-hover/item:scale-110 transition-transform duration-300">
              <Folder className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium group-hover/item:text-purple-700 transition-colors duration-300">
              Espace utilisé
            </span>
          </div>
          <span className="font-bold text-gray-900 text-xl group-hover/item:text-purple-700 transition-colors duration-300">
            {statistics.total_size_formatted}
          </span>
        </div>

        {/* Documents ce mois */}
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-100/80 hover:to-emerald-100/80 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-lg group/item relative overflow-hidden">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-green-500/0 group-hover/item:from-green-500/3 group-hover/item:via-emerald-500/3 group-hover/item:to-green-500/3 transition-all duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transform group-hover/item:scale-110 transition-transform duration-300">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium group-hover/item:text-green-700 transition-colors duration-300">
              Documents ce mois
            </span>
          </div>
          <span className="font-bold text-green-600 text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover/item:scale-110 transition-transform duration-300 animate-pulse">
            +{statistics.documents_this_month}
          </span>
        </div>

        {/* Indicateur de performance (nouveau) */}
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 font-medium">Performance</span>
            </div>
            <div className="flex items-center gap-1">
              {statistics.documents_this_month > 5 ? (
                <>
                  <span className="text-xs text-green-600 font-bold">EXCELLENT</span>
                  <Sparkles className="h-3 w-3 text-green-500 animate-bounce" />
                </>
              ) : statistics.documents_this_month > 2 ? (
                <>
                  <span className="text-xs text-blue-600 font-bold">BON</span>
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                </>
              ) : (
                <>
                  <span className="text-xs text-orange-600 font-bold">STABLE</span>
                  <Minus className="h-3 w-3 text-orange-500" />
                </>
              )}
            </div>
          </div>
        </div>
      </>
    )}
  </CardContent>

  {/* Élément décoratif en bas */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>

                  {/* Actions rapides */}
<Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm relative overflow-hidden group">
  {/* Effet de brillance */}
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-700" />
  
  <CardHeader className="pb-3 relative z-10">
    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
        <Users className="h-5 w-5 text-white" />
      </div>
      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Actions Rapides
      </span>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-4 relative z-10">
    {/* Bouton Voir tous les documents */}
    <Button 
      variant="outline" 
      className="w-full justify-start p-5 h-auto border-2 border-blue-100 hover:border-blue-300 bg-white/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl group/btn relative overflow-hidden"
      onClick={handleBackToRoot}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover/btn:from-blue-500/5 group-hover/btn:via-cyan-500/5 group-hover/btn:to-blue-500/5 transition-all duration-500" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md transform group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900 group-hover/btn:text-blue-700 transition-colors duration-300">
            Voir tous les documents
          </p>
          <p className="text-sm text-gray-600 group-hover/btn:text-blue-600 transition-colors duration-300 mt-1">
            Afficher la bibliothèque complète
          </p>
        </div>
        <div className="opacity-0 group-hover/btn:opacity-100 transform translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
    </Button>

    {/* Bouton Nouveau dossier */}
    <Button 
      variant="outline" 
      className="w-full justify-start p-5 h-auto border-2 border-orange-100 hover:border-orange-300 bg-white/80 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl group/btn relative overflow-hidden"
      onClick={() => setOpenFolderModal(true)}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-amber-500/0 to-orange-500/0 group-hover/btn:from-orange-500/5 group-hover/btn:via-amber-500/5 group-hover/btn:to-orange-500/5 transition-all duration-500" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-md transform group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300">
          <Folder className="h-5 w-5 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900 group-hover/btn:text-orange-700 transition-colors duration-300">
            Nouveau dossier
          </p>
          <p className="text-sm text-gray-600 group-hover/btn:text-orange-600 transition-colors duration-300 mt-1">
            Organiser les documents
          </p>
        </div>
        <div className="opacity-0 group-hover/btn:opacity-100 transform translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        </div>
      </div>
    </Button>

    {/* Bouton supplémentaire pour plus d'équilibre */}
    <Button 
      variant="outline" 
      className="w-full justify-start p-5 h-auto border-2 border-green-100 hover:border-green-300 bg-white/80 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl group/btn relative overflow-hidden"
      onClick={() => openUploadModalWithFolder()}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-green-500/0 group-hover/btn:from-green-500/5 group-hover/btn:via-emerald-500/5 group-hover/btn:to-green-500/5 transition-all duration-500" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transform group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900 group-hover/btn:text-green-700 transition-colors duration-300">
            Upload rapide
          </p>
          <p className="text-sm text-gray-600 group-hover/btn:text-green-600 transition-colors duration-300 mt-1">
            Ajouter un nouveau document
          </p>
        </div>
        <div className="opacity-0 group-hover/btn:opacity-100 transform translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </Button>
  </CardContent>

  {/* Élément décoratif en bas */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
</Card>
                </div>
              </div>
            </>
          )}

          {/* Vue dossier sélectionné */}
          {currentFolder && (
            <div className="space-y-6">
              {/* En-tête du dossier */}
              <Card className="border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${currentFolder.color} border transform hover:scale-105 transition-transform duration-300 shadow-lg`}>
                        {React.createElement(getIconComponent(currentFolder.icon), { className: "h-8 w-8" })}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {currentFolder.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{currentFolder.description || 'Aucune description'}</p>
                        <p className="text-sm text-gray-500 mt-1">{documents.length} document(s)</p>
                      </div>
                    </div>
                    <Button 
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-white"
                      onClick={() => openUploadModalWithFolder(currentFolder.id)}
                    >
                      <Upload className="h-4 w-4" />
                      Ajouter un document
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tableau des documents */}
              {documents.length === 0 ? (
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
                    <p className="text-gray-600 mb-6">Ce dossier est vide. Commencez par ajouter votre premier document.</p>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-white"
                      onClick={() => openUploadModalWithFolder(currentFolder.id)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter un document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
                          <TableHead className="font-semibold text-gray-900">Nom</TableHead>
                          <TableHead className="font-semibold text-gray-900">Type</TableHead>
                          <TableHead className="font-semibold text-gray-900">Taille</TableHead>
                          <TableHead className="font-semibold text-gray-900">Uploadé par</TableHead>
                          <TableHead className="font-semibold text-gray-900">Téléchargements</TableHead>
                          <TableHead className="font-semibold text-gray-900">Date</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc, index) => (
                          <TableRow 
                            key={doc.id}
                            className="group hover:bg-blue-50/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-sm border-b border-gray-100"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animation: 'slideInRight 0.6s ease-out forwards'
                            }}
                          >
                            <TableCell className="font-medium flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                              <FileText className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-gray-900">{doc.name}</span>
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {doc.file_type}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {doc.file_size_formatted}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {doc.uploader_name}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3 text-gray-400" />
                                {doc.downloads}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {formatDate(doc.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 transition-all duration-300">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                  onClick={() => handleDownloadDocument(doc.id, doc.name)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal création dossier */}
<Dialog open={openFolderModal} onOpenChange={setOpenFolderModal}>
  <DialogContent className="sm:max-w-[450px] bg-white border-0 shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 scale-95 data-[state=open]:scale-100">
    {/* En-tête avec dégradé */}
    <DialogHeader className="border-b border-gray-100 pb-6 pt-8 px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
          <Folder className="h-5 w-5 text-white" />
        </div>
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Nouveau Dossier
        </DialogTitle>
      </div>
      <DialogDescription className="text-gray-600 text-base">
        Organisez vos documents en créant des dossiers personnalisés
      </DialogDescription>
    </DialogHeader>
    
    <form onSubmit={handleCreateFolder}>
      <div className="grid gap-6 py-6 px-8">
        {/* Champ Nom */}
        <div className="space-y-2 group">
          <Label htmlFor="folder_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Nom du dossier
          </Label>
          <Input 
            id="folder_name" 
            value={folderFormData.name} 
            onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })} 
            className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3 text-gray-900"
            placeholder="Ex: Contrats de travail"
            required 
          />
        </div>

        {/* Champ Description */}
        <div className="space-y-2 group">
          <Label htmlFor="folder_description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            Description
          </Label>
          <Textarea 
            id="folder_description" 
            value={folderFormData.description} 
            onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })} 
            className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3 text-gray-900 resize-none"
            rows={3} 
            placeholder="Description optionnelle du dossier..."
          />
        </div>

        {/* Sélecteur de Couleur */}
        <div className="space-y-2 group">
          <Label htmlFor="folder_color" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Couleur du dossier
          </Label>
          <Select 
            value={folderFormData.color} 
            onValueChange={(value) => setFolderFormData({ ...folderFormData, color: value })}
          >
            <SelectTrigger className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3 text-gray-900">
              <SelectValue placeholder="Choisir une couleur" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-2xl rounded-xl p-2">
              <SelectItem value="bg-blue-100 text-blue-600 border-blue-200" className="rounded-lg hover:bg-blue-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span>Bleu</span>
                </div>
              </SelectItem>
              <SelectItem value="bg-green-100 text-green-600 border-green-200" className="rounded-lg hover:bg-green-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span>Vert</span>
                </div>
              </SelectItem>
              <SelectItem value="bg-purple-100 text-purple-600 border-purple-200" className="rounded-lg hover:bg-purple-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full" />
                  <span>Violet</span>
                </div>
              </SelectItem>
              <SelectItem value="bg-orange-100 text-orange-600 border-orange-200" className="rounded-lg hover:bg-orange-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full" />
                  <span>Orange</span>
                </div>
              </SelectItem>
              <SelectItem value="bg-indigo-100 text-indigo-600 border-indigo-200" className="rounded-lg hover:bg-indigo-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full" />
                  <span>Indigo</span>
                </div>
              </SelectItem>
              <SelectItem value="bg-gray-100 text-gray-600 border-gray-200" className="rounded-lg hover:bg-gray-50 transition-colors duration-200 my-1">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  <span>Gris</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pied de page */}
      <DialogFooter className="border-t border-gray-100 pt-6 pb-8 px-8 bg-gray-50/50">
        <div className="flex gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpenFolderModal(false)}
            disabled={isSubmitting}
            className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Création en cours...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Créer le dossier</span>
              </div>
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>

    {/* Élément décoratif en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
  </DialogContent>
</Dialog>

      {/* Modal upload document */}
<Dialog open={openUploadModal} onOpenChange={setOpenUploadModal}>
  <DialogContent className="w-[95vw] max-w-[500px] bg-white border-0 shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 scale-95 data-[state=open]:scale-100 mx-4">
    {/* En-tête avec dégradé */}
    <DialogHeader className="border-b border-gray-100 pb-6 pt-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <DialogTitle className="text-xl font-bold text-gray-900">
          Uploader un document
        </DialogTitle>
      </div>
      <DialogDescription className="text-gray-600 text-sm">
        {currentFolder ? (
          <span className="flex items-center gap-2">
            Ajouter à : 
            <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {currentFolder.name}
            </span>
          </span>
        ) : 'Ajoutez un nouveau document à la bibliothèque'}
      </DialogDescription>
    </DialogHeader>
    
    <form onSubmit={handleUploadDocument}>
      <div className="grid gap-4 py-4 px-6 max-h-[65vh] overflow-y-auto">
        {/* Sélection de fichier */}
        <div className="space-y-3 group">
  <Label htmlFor="file" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full" />
    Fichier à uploader *
  </Label>
  
  <div className="relative">
    <Input 
      id="file" 
      type="file" 
      onChange={handleFileChange} 
      className="w-full h-32 border-2 border-dashed border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-100/50 focus:border-blue-500 focus:bg-white transition-all duration-300 rounded-xl cursor-pointer opacity-0 z-10 relative"
      required 
      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" 
    />
    
    {/* Zone de dépôt stylisée */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none border-2 border-dashed border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-100/50 group-hover:border-blue-400 group-hover:bg-blue-100 transition-all duration-300 rounded-xl">
      <div className="p-3 bg-white rounded-full shadow-sm border border-blue-100">
        <Upload className="h-6 w-6 text-blue-500" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-700">
          Cliquez pour sélectionner un fichier
        </p>
        <p className="text-xs text-gray-500 max-w-xs">
          ou glissez-déposez votre fichier ici
        </p>
      </div>
      
      <div className="flex flex-wrap gap-1.5 justify-center">
        {['PDF', 'DOCX', 'XLSX', 'Images'].map((format) => (
          <span 
            key={format}
            className="bg-white text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200 font-medium"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  </div>

  {/* Aperçu du fichier sélectionné */}
  {selectedFile && (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <FileText className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 truncate">
            {selectedFile.name}
          </p>
          <p className="text-xs text-green-600">
            Taille : {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Check className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </div>
  )}

  <p className="text-xs text-gray-500 pt-2">
    Formats supportés : PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG, JPEG • Max 50MB
  </p>
</div>

        {/* Aperçu du fichier sélectionné */}
        {selectedFile && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 transform transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Nom du document */}
        <div className="space-y-2 group">
          <Label htmlFor="doc_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            Nom du document *
          </Label>
          <Input 
            id="doc_name" 
            value={uploadFormData.name} 
            onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })} 
            className="w-full border border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all duration-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
            placeholder="Ex: Contrat de travail"
            required 
          />
        </div>

        {/* Sélection du dossier */}
        <div className="space-y-2 group">
          <Label htmlFor="doc_folder" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Dossier de destination
          </Label>
          <Select 
            value={uploadFormData.folder_id} 
            onValueChange={(value) => setUploadFormData({ ...uploadFormData, folder_id: value })}
          >
            <SelectTrigger className="w-full border border-gray-300 hover:border-orange-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 rounded-lg px-3 py-2 text-gray-900 text-sm">
              <SelectValue placeholder="Sélectionner un dossier (optionnel)" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg p-2 max-h-60">
              <SelectItem value="none" className="rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <span>Aucun dossier (Racine)</span>
                </div>
              </SelectItem>
              {folders.map((folder) => {
                const IconComponent = getIconComponent(folder.icon);
                return (
                  <SelectItem 
                    key={folder.id} 
                    value={folder.id.toString()} 
                    className="rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${folder.color.split(' ')[1]}`} />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate">{folder.name}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({folder.document_count})
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2 group">
          <Label htmlFor="doc_description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Description
          </Label>
          <Textarea 
            id="doc_description" 
            value={uploadFormData.description} 
            onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })} 
            className="w-full border border-gray-300 hover:border-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all duration-300 rounded-lg px-3 py-2 text-gray-900 resize-none text-sm"
            rows={3} 
            placeholder="Description optionnelle du document..." 
          />
        </div>

        {/* Informations de format */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Formats supportés</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'TXT', 'PNG', 'JPG', 'JPEG'].map((format) => (
              <span 
                key={format}
                className="bg-white text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-200 font-medium"
              >
                {format}
              </span>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Taille maximale : 50MB par fichier
          </p>
        </div>
      </div>

      {/* Pied de page */}
      <DialogFooter className="border-t border-gray-100 pt-4 pb-6 px-6 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeUploadModal}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-white font-medium py-2.5 rounded-lg transition-all duration-300 text-sm order-2 sm:order-1"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedFile}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Upload en cours...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Upload className="h-4 w-4" />
                <span>Uploader le document</span>
              </div>
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>

    {/* Élément décoratif en bas */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
  </DialogContent>
</Dialog>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .card-glow {
          position: relative;
          overflow: hidden;
        }
        
        .card-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }
        
        .card-glow:hover::before {
          left: 100%;
        }
        
        .file-upload-success {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default RhDocumentsContent;