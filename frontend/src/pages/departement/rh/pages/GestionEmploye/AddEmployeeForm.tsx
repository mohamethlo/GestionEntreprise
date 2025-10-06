import React, { useState, useRef, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from './DetailsEmployee';
import { getSkillColor } from '@/utils/SkillColors';

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
    firstName: '', lastName: '', birthDate: '', email: '', phone: '',
    job: '', department: '', manager: '', contractType: 'CDI', skills: [], documents: []
  });
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newDocs = files.map(file => ({
        name: file.name, file, type: file.type, size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setDocumentFiles(prev => [...prev, ...newDocs]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index]?.preview) URL.revokeObjectURL(newFiles[index].preview!);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const employeeData = { ...formData, documents: documentFiles.map(d => d.name) };
      setOpen(false);
      const success = await onAddEmployee(employeeData);
      if (!success) throw new Error("Erreur lors de l'ajout");

      setFormData({
        firstName: '', lastName: '', birthDate: '', email: '', phone: '',
        job: '', department: '', manager: '', contractType: 'CDI', skills: [], documents: []
      });
      setDocumentFiles([]);
    } catch (error) {
      console.error(error);
      Swal.fire("Erreur", "Une erreur est survenue lors de l'ajout de l'employé", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">Ajouter un employé</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Ajouter un nouvel employé</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inputs de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2"><Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="birthDate">Date de naissance</Label>
              <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2"><Label htmlFor="job">Poste</Label>
              <Input id="job" name="job" value={formData.job} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="space-y-2"><Label htmlFor="department">Département</Label>
            <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
          </div>

          <div className="space-y-2"><Label htmlFor="manager">Manager</Label>
            <Input id="manager" name="manager" value={formData.manager} onChange={handleInputChange} />
          </div>

          <div className="space-y-2"><Label>Type de contrat</Label>
            <Select value={formData.contractType} onValueChange={value => setFormData(prev => ({ ...prev, contractType: value as 'CDI' | 'CDD' | 'Stage' }))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compétences */}
          <div className="space-y-2">
            <Label>Compétences</Label>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} />
              <Button type="button" onClick={handleAddSkill} variant="outline">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, i) => (
                <div key={skill} className={`${getSkillColor(i)} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                  {skill} <button type="button" onClick={() => handleRemoveSkill(skill)}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <Label htmlFor="documents">Documents</Label>
            <Input id="documents" type="file" ref={fileInputRef} onChange={handleFileChange} multiple />
            <div className="mt-2 space-y-1">
              {documentFiles.map((doc, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{doc.name}</span>
                  <button type="button" onClick={() => handleRemoveDocument(i)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;