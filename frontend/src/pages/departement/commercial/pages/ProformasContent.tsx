import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Printer, FileText, X, PlusCircle, Search, Eye, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Article {
  id: string;
  produitId: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  remise: number;
  total: number;
}

interface Produit {
  id: string;
  designation: string;
  prixUnitaire: number;
  description: string;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
}

import Swal from 'sweetalert2';

type StatutProforma = 'draft' | 'converted';

interface Proforma {
  id: string;
  numero: string;
  date: Date;
  validite: Date;
  client: Client;
  statut: StatutProforma;
  total: number;
}

const ProformasContent = () => {
  // État pour gérer l'affichage du formulaire
  const [showFormulaire, setShowFormulaire] = useState<boolean>(false);
  
  // États pour les données du formulaire
  const [clientId, setClientId] = useState<string>("");
  const [numeroProforma, setNumeroProforma] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [validite, setValidite] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [tva, setTva] = useState<number>(18);
  const [typeRemise, setTypeRemise] = useState<string>("aucune");
  const [domaine, setDomaine] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // États pour la gestion des articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // État pour la liste des proformas
  const [proformas, setProformas] = useState<Proforma[]>([]);
  
  // Fonction pour convertir un proforma en facture
  const convertirEnFacture = async (proformaId: string) => {
    const result = await Swal.fire({
      title: 'Confirmer la conversion',
      text: 'Êtes-vous sûr de vouloir convertir ce proforma en facture ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, convertir',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      // Mettre à jour le statut du proforma
      setProformas(proformas.map(proforma => 
        proforma.id === proformaId 
          ? { ...proforma, statut: 'converted' } 
          : proforma
      ));
      
      // Afficher une notification de succès
      await Swal.fire(
        'Converti !',
        'Le proforma a été converti en facture avec succès.',
        'success'
      );
    }
  };
  
  // Fonction pour éditer un proforma
  const editerProforma = (proforma: Proforma) => {
    // Remplir le formulaire avec les données du proforma
    setClientId(proforma.client.id);
    setNumeroProforma(proforma.numero);
    setDate(new Date(proforma.date));
    setValidite(new Date(proforma.validite));
    
    // TODO: Implémenter la logique de chargement des articles du proforma
    // setArticles(proforma.articles);
    
    // Afficher le formulaire
    setShowFormulaire(true);
  };
  
  // Fonction pour afficher les détails d'un proforma
  const voirDetails = (proforma: Proforma) => {
    Swal.fire({
      title: `Détails du proforma ${proforma.numero}`,
      html: `
        <div class="text-left">
          <p><strong>Client:</strong> ${proforma.client.entreprise || `${proforma.client.prenom} ${proforma.client.nom}`}</p>
          <p><strong>Date:</strong> ${format(proforma.date, 'dd/MM/yyyy', { locale: fr })}</p>
          <p><strong>Validité jusqu'au:</strong> ${format(proforma.validite, 'dd/MM/yyyy', { locale: fr })}</p>
          <p><strong>Statut:</strong> ${proforma.statut}</p>
          <p><strong>Total:</strong> ${proforma.total.toLocaleString()} FCFA</p>
        </div>
      `,
      confirmButtonText: 'Fermer'
    });
  };

  // Fonction pour supprimer un proforma
  const supprimerProforma = async (proformaId: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ce proforma ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      // Mettre à jour la liste des proformas
      setProformas(proformas.filter(proforma => proforma.id !== proformaId));
      
      // Afficher une notification de succès
      await Swal.fire(
        'Supprimé !',
        'Le proforma a été supprimé avec succès.',
        'success'
      );
    }
  };
  
  // États pour le nouvel article
  const [nouvelArticle, setNouvelArticle] = useState<Omit<Article, 'id' | 'total'>>({
    produitId: "",
    description: "",
    quantite: 1,
    prixUnitaire: 0,
    remise: 0,
  });

  // Simuler le chargement des données
  useEffect(() => {
    // Simuler des produits
    setProduits([
      { id: "1", designation: "Ordinateur portable", prixUnitaire: 800000, description: "PC portable 15\" 16Go RAM" },
      { id: "2", designation: "Souris sans fil", prixUnitaire: 25000, description: "Souris optique sans fil" },
      { id: "3", designation: "Clavier mécanique", prixUnitaire: 50000, description: "Clavier mécanique RGB" },
    ]);

    // Simuler des clients
    const clientsSimules = [
      { id: "1", nom: "Dupont", prenom: "Jean", entreprise: "Entreprise A" },
      { id: "2", nom: "Martin", prenom: "Sophie", entreprise: "Entreprise B" },
      { id: "3", nom: "Dubois", prenom: "Pierre", entreprise: "Entreprise C" },
    ];
    setClients(clientsSimules);

    // Simuler des proformas existants
    const aujourdHui = new Date();
    const proformasSimules: Proforma[] = [
      {
        id: "1",
        numero: `PROF-${aujourdHui.getFullYear()}-1001`,
        date: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1),
        validite: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 1),
        client: clientsSimules[0],
        statut: 'converted',
        total: 1250000
      },
      {
        id: "2",
        numero: `PROF-${aujourdHui.getFullYear()}-1002`,
        date: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 5),
        validite: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 5),
        client: clientsSimules[1],
        statut: 'converted',
        total: 850000
      },
      {
        id: "3",
        numero: `PROF-${aujourdHui.getFullYear()}-1003`,
        date: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 10),
        validite: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 10),
        client: clientsSimules[2],
        statut: 'draft',
        total: 420000
      },
      {
        id: "4",
        numero: `PROF-${aujourdHui.getFullYear()}-1004`,
        date: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 15),
        validite: new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 15),
        client: clientsSimules[0],
        statut: 'draft',
        total: 325000
      }
    ];
    setProformas(proformasSimules);

    // Générer un numéro de proforma pour un nouveau
    setNumeroProforma(`PROF-${aujourdHui.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  // Calculer les totaux
  const sousTotal = articles.reduce((sum, article) => sum + article.total, 0);
  const remiseTotale = articles.reduce((sum, article) => {
    return sum + (article.prixUnitaire * article.quantite * article.remise) / 100;
  }, 0);
  const montantTVA = (sousTotal - remiseTotale) * (tva / 100);
  const totalTTC = sousTotal - remiseTotale + montantTVA;

  // Gérer le changement de produit sélectionné
  const handleProduitChange = (produitId: string) => {
    const produit = produits.find(p => p.id === produitId);
    if (produit) {
      setNouvelArticle({
        ...nouvelArticle,
        produitId,
        description: produit.description,
        prixUnitaire: produit.prixUnitaire,
      });
    }
  };

  // Ajouter un nouvel article
  const ajouterArticle = () => {
    if (!nouvelArticle.produitId || nouvelArticle.quantite <= 0) return;

    const total = nouvelArticle.prixUnitaire * nouvelArticle.quantite * (1 - nouvelArticle.remise / 100);
    
    setArticles([
      ...articles,
      {
        ...nouvelArticle,
        id: Date.now().toString(),
        total,
      },
    ]);

    // Réinitialiser le formulaire d'ajout d'article
    setNouvelArticle({
      produitId: "",
      description: "",
      quantite: 1,
      prixUnitaire: 0,
      remise: 0,
    });
  };

  // Supprimer un article
  const supprimerArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  // Mettre à jour un article
  const mettreAJourArticle = (id: string, champ: keyof Article, valeur: any) => {
    setArticles(
      articles.map(article => {
        if (article.id === id) {
          const articleMisAJour = { ...article, [champ]: valeur };
          
          // Recalculer le total si nécessaire
          if (champ === 'quantite' || champ === 'prixUnitaire' || champ === 'remise') {
            articleMisAJour.total = articleMisAJour.prixUnitaire * articleMisAJour.quantite * (1 - articleMisAJour.remise / 100);
          }
          
          return articleMisAJour;
        }
        return article;
      })
    );
  };

  // Soumettre le proforma
  const soumettreProforma = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous pourriez envoyer les données à votre API
    console.log({
      clientId,
      numeroProforma,
      date,
      validite,
      tva,
      typeRemise,
      domaine,
      notes,
      articles,
      sousTotal,
      remiseTotale,
      montantTVA,
      totalTTC,
    });
    
    // Afficher une notification de succès
    alert("Proforma enregistré avec succès !");
  };

  // Fonction pour ouvrir le formulaire de création
  const ouvrirFormulaire = () => {
    // Réinitialiser le formulaire
    setClientId("");
    setArticles([]);
    setNotes("");
    setDomaine("");
    setTva(18);
    setTypeRemise("aucune");
    
    // Générer un nouveau numéro de proforma
    const aujourdHui = new Date();
    setNumeroProforma(`PROF-${aujourdHui.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    
    // Définir les dates
    setDate(new Date());
    const dateValidite = new Date();
    dateValidite.setDate(dateValidite.getDate() + 30);
    setValidite(dateValidite);
    
    // Afficher le formulaire
    setShowFormulaire(true);
  };

  // Fonction pour obtenir la classe de couleur du statut
  const getStatutCouleur = (statut: string) => {
    switch (statut) {
      case 'envoyé':
        return 'bg-blue-100 text-blue-800';
      case 'accepté':
        return 'bg-green-100 text-green-800';
      case 'refusé':
        return 'bg-red-100 text-red-800';
      case 'brouillon':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Proformas</h2>
        <Button onClick={ouvrirFormulaire} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau proforma
        </Button>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un proforma..."
            className="w-full pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="brouillon">Brouillons</SelectItem>
              <SelectItem value="envoyé">Envoyés</SelectItem>
              <SelectItem value="accepté">Acceptés</SelectItem>
              <SelectItem value="refusé">Refusés</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tous les mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              <SelectItem value="1">Janvier</SelectItem>
              <SelectItem value="2">Février</SelectItem>
              {/* ... autres mois ... */}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Liste des proformas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proformas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun proforma trouvé
                  </TableCell>
                </TableRow>
              ) : (
                proformas.map((proforma) => (
                  <TableRow key={proforma.id}>
                    <TableCell className="font-medium">{proforma.numero}</TableCell>
                    <TableCell>
                      {proforma.client.entreprise || `${proforma.client.prenom} ${proforma.client.nom}`}
                    </TableCell>
                    <TableCell>{format(proforma.date, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell>{format(proforma.validite, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell className="text-right">{proforma.total.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getStatutCouleur(proforma.statut))}>
                        {proforma.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* Bouton Dupliquer */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Dupliquer"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        
                        {/* Bouton Voir les détails */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Voir les détails"
                          onClick={() => voirDetails(proforma)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Bouton Convertir en facture (uniquement pour draft) */}
                        {proforma.statut === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            title="Convertir en facture"
                            onClick={() => convertirEnFacture(proforma.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Bouton Modifier (uniquement pour brouillon) */}
                        {proforma.statut === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            title="Modifier"
                            onClick={() => editerProforma(proforma)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </Button>
                        )}
                        
                        {/* Bouton Supprimer */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          title="Supprimer"
                          onClick={() => supprimerProforma(proforma.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Formulaire de création/édition dans une boîte de dialogue */}
      <Dialog open={showFormulaire} onOpenChange={setShowFormulaire}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Proforma</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau proforma
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Informations du proforma</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Aperçu
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>

      <form onSubmit={soumettreProforma} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.entreprise ? `${client.entreprise} (${client.prenom} ${client.nom})` : `${client.prenom} ${client.nom}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro de proforma</Label>
                <Input
                  id="numero"
                  value={numeroProforma}
                  onChange={(e) => setNumeroProforma(e.target.value)}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Validité jusqu'au</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !validite && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validite ? format(validite, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={validite}
                      onSelect={(newDate) => newDate && setValidite(newDate)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tva">Taux de TVA (%)</Label>
                <Input
                  id="tva"
                  type="number"
                  min="0"
                  max="100"
                  value={tva}
                  onChange={(e) => setTva(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type de remise</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={typeRemise === "aucune" ? "default" : "outline"}
                    onClick={() => setTypeRemise("aucune")}
                    className="flex-1"
                  >
                    Aucune remise
                  </Button>
                  <Button
                    type="button"
                    variant={typeRemise === "pourcentage" ? "default" : "outline"}
                    onClick={() => setTypeRemise("pourcentage")}
                    className="flex-1"
                  >
                    Pourcentage
                  </Button>
                  <Button
                    type="button"
                    variant={typeRemise === "montant" ? "default" : "outline"}
                    onClick={() => setTypeRemise("montant")}
                    className="flex-1"
                  >
                    Montant fixe
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domaine">Domaine</Label>
                <Select value={domaine} onValueChange={setDomaine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NETSYSTEME">NETSYSTEME</SelectItem>
                    <SelectItem value="SSE">SSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des notes ou des instructions spéciales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Produit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Qté</TableHead>
                      <TableHead className="w-[150px] text-right">Prix Unitaire</TableHead>
                      <TableHead className="w-[100px] text-right">Remise %</TableHead>
                      <TableHead className="w-[150px] text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun article ajouté
                        </TableCell>
                      </TableRow>
                    ) : (
                      articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <Select
                              value={article.produitId}
                              onValueChange={(value) => {
                                const produit = produits.find(p => p.id === value);
                                if (produit) {
                                  mettreAJourArticle(article.id, 'produitId', value);
                                  mettreAJourArticle(article.id, 'description', produit.description);
                                  mettreAJourArticle(article.id, 'prixUnitaire', produit.prixUnitaire);
                                }
                              }}
                            >
                              <SelectTrigger className="border-0 p-0 h-auto">
                                <SelectValue placeholder="Sélectionner un produit" />
                              </SelectTrigger>
                              <SelectContent>
                                {produits.map(produit => (
                                  <SelectItem key={produit.id} value={produit.id}>
                                    {produit.designation}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              className="border-0 p-0 h-auto"
                              value={article.description}
                              onChange={(e) => mettreAJourArticle(article.id, 'description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              className="border-0 p-0 h-auto text-right"
                              value={article.quantite}
                              onChange={(e) => mettreAJourArticle(article.id, 'quantite', parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="border-0 p-0 h-auto text-right"
                                value={article.prixUnitaire}
                                onChange={(e) => mettreAJourArticle(article.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                              />
                              <span className="ml-1 text-sm text-muted-foreground">FCFA</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              className="border-0 p-0 h-auto text-right"
                              value={article.remise}
                              onChange={(e) => mettreAJourArticle(article.id, 'remise', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {article.total.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => supprimerArticle(article.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Select
                      value={nouvelArticle.produitId}
                      onValueChange={handleProduitChange}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {produits.map(produit => (
                          <SelectItem key={produit.id} value={produit.id}>
                            {produit.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Description"
                      className="flex-1"
                      value={nouvelArticle.description}
                      onChange={(e) => setNouvelArticle({...nouvelArticle, description: e.target.value})}
                    />
                    
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qté"
                      className="w-24"
                      value={nouvelArticle.quantite}
                      onChange={(e) => setNouvelArticle({...nouvelArticle, quantite: parseInt(e.target.value) || 1})}
                    />
                    
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Prix unitaire"
                        className="pl-2 pr-8"
                        value={nouvelArticle.prixUnitaire}
                        onChange={(e) => setNouvelArticle({...nouvelArticle, prixUnitaire: parseFloat(e.target.value) || 0})}
                      />
                      <span className="absolute right-2 top-2.5 text-sm text-muted-foreground">FCFA</span>
                    </div>
                    
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Remise %"
                      className="w-24"
                      value={nouvelArticle.remise}
                      onChange={(e) => setNouvelArticle({...nouvelArticle, remise: parseFloat(e.target.value) || 0})}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={ajouterArticle}
                      disabled={!nouvelArticle.produitId || nouvelArticle.quantite <= 0}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="w-1/3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sous-total:</span>
                    <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
                  </div>
                  
                  {typeRemise !== "aucune" && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remise:</span>
                      <span className="font-medium text-red-500">-{remiseTotale.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVA ({tva}%):</span>
                    <span className="font-medium">{montantTVA.toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total TTC:</span>
                    <span className="font-bold text-lg">{totalTTC.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormulaire(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={soumettreProforma}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer le proforma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProformasContent;