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
import { Folder, Upload, FileSignature, FileText, Download, Search, MoreVertical, Users, Calendar, Eye, Loader2, Plus, Trash2, ChevronRight, Home } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";
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
    color: "bg-gray-100 text-gray-600",
    icon: "Folder",
  });

  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    description: "",
    folder_id: "",
  });

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<RhFolder[]>>(`${API_BASE_URL}/api/rh-documents/folders`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success && response.data.data) setFolders(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
    }
  }, [token]);

  const fetchDocuments = useCallback(async (folderId?: number) => {
    try {
      const url = folderId 
        ? `${API_BASE_URL}/api/rh-documents/documents?folder_id=${folderId}`
        : `${API_BASE_URL}/api/rh-documents/documents`;
      const response = await axios.get<ApiResponse<RhDocument[]>>(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success && response.data.data) setDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
    }
  }, [token]);

  const fetchRecentDocuments = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<RhDocument[]>>(`${API_BASE_URL}/api/rh-documents/documents/recent?limit=3`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success && response.data.data) setRecentDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents récents:", error);
    }
  }, [token]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<Statistics>>(`${API_BASE_URL}/api/rh-documents/statistics`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success && response.data.data) setStatistics(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  }, [token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchFolders(), fetchDocuments(), fetchRecentDocuments(), fetchStatistics()]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchFolders, fetchDocuments, fetchRecentDocuments, fetchStatistics]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse<any>>(`${API_BASE_URL}/api/rh-documents/folders`, folderFormData, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
      if (response.data.success) {
        await fetchFolders();
        setOpenFolderModal(false);
        setFolderFormData({ name: "", description: "", color: "bg-gray-100 text-gray-600", icon: "Folder" });
        Swal.fire({ title: 'Succès!', text: 'Le dossier a été créé avec succès.', icon: 'success' });
      }
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      Swal.fire({ title: 'Erreur', text: 'Une erreur est survenue lors de la création du dossier', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadFormData.name) setUploadFormData(prev => ({ ...prev, name: file.name }));
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire('Erreur', 'Veuillez sélectionner un fichier', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);
      
      // N'ajouter folder_id que si ce n'est pas "none"
      if (uploadFormData.folder_id && uploadFormData.folder_id !== '' && uploadFormData.folder_id !== 'none') {
        formData.append('folder_id', uploadFormData.folder_id);
      }
      
      const response = await axios.post<ApiResponse<RhDocument>>(`${API_BASE_URL}/api/rh-documents/documents/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      if (response.data.success) {
        await Promise.all([
          fetchDocuments(selectedFolder || undefined), 
          fetchRecentDocuments(), 
          fetchStatistics(), 
          fetchFolders()
        ]);
        closeUploadModal();
        Swal.fire({ title: 'Succès!', text: 'Le document a été uploadé avec succès.', icon: 'success' });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      Swal.fire({ title: 'Erreur', text: 'Une erreur est survenue lors de l\'upload du document', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (documentId: number, documentName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rh-documents/documents/${documentId}/download`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
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
      Swal.fire({ title: 'Erreur', text: 'Une erreur est survenue lors du téléchargement', icon: 'error' });
    }
  };

  const handleDeleteDocument = async (id: number) => {
    const result = await Swal.fire({ title: 'Êtes-vous sûr?', text: "Le document sera définitivement supprimé!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Oui, supprimer!', cancelButtonText: 'Annuler' });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/rh-documents/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        await Promise.all([fetchDocuments(selectedFolder || undefined), fetchRecentDocuments(), fetchStatistics(), fetchFolders()]);
        Swal.fire('Supprimé!', 'Le document a été supprimé.', 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression', 'error');
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
    const icons: { [key: string]: any } = { 'FileSignature': FileSignature, 'FileText': FileText, 'Folder': Folder };
    return icons[iconName] || Folder;
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-sm">
            <Folder className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bibliothèque de Documents RH</h2>
            <p className="text-gray-600 mt-1">Gérez et organisez tous vos documents ressources humaines</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchDocuments(selectedFolder || undefined)}><Search className="h-4 w-4" />Actualiser</Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => openUploadModalWithFolder(selectedFolder || undefined)}><Upload className="h-4 w-4" />Uploader un Fichier</Button>
        </div>
      </div>

      {currentFolder && (
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Button variant="ghost" size="sm" onClick={handleBackToRoot} className="flex items-center gap-1 hover:text-blue-600">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{currentFolder.name}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {!currentFolder && (
            <>
              <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Centralisez vos documents RH</h3>
                      <p className="text-gray-600 max-w-2xl">Téléchargez, organisez et partagez en toute sécurité vos documents ressources humaines. Supporte PDF, DOCX, XLSX et plus encore.</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <Button variant="outline" className="flex items-center gap-2 border-gray-300" onClick={() => setOpenFolderModal(true)}><Plus className="h-4 w-4" />Nouveau Dossier</Button>
                      <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => openUploadModalWithFolder()}><Upload className="h-4 w-4" />Nouveau Document</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {folders.map((folder) => {
                  const IconComponent = getIconComponent(folder.icon);
                  return (
                    <Card key={folder.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-200" onClick={() => handleViewFolder(folder)}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${folder.color}`}><IconComponent className="h-6 w-6" /></div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{folder.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{folder.document_count} documents</span>
                          <div className="flex gap-1"><Eye className="h-4 w-4 text-gray-400" /><span className="text-xs text-gray-500">Voir</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" />Documents Récents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentDocuments.length === 0 ? (<div className="text-center py-8 text-gray-500">Aucun document récent</div>) : (
                      recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:bg-white hover:border-blue-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="h-4 w-4 text-blue-600" /></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(doc.created_at)}</span>
                                <span className="text-xs text-gray-500">{doc.file_type} • {doc.file_size_formatted}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Download className="h-3 w-3" />{doc.downloads}</span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc.id, doc.name); }}><Download className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />Statistiques</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {statistics && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-700">Total des documents</span><span className="font-bold text-gray-900">{statistics.total_documents}</span></div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-700">Espace utilisé</span><span className="font-bold text-gray-900">{statistics.total_size_formatted}</span></div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-700">Documents ce mois</span><span className="font-bold text-green-600">+{statistics.documents_this_month}</span></div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2"><Users className="h-5 w-5 text-purple-600" />Actions Rapides</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50" onClick={handleBackToRoot}>
                        <div className="flex items-center gap-3"><Eye className="h-5 w-5 text-blue-600" /><div className="text-left"><p className="font-medium text-gray-900">Voir tous les documents</p><p className="text-sm text-gray-600">Afficher la bibliothèque complète</p></div></div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50" onClick={() => setOpenFolderModal(true)}>
                        <div className="flex items-center gap-3"><Folder className="h-5 w-5 text-orange-600" /><div className="text-left"><p className="font-medium text-gray-900">Nouveau dossier</p><p className="text-sm text-gray-600">Organiser les documents</p></div></div>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {currentFolder && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${currentFolder.color}`}>
                        {React.createElement(getIconComponent(currentFolder.icon), { className: "h-8 w-8" })}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h3>
                        <p className="text-gray-600 mt-1">{currentFolder.description || 'Aucune description'}</p>
                        <p className="text-sm text-gray-500 mt-1">{documents.length} document(s)</p>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => openUploadModalWithFolder(currentFolder.id)}>
                      <Upload className="h-4 w-4" />Ajouter un document
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {documents.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
                    <p className="text-gray-600 mb-6">Ce dossier est vide. Commencez par ajouter votre premier document.</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openUploadModalWithFolder(currentFolder.id)}>
                      <Upload className="h-4 w-4 mr-2" />Ajouter un document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead>Uploadé par</TableHead>
                          <TableHead>Téléchargements</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              {doc.name}
                            </TableCell>
                            <TableCell>{doc.file_type}</TableCell>
                            <TableCell>{doc.file_size_formatted}</TableCell>
                            <TableCell>{doc.uploader_name}</TableCell>
                            <TableCell>{doc.downloads}</TableCell>
                            <TableCell>{formatDate(doc.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id, doc.name)}><Download className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteDocument(doc.id)}><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={openFolderModal} onOpenChange={setOpenFolderModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
            <DialogDescription>Organisez vos documents en créant des dossiers</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folder_name" className="text-right">Nom</Label>
                <Input id="folder_name" value={folderFormData.name} onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="folder_description" className="text-right mt-2">Description</Label>
                <Textarea id="folder_description" value={folderFormData.description} onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })} className="col-span-3" rows={3} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folder_color" className="text-right">Couleur</Label>
                <Select value={folderFormData.color} onValueChange={(value) => setFolderFormData({ ...folderFormData, color: value })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-blue-100 text-blue-600">Bleu</SelectItem>
                    <SelectItem value="bg-green-100 text-green-600">Vert</SelectItem>
                    <SelectItem value="bg-purple-100 text-purple-600">Violet</SelectItem>
                    <SelectItem value="bg-orange-100 text-orange-600">Orange</SelectItem>
                    <SelectItem value="bg-indigo-100 text-indigo-600">Indigo</SelectItem>
                    <SelectItem value="bg-gray-100 text-gray-600">Gris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenFolderModal(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openUploadModal} onOpenChange={setOpenUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Uploader un document</DialogTitle>
            <DialogDescription>
              {currentFolder ? `Ajouter à : ${currentFolder.name}` : 'Ajoutez un nouveau document à la bibliothèque'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadDocument}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">Fichier</Label>
                <Input id="file" type="file" onChange={handleFileChange} className="col-span-3" required accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" />
              </div>
              {selectedFile && (
                <div className="col-span-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <FileText className="h-4 w-4 inline mr-2" />
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc_name" className="text-right">Nom</Label>
                <Input id="doc_name" value={uploadFormData.name} onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc_folder" className="text-right">Dossier</Label>
                <Select value={uploadFormData.folder_id} onValueChange={(value) => setUploadFormData({ ...uploadFormData, folder_id: value })}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un dossier (optionnel)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun dossier</SelectItem>
                    {folders.map((folder) => (<SelectItem key={folder.id} value={folder.id.toString()}>{folder.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="doc_description" className="text-right mt-2">Description</Label>
                <Textarea id="doc_description" value={uploadFormData.description} onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })} className="col-span-3" rows={3} placeholder="Description optionnelle du document..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeUploadModal} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Uploader'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RhDocumentsContent;