import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Clock, CheckCircle2, XCircle, BarChart, Settings, Plus, Download, Filter, Loader2, Calendar, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Configuration API
const API_BASE_URL = "http://localhost:5000";
const AUTH_TOKEN_KEY = 'authToken';

const useAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

interface Leave {
  id: number;
  user_id: string;
  user_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  approver_name?: string;
}

interface LeaveBalance {
  conges_payes: { used: number; total: number };
  rtt: { used: number; total: number };
  maladie: { used: number; total: number };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const LeavesContent = () => {
  const token = useAuthToken();
  const [leavesList, setLeavesList] = useState<Leave[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    duration: 0,
    reason: "",
  });

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCurrentUserId(response.data.data.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    };
    getUserInfo();
  }, [token]);

  // Récupérer la liste des congés
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Leave[]>>(
        `${API_BASE_URL}/api/leaves`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.data) {
        setLeavesList(response.data.data);
        setPendingLeaves(response.data.data.filter(l => l.status === 'pending'));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des congés:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger la liste des congés',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Récupérer le solde de congés
  const fetchLeaveBalance = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const response = await axios.get<ApiResponse<LeaveBalance>>(
        `${API_BASE_URL}/api/leaves/balance/${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.data) {
        setLeaveBalance(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
    }
  }, [token, currentUserId]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    if (currentUserId) {
      fetchLeaveBalance();
    }
  }, [currentUserId, fetchLeaveBalance]);

  const handleOpen = (leave: Leave | null = null) => {
    if (leave) {
      setFormData({
        leave_type: leave.leave_type || "",
        start_date: leave.start_date ? format(new Date(leave.start_date), 'yyyy-MM-dd') : "",
        end_date: leave.end_date ? format(new Date(leave.end_date), 'yyyy-MM-dd') : "",
        duration: leave.duration || 0,
        reason: leave.reason || "",
      });
      setCurrentLeaveId(leave.id);
    } else {
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        duration: 0,
        reason: "",
      });
      setCurrentLeaveId(null);
    }
    setOpen(true);
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const duration = calculateDuration(formData.start_date, formData.end_date);
      setFormData(prev => ({ ...prev, duration }));
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = currentLeaveId 
        ? `${API_BASE_URL}/api/leaves/${currentLeaveId}`
        : `${API_BASE_URL}/api/leaves`;
      
      const method = currentLeaveId ? 'put' : 'post';
      
      const response = await axios[method]<ApiResponse<Leave>>(
        url,
        {
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        await fetchLeaves();
        await fetchLeaveBalance();
        
        Swal.fire({
          title: 'Succès!',
          text: `La demande de congé a été ${currentLeaveId ? 'mise à jour' : 'créée'} avec succès.`,
          icon: 'success',
        });
        
        setOpen(false);
        setFormData({
          leave_type: "",
          start_date: "",
          end_date: "",
          duration: 0,
          reason: "",
        });
        setCurrentLeaveId(null);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      Swal.fire({
        title: 'Erreur',
        text: `Une erreur est survenue lors de ${currentLeaveId ? 'la mise à jour' : 'la création'} de la demande`,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Approuver cette demande?',
      text: "La demande de congé sera approuvée",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.put(`${API_BASE_URL}/api/leaves/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchLeaves();
        await fetchLeaveBalance();
        
        Swal.fire(
          'Approuvé!',
          'La demande a été approuvée avec succès.',
          'success'
        );
      } catch (error) {
        console.error("Erreur lors de l'approbation:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'approbation',
          icon: 'error',
        });
      }
    }
  };

  const handleReject = async (id: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Refuser cette demande?',
      input: 'textarea',
      inputLabel: 'Motif du refus',
      inputPlaceholder: 'Entrez le motif du refus...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Refuser',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez entrer un motif de refus';
        }
      }
    });
    
    if (reason) {
      try {
        await axios.put(
          `${API_BASE_URL}/api/leaves/${id}/reject`,
          { rejection_reason: reason },
          {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        await fetchLeaves();
        await fetchLeaveBalance();
        
        Swal.fire(
          'Refusé!',
          'La demande a été refusée.',
          'success'
        );
      } catch (error) {
        console.error("Erreur lors du refus:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors du refus',
          icon: 'error',
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leaves/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchLeaves();
        await fetchLeaveBalance();
        
        Swal.fire(
          'Supprimé!',
          'La demande a été supprimée avec succès.',
          'success'
        );
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la suppression',
          icon: 'error',
        });
      }
    }
  };

  const getStatusBadge = (status: Leave['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600 transition-colors">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="hover:bg-red-600 transition-colors">Refusé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'vacances': 'Vacances',
      'rtt': 'RTT',
      'maladie': 'Maladie',
      'formation': 'Formation',
    };
    return types[type] || type;
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'vacances': 'bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors',
      'rtt': 'bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors',
      'maladie': 'bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors',
      'formation': 'bg-green-100 text-green-600 hover:bg-green-200 transition-colors',
    };
    return colors[type] || 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* En-tête avec animation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CalendarCheck className="h-6 w-6 text-white" />
          </div>
          <div className="transform hover:translate-x-1 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Gestion des Congés et Absences
            </h2>
            <p className="text-gray-600 mt-1">Gérez les demandes de congés et suivez les soldes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => fetchLeaves()}
          >
            <Filter className="h-4 w-4" />
            Actualiser
          </Button>
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" style={{color: "white"}}
            onClick={() => handleOpen()}
          >
            <Plus className="h-4 w-4" style={{color: "white"}} />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Cartes principales avec animations améliorées */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Demandes en attente */}
            <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-500 animate-pulse" />
                    </div>
                    Demandes en Attente
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
                      {pendingLeaves.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-bounce mb-4">
                      <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
                    </div>
                    Aucune demande en attente
                  </div>
                ) : (
                  pendingLeaves.slice(0, 3).map((leave) => (
                    <div 
                      key={leave.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] group"
                      onMouseEnter={() => setHoveredCard(leave.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${getLeaveTypeColor(leave.leave_type)}`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {leave.user_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getLeaveTypeLabel(leave.leave_type)} • {leave.duration} jours
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatShortDate(leave.start_date)} - {formatShortDate(leave.end_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 transition-opacity duration-300">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          onClick={() => handleApprove(leave.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          onClick={() => handleReject(leave.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-indigo-50 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  Vue d'ensemble
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {leaveBalance ? (
                  <div className="space-y-6">
                    <div className="space-y-3 group">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Congés Payés</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.conges_payes.used}/{leaveBalance.conges_payes.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out group-hover:from-blue-500 group-hover:to-blue-700"
                          style={{ width: `${(leaveBalance.conges_payes.used / leaveBalance.conges_payes.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">RTT</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.rtt.used}/{leaveBalance.rtt.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 ease-out group-hover:from-purple-500 group-hover:to-purple-700"
                          style={{ width: `${(leaveBalance.rtt.used / leaveBalance.rtt.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Congés Maladie</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.maladie.used}/{leaveBalance.maladie.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000 ease-out group-hover:from-orange-500 group-hover:to-orange-700"
                          style={{ width: `${(leaveBalance.maladie.used / leaveBalance.maladie.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Chargement du solde...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table complète avec animations */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100" style={{color: "black"}}>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                Historique des Demandes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-50/50 transition-colors">
                      <TableHead className="font-semibold text-gray-900">Employé</TableHead>
                      <TableHead className="font-semibold text-gray-900">Type</TableHead>
                      <TableHead className="font-semibold text-gray-900">Période</TableHead>
                      <TableHead className="font-semibold text-gray-900">Durée</TableHead>
                      <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                      <TableHead className="font-semibold text-gray-900">Date demande</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leavesList.map((leave, index) => (
                      <TableRow 
                        key={leave.id}
                        className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animation: 'fadeInUp 0.6s ease-out forwards',
                          color: "black"
                        }}
                      >
                        <TableCell className="font-medium group-hover:text-purple-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {leave.user_name.charAt(0)}
                            </div>
                            {leave.user_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getLeaveTypeColor(leave.leave_type)} transform group-hover:scale-105 transition-transform duration-300`}>
                            {getLeaveTypeLabel(leave.leave_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="group-hover:text-gray-700 transition-colors">
                          {formatShortDate(leave.start_date)} - {formatShortDate(leave.end_date)}
                        </TableCell>
                        <TableCell className="font-semibold group-hover:text-purple-600 transition-colors">
                          {leave.duration} jours
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell className="group-hover:text-gray-700 transition-colors">
                          {formatDate(leave.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 transition-all duration-300">
                            {leave.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-all duration-300 hover:scale-110"
                                  onClick={() => handleApprove(leave.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                                  onClick={() => handleReject(leave.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                              onClick={() => handleDelete(leave.id)}
                              disabled={leave.status !== 'pending'}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal de création/modification avec animations */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl transform transition-all duration-300">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {currentLeaveId ? 'Modifier la demande' : 'Nouvelle demande de congé'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Remplissez les informations pour votre demande de congé
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4 group">
                <Label htmlFor="leave_type" className="text-right font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Type
                </Label>
                <Select 
                  value={formData.leave_type} 
                  onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                >
                  <SelectTrigger className="col-span-3 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-colors duration-300">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="border-0 shadow-lg bg-white">
                    <SelectItem value="vacances" className="hover:bg-purple-50 focus:bg-purple-50 transition-colors">Vacances</SelectItem>
                    <SelectItem value="rtt" className="hover:bg-purple-50 focus:bg-purple-50 transition-colors">RTT</SelectItem>
                    <SelectItem value="maladie" className="hover:bg-purple-50 focus:bg-purple-50 transition-colors">Maladie</SelectItem>
                    <SelectItem value="formation" className="hover:bg-purple-50 focus:bg-purple-50 transition-colors">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 group">
                <Label htmlFor="start_date" className="text-right font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Date début
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="col-span-3 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4 group">
                <Label htmlFor="end_date" className="text-right font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Date fin
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="col-span-3 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4 group">
                <Label htmlFor="duration" className="text-right font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Durée
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  className="col-span-3 bg-gray-50 border-gray-300"
                  disabled
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4 group">
                <Label htmlFor="reason" className="text-right mt-2 font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Motif
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="col-span-3 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-colors duration-300"
                  rows={3}
                  placeholder="Optionnel"
                />
              </div>
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
                disabled={isSubmitting || !formData.leave_type}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentLeaveId ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>{currentLeaveId ? 'Mettre à jour' : 'Créer'}</>
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
      `}</style>
    </div>
  );
};

export default LeavesContent;