import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, X, UserX, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  email?: string;
  telephone?: string;
  dateBlacklist?: string;
  raison?: string;
}

const BlacklistContent = () => {
  // État pour la liste des clients blacklistés
  const [blacklistedClients, setBlacklistedClients] = useState<Client[]>([]);
  
  // État pour la liste complète des clients (pour la sélection)
  const [allClients, setAllClients] = useState<Client[]>([]);
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogSearchTerm, setDialogSearchTerm] = useState("");
  
  // État pour le dialogue d'ajout
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [raisonBlacklist, setRaisonBlacklist] = useState("");
  
  // Réinitialiser les champs lors de l'ouverture/fermeture de la modale
  useEffect(() => {
    if (isAddDialogOpen) {
      setSelectedClients([]);
      setRaisonBlacklist("");
      setDialogSearchTerm("");
    }
  }, [isAddDialogOpen]);

  // Charger les données (à remplacer par un appel API réel)
  useEffect(() => {
    // Simuler le chargement des données
    const loadData = async () => {
      // Simuler des clients blacklistés
      const blacklisted = [
        {
          id: "1",
          nom: "Dupont",
          prenom: "Jean",
          entreprise: "Entreprise A",
          email: "jean.dupont@example.com",
          telephone: "+225 01 23 45 67 89",
          dateBlacklist: "2023-10-01",
          raison: "Retard de paiement répété"
        },
        {
          id: "2",
          nom: "Martin",
          prenom: "Sophie",
          entreprise: "Entreprise B",
          email: "sophie.martin@example.com",
          telephone: "+225 07 65 43 21 09",
          dateBlacklist: "2023-09-15",
          raison: "Commande annulée sans préavis"
        }
      ];
      
      // Simuler la liste complète des clients
      const clients = [
        ...blacklisted,
        {
          id: "3",
          nom: "Dubois",
          prenom: "Pierre",
          entreprise: "Entreprise C",
          email: "pierre.dubois@example.com",
          telephone: "+225 05 55 44 33 22"
        },
        {
          id: "4",
          nom: "Bernard",
          prenom: "Marie",
          entreprise: "Entreprise D",
          email: "marie.bernard@example.com",
          telephone: "+225 01 11 22 33 44"
        }
      ];
      
      setBlacklistedClients(blacklisted);
      setAllClients(clients);
    };
    
    loadData();
  }, []);
  
  // Filtrer les clients blacklistés selon le terme de recherche
  const filteredBlacklistedClients = blacklistedClients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      client.prenom.toLowerCase().includes(searchLower) ||
      (client.entreprise?.toLowerCase().includes(searchLower) ?? false) ||
      (client.email?.toLowerCase().includes(searchLower) ?? false) ||
      (client.telephone?.includes(searchTerm) ?? false)
    );
  });
  
  // Filtrer les clients non blacklistés pour la sélection avec recherche
  const availableClients = allClients
    .filter(client => !blacklistedClients.some(bc => bc.id === client.id))
    .filter(client => {
      if (!dialogSearchTerm) return true;
      const searchLower = dialogSearchTerm.toLowerCase();
      return (
        client.nom.toLowerCase().includes(searchLower) ||
        client.prenom.toLowerCase().includes(searchLower) ||
        (client.entreprise?.toLowerCase().includes(searchLower) ?? false) ||
        (client.email?.toLowerCase().includes(searchLower) ?? false) ||
        (client.telephone?.includes(dialogSearchTerm) ?? false)
      );
    });
  
  // Gérer la sélection/désélection d'un client
  const handleClientSelect = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };
  
  // Ajouter des clients à la liste noire
  const handleAddToBlacklist = () => {
    if (selectedClients.length === 0 || !raisonBlacklist) return;
    
    const clientsToAdd = allClients
      .filter(client => selectedClients.includes(client.id))
      .map(client => ({
        ...client,
        dateBlacklist: new Date().toISOString().split('T')[0],
        raison: raisonBlacklist
      }));
    
    setBlacklistedClients(prev => [...prev, ...clientsToAdd]);
    setSelectedClients([]);
    setRaisonBlacklist("");
    setIsAddDialogOpen(false);
  };
  
  // Retirer un client de la liste noire
  const handleRemoveFromBlacklist = (clientId: string) => {
    setBlacklistedClients(prev => prev.filter(client => client.id !== clientId));
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Liste noire des clients</h1>
            <p className="text-muted-foreground">
              Gérer les clients blacklistés et leurs informations
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Blacklister un client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Ajouter un client à la liste noire</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sélectionner les clients</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un client..."
                      className="pl-9"
                      value={dialogSearchTerm}
                      onChange={(e) => setDialogSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <ScrollArea className="border rounded-md flex-1">
                  <div className="p-2 space-y-2">
                    {availableClients.length > 0 ? (
                      availableClients.map((client) => (
                        <div
                          key={client.id}
                          className={`flex items-center space-x-3 p-3 rounded-md hover:bg-accent cursor-pointer ${
                            selectedClients.includes(client.id) ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleClientSelect(client.id)}
                        >
                          <Checkbox
                            checked={selectedClients.includes(client.id)}
                            onCheckedChange={() => handleClientSelect(client.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <p className="font-medium">
                              {client.prenom} {client.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {client.entreprise} • {client.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        Aucun client disponible à blacklister
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="space-y-2">
                  <label htmlFor="raison" className="text-sm font-medium">
                    Raison de la mise en liste noire
                  </label>
                  <textarea
                    id="raison"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Saisissez la raison de la mise en liste noire..."
                    value={raisonBlacklist}
                    onChange={(e) => setRaisonBlacklist(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedClients([]);
                    setRaisonBlacklist("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddToBlacklist}
                  disabled={selectedClients.length === 0 || !raisonBlacklist}
                >
                  Confirmer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="rounded-md border">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredBlacklistedClients.length} client(s) blacklisté(s)
              </div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Coordonnées</TableHead>
                <TableHead>Date de blacklist</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlacklistedClients.length > 0 ? (
                filteredBlacklistedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {client.prenom} {client.nom}
                        </p>
                        {client.entreprise && (
                          <p className="text-sm text-muted-foreground">
                            {client.entreprise}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <p className="text-sm">{client.email}</p>
                        )}
                        {client.telephone && (
                          <p className="text-sm text-muted-foreground">
                            {client.telephone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.dateBlacklist ? (
                        <span className="text-sm">
                          {new Date(client.dateBlacklist).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non spécifiée</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="whitespace-normal text-left">
                        {client.raison || "Aucune raison spécifiée"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromBlacklist(client.id)}
                        title="Retirer de la liste noire"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span className="sr-only">Retirer de la liste noire</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? (
                      <p>Aucun client ne correspond à votre recherche.</p>
                    ) : (
                      <p>Aucun client n'est actuellement blacklisté.</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BlacklistContent;