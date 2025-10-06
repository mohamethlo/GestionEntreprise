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
  Search
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";
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

  const [formData, setFormData] = useState({
    nom: "",
    poste: "",
    domaine: "",
    email: "",
    telephone: "",
  });

  const domaines = ["Informatique","Ressources Humaines","Marketing","Finance","Commercial","Autre"];
  const statusOptions = ["nouveau","en_cours","accepte","refuse"];

  // ------------------- Fetch candidatures -------------------
  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/candidatures/`;
      const params: Record<string, string> = {};
      if (filtreDomaine !== "Tous") params.domaine = filtreDomaine;
      if (filtreStatus !== "Tous") params.status = filtreStatus;

      const response = await axios.get<ApiResponse<Candidature[]>>(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success && response.data.data) {
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(a.date_depot).getTime() - new Date(b.date_depot).getTime()
        );
        setCandidatures(sorted);
        setFilteredCandidatures(sorted); // Initialiser les candidatures filtrées
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ title:'Erreur', text:'Impossible de charger les candidatures', icon:'error' });
    } finally { setLoading(false); }
  }, [token, filtreDomaine, filtreStatus]);

  // ------------------- Fetch stats -------------------
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<Stats>>(`${API_BASE_URL}/api/candidatures/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) setStats(response.data.data);
    } catch (error) { console.error(error); }
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
        candidature.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
    if(file && file.size <= 5*1024*1024) setSelectedFile(file);
    else if(file) Swal.fire({title:'Erreur', text:'Le fichier ne doit pas dépasser 5MB', icon:'error'});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if(currentCandidatureId) {
        // Modifier infos
        await axios.put(`${API_BASE_URL}/api/candidatures/${currentCandidatureId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }
        });
        Swal.fire({title:'Succès', text:'Candidature mise à jour', icon:'success'});
      } else {
        if(!selectedFile) { Swal.fire({title:'Erreur', text:'Veuillez sélectionner un CV', icon:'error'}); return; }
        const formToSend = new FormData();
        Object.entries(formData).forEach(([k,v])=>formToSend.append(k,v));
        formToSend.append("fichier", selectedFile);
        await axios.post(`${API_BASE_URL}/api/candidatures/`, formToSend, { headers:{ Authorization:`Bearer ${token}` } });
        Swal.fire({title:'Succès', text:'Candidature créée', icon:'success'});
      }
      setOpen(false);
      setFormData({nom:"",poste:"",domaine:"",email:"",telephone:""});
      setSelectedFile(null);
      setCurrentCandidatureId(null);
      await fetchCandidatures();
      await fetchStats();
    } catch(error) {
      console.error(error);
      Swal.fire({title:'Erreur', text:'Erreur lors de la soumission', icon:'error'});
    } finally { setIsSubmitting(false); }
  };

  // ------------------- Download -------------------
  const handleDownload = async (id:number, nom:string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/candidatures/${id}/download`, {
        headers:{ Authorization:`Bearer ${token}` },
        responseType:'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href=url; link.setAttribute('download',`${nom}_CV.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch(error) { console.error(error); Swal.fire({title:'Erreur', text:'Impossible de télécharger le CV', icon:'error'}); }
  };

  // ------------------- Delete -------------------
  const handleDelete = async (id:number) => {
    const result = await Swal.fire({title:'Êtes-vous sûr?', text:"Vous ne pourrez pas revenir en arrière!", icon:'warning', showCancelButton:true, confirmButtonText:'Oui, supprimer!', cancelButtonText:'Annuler'});
    if(result.isConfirmed){
      try {
        await axios.delete(`${API_BASE_URL}/api/candidatures/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
        Swal.fire('Supprimé!','Candidature supprimée','success'); 
        await fetchCandidatures(); await fetchStats();
      } catch(error){ console.error(error); Swal.fire({title:'Erreur', text:'Erreur suppression', icon:'error'}); }
    }
  };

  // ------------------- Update status -------------------
  const handleStatusChange = async (id:number, newStatus:string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/candidatures/${id}/status`, { status: newStatus }, { headers:{ Authorization:`Bearer ${token}` } });
      setCandidatures(prev => prev.map(c => c.id===id ? {...c,status:newStatus} : c));
      await fetchStats();
      Swal.fire({title:'Succès', text:`Statut changé en ${newStatus}`, icon:'success'});
    } catch(error){ console.error(error); Swal.fire({title:'Erreur', text:'Impossible de changer le statut', icon:'error'});}
  };

  const formatDate = (dateString:string) => format(new Date(dateString), 'PPP à HH:mm', {locale:fr});
  const getStatusBadge = (status:string) => {
    switch(status){
      case 'nouveau': return <Badge className="bg-blue-500">Nouveau</Badge>;
      case 'en_cours': return <Badge className="bg-yellow-500">En cours</Badge>;
      case 'accepte': return <Badge className="bg-green-500">Accepté</Badge>;
      case 'refuse': return <Badge variant="destructive">Refusé</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Candidatures</h1>
          <p className="text-gray-600 mt-1">Ajoutez et gérez les CV reçus par domaine et statut</p>
        </div>
        <Button onClick={()=>handleOpen()}><UserPlus className="mr-2 h-4 w-4"/>Nouvelle Candidature</Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6 items-center">
        <Filter className="h-5 w-5 text-gray-500"/>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filtreDomaine} onValueChange={setFiltreDomaine}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filtrer par domaine"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les domaines</SelectItem>
            {domaines.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtreStatus} onValueChange={setFiltreStatus}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filtrer par statut"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les statuts</SelectItem>
            {statusOptions.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Liste des Candidatures ({filteredCandidatures.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : filteredCandidatures.length===0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400"/>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune candidature</h3>
              <p className="mt-1 text-sm text-gray-500">
                {candidatures.length === 0 ? "Commencez par créer une candidature." : "Aucune candidature ne correspond à vos critères de recherche."}
              </p>
              {candidatures.length === 0 && (
                <div className="mt-6"><Button onClick={()=>handleOpen()}><UserPlus className="mr-2 h-4 w-4"/>Nouvelle Candidature</Button></div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de dépôt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatures.map(c=>(
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nom}</TableCell>
                      <TableCell>{c.poste}</TableCell>
                      <TableCell>{c.domaine}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.telephone}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell>{formatDate(c.date_depot)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Button variant="ghost" size="icon" onClick={()=>handleDownload(c.id, c.nom)} title="Télécharger CV">
                            <Download className="h-4 w-4"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={()=>handleOpen(c)} title="Modifier">
                            <Edit className="h-4 w-4"/>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={()=>handleDelete(c.id)} title="Supprimer">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                          <Select value={c.status} onValueChange={(newStatus)=>handleStatusChange(c.id,newStatus)}>
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue placeholder={c.status}/>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
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

      {/* Modal ajout/édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentCandidatureId?'Modifier la candidature':'Nouvelle candidature'}</DialogTitle>
            <DialogDescription>{currentCandidatureId?'Modifiez les infos de la candidature':'Remplissez les infos et téléversez le CV'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {['nom','poste','domaine','email','telephone'].map((field,i)=>{
                if(field==='domaine'){
                  return (
                    <div key={i} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field} className="text-right">Domaine</Label>
                      <Select value={formData.domaine} onValueChange={(val)=>setFormData({...formData,domaine:val})} required>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir un domaine"/></SelectTrigger>
                        <SelectContent>{domaines.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )
                } else {
                  return (
                    <div key={i} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={field} className="text-right">{field.charAt(0).toUpperCase()+field.slice(1)}</Label>
                      <Input id={field} value={(formData as any)[field]} onChange={(e)=>setFormData({...formData,[field]:e.target.value})} className="col-span-3" required/>
                    </div>
                  )
                }
              })}
              {!currentCandidatureId && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fichier" className="text-right">CV</Label>
                  <div className="col-span-3">
                    <Input id="fichier" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required/>
                    {selectedFile && <p className="text-xs text-gray-500 mt-1">Fichier: {selectedFile.name}</p>}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {currentCandidatureId?'Mettre à jour':'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewHireContent;