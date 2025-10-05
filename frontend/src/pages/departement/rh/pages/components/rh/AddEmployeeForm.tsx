import React, { useState, useRef, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from './EmployeeFileContent';
import { getSkillColor } from '@/utils/skillColors';

interface DocumentFile {
  name: string;
  file: File;
  type: string;
  size: number;
  preview?: string;
}

interface AddEmployeeFormProps {
  onAddEmployee: (employee: Omit<Employee, 'id'>) => Promise<boolean>;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onAddEmployee }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
    job: '',
    department: '',
    manager: '',
    contractType: 'CDI',
    skills: [],
    documents: []
  });
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      const newDocuments = files.map(file => ({
        name: file.name,
        file,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));

      setDocumentFiles(prev => [...prev, ...newDocuments]);
      
      // Réinitialiser l'input pour permettre la sélection du même fichier à nouveau
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentFiles(prev => {
      const newFiles = [...prev];
      // Libérer l'URL de l'aperçu si elle existe
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (isSubmitting) return; // éviter les soumissions multiples
  
    setIsSubmitting(true);
  
    try {
      // Préparer les données à envoyer
      const employeeData = {
        ...formData,
        birthDate: formData.birthDate,
        skills: [...formData.skills],
        documents: documentFiles.map(doc => doc.name)
      };
  
      // Fermer le modal avant SweetAlert pour éviter le blocage
      setOpen(false);
  
      // Appeler la fonction parente avec les données du nouvel employé
      const success = await onAddEmployee(employeeData);
  
      if (!success) throw new Error("Erreur lors de l'ajout de l'employé");
  
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        job: '',
        department: '',
        manager: '',
        contractType: 'CDI',
        skills: [],
        documents: []
      });
      setDocumentFiles([]);
  
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
  
      // Afficher SweetAlert
      await Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajout de l\'employé',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: true,
        allowEscapeKey: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          Ajouter un employé
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job">Poste</Label>
              <Input
                id="job"
                name="job"
                value={formData.job}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractType">Type de contrat</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractType: value as 'CDI' | 'CDD' | 'Stage',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Compétences</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => {
                const colorClass = getSkillColor(index);
                
                return (
                  <div key={skill} className={`flex items-center ${colorClass} px-3 py-1 rounded-full text-sm font-medium`}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:opacity-75 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Documents</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  id="documents"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
              <p className="text-sm text-gray-500">
                Formats acceptés : PDF, Word, Excel, images (max 5Mo par fichier)
              </p>
            </div>
            
            <div className="mt-4 space-y-2">
              {documentFiles.map((doc, index) => (
                <div key={`${doc.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    {doc.preview ? (
                      <div className="w-10 h-10 flex-shrink-0">
                        <img 
                          src={doc.preview} 
                          alt={doc.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">{doc.name.split('.').pop()?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(doc.size / 1024)} KB • {doc.type}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Supprimer le document"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;
