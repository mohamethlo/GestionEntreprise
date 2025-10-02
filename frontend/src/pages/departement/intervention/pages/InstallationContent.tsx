import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash, FileText, DollarSign } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Installation {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  montant: number;
  avance: number;
  dateInstallation: string;
  methode: string;
  echeance: string;
  contrat: string;  // Toujours une chaîne pour les installations enregistrées
}

const initialInstallations: Installation[] = [
  { id: 1, prenom: "Awa", nom: "Diop", telephone: "770000000", montant: 400000, avance: 175000, dateInstallation: "2025-10-01", methode: "Espèce", echeance: "2025-10-15", contrat: "contrat1.pdf" },
  { id: 2, prenom: "Mamadou", nom: "Fall", telephone: "770111111", montant: 300000, avance: 150000, dateInstallation: "2025-10-05", methode: "Wave", echeance: "2025-10-20", contrat: "contrat2.pdf" },
];

const InstallationContent = () => {
  const [installations, setInstallations] = useState(initialInstallations);
  const [open, setOpen] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0]
  });
  // Type pour le formulaire (permet File pour le téléchargement)
  type InstallationFormData = {
    prenom: string;
    nom: string;
    telephone: string;
    montant: number;
    avance: number;
    dateInstallation: string;
    methode: string;
    echeance: string;
    contrat: string | File;  // Permet File pendant l'édition
  };

  const [formData, setFormData] = useState<InstallationFormData>({
    prenom: "",
    nom: "",
    telephone: "",
    montant: 0,
    avance: 0,
    dateInstallation: "",
    methode: "",
    echeance: "",
    contrat: "",
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredInstallations, setFilteredInstallations] = useState(installations);

  // Filtrer selon les dates
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredInstallations(installations);
      return;
    }
    const filtered = installations.filter((inst) => {
      const instDate = new Date(inst.dateInstallation);
      return instDate >= new Date(startDate) && instDate <= new Date(endDate);
    });
    setFilteredInstallations(filtered);
  }, [startDate, endDate, installations]);

  const totalMontant = filteredInstallations.reduce((acc, i) => acc + i.montant, 0);
  const totalReliquat = filteredInstallations.reduce((acc, i) => acc + (i.montant - i.avance), 0);

  const handleOpen = (inst: Installation | null = null) => {
    if (inst) {
      // Convertir l'installation en données de formulaire
      setFormData({
        prenom: inst.prenom,
        nom: inst.nom,
        telephone: inst.telephone,
        montant: inst.montant,
        avance: inst.avance,
        dateInstallation: inst.dateInstallation,
        methode: inst.methode,
        echeance: inst.echeance,
        contrat: inst.contrat as string  // On s'assure que c'est une chaîne
      });
      setEditingId(inst.id);
    } else {
      setFormData({
        prenom: "",
        nom: "",
        telephone: "",
        montant: 0,
        avance: 0,
        dateInstallation: "",
        methode: "",
        echeance: "",
        contrat: "",
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (!formData.prenom || !formData.nom || !formData.telephone || !formData.montant || !formData.dateInstallation || !formData.methode) {
      Swal.fire("Erreur", "Merci de remplir tous les champs obligatoires", "error");
      return;
    }

    // Déterminer le nom du fichier
    let contratFileName = '';
    if (formData.contrat instanceof File) {
      contratFileName = formData.contrat.name;
    } else if (typeof formData.contrat === 'string') {
      contratFileName = formData.contrat;
    }

    // Préparer les données pour la sauvegarde
    const installationData: Installation = {
      id: editingId || Date.now(),
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
      montant: formData.montant,
      avance: formData.avance,
      dateInstallation: formData.dateInstallation,
      methode: formData.methode,
      echeance: formData.echeance,
      contrat: contratFileName
    };

    if (editingId) {
      setInstallations(installations.map(i => i.id === editingId ? installationData : i));
      setEditingId(null);
    } else {
      setInstallations([...installations, installationData]);
    }
    setOpen(false);
    Swal.fire("Succès", "Installation enregistrée avec succès !", "success");
  };

  const handlePayment = (inst: Installation) => {
    setSelectedInstallation(inst);
    setPaymentData({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setOpenPayment(true);
  };

  const handleProcessPayment = () => {
    if (!selectedInstallation || paymentData.amount <= 0 || !paymentData.paymentDate) {
      Swal.fire("Erreur", "Veuillez remplir tous les champs correctement", "error");
      return;
    }

    const remaining = selectedInstallation.montant - selectedInstallation.avance;
    if (paymentData.amount > remaining) {
      Swal.fire("Erreur", `Le montant ne peut pas dépasser ${remaining.toLocaleString()} FCFA`, "error");
      return;
    }

    // Mettre à jour l'installation avec le nouveau versement
    const updatedInstallations = installations.map(inst => {
      if (inst.id === selectedInstallation.id) {
        return {
          ...inst,
          avance: inst.avance + paymentData.amount
        };
      }
      return inst;
    });

    setInstallations(updatedInstallations);
    setOpenPayment(false);
    Swal.fire("Succès", `Paiement de ${paymentData.amount.toLocaleString()} FCFA enregistré avec succès`, "success");
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette installation sera supprimée définitivement !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setInstallations(installations.filter((i) => i.id !== id));
        Swal.fire("Supprimé !", "L'installation a été supprimée.", "success");
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-3">
          <PlusCircle className="h-6 w-6" /> Gestion des Installations
        </h2>
        <Button variant="default" className="bg-amber-500 hover:bg-amber-600" onClick={() => handleOpen()}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nouvelle Installation
        </Button>
      </div>

      {/* Filtres date */}
      <div className="flex gap-4 flex-wrap items-end">
        <div>
          <label className="font-medium text-sm">Date du</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="font-medium text-sm">Au</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
          className="h-10"
        >
          Réinitialiser
        </Button>
      </div>

      {/* Cards Total Installations et Total Reliquats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Total Installations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMontant.toLocaleString()} F</p>
          </CardContent>
        </Card>

        <Card className="bg-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Total Reliquats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalReliquat.toLocaleString()} F</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des installations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des Installations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInstallations.length === 0 ? (
            <p className="text-gray-500">Aucune installation pour cette période.</p>
          ) : (
            <ul className="space-y-2">
              {filteredInstallations.map((inst) => (
                <li key={inst.id} className="flex justify-between items-center border p-2 rounded">
                  <div>
                    <p className="font-semibold">{inst.prenom} {inst.nom}</p>
                    <p className="text-sm text-gray-500">
                      Téléphone: {inst.telephone} | Montant: {inst.montant.toLocaleString()} F | Avance: {inst.avance.toLocaleString()} F | Reliquat: {(inst.montant - inst.avance).toLocaleString()} F
                    </p>
                    <p className="text-xs text-gray-400">
                      Date: {inst.dateInstallation} | Méthode: {inst.methode} | Échéance: {inst.echeance} | Contrat: {inst.contrat}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleOpen(inst)} className="bg-blue-500 hover:bg-blue-600">
                      <Edit className="w-4 h-4 mr-1" /> Modifier
                    </Button>
                    <Button 
                      onClick={() => handlePayment(inst)}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={inst.montant <= inst.avance}
                    >
                      <DollarSign className="w-4 h-4 mr-1" /> Versement
                    </Button>
                    <Button onClick={() => handleDelete(inst.id)} className="bg-red-500 hover:bg-red-600">
                      <Trash className="w-4 h-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog Formulaire Nouvelle Installation */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Installation</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1">
              <label className="font-medium text-sm">Prénom *</label>
              <Input placeholder="Prénom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Nom *</label>
              <Input placeholder="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Téléphone *</label>
              <Input placeholder="Téléphone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Montant total *</label>
              <Input type="number" placeholder="Montant total" value={formData.montant} onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Avance</label>
              <Input type="number" placeholder="Avance" value={formData.avance} onChange={(e) => setFormData({ ...formData, avance: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Date installation *</label>
              <Input type="date" value={formData.dateInstallation} onChange={(e) => setFormData({ ...formData, dateInstallation: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Méthode de paiement *</label>
              <Select value={formData.methode} onValueChange={(val) => setFormData({ ...formData, methode: val })}>
                <SelectTrigger><SelectValue placeholder="Méthode de paiement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Espèce">Espèce</SelectItem>
                  <SelectItem value="Orange Money">1 tranche</SelectItem>
                  <SelectItem value="Wave">2 tranches</SelectItem>
                  <SelectItem value="Djamo">3 tranches</SelectItem>
                  <SelectItem value="Djamo">4 tranches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Date d'échéance</label>
              <Input type="date" value={formData.echeance} onChange={(e) => setFormData({ ...formData, echeance: e.target.value })} />
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
                <label className="font-medium text-sm">Contrat (PDF ou image)</label>
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, contrat: file });
                      }
                    }}
                    className="border rounded p-2 w-full"
                />
                {formData.contrat && (
                    <p className="text-sm text-gray-500 mt-1">
                      Fichier sélectionné: {typeof formData.contrat === "string" ? formData.contrat : (formData.contrat as File).name}
                    </p>
                )}
                </div>

          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour le versement */}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Effectuer un versement</DialogTitle>
          </DialogHeader>
          {selectedInstallation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Montant total (FCFA)</span>
                <span className="col-span-3">{selectedInstallation.montant.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Montant déjà payé (FCFA)</span>
                <span className="col-span-3">{selectedInstallation.avance.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Montant restant (FCFA)</span>
                <span className="col-span-3">
                  {(selectedInstallation.montant - selectedInstallation.avance).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-sm font-medium">
                  Montant à verser (FCFA) *
                </label>
                <Input
                  id="amount"
                  type="number"
                  className="col-span-3"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                  min="1"
                  max={selectedInstallation.montant - selectedInstallation.avance}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="paymentDate" className="text-sm font-medium">
                  Date du versement *
                </label>
                <Input
                  id="paymentDate"
                  type="date"
                  className="col-span-3"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpenPayment(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleProcessPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Enregistrer le versement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstallationContent;
