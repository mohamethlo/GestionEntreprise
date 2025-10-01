import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  RefreshCw,
  KeyRound,
  Mail,
  User,
  PlusCircle,
  Shield,
  Zap,
  Sparkles,
  Rocket,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  History,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const PasswordContent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  // Données de simulation
  const stats = [
    {
      stage: "En Attente",
      count: 4,
      color: "from-yellow-500 to-amber-600",
      icon: <Clock className="h-5 w-5" />,
      description: "Demandes en cours",
    },
    {
      stage: "Réussies",
      count: 10,
      color: "from-green-500 to-emerald-600",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Réinitialisations effectuées",
    },
    {
      stage: "Échecs",
      count: 2,
      color: "from-red-500 to-pink-600",
      icon: <XCircle className="h-5 w-5" />,
      description: "Tentatives échouées",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Jean Dupont",
      action: "Réinitialisation demandée",
      time: "Il y a 5 min",
      status: "pending",
    },
    {
      id: 2,
      user: "Marie Martin",
      action: "Mot de passe changé",
      time: "Il y a 15 min",
      status: "success",
    },
    {
      id: 3,
      user: "Pierre Lambert",
      action: "Échec de réinitialisation",
      time: "Il y a 30 min",
      status: "error",
    },
    {
      id: 4,
      user: "Sophie Chen",
      action: "Lien envoyé",
      time: "Il y a 1h",
      status: "sent",
    },
  ];

  const usersList = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@entreprise.com",
      status: "active",
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie@entreprise.com",
      status: "active",
    },
    {
      id: 3,
      name: "Pierre Lambert",
      email: "pierre@entreprise.com",
      status: "inactive",
    },
    {
      id: 4,
      name: "Sophie Chen",
      email: "sophie@entreprise.com",
      status: "active",
    },
  ];

  const handleSendResetLink = () => {
    Swal.fire({
      title: "🎉 Lien envoyé !",
      text: "Le lien de réinitialisation a été envoyé avec succès.",
      icon: "success",
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#3b82f6",
    });
  };

  const handleGenerateTempPassword = () => {
    const tempPassword = Math.random().toString(36).slice(-8);
    setOpenDialog(true);
  };

  const handleForceReset = () => {
    Swal.fire({
      title: "⚠️ Confirmation",
      text: "Êtes-vous sûr de vouloir forcer la réinitialisation ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, forcer",
      cancelButtonText: "Annuler",
      background: "#ffffff",
      color: "#1f2937",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "✅ Succès !",
          text: "La réinitialisation a été forcée avec succès.",
          icon: "success",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "sent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Animé */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-100 to-blue-100 border border-blue-200 p-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-lg animate-pulse">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <KeyRound className="absolute -top-2 -right-2 h-6 w-6 text-cyan-600 animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Sécurité des Mots de Passe
                </h1>
                <p className="text-gray-600 text-lg">
                  Gestion et réinitialisation des accès utilisateurs
                </p>
              </div>
            </div>

            <Button
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 hover:rotate-1 group"
            >
              <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouvelle Demande
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={stat.stage}
            className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 group"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {stat.stage}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.count}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: `${(stat.count / 16) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités Récentes */}
        <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
              Activités Récentes
              <Badge
                variant="secondary"
                className="ml-2 bg-cyan-500 text-white font-bold"
              >
                {recentActivities.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white group-hover:scale-110 transition-transform duration-300">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-gray-600 text-sm">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${getStatusColor(
                        activity.status
                      )} text-xs font-medium`}
                    >
                      {activity.status}
                    </Badge>
                    <p className="text-gray-500 text-xs mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Rapides */}
        <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Rocket className="h-5 w-5 text-cyan-600 animate-pulse" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button
                onClick={handleSendResetLink}
                className="w-full justify-start bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 hover:text-cyan-800 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <Mail className="h-5 w-5 mr-3 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-semibold">
                    Envoyer un lien de réinitialisation
                  </div>
                  <div className="text-xs text-cyan-600">Email sécurisé</div>
                </div>
              </Button>

              <Button
                onClick={handleGenerateTempPassword}
                className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 hover:text-yellow-800 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <KeyRound className="h-5 w-5 mr-3 text-yellow-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-semibold">
                    Générer un mot de passe temporaire
                  </div>
                  <div className="text-xs text-yellow-600">Valable 24h</div>
                </div>
              </Button>

              <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 hover:text-purple-800 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group">
                <History className="h-5 w-5 mr-3 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-semibold">
                    Historique des réinitialisations
                  </div>
                  <div className="text-xs text-purple-600">Voir les logs</div>
                </div>
              </Button>

              <Button
                onClick={handleForceReset}
                className="w-full justify-start bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <RefreshCw className="h-5 w-5 mr-3 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-semibold">
                    Forcer la réinitialisation
                  </div>
                  <div className="text-xs text-red-600">Action immédiate</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog pour nouvelle demande */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-300 bg-white p-0 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <KeyRound className="h-6 w-6 text-white" />
                Nouvelle Réinitialisation
              </DialogTitle>
            </DialogHeader>
            <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white animate-spin" />
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Utilisateur
              </label>
              <Select onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-lg">
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-lg">
                  {usersList.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id.toString()}
                      className="hover:bg-cyan-50"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                          className="ml-2 text-xs"
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mot de passe temporaire
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value="TempPass123!"
                  readOnly
                  className="bg-white border-gray-300 text-gray-900 rounded-lg pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Ce mot de passe est valable 24 heures
              </p>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-cyan-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Sécurité renforcée</span>
              </div>
              <p className="text-cyan-600 text-xs mt-1">
                Le lien de réinitialisation expire dans 1 heure et ne peut être
                utilisé qu'une seule fois.
              </p>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t border-gray-200">
            <Button
              onClick={() => {
                setOpenDialog(false);
                handleSendResetLink();
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordContent;
