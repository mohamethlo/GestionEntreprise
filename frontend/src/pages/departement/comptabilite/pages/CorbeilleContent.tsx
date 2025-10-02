import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RotateCcw, Trash2, FileText, Eye, X } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import Swal from 'sweetalert2';

// Types
type Category = 'Transport' | 'Carburant' | 'Repas' | 'Hébergement' | 'Matériel' | 'Formation' | 'Salaire' | 'Loyer' | 'Facture eau' | 'Facture sonatel' | "Main d'oeuvre mécanicien" | 'Autre';

interface DeletedExpense {
  id: string;
  titre: string;
  montant: number;
  categorie: Category;
  statut: 'en_attente' | 'approuve' | 'rejete';
  date: Date;
  deletedAt: Date;
  facture: string | null;
  description: string;
}

const CorbeilleContent = () => {
  // État pour stocker les dépenses supprimées
  const [deletedExpenses, setDeletedExpenses] = useState<DeletedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingExpense, setViewingExpense] = useState<DeletedExpense | null>(null);

  // Charger les dépenses supprimées (à remplacer par un appel API réel)
  useEffect(() => {
    // Simuler un chargement de données
    const fetchDeletedExpenses = () => {
      // Exemple de données statiques pour la démonstration
      const mockData: DeletedExpense[] = [
        {
          id: '1',
          titre: 'Achat de fournitures',
          montant: 125000,
          categorie: 'Matériel',
          statut: 'approuve',
          date: subDays(new Date(), 1),
          deletedAt: new Date(),
          facture: null,
          description: 'Achat de fournitures de bureau pour le service administratif'
        },
        {
            id: '2',
            titre: 'Deploiement',
            montant: 225000,
            categorie: 'Matériel',
            statut: 'en_attente',
            date: subDays(new Date(), 1),
            deletedAt: new Date(),
            facture: null,
            description: 'Deploiement du logiciel louer les serveurs'
          },
      ];
      
      setDeletedExpenses(mockData);
      setLoading(false);
    };

    fetchDeletedExpenses();
  }, []);

  // Restaurer une dépense
  const handleRestore = (id: string) => {
    // Ici, vous devrez implémenter la logique de restauration
    // Par exemple, un appel API pour restaurer la dépense
    setDeletedExpenses(deletedExpenses.filter(expense => expense.id !== id));
    
    toast({
      title: "Dépense restaurée",
      description: "La dépense a été restaurée avec succès.",
    });
  };

  // Supprimer définitivement une dépense
  const handlePermanentDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer définitivement cette dépense ? Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      // Ici, vous devrez implémenter la logique de suppression définitive
      // Par exemple, un appel API pour supprimer définitivement la dépense
      setDeletedExpenses(deletedExpenses.filter(expense => expense.id !== id));
      
      Swal.fire({
        title: 'Supprimé !',
        text: 'La dépense a été supprimée définitivement du système.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Vider la corbeille
  const handleEmptyTrash = async () => {
    if (deletedExpenses.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: 'Vider la corbeille',
      text: `Êtes-vous sûr de vouloir vider la corbeille ? Les ${deletedExpenses.length} dépenses seront supprimées définitivement.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, vider la corbeille',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      // Ici, vous devrez implémenter la logique pour vider la corbeille
      setDeletedExpenses([]);
      
      await Swal.fire({
        title: 'Corbeille vidée',
        text: 'Toutes les dépenses ont été supprimées définitivement.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Calculer si une dépense sera bientôt supprimée automatiquement (moins de 24h restantes)
  const isExpiringSoon = (deletedAt: Date) => {
    const hoursDiff = (new Date().getTime() - new Date(deletedAt).getTime()) / (1000 * 60 * 60);
    return hoursDiff > 23; // Moins de 24h restantes
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Corbeille des Dépenses</h2>
          <p className="text-sm text-muted-foreground">
            Dépenses supprimées (stockées max. 24h)
          </p>
        </div>
        {deletedExpenses.length > 0 && (
          <Button 
            variant="destructive"
            onClick={handleEmptyTrash}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Vider la corbeille
          </Button>
        )}
      </div>

      {/* Tableau des dépenses supprimées */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Supprimée le</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : deletedExpenses.length > 0 ? (
                deletedExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    className={isExpiringSoon(expense.deletedAt) ? 'bg-yellow-50' : ''}
                  >
                    <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-medium">{expense.titre}</TableCell>
                    <TableCell>{expense.montant.toLocaleString()} FCFA</TableCell>
                    <TableCell>{expense.categorie}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        expense.statut === 'approuve' 
                          ? 'bg-green-100 text-green-800' 
                          : expense.statut === 'rejete'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.statut === 'approuve' ? 'Approuvé' : expense.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(expense.deletedAt), 'dd/MM/yyyy', { locale: fr })}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(expense.deletedAt), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setViewingExpense(expense)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-700"
                          onClick={() => handleRestore(expense.id)}
                          title="Restaurer"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handlePermanentDelete(expense.id)}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune dépense supprimée pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de détails de la dépense */}
      {viewingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-black">Détails de la dépense</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewingExpense(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Titre</p>
                <p className="font-medium text-black">{viewingExpense.titre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant</p>
                <p className="font-medium text-black">{viewingExpense.montant.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catégorie</p>
                <p className="font-medium text-black">{viewingExpense.categorie}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-black">{format(new Date(viewingExpense.date), 'dd MMMM yyyy', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-medium">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingExpense.statut === 'approuve' 
                      ? 'bg-green-100 text-green-800' 
                      : viewingExpense.statut === 'rejete'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingExpense.statut === 'approuve' ? 'Approuvé' : viewingExpense.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supprimée le</p>
                <p className="font-medium text-black">
                  {format(new Date(viewingExpense.deletedAt), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="whitespace-pre-line bg-gray-50 p-3 rounded-md text-black">
                {viewingExpense.description || 'Aucune description fournie.'}
              </p>
            </div>
            
            {viewingExpense.facture && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Facture</p>
                <a 
                  href={viewingExpense.facture} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Voir la facture
                </a>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setViewingExpense(null)}
              >
                Fermer
              </Button>
              <Button 
                variant="default" 
                onClick={() => {
                  handleRestore(viewingExpense.id);
                  setViewingExpense(null);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorbeilleContent;