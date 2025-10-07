import React, { useState, useRef, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeData, UpdateEmployeeDetailsData } from '@/api/employeeService';
import { getSkillColor } from '@/utils/skillColors';

interface DocumentFile {
  name: string;
  file: File;
  type: string;
  size: number;
  preview?: string;
}

interface AddEmployeeFormProps {
  employee: EmployeeData;
  onUpdateEmployee: (userId: number, data: UpdateEmployeeDetailsData) => Promise<boolean>;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ employee, onUpdateEmployee }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateEmployeeDetailsData>({
    birthDate: employee.birthDate || '',
    job: employee.job || '',
    department: employee.department || '',
    manager: employee.manager || '',
    contractType: employee.contractType || 'CDI',
    skills: employee.skills || [],
    documents: employee.documents || [],
    hireDate: employee.hireDate || '',
    status: employee.status || 'Actif',
    baseSalary: employee.baseSalary || undefined,
    bankAccount: employee.bankAccount || '',
    bankName: employee.bankName || '',
    cssNumber: employee.cssNumber || '',
    ipresNumber: employee.ipresNumber || '',
    cssRate: employee.cssRate || 7.0,
    ipresRate: employee.ipresRate || 5.6,
    taxNumber: employee.taxNumber || '',
    trimfRate: employee.trimfRate || 0,
    familySituation: employee.familySituation || '',
    dependents: employee.dependents || 0,
    idCardNumber: employee.idCardNumber || '',
    idCardExpiry: employee.idCardExpiry || '',
  });
  
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value 
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || [] 
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newDocs = files.map(file => ({
        name: file.name, 
        file, 
        type: file.type, 
        size: file.size,
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
      const dataToSend = {
        ...formData,
        documents: [...(formData.documents || []), ...documentFiles.map(d => d.name)]
      };
      
      const success = await onUpdateEmployee(employee.userId, dataToSend);
      
      if (!success) throw new Error("Erreur lors de la mise à jour");

      setOpen(false);
      await Swal.fire({
        title: "Succès !",
        text: `Fiche employé mise à jour avec succès !`,
        icon: "success",
      });
      
      setDocumentFiles([]);
    } catch (error) {
      console.error(error);
      Swal.fire("Erreur", "Une erreur est survenue lors de la mise à jour", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          {employee.hasEmployeeDetails ? '✏️ Modifier les détails' : '➕ Ajouter les détails'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fiche employé - {employee.prenom} {employee.nom}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input id="hireDate" name="hireDate" type="date" value={formData.hireDate || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="job">Poste</Label>
                <Input id="job" name="job" value={formData.job || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input id="department" name="department" value={formData.department || ''} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input id="manager" name="manager" value={formData.manager || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Select value={formData.contractType || 'CDI'} onValueChange={value => setFormData(prev => ({ ...prev, contractType: value }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Statut</Label>
              <Select value={formData.status || 'Actif'} onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="En congé">En congé</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compétences */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Compétences</h3>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une compétence" 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} />
              <Button type="button" onClick={handleAddSkill} variant="outline">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills?.map((skill, i) => (
                <div key={skill} className={`${getSkillColor(i)} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}>
                  {skill} 
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Informations de paie */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">💰 Informations de paie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Salaire de base (FCFA)</Label>
                <Input id="baseSalary" name="baseSalary" type="number" value={formData.baseSalary || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Banque</Label>
                <Input id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">RIB</Label>
                <Input id="bankAccount" name="bankAccount" value={formData.bankAccount || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Charges sociales */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">🏥 Charges sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cssNumber">N° CSS</Label>
                <Input id="cssNumber" name="cssNumber" value={formData.cssNumber || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cssRate">Taux CSS (%)</Label>
                <Input id="cssRate" name="cssRate" type="number" step="0.1" value={formData.cssRate || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipresNumber">N° IPRES</Label>
                <Input id="ipresNumber" name="ipresNumber" value={formData.ipresNumber || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipresRate">Taux IPRES (%)</Label>
                <Input id="ipresRate" name="ipresRate" type="number" step="0.1" value={formData.ipresRate || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Impôts */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">📊 Informations fiscales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">N° fiscal</Label>
                <Input id="taxNumber" name="taxNumber" value={formData.taxNumber || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimfRate">Taux TRIMF (%)</Label>
                <Input id="trimfRate" name="trimfRate" type="number" step="0.1" value={formData.trimfRate || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familySituation">Situation familiale</Label>
                <Select value={formData.familySituation || ''} onValueChange={value => setFormData(prev => ({ ...prev, familySituation: value }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Célibataire">Célibataire</SelectItem>
                    <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                    <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                    <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dependents">Personnes à charge</Label>
                <Input id="dependents" name="dependents" type="number" value={formData.dependents || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Documents administratifs */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">📄 Documents administratifs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idCardNumber">N° CNI</Label>
                <Input id="idCardNumber" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idCardExpiry">Date d'expiration CNI</Label>
                <Input id="idCardExpiry" name="idCardExpiry" type="date" value={formData.idCardExpiry || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold mb-3">📎 Documents</h3>
            <Input id="documents" type="file" ref={fileInputRef} onChange={handleFileChange} multiple />
            <div className="mt-3 space-y-2">
              {documentFiles.map((doc, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{doc.name}</span>
                  <button type="button" onClick={() => handleRemoveDocument(i)} className="text-red-600 hover:text-red-800 font-bold">×</button>
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