import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, Clock, ListChecks, X, CheckCircle, XCircle, Loader2, TrendingUp, Users } from "lucide-react";
import Swal from 'sweetalert2';

// ===========================================
// CONFIGURATION API
// ===========================================
const FLASK_API_ROOT = "http://localhost:5000"; 
const AUTH_TOKEN_KEY = 'authToken'; 
const API_BASE_URL = FLASK_API_ROOT + "/api/salary_advances"; 

interface AdvanceRequest {
    id: number;
    user_id: number;
    user_name: string;
    montant: string | number;
    motif: string;
    statut: 'en_attente' | 'approuve' | 'refuse';
    date_demande: string;
    notes_admin?: string | null;
}

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  
  const customHeaders: HeadersInit = options.headers || {}; 
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...customHeaders,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json(); 
  } catch (e) {
    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: Le serveur n'a pas renvoyé de JSON.`);
    }
    return {};
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Erreur API: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};

// ===========================================
// COMPOSANT PRINCIPAL
// ===========================================

const SalaryAdvanceContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [showApprovedModal, setShowApprovedModal] = useState(false);
    const [showRejectedModal, setShowRejectedModal] = useState(false);
    
    const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [approvalNote, setApprovalNote] = useState('');
    const [rejectionNote, setRejectionNote] = useState('');

    const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAdvances = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch(""); 
            setAdvances(data.advances || []);
        } catch (error: any) {
            console.error("Erreur lors du chargement des avances:", error.message);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de chargement',
                text: `Impossible de récupérer les demandes : ${error.message}`,
                confirmButtonColor: '#EF4444',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdvances();
    }, [fetchAdvances]);

    const pendingRequests = useMemo(() => 
        advances.filter(req => req.statut === 'en_attente')
    , [advances]);
    
    const approvedRequests = useMemo(() => 
        advances.filter(req => req.statut === 'approuve')
    , [advances]);
    
    const rejectedRequests = useMemo(() => 
        advances.filter(req => req.statut === 'refuse')
    , [advances]);

    const pendingAmount = useMemo(() => 
        pendingRequests.reduce((sum, req) => sum + Number(req.montant), 0)
    , [pendingRequests]);

    const totalApprovedAmount = useMemo(() => 
        approvedRequests.reduce((sum, req) => sum + Number(req.montant), 0)
    , [approvedRequests]);
        
    const formatAmount = (amount: string | number) => {
        return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' FCFA';
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleViewDetails = (request: AdvanceRequest) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
        setApprovalNote(request.notes_admin || '');
        setRejectionNote(request.notes_admin || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (!amount || !reason) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs manquants',
                text: 'Veuillez remplir le montant et la raison.',
                confirmButtonColor: '#F59E0B',
            });
            setIsSaving(false);
            return;
        }

        try {
            await apiFetch("", {
                method: "POST",
                body: JSON.stringify({
                    montant: Number(amount),
                    motif: reason,
                }),
            });

            Swal.fire({
                icon: 'success',
                title: 'Demande soumise !',
                text: 'Votre demande d\'avance a été envoyée pour approbation.',
                confirmButtonColor: '#10B981',
            });
            
            setAmount('');
            setReason('');
            handleCloseModal();
            await fetchAdvances();

        } catch (error: any) {
            console.error("Erreur lors de la soumission:", error.message);
            Swal.fire({
                icon: 'error',
                title: 'Échec de la soumission',
                text: `Impossible d'envoyer la demande : ${error.message}`,
                confirmButtonColor: '#EF4444',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleApprove = async (id: number) => {
        if (!selectedRequest) return;
        setIsSaving(true);
        try {
            await apiFetch(`/${id}/approve`, {
                method: "POST",
                body: JSON.stringify({
                    notes_admin: approvalNote,
                }),
            });

            Swal.fire({
                icon: 'success',
                title: 'Demande Approuvée !',
                text: `L'avance pour ${selectedRequest.user_name} a été acceptée.`,
                confirmButtonColor: '#10B981',
            });

            setIsDetailModalOpen(false);
            setApprovalNote('');
            await fetchAdvances();

        } catch (error: any) {
            console.error("Erreur lors de l'approbation:", error.message);
            Swal.fire({
                icon: 'error',
                title: 'Échec de l\'approbation',
                text: `Erreur: ${error.message}`,
                confirmButtonColor: '#EF4444',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReject = async (id: number) => {
        if (!selectedRequest) return;
        setIsSaving(true);
        try {
            await apiFetch(`/${id}/refuse`, {
                method: "POST",
                body: JSON.stringify({
                    notes_admin: rejectionNote,
                }),
            });

            Swal.fire({
                icon: 'success',
                title: 'Demande Refusée !',
                text: `L'avance pour ${selectedRequest.user_name} a été refusée.`,
                confirmButtonColor: '#10B981',
            });

            setIsDetailModalOpen(false);
            setRejectionNote('');
            await fetchAdvances();

        } catch (error: any) {
            console.error("Erreur lors du refus:", error.message);
            Swal.fire({
                icon: 'error',
                title: 'Échec du refus',
                text: `Erreur: ${error.message}`,
                confirmButtonColor: '#EF4444',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.4s ease-out;
                }
                .hover-lift {
                    transition: all 0.3s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
                }
                .card-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card-gradient-green {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                .card-gradient-yellow {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }
                .card-gradient-blue {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }
                .glassmorphism {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header avec animation */}
                <div className="flex justify-between items-center animate-fadeIn">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <Wallet className="h-8 w-8 text-white"/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Gestion des Avances sur Salaire
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Gérez vos demandes d'avance en temps réel</p>
                        </div>
                    </div>
                    <Button
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 rounded-xl"
                        onClick={handleOpenModal}
                    >
                        <DollarSign className="h-5 w-5"/>
                        Nouvelle Demande
                    </Button>
                </div>

                {/* Statistiques Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideIn">
                    {/* Card 1 - Montant en cours */}
                    <Card className="hover-lift border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-green-600"/>
                                </div>
                                Montant en Cours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                            ) : (
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{formatAmount(pendingAmount)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Total en attente</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card 2 - Demandes en attente */}
                    <Card className="hover-lift border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-yellow-600"/>
                                </div>
                                En Attente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Demandes à traiter</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3 - Approuvées */}
                    <Card className="hover-lift border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-blue-600"/>
                                </div>
                                Approuvées
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{approvedRequests.length}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatAmount(totalApprovedAmount)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4 - Refusées */}
                    <Card className="hover-lift border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-rose-600/20 rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle className="h-4 w-4 text-red-600"/>
                                </div>
                                Refusées
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{rejectedRequests.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Demandes rejetées</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section principale */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Demandes en attente - 2 colonnes */}
                    <Card className="lg:col-span-2 border-0 shadow-xl hover-lift">
                        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <Clock className="h-5 w-5 text-yellow-600"/>
                                Demandes en Attente
                                <span className="ml-auto bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {pendingRequests.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-gray-400"/>
                                    </div>
                                    <p className="text-gray-500">Aucune demande en attente</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {pendingRequests.map((req, index) => (
                                        <div 
                                            key={req.id} 
                                            className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-yellow-50 rounded-xl border border-yellow-100 hover:shadow-md transition-all duration-300 hover:scale-102"
                                            style={{animationDelay: `${index * 0.1}s`}}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                                                    <Users className="h-5 w-5 text-white"/>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{req.user_name}</p>
                                                    <p className="text-sm text-gray-600">{formatAmount(req.montant)}</p>
                                                    <p className="text-xs text-gray-400">{new Date(req.date_demande).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
                                                onClick={() => handleViewDetails(req)}
                                            >
                                                Voir détails
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions rapides - 1 colonne */}
                    <Card className="border-0 shadow-xl hover-lift">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <ListChecks className="h-5 w-5 text-indigo-600"/>
                                Actions Rapides
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <Button 
                                className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 h-16"
                                onClick={() => setShowApprovedModal(true)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="bg-green-500 p-2 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold">Approuvées</p>
                                        <p className="text-xs text-green-600">{approvedRequests.length} demandes</p>
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-green-500"/>
                                </div>
                            </Button>
                            
                            <Button 
                                className="w-full justify-start bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 h-16"
                                onClick={() => setShowRejectedModal(true)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="bg-red-500 p-2 rounded-lg">
                                        <XCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold">Refusées</p>
                                        <p className="text-xs text-red-600">{rejectedRequests.length} demandes</p>
                                    </div>
                                </div>
                            </Button>

                            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                <p className="text-sm text-gray-600 mb-2">💡 Conseil</p>
                                <p className="text-xs text-gray-500">Traitez les demandes rapidement pour améliorer la satisfaction des employés.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de demande d'avance */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-scaleIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                            onClick={handleCloseModal}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
                                <DollarSign className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Nouvelle Demande</h3>
                            <p className="text-gray-500 text-sm mt-2">Remplissez les informations ci-dessous</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Montant (FCFA)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Entrez le montant"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition-all"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Raison de la demande
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Décrivez la raison de votre demande"
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 transition-all resize-none"
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    className="flex-1 border-2 hover:bg-gray-50 rounded-xl py-6"
                                    disabled={isSaving}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg rounded-xl py-6"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <><Loader2 className="h-4 w-4 animate-spin mr-2"/> Envoi...</>
                                    ) : (
                                        "Soumettre"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de détail */}
            {isDetailModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-scaleIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                            onClick={() => setIsDetailModalOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl inline-block mb-4">
                                <Users className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Détails de la demande</h3>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Employé</p>
                                <p className="font-semibold text-gray-900 text-lg">{selectedRequest.user_name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-xs text-gray-500 mb-1">Montant</p>
                                    <p className="font-bold text-green-600">{formatAmount(selectedRequest.montant)}</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                    <p className="font-bold text-blue-600">{new Date(selectedRequest.date_demande).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-xs text-gray-500 mb-1">Motif</p>
                                <p className="text-gray-700">{selectedRequest.motif}</p>
                            </div>
                            
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                                <p className="text-xs text-gray-500 mb-1">Statut</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                    selectedRequest.statut === 'approuve' ? 'bg-green-100 text-green-700' : 
                                    selectedRequest.statut === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {selectedRequest.statut === 'approuve' && <CheckCircle className="h-4 w-4 mr-1"/>}
                                    {selectedRequest.statut === 'refuse' && <XCircle className="h-4 w-4 mr-1"/>}
                                    {selectedRequest.statut === 'en_attente' && <Clock className="h-4 w-4 mr-1"/>}
                                    {selectedRequest.statut.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {selectedRequest.statut === 'en_attente' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Note d'administration (optionnelle)
                                    </label>
                                    <textarea
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        rows={3}
                                        placeholder="Ajoutez une note pour votre décision..."
                                        value={approvalNote}
                                        onChange={(e) => {
                                            setApprovalNote(e.target.value);
                                            setRejectionNote(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg rounded-xl py-6"
                                        onClick={() => handleReject(selectedRequest.id)}
                                        disabled={isSaving}
                                    >
                                        <XCircle className="mr-2 h-5 w-5" />
                                        {isSaving ? "Refus..." : "Refuser"}
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg text-white rounded-xl py-6"
                                        onClick={() => handleApprove(selectedRequest.id)}
                                        disabled={isSaving}
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        {isSaving ? "Accept..." : "Accepter"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal des demandes approuvées */}
            {showApprovedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-8 relative max-h-[85vh] overflow-hidden shadow-2xl animate-scaleIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all z-10"
                            onClick={() => setShowApprovedModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl inline-block mb-4">
                                <CheckCircle className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Demandes Approuvées</h3>
                            <p className="text-gray-500 text-sm mt-2">{approvedRequests.length} demande(s) approuvée(s)</p>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[calc(85vh-200px)] pr-2">
                            {approvedRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-gray-400"/>
                                    </div>
                                    <p className="text-gray-500">Aucune demande approuvée pour le moment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {approvedRequests.map((request, index) => (
                                        <div 
                                            key={request.id} 
                                            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-102"
                                            style={{animationDelay: `${index * 0.05}s`}}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                                                        <Users className="h-5 w-5 text-white"/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{request.user_name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(request.date_demande).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-green-600">{formatAmount(request.montant)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{request.motif}</p>
                                            {request.notes_admin && (
                                                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">📝 Note Admin:</p>
                                                    <p className="text-sm text-gray-600">{request.notes_admin}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal des demandes refusées */}
            {showRejectedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-8 relative max-h-[85vh] overflow-hidden shadow-2xl animate-scaleIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all z-10"
                            onClick={() => setShowRejectedModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl inline-block mb-4">
                                <XCircle className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Demandes Refusées</h3>
                            <p className="text-gray-500 text-sm mt-2">{rejectedRequests.length} demande(s) refusée(s)</p>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[calc(85vh-200px)] pr-2">
                            {rejectedRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="h-8 w-8 text-gray-400"/>
                                    </div>
                                    <p className="text-gray-500">Aucune demande refusée pour le moment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rejectedRequests.map((request, index) => (
                                        <div 
                                            key={request.id} 
                                            className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-102"
                                            style={{animationDelay: `${index * 0.05}s`}}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2 rounded-lg">
                                                        <Users className="h-5 w-5 text-white"/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{request.user_name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(request.date_demande).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-red-600">{formatAmount(request.montant)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{request.motif}</p>
                                            {request.notes_admin && (
                                                <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">📝 Note Admin:</p>
                                                    <p className="text-sm text-gray-600">{request.notes_admin}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryAdvanceContent;