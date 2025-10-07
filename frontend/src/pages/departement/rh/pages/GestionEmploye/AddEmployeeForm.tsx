import React, { useState, useRef, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeData, UpdateEmployeeDetailsData } from '@/api/employeeService';
import { User, Calendar, Briefcase, Building, Users, FileText, Banknote, Shield, CreditCard, FileCheck, Upload, X, Plus, Loader2, BadgeCheck } from "lucide-react";

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
        text: "Fiche employé mise à jour avec succès !",
        icon: "success",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#10b981'
      });
      
      setDocumentFiles([]);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Erreur", 
        text: "Une erreur est survenue lors de la mise à jour", 
        icon: "error",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSkillColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors duration-300',
      'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors duration-300',
      'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 transition-colors duration-300',
      'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 transition-colors duration-300',
      'bg-pink-100 text-pink-800 border border-pink-200 hover:bg-pink-200 transition-colors duration-300',
      'bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200 transition-colors duration-300'
    ];
    return colors[index % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
            employee.hasEmployeeDetails 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
          }`}
        >
          {employee.hasEmployeeDetails ? (
            <>
              <BadgeCheck className="h-4 w-4" />
              Modifier les détails
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Ajouter les détails
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-gray-100 pb-6 pt-8 px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {employee.hasEmployeeDetails ? 'Modifier' : 'Créer'} la fiche employé
            </DialogTitle>
          </div>
          <p className="text-gray-600 mt-2">
            {employee.prenom} {employee.nom} - {employee.email}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Informations de base */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Date de naissance
                  </Label>
                  <Input 
                    id="birthDate" 
                    name="birthDate" 
                    type="date" 
                    value={formData.birthDate || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="hireDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    Date d'embauche
                  </Label>
                  <Input 
                    id="hireDate" 
                    name="hireDate" 
                    type="date" 
                    value={formData.hireDate || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="job" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    Poste
                  </Label>
                  <Input 
                    id="job" 
                    name="job" 
                    value={formData.job || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3"
                    placeholder="Ex: Développeur Frontend"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-orange-500" />
                    Département
                  </Label>
                  <Input 
                    id="department" 
                    name="department" 
                    value={formData.department || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 rounded-xl px-4 py-3"
                    placeholder="Ex: Développement"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="manager" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    Manager
                  </Label>
                  <Input 
                    id="manager" 
                    name="manager" 
                    value={formData.manager || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 rounded-xl px-4 py-3"
                    placeholder=""
                  />
                </div>
                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Type de contrat
                  </Label>
                  <Select value={formData.contractType || 'CDI'} onValueChange={value => setFormData(prev => ({ ...prev, contractType: value }))}>
                    <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 shadow-2xl rounded-xl">
                      <SelectItem value="CDI" className="rounded-lg hover:bg-blue-50 transition-colors duration-200">CDI</SelectItem>
                      <SelectItem value="CDD" className="rounded-lg hover:bg-blue-50 transition-colors duration-200">CDD</SelectItem>
                      <SelectItem value="Stage" className="rounded-lg hover:bg-blue-50 transition-colors duration-200">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 group">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  Statut
                </Label>
                <Select value={formData.status || 'Actif'} onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-gray-200 shadow-2xl rounded-xl">
                    <SelectItem value="Actif" className="rounded-lg hover:bg-green-50 transition-colors duration-200">Actif</SelectItem>
                    <SelectItem value="En congé" className="rounded-lg hover:bg-green-50 transition-colors duration-200">En congé</SelectItem>
                    <SelectItem value="Suspendu" className="rounded-lg hover:bg-green-50 transition-colors duration-200">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Compétences */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BadgeCheck className="h-5 w-5 text-purple-600" />
                </div>
                Compétences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-3">
                <Input 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Ajouter une compétence" 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill} 
                  variant="outline"
                  className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.skills?.map((skill, i) => (
                  <div 
                    key={skill} 
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${getSkillColor(i)}`}
                  >
                    {skill} 
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)} 
                      className="hover:text-red-600 font-bold transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations de paie */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Banknote className="h-5 w-5 text-green-600" />
                </div>
                Informations de paie
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="baseSalary" className="text-sm font-semibold text-gray-700">
                    Salaire de base (FCFA)
                  </Label>
                  <Input 
                    id="baseSalary" 
                    name="baseSalary" 
                    type="number" 
                    value={formData.baseSalary || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="bankName" className="text-sm font-semibold text-gray-700">
                    Banque
                  </Label>
                  <Input 
                    id="bankName" 
                    name="bankName" 
                    value={formData.bankName || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="bankAccount" className="text-sm font-semibold text-gray-700">
                    RIB
                  </Label>
                  <Input 
                    id="bankAccount" 
                    name="bankAccount" 
                    value={formData.bankAccount || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charges sociales */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                Charges sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="cssNumber" className="text-sm font-semibold text-gray-700">
                    N° CSS
                  </Label>
                  <Input 
                    id="cssNumber" 
                    name="cssNumber" 
                    value={formData.cssNumber || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="cssRate" className="text-sm font-semibold text-gray-700">
                    Taux CSS (%)
                  </Label>
                  <Input 
                    id="cssRate" 
                    name="cssRate" 
                    type="number" 
                    step="0.1" 
                    value={formData.cssRate || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="ipresNumber" className="text-sm font-semibold text-gray-700">
                    N° IPRES
                  </Label>
                  <Input 
                    id="ipresNumber" 
                    name="ipresNumber" 
                    value={formData.ipresNumber || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="ipresRate" className="text-sm font-semibold text-gray-700">
                    Taux IPRES (%)
                  </Label>
                  <Input 
                    id="ipresRate" 
                    name="ipresRate" 
                    type="number" 
                    step="0.1" 
                    value={formData.ipresRate || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations fiscales */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                Informations fiscales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="taxNumber" className="text-sm font-semibold text-gray-700">
                    N° fiscal
                  </Label>
                  <Input 
                    id="taxNumber" 
                    name="taxNumber" 
                    value={formData.taxNumber || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="trimfRate" className="text-sm font-semibold text-gray-700">
                    Taux TRIMF (%)
                  </Label>
                  <Input 
                    id="trimfRate" 
                    name="trimfRate" 
                    type="number" 
                    step="0.1" 
                    value={formData.trimfRate || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-gray-700">
                    Situation familiale
                  </Label>
                  <Select value={formData.familySituation || ''} onValueChange={value => setFormData(prev => ({ ...prev, familySituation: value }))}>
                    <SelectTrigger className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-gray-200 shadow-2xl rounded-xl">
                      <SelectItem value="Célibataire" className="rounded-lg hover:bg-purple-50 transition-colors duration-200">Célibataire</SelectItem>
                      <SelectItem value="Marié(e)" className="rounded-lg hover:bg-purple-50 transition-colors duration-200">Marié(e)</SelectItem>
                      <SelectItem value="Divorcé(e)" className="rounded-lg hover:bg-purple-50 transition-colors duration-200">Divorcé(e)</SelectItem>
                      <SelectItem value="Veuf/Veuve" className="rounded-lg hover:bg-purple-50 transition-colors duration-200">Veuf/Veuve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="dependents" className="text-sm font-semibold text-gray-700">
                    Personnes à charge
                  </Label>
                  <Input 
                    id="dependents" 
                    name="dependents" 
                    type="number" 
                    value={formData.dependents || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents administratifs */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileCheck className="h-5 w-5 text-orange-600" />
                </div>
                Documents administratifs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="idCardNumber" className="text-sm font-semibold text-gray-700">
                    N° CNI
                  </Label>
                  <Input 
                    id="idCardNumber" 
                    name="idCardNumber" 
                    value={formData.idCardNumber || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="idCardExpiry" className="text-sm font-semibold text-gray-700">
                    Date d'expiration CNI
                  </Label>
                  <Input 
                    id="idCardExpiry" 
                    name="idCardExpiry" 
                    type="date" 
                    value={formData.idCardExpiry || ''} 
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Input 
                  id="documents" 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple
                  className="border-2 border-dashed border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 rounded-xl px-4 py-6 cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cliquez pour sélectionner des fichiers</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {documentFiles.map((doc, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDocument(i)} 
                      className="text-red-600 hover:text-red-800 font-bold transition-colors duration-200 p-1 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enregistrement...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Enregistrer</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;