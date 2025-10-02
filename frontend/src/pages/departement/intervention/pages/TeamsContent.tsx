import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Trash2, Edit, X, Check, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
type TeamMember = {
  id: string;
  name: string;
  role: 'Chef d\'équipe' | 'Technicien' | 'Apprenti';
  phone: string;
  email: string;
};

type Team = {
  id: string;
  name: string;
  members: TeamMember[];
  interventionsCount: number;
  createdAt: string;
};

const TeamsContent = () => {
  // États
  const [teams, setTeams] = useState<Team[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id'>>({ 
    name: '', 
    role: 'Technicien', 
    phone: '', 
    email: '' 
  });
  
  // Données de démonstration pour les techniciens disponibles
  const availableTechnicians: TeamMember[] = [
    { id: '1', name: 'Jean Dupont', role: 'Chef d\'équipe', phone: '771234567', email: 'jean@example.com' },
    { id: '2', name: 'Marie Martin', role: 'Technicien', phone: '772345678', email: 'marie@example.com' },
    { id: '3', name: 'Pierre Durand', role: 'Technicien', phone: '773456789', email: 'pierre@example.com' },
    { id: '4', name: 'Sophie Petit', role: 'Apprenti', phone: '774567890', email: 'sophie@example.com' },
  ];

  // Gestion des équipes
  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName,
      members: [...selectedMembers],
      interventionsCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setTeams([...teams, newTeam]);
    resetForm();
  };

  const handleUpdateTeam = () => {
    if (!editingTeam || !teamName.trim()) return;
    
    const updatedTeams = teams.map(team => 
      team.id === editingTeam.id 
        ? { ...team, name: teamName, members: selectedMembers } 
        : team
    );
    
    setTeams(updatedTeams);
    resetForm();
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
    setDeleteDialogOpen(false);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedMembers([...team.members]);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setTeamName('');
    setSelectedMembers([]);
    setNewMember({ name: '', role: 'Technicien', phone: '', email: '' });
    setDialogOpen(false);
    setEditingTeam(null);
  };

  // Gestion des membres
  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email) return;
    
    const member: TeamMember = {
      ...newMember,
      id: Date.now().toString(),
    };
    
    setSelectedMembers([...selectedMembers, member]);
    setNewMember({ name: '', role: 'Technicien', phone: '', email: '' });
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };

  const addExistingMember = (member: TeamMember) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, { ...member }]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des équipes d'intervention</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle équipe
        </Button>
      </div>

      {/* Liste des équipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team.members.length} membre{team.members.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Créée le {new Date(team.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map((member, index) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {team.members.length > 5 && (
                    <Avatar className="h-8 w-8 border-2 border-background bg-muted flex items-center justify-center text-xs">
                      +{team.members.length - 5}
                    </Avatar>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Badge variant="secondary" className="gap-1">
                      {team.interventionsCount} intervention{team.interventionsCount > 1 ? 's' : ''}
                    </Badge>
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTeam(team)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive border-destructive/50 hover:bg-destructive/10"
                      onClick={() => {
                        setCurrentTeam(team);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {teams.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Aucune équipe créée</h3>
            <p className="text-sm text-muted-foreground mb-4">Commencez par créer votre première équipe</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Créer une équipe
            </Button>
          </div>
        )}
      </div>

      {/* Boîte de dialogue pour créer/modifier une équipe */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'équipe *</label>
              <Input 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: Équipe Nord"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Membres de l'équipe</h4>
                <span className="text-sm text-muted-foreground">
                  {selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Liste des membres sélectionnés */}
              {selectedMembers.length > 0 ? (
                <div className="space-y-2">
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun membre ajouté</p>
                </div>
              )}
              
              {/* Formulaire d'ajout d'un nouveau membre */}
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium">Ajouter un nouveau membre</h5>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <Input 
                      placeholder="Nom complet"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Select 
                      value={newMember.role}
                      onValueChange={(value) => setNewMember({...newMember, role: value as TeamMember['role']})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                        <SelectItem value="Technicien">Technicien</SelectItem>
                        <SelectItem value="Apprenti">Apprenti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Input 
                      placeholder="Téléphone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button 
                      className="w-full"
                      onClick={addMember}
                      disabled={!newMember.name.trim()}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                </div>
                
                {/* Liste des techniciens disponibles */}
                {availableTechnicians.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-medium mb-2">Ou sélectionner parmi les techniciens disponibles</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableTechnicians
                        .filter(tech => !selectedMembers.some(m => m.id === tech.id))
                        .map(tech => (
                          <div key={tech.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{tech.name}</p>
                                <p className="text-xs text-muted-foreground">{tech.role}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addExistingMember(tech)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Ajouter
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button 
              onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}
              disabled={!teamName.trim() || selectedMembers.length === 0}
            >
              {editingTeam ? 'Mettre à jour' : 'Créer l\'équipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Supprimer l'équipe</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer l'équipe <strong>{currentTeam?.name}</strong> ?</p>
            {currentTeam?.interventionsCount > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Cette équipe a effectué {currentTeam.interventionsCount} intervention{currentTeam.interventionsCount > 1 ? 's' : ''}.
                  La suppression est irréversible.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={() => currentTeam && handleDeleteTeam(currentTeam.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsContent;