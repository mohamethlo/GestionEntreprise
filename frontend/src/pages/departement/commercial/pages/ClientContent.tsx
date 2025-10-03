import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Edit, Trash2, User, Loader2, FileText, Users, 
  Building, Mail, Phone, MapPin, Search, Filter, Sparkles,
  Zap, Crown, BadgeCheck, Calendar, ArrowUpDown
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API_BASE_URL = "http://localhost:5000";
const CLIENT_ENDPOINT = `${API_BASE_URL}/api/clients/`;

const useAuthToken = () => {
    return localStorage.getItem('authToken') || 'YOUR_VALID_JWT_TOKEN';
};

interface Client {
    id: number;
    nom: string;
    prenom: string | null;
    entreprise: string | null;
    email: string;
    telephone: string;
    adresse: string | null;
    ville: string | null;
    code_postal: string | null;
    type_client: string;
    created_at: string;
    nomCompletDisplay: string;
}

const ClientContent = () => {
    const token = useAuthToken();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        entreprise: "",
        email: "",
        telephone: "",
        adresse: "",
        ville: "",
        code_postal: "",
        identifiantFiscal: "",
        type_client: "prospect",
    });

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    const resetFormData = () => {
        setFormData({
            nom: "", prenom: "", entreprise: "", email: "", telephone: "", 
            adresse: "", identifiantFiscal: "", ville: "", code_postal: "",
            type_client: "prospect"
        });
    };

    const fetchClients = useCallback(async () => {
        if (!token || token === 'YOUR_VALID_JWT_TOKEN') {
            Swal.fire("Authentification", "Veuillez remplacer 'YOUR_VALID_JWT_TOKEN' par un jeton valide.", "error");
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(CLIENT_ENDPOINT, {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                throw new Error("Accès non autorisé. Jeton JWT invalide ou expiré.");
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ msg: response.statusText }));
                throw new Error(errorData.msg || "Erreur lors de la récupération des clients.");
            }

            const data = await response.json();
            const clientList = Array.isArray(data.clients) ? data.clients : [];
            const adaptedClients = clientList.map((c: any) => ({
                ...c,
                nomCompletDisplay: c.entreprise || `${c.nom} ${c.prenom || ''}`.trim(),
            }));
            
            setClients(adaptedClients);
        } catch (error: any) {
            console.error("Erreur Fetch Clients:", error);
            Swal.fire({
                title: "Erreur de l'API",
                text: error.message,
                icon: "error",
                background: '#fff',
                color: '#1f2937',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || token === 'YOUR_VALID_JWT_TOKEN') return Swal.fire("Erreur", "Jeton d'authentification manquant.", "error");

        if (!formData.nom || !formData.telephone) {
            Swal.fire({
                title: "Erreur de formulaire",
                text: "Le Nom et le Téléphone sont obligatoires.",
                icon: "warning",
                background: '#fff',
                color: '#1f2937',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setIsSubmitting(true);
        const isNew = editingId === null;
        const url = isNew ? CLIENT_ENDPOINT : `${CLIENT_ENDPOINT}${editingId}`;
        const method = isNew ? "POST" : "PUT";

        const dataToSend = {
            nom: formData.nom,
            prenom: formData.prenom || null,
            entreprise: formData.entreprise || null,
            email: formData.email,
            telephone: formData.telephone,
            adresse: formData.adresse || null,
            ville: formData.ville || null,
            code_postal: formData.code_postal || null,
            type_client: formData.type_client,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.msg || `Erreur ${response.status} lors de l'opération.`);
            }

            setOpen(false);
            setEditingId(null);
            resetFormData();
            await fetchClients();
            Swal.fire({
                title: "✅ Succès !",
                text: isNew ? "Client ajouté avec succès." : "Client mis à jour avec succès.",
                icon: "success",
                background: '#fff',
                color: '#1f2937',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        } catch (error: any) {
            console.error("Erreur API Enregistrement:", error);
            Swal.fire({
                title: "Erreur",
                text: error.message,
                icon: "error",
                background: '#fff',
                color: '#1f2937',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        if (!token || token === 'YOUR_VALID_JWT_TOKEN') return Swal.fire("Erreur", "Jeton d'authentification manquant.", "error");

        Swal.fire({
            title: "⚠️ Êtes-vous sûr ?",
            text: "Cette action est irréversible et supprimera le client !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
            background: '#fff',
            color: '#1f2937',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const response = await fetch(`${CLIENT_ENDPOINT}${id}`, {
                        method: "DELETE",
                        headers: getAuthHeaders(),
                    });
                    
                    if (!response.ok) {
                        const result = await response.json().catch(() => ({ msg: response.statusText }));
                        throw new Error(result.msg || `Erreur ${response.status} lors de la suppression.`);
                    }

                    setClients(prevClients => prevClients.filter(c => c.id !== id));
                    Swal.fire({
                        title: "🗑️ Supprimé !",
                        text: "Le client a été supprimé.",
                        icon: "success",
                        background: '#fff',
                        color: '#1f2937',
                        confirmButtonColor: '#10b981',
                        timer: 1500
                    });
                } catch (error: any) {
                    console.error("Erreur suppression:", error);
                    Swal.fire({
                        title: "Erreur",
                        text: error.message,
                        icon: "error",
                        background: '#fff',
                        color: '#1f2937',
                        confirmButtonColor: '#ef4444'
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    
    const handleOpen = async (client: Client | null = null) => {
        if (client && (!token || token === 'YOUR_VALID_JWT_TOKEN')) {
            return Swal.fire("Erreur", "Jeton d'authentification manquant pour l'édition.", "error");
        }

        if (client) {
            setLoading(true);
            try {
                const response = await fetch(`${CLIENT_ENDPOINT}${client.id}`, {
                    headers: getAuthHeaders()
                });
                
                if (!response.ok) throw new Error("Erreur lors du chargement des détails du client.");
                const fullClientData = await response.json();
                
                setFormData({
                    nom: fullClientData.nom || '',
                    prenom: fullClientData.prenom || '',
                    entreprise: fullClientData.entreprise || '',
                    email: fullClientData.email || '',
                    telephone: fullClientData.telephone || '',
                    adresse: fullClientData.adresse || '',
                    ville: fullClientData.ville || '',
                    code_postal: fullClientData.code_postal || '',
                    identifiantFiscal: "",
                    type_client: fullClientData.type_client || 'prospect',
                });
                setEditingId(client.id);
                setOpen(true);
            } catch (error: any) {
                console.error("Erreur chargement édition:", error);
                Swal.fire({
                    title: "Erreur",
                    text: error.message,
                    icon: "error",
                    background: '#fff',
                    color: '#1f2937',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setLoading(false);
            }
        } else {
            resetFormData();
            setEditingId(null);
            setOpen(true);
        }
    };

    // Filtrage et tri des clients
    const filteredAndSortedClients = clients
        .filter(client => {
            const matchesSearch = 
                client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.telephone?.includes(searchTerm);
            
            const matchesType = typeFilter === "all" || client.type_client === typeFilter;
            
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            let aValue = a[sortField as keyof Client];
            let bValue = b[sortField as keyof Client];
            
            if (sortField === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            }
            
            if (aValue === null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue === null) return sortDirection === 'asc' ? 1 : -1;
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getTypeConfig = (type: string) => {
        const config = {
            client: { color: "from-green-500 to-emerald-600", label: "CLIENT", icon: <BadgeCheck className="h-3 w-3" /> },
            prospect: { color: "from-blue-500 to-cyan-600", label: "PROSPECT", icon: <User className="h-3 w-3" /> },
            partenaire: { color: "from-purple-500 to-pink-600", label: "PARTENAIRE", icon: <Crown className="h-3 w-3" /> }
        };
        return config[type as keyof typeof config] || config.prospect;
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
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">
                                    Gestion des Clients
                                </h1>
                                <p className="text-blue-100 text-lg">Gérez votre portefeuille clients et prospects</p>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={() => handleOpen()}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group"
                        >
                            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                            Nouveau Client
                        </Button>
                    </div>
                </div>
            </div>

            {/* Cartes de Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { 
                        label: "Total Clients", 
                        value: clients.length, 
                        icon: Users, 
                        color: "from-blue-500 to-cyan-500",
                        description: "Tous les contacts"
                    },
                    { 
                        label: "Clients Actifs", 
                        value: clients.filter(c => c.type_client === 'client').length, 
                        icon: BadgeCheck, 
                        color: "from-green-500 to-emerald-500",
                        description: "Clients confirmés"
                    },
                    { 
                        label: "Prospects", 
                        value: clients.filter(c => c.type_client === 'prospect').length, 
                        icon: User, 
                        color: "from-orange-500 to-red-500",
                        description: "En négociation"
                    },
                    { 
                        label: "Partenaires", 
                        value: clients.filter(c => c.type_client === 'partenaire').length, 
                        icon: Crown, 
                        color: "from-purple-500 to-pink-500",
                        description: "Collaborations"
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
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                                    style={{ width: `${(stat.value / Math.max(clients.length, 1)) * 100}%` }}
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
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900 rounded-xl py-3">
                                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="Filtrer par type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl">
                                    <SelectItem value="all" className="hover:bg-gray-100">👥 Tous les types</SelectItem>
                                    <SelectItem value="client" className="hover:bg-green-50">✅ Client</SelectItem>
                                    <SelectItem value="prospect" className="hover:bg-blue-50">🎯 Prospect</SelectItem>
                                    <SelectItem value="partenaire" className="hover:bg-purple-50">🤝 Partenaire</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("");
                                    setTypeFilter("all");
                                }}
                                className="border-gray-300 text-white-700 hover:bg-gray-50"
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des Clients */}
            <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-gray-200">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
                        Liste des Clients
                        <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
                            {filteredAndSortedClients.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des clients...</h3>
                            <p className="text-gray-600">Préparation de votre portefeuille clients</p>
                        </div>
                    ) : filteredAndSortedClients.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="animate-bounce mb-4">
                                <Users className="h-16 w-16 text-gray-400 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
                            <p className="text-gray-600 mb-6">
                                {clients.length === 0 ? "Commencez par ajouter votre premier client !" : "Aucun résultat pour votre recherche"}
                            </p>
                            {clients.length === 0 && (
                                <Button 
                                    onClick={() => handleOpen()}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Ajouter le Premier Client
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                            onClick={() => handleSort('nomCompletDisplay')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Nom/Entreprise
                                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Date d'ajout
                                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedClients.map((client, index) => (
                                        <TableRow 
                                            key={client.id}
                                            className="group hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.01]"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeConfig(client.type_client).color} bg-opacity-10`}>
                                                        {client.entreprise ? (
                                                            <Building className="h-4 w-4 text-blue-600" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {client.nomCompletDisplay}
                                                        </div>
                                                        {client.entreprise && (
                                                            <div className="text-sm text-gray-600">
                                                                {client.prenom} {client.nom}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    className={`px-3 py-1 text-xs font-bold border-0 text-white bg-gradient-to-r ${getTypeConfig(client.type_client).color}`}
                                                >
                                                    {getTypeConfig(client.type_client).icon}
                                                    <span className="ml-1">{getTypeConfig(client.type_client).label}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                    {client.prenom || client.nom}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <span className="truncate max-w-[200px]">{client.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone className="h-4 w-4 text-blue-600" />
                                                    {client.telephone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    {new Date(client.created_at).toLocaleDateString("fr-FR", {
                                                        year: "numeric", 
                                                        month: "short", 
                                                        day: "numeric",
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpen(client)}
                                                        disabled={loading}
                                                        className="h-8 w-8 p-0 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(client.id)}
                                                        disabled={loading}
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
                <DialogContent className="sm:max-w-[700px] rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
                    {/* Header du Dialog */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                                {editingId ? "✨ Modifier le Client" : "🚀 Ajouter un Client"}
                            </DialogTitle>
                        </DialogHeader>
                        
                        {/* Bouton fermeture */}
                        <Button
                            variant="ghost"
                            onClick={() => { setOpen(false); resetFormData(); }}
                            className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white"
                        >
                            ×
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Informations de base */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    Informations de base
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                                            Nom/Raison Sociale *
                                        </Label>
                                        <Input
                                            id="nom"
                                            placeholder="Nom ou Raison Sociale"
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="prenom" className="text-sm font-semibold text-gray-700">
                                            Prénom (Contact)
                                        </Label>
                                        <Input
                                            id="prenom"
                                            placeholder="Prénom de la personne de contact"
                                            value={formData.prenom}
                                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="entreprise" className="text-sm font-semibold text-gray-700">
                                            Entreprise
                                        </Label>
                                        <Input
                                            id="entreprise"
                                            placeholder="Nom de l'entreprise"
                                            value={formData.entreprise}
                                            onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Type et Contact */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-blue-600" />
                                    Type et Contact
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="type_client" className="text-sm font-semibold text-gray-700">
                                            Type de client
                                        </Label>
                                        <Select 
                                            value={formData.type_client} 
                                            onValueChange={(value) => setFormData({ ...formData, type_client: value })}
                                        >
                                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="Sélectionnez le type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="prospect" className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Prospect
                                                </SelectItem>
                                                <SelectItem value="client" className="flex items-center gap-2">
                                                    <BadgeCheck className="h-4 w-4" />
                                                    Client
                                                </SelectItem>
                                                <SelectItem value="partenaire" className="flex items-center gap-2">
                                                    <Crown className="h-4 w-4" />
                                                    Partenaire
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                            Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@exemple.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700">
                                            Téléphone *
                                        </Label>
                                        <Input
                                            id="telephone"
                                            type="tel"
                                            placeholder="+221 77 123 45 67"
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Adresse */}
                            <div className="space-y-4 sm:col-span-2">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    Adresse
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700">
                                            Adresse complète
                                        </Label>
                                        <Input
                                            id="adresse"
                                            placeholder="Adresse complète (rue, bâtiment...)"
                                            value={formData.adresse}
                                            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ville" className="text-sm font-semibold text-gray-700">
                                            Ville
                                        </Label>
                                        <Input
                                            id="ville"
                                            placeholder="Ville"
                                            value={formData.ville}
                                            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code_postal" className="text-sm font-semibold text-gray-700">
                                            Code Postal
                                        </Label>
                                        <Input
                                            id="code_postal"
                                            placeholder="Code Postal"
                                            value={formData.code_postal}
                                            onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setOpen(false); resetFormData(); }}
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
                                {editingId ? "💫 Mettre à jour" : "✨ Créer le client"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientContent;