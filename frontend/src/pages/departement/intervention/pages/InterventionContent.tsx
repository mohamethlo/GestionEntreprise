import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Users, PlusCircle, Edit, Trash, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import "sweetalert2/dist/sweetalert2.min.css";

const clientsExistants = ["Client A", "Client B", "Client C"];
const typeInterventions = ["Maintenance", "Installation", "Dépannage"];
const materielsDisponibles = ["Câble", "Prise", "Disjoncteur", "Lampe", "Autre"];

const InterventionContent = () => {
  const [interventions, setInterventions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // pour l'édition
  const [formData, setFormData] = useState({
    titre: "",
    priorite: "Normale",
    description: "",
    clientType: "non-enregistre",
    client: "",
    nomClient: "",
    telClient: "",
    technicien: "assigner-plus-tard",
    datePrevue: "",
    dureeEstimee: "",
    typeIntervention: "",
    adresse: "",
    materiels: {},
  });

  const handleOpen = (intervention = null) => {
    if (intervention) {
      // Pré-remplir le formulaire pour modification
      setFormData({ ...intervention });
      setEditingId(intervention.id);
    } else {
      setFormData({
        titre: "",
        priorite: "Normale",
        description: "",
        clientType: "non-enregistre",
        client: "",
        nomClient: "",
        telClient: "",
        technicien: "assigner-plus-tard",
        datePrevue: "",
        dureeEstimee: "",
        typeIntervention: "",
        adresse: "",
        materiels: {},
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setInterventions(interventions.map((i) => (i.id === editingId ? { ...formData } : i)));
      setEditingId(null);
    } else {
      const newIntervention = { id: Date.now(), ...formData };
      setInterventions([...interventions, newIntervention]);
    }
    setOpen(false);
    Swal.fire({
      icon: "success",
      title: "Succès",
      text: "Intervention enregistrée avec succès !",
      confirmButtonColor: "#3085d6",
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette intervention sera supprimée définitivement !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        setInterventions(interventions.filter((i) => i.id !== id));
        Swal.fire("Supprimé !", "L'intervention a été supprimée.", "success");
      }
    });
  };

  const toggleMateriel = (mat) => {
    setFormData((prev) => {
      const newMateriels = { ...prev.materiels };
      if (newMateriels[mat]) {
        delete newMateriels[mat];
      } else {
        newMateriels[mat] = 1;
      }
      return { ...prev, materiels: newMateriels };
    });
  };

  const setMaterielQuantity = (mat, qty) => {
    setFormData((prev) => ({
      ...prev,
      materiels: { ...prev.materiels, [mat]: Number(qty) },
    }));
  };

  const generatePDF = (interv) => {
    const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo
  const logoUrl = '/logo/logo_lg.png'; //mettre le chemin correct de votre logo
  doc.addImage(logoUrl, 'PNG', 10, 5, 40, 15);

  // Titre
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FICHE D'INTERVENTION", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("NETSYSTEME INFORMATIQUE & TELECOM", pageWidth / 2, 23, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Société / Organisme : ${interv.clientType === "existant" ? interv.client : interv.nomClient}`, 10, 35);
  doc.text(`N°${interv.id}`, 160, 35);
  doc.text(`Nom de l'intervenant : ${interv.technicien}`, 10, 42);

  // Nature de l'intervention
  doc.setFont("helvetica", "bold");
  doc.text("NATURE DE L'INTERVENTION", 10, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`- Type : ${interv.typeIntervention || 'Non défini'}`, 15, 57);
  doc.text(`- Description : ${interv.description || '-'}`, 15, 64);

  // Matériels
  doc.text("Matériels utilisés :", 10, 71);
  let matY = 78;
  Object.entries(interv.materiels).forEach(([mat, qty]) => {
    doc.text(`• ${mat} : ${qty}`, 15, matY);
    matY += 7;
  });

  // Adresse
  doc.text(`Adresse : ${interv.adresse || '-'}`, 10, matY + 5);

  // Observations
  doc.setFont("helvetica", "bold");
  doc.text("Observations et suite donnée :", 10, matY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(interv.observations || "-", 10, matY + 22);

  // Horaires
  doc.text(`Heure d'arrivée : ${interv.heureArrivee || '--:--'}`, 10, matY + 32);
  doc.text(`Heure de départ : ${interv.heureDepart || '--:--'}`, 70, matY + 32);
  doc.text(`Durée : ${interv.duree || '--:--'}`, 140, matY + 32);

  // Identifiants DVR/NVR
  doc.text(`Identifiant DVR/NVR : ${interv.idDVR || 'Non renseigné'}`, 10, matY + 40);
  doc.text(`Mot de passe DVR/NVR : ${interv.mdpDVR || 'Non renseigné'}`, 110, matY + 40);

  // Signatures
  doc.text(`Fait le : ${interv.date || new Date().toISOString().split('T')[0]}`, 10, matY + 50);
  doc.text("Signature représentant : _____________________", 10, matY + 57);
  doc.text("Cachet de l'entreprise : _____________________", 10, matY + 64);

  // Footer
  doc.setFontSize(8);
  doc.text("Whatsapp: 77 846 16 55 / Bureau: 33 883 42 42 - 33 827 28 45", pageWidth / 2, 285, { align: "center" });
  doc.text("Ouest foire, route aéroport, immeuble Seigneurie", pageWidth / 2, 290, { align: "center" });
  doc.text("R.C.SN/DKR-2010.A.7987 // NINEA: 004225464 // www.netsys-info.com", pageWidth / 2, 295, { align: "center" });

  doc.save(`fiche_intervention_${interv.id}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-3">
        <Users className="h-6 w-6" /> Gestion des Interventions
      </h2>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Liste des Interventions ({interventions.length})</h3>
        <Button variant="default" className="bg-amber-500 hover:bg-amber-600" onClick={() => handleOpen()}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nouvelle Intervention
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interventions</CardTitle>
        </CardHeader>
        <CardContent>
          {interventions.length === 0 ? (
            <p className="text-gray-500">Aucune intervention enregistrée.</p>
          ) : (
            <ul className="space-y-2">
              {interventions.map((intv) => (
                <li key={intv.id} className="flex justify-between items-center border p-2 rounded">
                  <div>
                    <p className="font-semibold">{intv.titre}</p>
                    <p className="text-sm text-gray-500">
                      Client: {intv.clientType === "existant" ? intv.client : intv.nomClient || "Non renseigné"}
                    </p>
                    <p className="text-xs text-gray-400">Priorité: {intv.priorite}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleOpen(intv)} className="bg-blue-500 hover:bg-blue-600">
                      <Edit className="w-4 h-4 mr-1" /> Modifier
                    </Button>
                    <Button onClick={() => generatePDF(intv)} className="bg-green-500 hover:bg-green-600">
                      <FileText className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button onClick={() => handleDelete(intv.id)} className="bg-red-500 hover:bg-red-600">
                      <Trash className="w-4 h-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog Formulaire Intervention */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Intervention</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

            {/* Titre et Priorité */}
            <div className="space-y-1">
              <label className="font-medium text-sm">Titre de l'intervention *</label>
              <Input
                placeholder="Titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Priorité</label>
              <Select value={formData.priorite} onValueChange={(val) => setFormData({ ...formData, priorite: val })}>
                <SelectTrigger><SelectValue placeholder="Priorité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normale">Normale</SelectItem>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="font-medium text-sm">Description</label>
              <Textarea
                placeholder="Description de l'intervention"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-24"
              />
            </div>

            {/* Client */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="font-medium text-sm">Client</label>
              <Select value={formData.clientType} onValueChange={(val) => setFormData({ ...formData, clientType: val })}>
                <SelectTrigger><SelectValue placeholder="Type de client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-enregistre">Client non enregistré</SelectItem>
                  <SelectItem value="existant">Client existant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.clientType === "existant" && (
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="font-medium text-sm">Sélectionner un client</label>
                <Select value={formData.client} onValueChange={(val) => setFormData({ ...formData, client: val })}>
                  <SelectTrigger><SelectValue placeholder="Client existant" /></SelectTrigger>
                  <SelectContent>
                    {clientsExistants.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.clientType === "non-enregistre" && (
              <>
                <div className="space-y-1">
                  <label className="font-medium text-sm">Nom du client *</label>
                  <Input
                    placeholder="Nom"
                    value={formData.nomClient}
                    onChange={(e) => setFormData({ ...formData, nomClient: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-sm">Téléphone du client *</label>
                  <Input
                    placeholder="Téléphone"
                    value={formData.telClient}
                    onChange={(e) => setFormData({ ...formData, telClient: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Technicien et Date prévue */}
            <div className="space-y-1">
              <label className="font-medium text-sm">Technicien</label>
              <Select value={formData.technicien} onValueChange={(val) => setFormData({ ...formData, technicien: val })}>
                <SelectTrigger><SelectValue placeholder="Technicien" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigner-plus-tard">Assigner plus tard</SelectItem>
                  <SelectItem value="technicien1">Technicien 1</SelectItem>
                  <SelectItem value="technicien2">Technicien 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Date prévue *</label>
              <Input
                type="datetime-local"
                value={formData.datePrevue}
                onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
              />
            </div>

            {/* Durée et Type d'intervention */}
            <div className="space-y-1">
              <label className="font-medium text-sm">Durée estimée (minutes)</label>
              <Input
                type="number"
                value={formData.dureeEstimee}
                onChange={(e) => setFormData({ ...formData, dureeEstimee: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-sm">Type d'intervention *</label>
              <Select value={formData.typeIntervention} onValueChange={(val) => setFormData({ ...formData, typeIntervention: val })}>
                <SelectTrigger><SelectValue placeholder="Type d'intervention" /></SelectTrigger>
                <SelectContent>
                  {typeInterventions.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Adresse */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="font-medium text-sm">Adresse</label>
              <Input
                placeholder="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              />
            </div>

            {/* Matériels requis avec quantité */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="font-medium text-sm">Matériels requis</label>
              <div className="flex flex-wrap gap-4">
                {materielsDisponibles.map((mat) => (
                  <div key={mat} className="flex items-center space-x-2">
                    <Switch
                      checked={!!formData.materiels[mat]}
                      onCheckedChange={() => toggleMateriel(mat)}
                    />
                    <span>{mat}</span>
                    {formData.materiels[mat] && (
                      <Input
                        type="number"
                        className="w-16"
                        min={1}
                        value={formData.materiels[mat]}
                        onChange={(e) => setMaterielQuantity(mat, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterventionContent;
