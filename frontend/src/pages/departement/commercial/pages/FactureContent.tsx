import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Printer, FileText, X, PlusCircle, Search, Eye, Download, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Définition du type pour le statut de la facture
type StatutFacture = 'draft' | 'confirmed';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

interface Produit {
  id: string;
  designation: string;
  prixUnitaire: number;
  description: string;
  quantiteEnStock: number;
}

interface Article {
  id: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  remise?: number;
  total: number;
  produitId?: string;
}

interface Facture {
  id: string;
  numero: string;
  date: Date;
  echeance: Date;
  client: Client;
  statut: StatutFacture;
  total: number;
  articles: Article[];
  notes?: string;
  tva?: number;
  typeRemise?: string;
  domaine?: string;
}

const FactureContent = () => {
  // État pour gérer l'affichage du formulaire
  const [showFormulaire, setShowFormulaire] = useState<boolean>(false);
  
  // États pour les données du formulaire
  const [clientId, setClientId] = useState<string>("");
  const [numeroFacture, setNumeroFacture] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [echeance, setEcheance] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [tva, setTva] = useState<number>(18);
  const [typeRemise, setTypeRemise] = useState<string>("aucune");
  const [valeurRemise, setValeurRemise] = useState<number>(0);
  const [domaine, setDomaine] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // États pour la gestion des articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // État pour la liste des factures
  const [factures, setFactures] = useState<Facture[]>([]);
  
  // État pour le nouvel article
  const [nouvelArticle, setNouvelArticle] = useState<Omit<Article, 'id' | 'total'>>({
    produitId: "",
    description: "",
    quantite: 1,
    prixUnitaire: 0,
    remise: 0,
  });

  // Calculer les totaux
  const sousTotal = articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
  
  // Calculer la remise globale selon le type sélectionné
  let remiseTotale = 0;
  if (typeRemise === 'pourcentage' && valeurRemise > 0) {
    remiseTotale = (sousTotal * valeurRemise) / 100;
  } else if (typeRemise === 'montant' && valeurRemise > 0) {
    remiseTotale = Math.min(valeurRemise, sousTotal); // Ne pas dépasser le montant total
  }
  
  const montantTVA = (sousTotal - remiseTotale) * (tva / 100);
  const totalTTC = sousTotal - remiseTotale + montantTVA;

  // Fonction pour gérer le changement de produit sélectionné
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

    const total = nouvelArticle.prixUnitaire * nouvelArticle.quantite * (1 - (nouvelArticle.remise || 0) / 100);
    
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
            articleMisAJour.total = articleMisAJour.prixUnitaire * articleMisAJour.quantite * (1 - (articleMisAJour.remise || 0) / 100);
          }
          
          return articleMisAJour;
        }
        return article;
      })
    );
  };

  // Fonction pour confirmer une facture
  const confirmerFacture = async (factureId: string) => {
    const result = await Swal.fire({
      title: 'Confirmer la facture',
      text: 'Êtes-vous sûr de vouloir confirmer cette facture ? Cette action est irréversible.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      // Mettre à jour le statut de la facture
      setFactures(factures.map(facture => 
        facture.id === factureId 
          ? { ...facture, statut: 'confirmed' } 
          : facture
      ));
      
      // Afficher une notification de succès
      await Swal.fire(
        'Confirmée !',
        'La facture a été confirmée avec succès.',
        'success'
      );
    }
  };

  // Fonction pour supprimer une facture (fonctionne pour tous les statuts)
  const supprimerFacture = async (factureId: string) => {
    const facture = factures.find(f => f.id === factureId);
    const estConfirmee = facture?.statut === 'confirmed';
    
    const result = await Swal.fire({
      title: `Supprimer la facture ${facture?.numero || ''}`,
      text: `Êtes-vous sûr de vouloir supprimer cette facture ${estConfirmee ? 'confirmée' : 'en brouillon'} ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      try {
        // Supprimer la facture de la liste
        setFactures(factures.filter(facture => facture.id !== factureId));
        
        // Afficher une notification de succès
        await Swal.fire(
          'Supprimée !',
          `La facture a été supprimée avec succès.`,
          'success'
        );
      } catch (error) {
        console.error('Erreur lors de la suppression de la facture :', error);
        await Swal.fire(
          'Erreur',
          'Une erreur est survenue lors de la suppression de la facture.',
          'error'
        );
      }
    }
  };
  
  // Fonction pour éditer une facture
  const editerFacture = (facture: Facture) => {
    // Remplir le formulaire avec les données de la facture
    setClientId(facture.client.id);
    setNumeroFacture(facture.numero);
    setDate(new Date(facture.date));
    setEcheance(new Date(facture.echeance));
    
    // Charger les articles de la facture
    if (facture.articles) {
      setArticles(facture.articles);
    }
    
    // Afficher le formulaire
    setShowFormulaire(true);
  };
  
  // Fonction pour afficher les détails d'une facture
  const voirDetails = (facture: Facture) => {
    Swal.fire({
      title: '',
      html: `
        <div class="text-left w-full max-w-3xl">
          <!-- Boutons d'action -->
          <div class="flex justify-end gap-2 mb-4">
            <button id="imprimerBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
              </svg>
              Imprimer
            </button>
            ${facture.statut === 'draft' ? `
              <button id="confirmerBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Confirmer la facture
              </button>
            ` : ''}
          </div>
          
          <!-- En-tête -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">FACTURE</h2>
              <p class="text-gray-600">${facture.numero}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Date: ${format(facture.date, 'dd/MM/yyyy', { locale: fr })}</p>
              <p class="text-sm text-gray-500">Échéance: ${format(facture.echeance, 'dd/MM/yyyy', { locale: fr })}</p>
              <span class="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                facture.statut === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }">
                ${facture.statut === 'draft' ? 'Brouillon' : 'Confirmée'}
              </span>
            </div>
          </div>

          <!-- Informations client -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">Client</h3>
            <p class="text-gray-800">${facture.client.entreprise || `${facture.client.prenom} ${facture.client.nom}`}</p>
            ${facture.client.entreprise ? `<p class="text-gray-600 text-sm">${facture.client.prenom} ${facture.client.nom}</p>` : ''}
            ${facture.client.email ? `<p class="text-gray-600 text-sm">${facture.client.email}</p>` : ''}
            ${facture.client.telephone ? `<p class="text-gray-600 text-sm">${facture.client.telephone}</p>` : ''}
            ${facture.client.adresse ? `<p class="text-gray-600 text-sm">${facture.client.adresse}</p>` : ''}
          </div>

          <!-- Liste des articles -->
          <div class="border rounded-lg overflow-hidden mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix U.</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${facture.articles ? facture.articles.map(article => `
                  <tr>
                    <td class="px-4 py-2">
                      <p class="text-sm font-medium text-gray-900">${article.description || 'Article sans description'}</p>
                    </td>
                    <td class="px-4 py-2 text-right text-sm text-gray-500">${article.quantite}</td>
                    <td class="px-4 py-2 text-right text-sm text-gray-500">${article.prixUnitaire.toLocaleString()} FCFA</td>
                    <td class="px-4 py-2 text-right text-sm font-medium text-gray-900">${(article.quantite * article.prixUnitaire).toLocaleString()} FCFA</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" class="px-4 py-2 text-center text-sm text-gray-500">Aucun article</td></tr>'}
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="px-4 py-3 text-right text-sm font-medium text-gray-700">Total HT</td>
                  <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">${(facture.total * 0.82).toLocaleString(undefined, { maximumFractionDigits: 2 })} FCFA</td>
                </tr>
                <tr>
                  <td colspan="3" class="px-4 py-1 text-right text-sm font-medium text-gray-700">TVA (${facture.tva || 18}%)</td>
                  <td class="px-4 py-1 text-right text-sm font-medium text-gray-900">${(facture.total * 0.18).toLocaleString(undefined, { maximumFractionDigits: 2 })} FCFA</td>
                </tr>
                <tr class="border-t border-gray-200">
                  <td colspan="3" class="px-4 py-3 text-right text-base font-bold text-gray-900">Total TTC</td>
                  <td class="px-4 py-3 text-right text-base font-bold text-gray-900">${facture.total.toLocaleString()} FCFA</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Notes -->
          ${facture.notes ? `
            <div class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p class="text-sm text-yellow-700">${facture.notes}</p>
            </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '800px',
      padding: '0',
      customClass: {
        popup: 'p-0',
        closeButton: 'm-4 text-gray-400 hover:text-gray-600'
      },
      didOpen: () => {
        // Gestion du clic sur le bouton Imprimer
        const imprimerBtn = document.getElementById('imprimerBtn');
        if (imprimerBtn) {
          imprimerBtn.addEventListener('click', () => {
            window.print();
          });
        }
        
        // Gestion du clic sur le bouton Confirmer
        const confirmerBtn = document.getElementById('confirmerBtn');
        if (confirmerBtn) {
          confirmerBtn.addEventListener('click', () => {
            Swal.close();
            confirmerFacture(facture.id);
          });
        }
      }
    });
  };

  // Charger les données initiales
  useEffect(() => {
    // Simuler le chargement des données
    const loadData = async () => {
      // Simuler des clients
      const clientsData: Client[] = [
        {
          id: "1",
          nom: "Dupont",
          prenom: "Jean",
          entreprise: "Entreprise A",
          email: "jean.dupont@example.com",
          telephone: "+225 01 23 45 67 89",
          adresse: "123 Rue de la Paix, Abidjan"
        },
        {
          id: "2",
          nom: "Martin",
          prenom: "Sophie",
          entreprise: "Entreprise B",
          email: "sophie.martin@example.com",
          telephone: "+225 07 65 43 21 09",
          adresse: "456 Avenue des Cocotiers, Yopougon"
        }
      ];

      // Simuler des produits
      const produitsData: Produit[] = [
        {
          id: "1",
          designation: "Ordinateur portable",
          description: "PC portable haute performance",
          prixUnitaire: 800000,
          quantiteEnStock: 15
        },
        {
          id: "2",
          designation: "Smartphone",
          description: "Smartphone haut de gamme",
          prixUnitaire: 500000,
          quantiteEnStock: 30
        },
        {
          id: "3",
          designation: "Souris sans fil",
          description: "Souris ergonomique sans fil",
          prixUnitaire: 25000,
          quantiteEnStock: 50
        }
      ];

      // Simuler des factures existantes
      const facturesData: Facture[] = [
        {
          id: "1",
          numero: "FAC-2023-001",
          date: new Date(2023, 9, 1),
          echeance: new Date(2023, 10, 1),
          client: clientsData[0],
          statut: 'draft',
          total: 1650000,
          tva: 18,
          articles: [
            {
              id: "1",
              produitId: "1",
              description: "Ordinateur portable",
              quantite: 2,
              prixUnitaire: 800000,
              total: 1600000
            },
            {
              id: "2",
              produitId: "3",
              description: "Souris sans fil",
              quantite: 4,
              prixUnitaire: 25000,
              total: 100000
            }
          ],
          notes: "Paiement à réception de la facture"
        },
        {
          id: "2",
          numero: "FAC-2023-002",
          date: new Date(2023, 9, 5),
          echeance: new Date(2023, 10, 5),
          client: clientsData[1],
          statut: 'confirmed',
          total: 1500000,
          tva: 18,
          articles: [
            {
              id: "3",
              produitId: "2",
              description: "Smartphone",
              quantite: 3,
              prixUnitaire: 500000,
              total: 1500000
            }
          ]
        }
      ];

      setClients(clientsData);
      setProduits(produitsData);
      setFactures(facturesData);
      
      // Générer un numéro de facture par défaut
      if (facturesData.length > 0) {
        const lastNum = parseInt(facturesData[facturesData.length - 1].numero.split('-')[2]);
        setNumeroFacture(`FAC-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(3, '0')}`);
      } else {
        setNumeroFacture(`FAC-${new Date().getFullYear()}-001`);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Gestion des factures</h1>
            <p className="text-muted-foreground">
              Créez et gérez les factures de vos clients
            </p>
          </div>
          
          <Button onClick={() => setShowFormulaire(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>

        {/* Liste des factures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factures.length > 0 ? (
                  factures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="font-medium">{facture.numero}</TableCell>
                      <TableCell>
                        {facture.client.entreprise || `${facture.client.prenom} ${facture.client.nom}`}
                      </TableCell>
                      <TableCell>{format(facture.date, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell>{format(facture.echeance, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right">{facture.total.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge variant={facture.statut === 'draft' ? 'secondary' : 'default'}>
                          {facture.statut === 'draft' ? 'Brouillon' : 'Confirmée'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {/* Bouton Voir les détails */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            title="Voir les détails"
                            onClick={() => voirDetails(facture)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Bouton Confirmer la facture (uniquement pour brouillon) */}
                          {facture.statut === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              title="Confirmer la facture"
                              onClick={() => confirmerFacture(facture.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Bouton Modifier (uniquement pour brouillon) */}
                          {facture.statut === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                              title="Modifier"
                              onClick={() => editerFacture(facture)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                              </svg>
                            </Button>
                          )}
                          
                          {/* Bouton Supprimer (visible pour toutes les factures) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            title="Supprimer"
                            onClick={() => supprimerFacture(facture.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucune facture pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Formulaire de création/édition de facture */}
        <Dialog open={showFormulaire} onOpenChange={setShowFormulaire}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{numeroFacture ? `Facture ${numeroFacture}` : 'Nouvelle facture'}</DialogTitle>
              <DialogDescription>
                Remplissez les détails de la facture
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Informations générales */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.entreprise || `${client.prenom} ${client.nom}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
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
                  
                  <div>
                    <Label htmlFor="echeance">Échéance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !echeance && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {echeance ? format(echeance, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={echeance}
                          onSelect={(newDate) => newDate && setEcheance(newDate)}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="domaine">Domaine</Label>
                  <Select value={domaine} onValueChange={setDomaine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatique">Informatique</SelectItem>
                      <SelectItem value="bureautique">Bureautique</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes ou conditions de paiement..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              {/* Articles */}
              <div className="space-y-4">
                <div>
                  <Label>Articles</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Select
                          value={nouvelArticle.produitId}
                          onValueChange={handleProduitChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                          <SelectContent>
                            {produits.map((produit) => (
                              <SelectItem key={produit.id} value={produit.id}>
                                {produit.designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qté"
                          value={nouvelArticle.quantite}
                          onChange={(e) =>
                            setNouvelArticle({
                              ...nouvelArticle,
                              quantite: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="Prix unitaire"
                          value={nouvelArticle.prixUnitaire || ""}
                          onChange={(e) =>
                            setNouvelArticle({
                              ...nouvelArticle,
                              prixUnitaire: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Button
                          type="button"
                          onClick={ajouterArticle}
                          disabled={!nouvelArticle.produitId || !nouvelArticle.quantite}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {articles.length > 0 && (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Désignation</TableHead>
                              <TableHead className="text-right">Qté</TableHead>
                              <TableHead className="text-right">Prix U.</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {articles.map((article) => (
                              <TableRow key={article.id}>
                                <TableCell className="py-1">
                                  <Input
                                    value={article.description}
                                    onChange={(e) =>
                                      mettreAJourArticle(
                                        article.id,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="border-0 p-0 h-auto"
                                  />
                                </TableCell>
                                <TableCell className="py-1">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={article.quantite}
                                    onChange={(e) =>
                                      mettreAJourArticle(
                                        article.id,
                                        "quantite",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="border-0 p-0 h-auto text-right"
                                  />
                                </TableCell>
                                <TableCell className="py-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={article.prixUnitaire}
                                    onChange={(e) =>
                                      mettreAJourArticle(
                                        article.id,
                                        "prixUnitaire",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="border-0 p-0 h-auto text-right"
                                  />
                                </TableCell>
                                <TableCell className="py-1 text-right">
                                  {(article.quantite * article.prixUnitaire).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="py-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => supprimerArticle(article.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}\n                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Récapitulatif */}
                <div className="ml-auto w-full max-w-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Remise</Label>
                    <div className="flex space-x-2">
                      <Select value={typeRemise} onValueChange={setTypeRemise}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aucune">Aucune</SelectItem>
                          <SelectItem value="pourcentage">%</SelectItem>
                          <SelectItem value="montant">Montant fixe</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {typeRemise !== 'aucune' && (
                        <Input
                          type="number"
                          min="0"
                          step={typeRemise === 'pourcentage' ? '0.1' : '100'}
                          value={valeurRemise}
                          onChange={(e) => setValeurRemise(parseFloat(e.target.value) || 0)}
                          placeholder={typeRemise === 'pourcentage' ? '0.0' : '0'}
                          className="text-right"
                        />
                      )}
                    </div>
                    
                    {typeRemise !== 'aucune' && (
                      <div className="text-right text-sm text-muted-foreground">
                        -{remiseTotale.toLocaleString()} FCFA
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVA ({tva}%)</span>
                    <span className="font-medium">{montantTVA.toLocaleString(undefined, { maximumFractionDigits: 2 })} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total TTC</span>
                    <span className="font-bold text-lg">{totalTTC.toLocaleString(undefined, { maximumFractionDigits: 2 })} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFormulaire(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer le brouillon</Button>
              <Button type="submit" variant="default">
                Confirmer la facture
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FactureContent;