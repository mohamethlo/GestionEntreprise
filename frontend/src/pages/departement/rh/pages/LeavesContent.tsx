import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Clock, CheckCircle2, XCircle, BarChart, Settings, Plus, Download, Filter, Loader2, Calendar } from "lucide-react";
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
        return <Badge variant="secondary" className="bg-orange-100 text-orange-600">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refusé</Badge>;
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
      'vacances': 'bg-blue-100 text-blue-600',
      'rtt': 'bg-purple-100 text-purple-600',
      'maladie': 'bg-orange-100 text-orange-600',
      'formation': 'bg-green-100 text-green-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-sm">
            <CalendarCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestion des Congés et Absences</h2>
            <p className="text-gray-600 mt-1">Gérez les demandes de congés et suivez les soldes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => fetchLeaves()}>
            <Filter className="h-4 w-4" />
            Actualiser
          </Button>
          <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700" onClick={() => handleOpen()}>
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Cartes principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Demandes en attente */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Demandes en Attente
                    <span className="bg-orange-100 text-orange-600 text-sm px-2 py-1 rounded-full">
                      {pendingLeaves.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune demande en attente
                  </div>
                ) : (
                  pendingLeaves.slice(0, 3).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getLeaveTypeColor(leave.leave_type)}`}>
                          <CalendarCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{leave.user_name}</p>
                          <p className="text-sm text-gray-600">
                            {getLeaveTypeLabel(leave.leave_type)} • {leave.duration} jours
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatShortDate(leave.start_date)} - {formatShortDate(leave.end_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(leave.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleReject(leave.id)}>
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-600" />
                  Vue d'ensemble
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {leaveBalance ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Congés Payés</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.conges_payes.used}/{leaveBalance.conges_payes.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(leaveBalance.conges_payes.used / leaveBalance.conges_payes.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">RTT</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.rtt.used}/{leaveBalance.rtt.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${(leaveBalance.rtt.used / leaveBalance.rtt.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Congés Maladie</span>
                        <span className="font-semibold text-gray-900">
                          {leaveBalance.maladie.used}/{leaveBalance.maladie.total} jours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-orange-500 transition-all duration-500"
                          style={{ width: `${(leaveBalance.maladie.used / leaveBalance.maladie.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Chargement du solde...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table complète */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historique des Demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date demande</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leavesList.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell className="font-medium">{leave.user_name}</TableCell>
                        <TableCell>
                          <Badge className={getLeaveTypeColor(leave.leave_type)}>
                            {getLeaveTypeLabel(leave.leave_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatShortDate(leave.start_date)} - {formatShortDate(leave.end_date)}
                        </TableCell>
                        <TableCell>{leave.duration} jours</TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell>{formatDate(leave.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {leave.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApprove(leave.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleReject(leave.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
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

      {/* Modal de création/modification */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentLeaveId ? 'Modifier la demande' : 'Nouvelle demande de congé'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour votre demande de congé
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leave_type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={formData.leave_type} 
                  onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacances">Vacances</SelectItem>
                    <SelectItem value="rtt">RTT</SelectItem>
                    <SelectItem value="maladie">Maladie</SelectItem>
                    <SelectItem value="formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Date début
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date" className="text-right">
                  Date fin
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Durée
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  className="col-span-3"
                  disabled
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="reason" className="text-right mt-2">
                  Motif
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="Optionnel"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.leave_type}>
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
    </div>
  );
};

export default LeavesContent;