// src/components/rh/pages/SecurityContent.jsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, Edit, Trash2, Shield, Lock, Key, Users, 
  Zap, Sparkles, Crown, Settings, UserCheck, AlertTriangle,
  Rocket, Palette, Star
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const SecurityContent = () => {
  const [roles, setRoles] = useState([
    { 
      id: 1, 
      name: "Admin", 
      permissions: ["Utilisateurs", "Clients", "Facturation", "Stock", "Dépenses", "Interventions", "Installations"],
      color: "from-red-500 to-pink-600",
      icon: <Crown className="h-4 w-4" />,
      users: 3
    },
    { 
      id: 2, 
      name: "Manager", 
      permissions: ["Clients", "Dépenses", "Interventions", "Installations"],
      color: "from-blue-500 to-cyan-600",
      icon: <Settings className="h-4 w-4" />,
      users: 5
    },
    { 
      id: 3, 
      name: "Employé", 
      permissions: ["Interventions"],
      color: "from-green-500 to-emerald-600",
      icon: <UserCheck className="h-4 w-4" />,
      users: 12
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });

  const permissionsList = [
    { name: "Utilisateurs", icon: "👥", color: "from-purple-500 to-pink-500", description: "Gestion des utilisateurs" },
    { name: "Clients", icon: "💼", color: "from-blue-500 to-cyan-500", description: "Gestion de la clientèle" },
    { name: "Stock", icon: "📦", color: "from-green-500 to-emerald-500", description: "Gestion des stocks" },
    { name: "Dépenses", icon: "💰", color: "from-yellow-500 to-amber-500", description: "Gestion des dépenses" },
    { name: "Facturation", icon: "🧾", color: "from-indigo-500 to-blue-500", description: "Gestion facturation" },
    { name: "Interventions", icon: "🛠️", color: "from-orange-500 to-red-500", description: "Gestion interventions" },
    { name: "Installations", icon: "⚡", color: "from-teal-500 to-green-500", description: "Gestion installations" },
  ];

  const getRandomGradient = () => {
    const gradients = [
      "from-purple-500 to-pink-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-indigo-500 to-purple-600",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleSave = () => {
    if (editingRole) {
      setRoles(
        roles.map((r) => (r.id === editingRole.id ? { 
          ...r, 
          ...formData,
          color: r.color || getRandomGradient()
        } : r))
      );
    } else {
      const newRole = { 
        id: Date.now(), 
        ...formData, 
        color: getRandomGradient(),
        icon: <Shield className="h-4 w-4" />,
        users: 0
      };
      setRoles([...roles, newRole]);
    }
    setOpen(false);
    
    Swal.fire({
      title: "🎉 Succès !",
      text: "Le rôle a été enregistré avec succès !",
      icon: "success",
      background: '#ffffff',
      color: '#1f2937',
      confirmButtonColor: '#3b82f6',
      iconColor: '#10b981'
    });
  };

  const handleDelete = (id) => {
    const role = roles.find(r => r.id === id);
    
    Swal.fire({
      title: "⚠️ Attention !",
      html: `Êtes-vous sûr de vouloir supprimer le rôle <strong>"${role?.name}"</strong> ?<br/><span class="text-red-600">Cette action est irréversible.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: '#ffffff',
      color: '#1f2937',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        setRoles(roles.filter((r) => r.id !== id));
        Swal.fire({
          title: "🗑️ Supprimé !", 
          text: "Le rôle a été supprimé avec succès.", 
          icon: "success",
          background: '#ffffff',
          color: '#1f2937',
          confirmButtonColor: '#3b82f6'
        });
      }
    });
  };

  const togglePermission = (perm) => {
    setFormData((prev) => {
      const newPerms = prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPerms };
    });
  };

  const toggleAllPermissions = () => {
    if (formData.permissions.length === permissionsList.length) {
      setFormData({ ...formData, permissions: [] });
    } else {
      setFormData({ ...formData, permissions: permissionsList.map(p => p.name) });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Animé */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 p-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-lg animate-pulse">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <Lock className="absolute -top-2 -right-2 h-6 w-6 text-red-500 animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                  Sécurité & Rôles
                </h1>
                <p className="text-gray-600 text-lg">Gestion avancée des permissions et accès</p>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setEditingRole(null);
                setFormData({ name: "", permissions: [] });
                setOpen(true);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:rotate-1 group"
            >
              <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau Rôle
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques des Rôles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Rôles", value: roles.length, icon: Shield, color: "from-purple-500 to-pink-600" },
          { label: "Utilisateurs Actifs", value: roles.reduce((acc, role) => acc + role.users, 0), icon: Users, color: "from-blue-500 to-cyan-500" },
          { label: "Permissions", value: permissionsList.length, icon: Key, color: "from-green-500 to-emerald-600" },
          { label: "Niveau Sécurité", value: "Élevé", icon: Lock, color: "from-orange-500 to-red-600" },
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
                  style={{ width: `${(index + 1) * 25}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des Rôles */}
      <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
            Rôles du Système
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white font-bold">
              {roles.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {roles.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Shield className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rôle défini</h3>
              <p className="text-gray-600 mb-6">
                Créez votre premier rôle pour commencer à sécuriser votre application
              </p>
              <Button 
                onClick={() => {
                  setEditingRole(null);
                  setFormData({ name: "", permissions: [] });
                  setOpen(true);
                }}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Créer Premier Rôle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {roles.map((role, index) => (
                <div 
                  key={role.id}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-red-400 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    {/* En-tête du rôle */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${role.color} shadow-md`}>
                          {role.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl group-hover:text-red-600 transition-colors duration-300">
                            {role.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-gray-100 text-gray-700 border-0">
                              <Users className="h-3 w-3 mr-1" />
                              {role.users} utilisateurs
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
                          onClick={() => {
                            setEditingRole(role);
                            setFormData(role);
                            setOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-600" />
                        PERMISSIONS ATTRIBUÉES ({role.permissions.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 4).map((perm) => {
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
                        {role.permissions.length > 4 && (
                          <Badge className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 font-medium">
                            +{role.permissions.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression des permissions */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Niveau d'accès</span>
                        <span>{Math.round((role.permissions.length / permissionsList.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${role.color} transition-all duration-1000`}
                          style={{ width: `${(role.permissions.length / permissionsList.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup Ajout/Édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          {/* Header du Dialog */}
          <div className="relative bg-gradient-to-r from-red-600 to-pink-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Palette className="h-6 w-6 text-white" />
                {editingRole ? "✨ Modifier le Rôle" : "🚀 Créer un Nouveau Rôle"}
              </DialogTitle>
            </DialogHeader>
            <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white animate-spin" />
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Nom du Rôle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Crown className="h-4 w-4 text-red-600" />
                Nom du Rôle *
              </label>
              <Input
                placeholder="Ex: Super Admin, Manager, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="h-4 w-4 text-red-600" />
                  🎯 Permissions d'Accès
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllPermissions}
                  className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {formData.permissions.length === permissionsList.length ? "Tout désélectionner" : "Tout sélectionner"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionsList.map((perm) => (
                  <label 
                    key={perm.name}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.permissions.includes(perm.name) 
                        ? `border-red-500 bg-red-50 shadow-md shadow-red-500/25` 
                        : 'border-gray-300 bg-white hover:border-red-400 hover:bg-red-50'
                    }`}
                  >
                    <Checkbox 
                      checked={formData.permissions.includes(perm.name)} 
                      onCheckedChange={() => togglePermission(perm.name)}
                      className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{perm.icon}</span>
                        <span className="text-gray-900 font-medium">{perm.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Compteur de permissions */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                <span className="text-gray-700 text-sm">
                  Permissions sélectionnées
                </span>
                <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
                  {formData.permissions.length} / {permissionsList.length}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-200">
            <Button 
              onClick={handleSave} 
              disabled={!formData.name}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Zap className="h-5 w-5 mr-2" />
              {editingRole ? "💫 Mettre à Jour" : "✨ Créer le Rôle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityContent;