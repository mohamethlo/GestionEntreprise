// src/components/rh/pages/RecruitmentContent.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  PlusCircle, Edit, Trash2, Users, Mail, Phone, MapPin, Shield, 
  Search, Filter, Zap, Sparkles, Star, Crown, Rocket, Palette,
  Eye, EyeOff, UserCheck, Settings, UserPlus, Key, Fingerprint, Lock, Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// --- Configuration API & AUTHENTIFICATION ---
const API_BASE_URL = "http://localhost:5000"; 
const AUTH_TOKEN_KEY = 'authToken'; 

// Liste des sites disponibles
const SITES_LIST = ["Dakar", "Mbour"]; 

// Récupère le token JWT depuis le localStorage
const useAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY); 
};
// --- Fin Configuration API & AUTHENTIFICATION ---

const UserContent = () => {
    const token = useAuthToken();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [apiReady, setApiReady] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        username: "",
        email: "",
        telephone: "",
        site: "",
        role_id: "", 
        permissions: [],
        password: "",
    });

    // Configuration des rôles pour l'affichage
    const roleConfig = {
        "Administrateur": { 
            color: "from-red-500 to-pink-600", 
            icon: <Crown className="h-3 w-3" />,
            bg: "bg-gradient-to-r from-red-500 to-pink-600"
        },
        "Commercial": { 
            color: "from-blue-500 to-cyan-600", 
            icon: <Settings className="h-3 w-3" />,
            bg: "bg-gradient-to-r from-blue-500 to-cyan-600"
        },
        "Technicien": { 
            color: "from-green-500 to-emerald-600", 
            icon: <UserCheck className="h-3 w-3" />,
            bg: "bg-gradient-to-r from-green-500 to-emerald-600"
        }
    };

    // Liste des permissions pour le frontend
    const permissionsList = [
        { name: "interventions", icon: "🛠️", color: "from-orange-500 to-red-500" },
        { name: "stock", icon: "📦", color: "from-blue-500 to-cyan-500" },
        { name: "depenses", icon: "💰", color: "from-green-500 to-emerald-500" },
        { name: "clients", icon: "👥", color: "from-purple-500 to-pink-500" },
        { name: "installations", icon: "⚡", color: "from-yellow-500 to-amber-500" },
        { name: "facturation", icon: "🧾", color: "from-indigo-500 to-blue-500" },
    ];

    const getInitials = (prenom, nom) => {
        return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
    };

    const getRandomGradient = () => {
        const gradients = [
            "from-purple-500 to-pink-600",
            "from-blue-500 to-cyan-600",
            "from-green-500 to-emerald-600",
            "from-orange-500 to-red-600",
            "from-indigo-500 to-purple-600",
            "from-teal-500 to-blue-600"
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    };

    // Correspondance entre le nom de rôle affiché et l'ID du rôle réel
    const getRoleIdByName = useCallback((name) => roles.find(r => r.name === name)?.id, [roles]);

    // Fonction utilitaire pour convertir les permissions de l'API (chaîne) au format frontend (tableau)
    const apiPermissionsToForm = (apiValue) => {
        const apiString = (apiValue || '').toString(); 
        
        if (apiString === 'all') return permissionsList.map(p => p.name);
        if (apiString === '') return []; 
        
        return apiString.split(',').map(p => p.trim());
    };

    // Fonction utilitaire pour convertir les permissions du formulaire au format API (chaîne)
    const formPermissionsToApi = (formArray) => {
        if (formArray.length === permissionsList.length && permissionsList.every(p => formArray.includes(p.name))) {
            return 'all';
        }
        return formArray.join(', ');
    };

    // --- Fonctions d'appel API ---

    // 1. Récupérer les rôles (Doit être appelé en premier)
    const fetchRoles = useCallback(async () => {
        if (!token) return; 
        try {
            const response = await fetch(`${API_BASE_URL}/api/roles/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors de la récupération des rôles.");
            const data = await response.json();
            setRoles(data);
            setApiReady(true); 
        } catch (error) {
            console.error("Erreur rôles:", error);
            Swal.fire("Erreur", error.message, "error");
            setLoading(false);
        }
    }, [token]);

    // 2. Récupérer les utilisateurs (Dépend des rôles pour le mappage)
    const fetchUsers = useCallback(async () => {
        if (!token || !apiReady) return; 
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs.");
            const data = await response.json();
            
            const adaptedUsers = data.map(user => ({
                ...user,
                role_id: getRoleIdByName(user.role) || user.role_id,
                permissions: apiPermissionsToForm(user.permissions),
                avatarGradient: getRandomGradient()
            }));

            setUsers(adaptedUsers);
        } catch (error) {
            console.error("Erreur utilisateurs:", error);
            Swal.fire("Erreur", error.message, "error"); 
        } finally {
            setLoading(false);
        }
    }, [token, apiReady, getRoleIdByName]); 

    // Chargement initial des Rôles
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    // Chargement des Utilisateurs après les Rôles
    useEffect(() => {
        if (apiReady) {
            fetchUsers();
        }
    }, [apiReady, fetchUsers]);

    // 3. Gestion de la sauvegarde (Création ou Mise à jour)
    const handleSave = async () => {
        setLoading(true);

        // Préparation des données pour l'API
        const dataToSend = {
            ...formData,
            role_id: formData.role_id,
            permissions: formPermissionsToApi(formData.permissions)
        };
        delete dataToSend.role; 

        let url = `${API_BASE_URL}/api/users/`;
        let method = "POST";
        let successMsg = "L'utilisateur a été créé avec succès !";

        if (editingUser) {
            url = `${API_BASE_URL}/api/users/${editingUser.id}`;
            method = "PUT";
            successMsg = "L'utilisateur a été mis à jour avec succès !";
            if (!dataToSend.password || dataToSend.password.trim() === "") {
                delete dataToSend.password;
            }
        } else {
            if (!dataToSend.password || dataToSend.password.trim() === "") {
                Swal.fire("Erreur", "Le mot de passe est obligatoire pour la création.", "error");
                setLoading(false);
                return;
            }
        }
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.msg || `Erreur ${response.status} lors de l'opération.`);
            }

            setOpen(false);
            await fetchUsers(); 
            Swal.fire({
                icon: "success",
                title: "🎉 Succès !",
                text: successMsg,
                confirmButtonColor: "#3b82f6",
                background: '#ffffff',
                color: '#1f2937',
                iconColor: '#10b981'
            });
        } catch (error) {
            console.error("Erreur API:", error);
            Swal.fire("Erreur", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 4. Gestion de la suppression
    const handleDelete = (id) => {
        Swal.fire({
            title: "⚠️ Attention !",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
            background: '#ffffff',
            color: '#1f2937',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
        }).then(async (result) => { 
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                        method: "DELETE",
                        headers: { 'Authorization': `Bearer ${token}` }, 
                    });
                    
                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.msg || `Erreur ${response.status} lors de la suppression.`);
                    }

                    await fetchUsers();
                    Swal.fire({
                        title: "🗑️ Supprimé !", 
                        text: "L'utilisateur a été supprimé.", 
                        icon: "success",
                        background: '#ffffff',
                        color: '#1f2937',
                        confirmButtonColor: '#3b82f6'
                    });
                } catch (error) {
                    console.error("Erreur suppression:", error);
                    Swal.fire("Erreur", error.message, "error");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // 5. Réinitialisation du mot de passe
    const handleResetPassword = useCallback((userId, username) => {
        const newPassword = "password"; 

        Swal.fire({
            title: "Réinitialiser le mot de passe ?",
            text: `Le mot de passe de ${username} sera réinitialisé à "${newPassword}".`, 
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui, réinitialiser",
            cancelButtonText: "Annuler",
            background: '#ffffff',
            color: '#1f2937'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
                        method: "PATCH",
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ new_password: newPassword }),
                    });

                    const apiResponse = await response.json();
            
                    if (!response.ok) {
                        throw new Error(apiResponse.msg || `Erreur ${response.status} lors de la réinitialisation.`);
                    }

                    Swal.fire({
                        title: "Mot de passe réinitialisé !", 
                        text: `Le nouveau mot de passe est : **${newPassword}**`, 
                        icon: "success",
                        background: '#ffffff',
                        color: '#1f2937'
                    });
                } catch (error) {
                    console.error("Erreur réinitialisation:", error);
                    Swal.fire("Erreur", error.message, "error");
                } finally {
                    setLoading(false);
                }
            }
        });
    }, [token]); 

    // --- Fonctions locales pour le formulaire ---
    const handleOpen = () => {
        setEditingUser(null);
        setFormData({
            prenom: "", nom: "", username: "", email: "", telephone: "", 
            site: "", 
            role_id: getRoleIdByName('Administrateur') || "", 
            permissions: [], 
            password: "",
        });
        setOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        
        const formattedPermissions = apiPermissionsToForm(user.permissions);

        setFormData({
            ...user,
            permissions: formattedPermissions, 
            role_id: user.role_id || getRoleIdByName(user.role) || "", 
            password: "",
        });
        setOpen(true);
    };

    const togglePermission = (perm) => {
        setFormData((prev) => {
            const newPerms = prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm];
            return { ...prev, permissions: newPerms };
        });
    };

    const getRoleStatus = (roleName) => {
        const roleId = getRoleIdByName(roleName);
        return formData.role_id === roleId;
    };

    const toggleRole = (roleName) => {
        const roleId = getRoleIdByName(roleName);
        setFormData((prev) => ({
            ...prev,
            role_id: prev.role_id === roleId ? "" : roleId
        }));
    };

    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-bounce mb-4">
                        <Rocket className="h-16 w-16 text-blue-600 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur d'authentification</h2>
                    <p className="text-gray-600">Jeton d'authentification manquant. Veuillez vous reconnecter.</p>
                </div>
            </div>
        );
    }
    
    if (loading && users.length === 0 && !apiReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-bounce mb-4">
                        <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement...</h2>
                    <p className="text-gray-600">Préparation de l'espace utilisateurs</p>
                    <div className="mt-6 w-32 h-2 bg-blue-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
            {/* Header Animé */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg animate-pulse">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-400 animate-spin" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Gestion des Utilisateurs
                                </h1>
                                <p className="text-gray-600 text-lg">Espace de gestion des accès et permissions</p>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleOpen}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:rotate-1 group"
                        >
                            <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            Nouvel Utilisateur
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards avec Animations */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Utilisateurs", value: users.length, icon: Users, color: "from-blue-500 to-cyan-500" },
                    { label: "Administrateurs", value: users.filter(u => u.role === "Administrateur").length, icon: Crown, color: "from-red-500 to-pink-600" },
                    { label: "Commerciaux", value: users.filter(u => u.role === "Commercial").length, icon: Settings, color: "from-green-500 to-emerald-600" },
                    { label: "Techniciens", value: users.filter(u => u.role === "Technicien").length, icon: UserCheck, color: "from-purple-500 to-indigo-600" }
                ].map((stat, index) => (
                    <Card 
                        key={stat.label}
                        className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 group"
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
                                    style={{ width: `${(stat.value / Math.max(users.length, 1)) * 100}%` }}
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
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900 rounded-xl py-3">
                                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="Filtrer par rôle" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl">
                                    <SelectItem value="all" className="hover:bg-gray-100">👑 Tous les rôles</SelectItem>
                                    <SelectItem value="Administrateur" className="hover:bg-red-50">👑 Administrateur</SelectItem>
                                    <SelectItem value="Commercial" className="hover:bg-blue-50">⚙️ Commercial</SelectItem>
                                    <SelectItem value="Technicien" className="hover:bg-green-50">👤 Technicien</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des Utilisateurs */}
            <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-gray-200">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
                        Liste des Utilisateurs
                        <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
                            {filteredUsers.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="animate-bounce mb-4">
                                <Users className="h-16 w-16 text-gray-400 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                            <p className="text-gray-600 mb-6">
                                {users.length === 0 ? "Commencez l'aventure en ajoutant votre premier utilisateur !" : "Aucun résultat pour votre recherche"}
                            </p>
                            {users.length === 0 && (
                                <Button 
                                    onClick={handleOpen}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                                >
                                    <Rocket className="h-5 w-5 mr-2" />
                                    Démarrer l'Aventure
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredUsers.map((user, index) => (
                                <div 
                                    key={user.id}
                                    className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Effet de brillance au survol */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                    
                                    <div className="relative z-10">
                                        {/* En-tête avec avatar et actions */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-14 w-14 border-2 border-gray-200 shadow-md group-hover:border-blue-400 transition-colors duration-300">
                                                    <AvatarFallback className={`bg-gradient-to-r ${user.avatarGradient || getRandomGradient()} text-white font-bold text-lg`}>
                                                        {getInitials(user.prenom, user.nom) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                                                        {user.prenom} {user.nom}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge 
                                                            className={`px-3 py-1 text-xs font-bold border-0 text-white ${roleConfig[user.role]?.bg || 'bg-gray-500'}`}
                                                        >
                                                            {roleConfig[user.role]?.icon}
                                                            <span className="ml-1">{user.role}</span>
                                                        </Badge>
                                                        <Star className="h-3 w-3 text-yellow-500 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Informations de contact */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm truncate">{user.email}</span>
                                            </div>
                                            {user.telephone && (
                                                <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                                    <Phone className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">{user.telephone}</span>
                                                </div>
                                            )}
                                            {user.site && (
                                                <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                                    <MapPin className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">{user.site}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Permissions */}
                                        {user.permissions && user.permissions.length > 0 && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <p className="text-xs font-semibold text-gray-500 mb-3">POUVOIRS SPÉCIAUX ✨</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.permissions.slice(0, 4).map((perm) => {
                                                        const permConfig = permissionsList.find(p => p.name === perm);
                                                        return (
                                                            <Badge 
                                                                key={perm} 
                                                                className={`px-2 py-1 text-xs bg-gradient-to-r ${permConfig?.color || 'from-gray-500 to-gray-600'} text-white border-0 font-medium`}
                                                            >
                                                                {permConfig?.icon} {perm}
                                                            </Badge>
                                                        );
                                                    })}
                                                    {user.permissions.length > 4 && (
                                                        <Badge className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 font-medium">
                                                            +{user.permissions.length - 4}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Popup Ajout/Édition */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className={`${editingUser ? "max-w-6xl" : "max-w-2xl"} max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl`}>
                    {/* Header du Dialog */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                <Palette className="h-6 w-6 text-white" />
                                {editingUser ? "✨ Modifier l'Utilisateur" : "🚀 Créer un Nouvel Utilisateur"}
                            </DialogTitle>
                        </DialogHeader>
                        <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white animate-spin" />
                    </div>

                    {/* === AJOUT UTILISATEUR === */}
                    {!editingUser && (
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Informations Personnelles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { label: "Prénom *", key: "prenom", type: "text" },
                                    { label: "Nom *", key: "nom", type: "text" },
                                    { label: "Nom d'utilisateur *", key: "username", type: "text" },
                                    { label: "Email *", key: "email", type: "email" },
                                    { label: "Téléphone", key: "telephone", type: "text" },
                                    { 
                                        label: "Mot de passe *", 
                                        key: "password", 
                                        type: showPassword ? "text" : "password",
                                        icon: showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
                                        onIconClick: () => setShowPassword(!showPassword)
                                    },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">{field.label}</label>
                                        <div className="relative">
                                            <Input 
                                                type={field.type}
                                                placeholder={field.label}
                                                value={formData[field.key]}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                            />
                                            {field.icon && (
                                                <button
                                                    type="button"
                                                    onClick={field.onIconClick}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                                >
                                                    {field.icon}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Site et Rôle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">🏢 Site</label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, site: val })} value={formData.site}>
                                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-lg">
                                            <SelectValue placeholder="Choisir un site" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-lg">
                                            {SITES_LIST.map(site => (
                                                <SelectItem key={site} value={site} className="hover:bg-blue-50">{site}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">👑 Rôle</label>
                                    <Select onValueChange={(roleId) => setFormData({ ...formData, role_id: roleId })} value={formData.role_id ? String(formData.role_id) : ""}>
                                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-lg">
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-lg">
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={String(role.id)} className="hover:bg-blue-50">{role.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    🎯 Permissions Spéciales
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {permissionsList.map((perm) => (
                                        <label 
                                            key={perm.name}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                                formData.permissions.includes(perm.name) 
                                                    ? `border-blue-500 bg-blue-50 shadow-md shadow-blue-500/25` 
                                                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                        >
                                            <Checkbox 
                                                checked={formData.permissions.includes(perm.name)} 
                                                onCheckedChange={() => togglePermission(perm.name)}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <span className="text-gray-900 font-medium flex items-center gap-2">
                                                <span className="text-lg">{perm.icon}</span>
                                                {perm.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button 
                                    onClick={handleSave} 
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Zap className="h-5 w-5 mr-2" />
                                    {editingUser ? "💫 Mettre à Jour" : "✨ Créer l'Utilisateur"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {/* === MODIFICATION UTILISATEUR === */}
                    {editingUser && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Formulaire d'édition utilisateur */}
                                <Card className="border-blue-200 bg-white">
                                    <CardHeader className="bg-blue-600 text-white">
                                        <CardTitle className="flex items-center gap-2">
                                            <UserPlus className="h-5 w-5" />
                                            Formulaire d'édition utilisateur
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 mt-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Nom *</label>
                                                <Input 
                                                    placeholder="Nom" 
                                                    value={formData.nom} 
                                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                                                    className="border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Prénom *</label>
                                                <Input 
                                                    placeholder="Prénom" 
                                                    value={formData.prenom} 
                                                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} 
                                                    className="border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Nom d'utilisateur *</label>
                                                <Input 
                                                    placeholder="Nom d'utilisateur" 
                                                    value={formData.username} 
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                                                    className="border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Adresse e-mail *</label>
                                                <Input 
                                                    type="email"
                                                    placeholder="Email" 
                                                    value={formData.email} 
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                                    className="border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                                                <Input 
                                                    placeholder="Téléphone" 
                                                    value={formData.telephone} 
                                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} 
                                                    className="border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Site</label>
                                                <Select onValueChange={(val) => setFormData({ ...formData, site: val })} value={formData.site}>
                                                    <SelectTrigger className="border-gray-300">
                                                        <SelectValue placeholder="Sélectionner un site" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SITES_LIST.map(site => (
                                                            <SelectItem key={site} value={site}>{site}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {/* Champ mot de passe optionnel pour mise à jour */}
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau mot de passe (laissez vide si inchangé)</label>
                                            <Input 
                                                type="password"
                                                placeholder="Nouveau mot de passe" 
                                                value={formData.password} 
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                                className="border-gray-300"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Appliquer les modifications
                                        </Button>
                                        <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                            Retourner à la liste
                                        </Button>
                                    </CardFooter>
                                </Card>

                                {/* Colonne droite : Réinitialisation, Rôles, Permissions */}
                                <div className="space-y-4">
                                    {/* Réinitialisation mot de passe */}
                                    <Card className="border-blue-200 bg-white">
                                        <CardHeader className="bg-blue-600 text-white">
                                            <CardTitle className="flex items-center gap-2">
                                                <Key className="h-5 w-5" />
                                                Réinitialisation de mot de passe
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <ul className="list-disc list-inside text-gray-700">
                                                <li>
                                                    <Button 
                                                        variant="link" 
                                                        className="p-0 h-auto text-blue-600 hover:text-blue-800" 
                                                        onClick={() => handleResetPassword(editingUser.id, editingUser.username)} 
                                                        disabled={loading}
                                                    >
                                                        Réinitialiser le mot de passe
                                                    </Button>
                                                    <span className="text-sm text-gray-600"> (par défaut: "password")</span>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    {/* Rôles */}
                                    <Card className="border-blue-200 bg-white">
                                        <CardHeader className="bg-blue-600 text-white">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Fingerprint className="h-5 w-5" />
                                                    Rôles
                                                </CardTitle>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={loading}>
                                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Appliquer les modifications
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <Accordion type="single" collapsible>
                                                {roles.map((role) => {
                                                    if (!['Administrateur', 'Commercial', 'Technicien', 'Administration', 'Dev_administration'].includes(role.name)) return null;

                                                    return (
                                                        <AccordionItem key={role.id} value={role.name}>
                                                            <div className="flex items-center justify-between">
                                                                <AccordionTrigger className="flex-1 text-gray-900">{role.name}</AccordionTrigger>
                                                                <div className="flex items-center gap-2 mr-4">
                                                                    <Switch 
                                                                        checked={getRoleStatus(role.name)}
                                                                        onCheckedChange={() => toggleRole(role.name)}
                                                                    />
                                                                    <span className="text-sm text-gray-700">{getRoleStatus(role.name) ? 'Activé' : 'Désactivé'}</span>
                                                                </div>
                                                            </div>
                                                            <AccordionContent className="text-gray-600">
                                                                {role.name === 'Administrateur' && 'Accès complet à toutes les fonctionnalités du système.'}
                                                                {role.name === 'Commercial' && 'Accès limité aux fonctionnalités de gestion (Client, Intervention, Pointage).'}
                                                                {role.name === 'Technicien' && 'Accès aux fonctionnalités basiques pour techniciens (Pointage, Intervention).'}
                                                                {role.name === 'Administration' && 'Accès aux fonctionnalités d\'administration (Pointage, Intervention).'}
                                                                {role.name === 'Dev_administration' && 'Accès aux fonctionnalités de développement et administration (Pointage).'}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    );
                                                })}
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Permissions */}
                                    <Card className="border-blue-200 bg-white">
                                        <CardHeader className="bg-blue-600 text-white">
                                            <CardTitle className="flex items-center gap-2">
                                                <Lock className="h-5 w-5" />
                                                Permissions supplémentaires
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {permissionsList.map((perm) => (
                                                    <label key={perm.name} className="flex items-center space-x-2 text-gray-700">
                                                        <Checkbox 
                                                            checked={formData.permissions.includes(perm.name)} 
                                                            onCheckedChange={() => togglePermission(perm.name)} 
                                                        />
                                                        <span>{perm.name.charAt(0).toUpperCase() + perm.name.slice(1)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserContent;