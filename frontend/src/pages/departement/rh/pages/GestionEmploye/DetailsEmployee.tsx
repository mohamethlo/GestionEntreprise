import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeData } from '@/api/employeeService';
import { ArrowLeft, Mail, Phone, Calendar, User, Building, Briefcase, Users, CreditCard, Shield, FileText, Banknote, Heart, FileCheck, BadgeCheck } from "lucide-react";

interface EmployeeFileContentProps {
  employee: EmployeeData;
  onBack: () => void;
}

const EmployeeFileContent: React.FC<EmployeeFileContentProps> = ({ employee, onBack }) => {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Non renseigné';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const getSkillColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border border-blue-200',
      'bg-green-100 text-green-800 border border-green-200',
      'bg-purple-100 text-purple-800 border border-purple-200',
      'bg-orange-100 text-orange-800 border border-orange-200',
      'bg-pink-100 text-pink-800 border border-pink-200',
      'bg-indigo-100 text-indigo-800 border border-indigo-200'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Bouton de retour */}
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 transform hover:-translate-x-1 text-gray-700 font-semibold px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>

        {/* En-tête de l'employé */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg backdrop-blur-sm">
                  {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    {employee.prenom} {employee.nom}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    {employee.job && (
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <Briefcase className="h-4 w-4" />
                        <span className="font-medium">{employee.job}</span>
                      </div>
                    )}
                    {employee.department && (
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{employee.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                  employee.is_active 
                    ? 'bg-green-500/20 text-green-100 border border-green-300/30' 
                    : 'bg-red-500/20 text-red-100 border border-red-300/30'
                }`}>
                  {employee.is_active ? '🟢 Actif' : '🔴 Inactif'}
                </span>
                {employee.status && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-400/20 text-blue-100 border border-blue-300/30 backdrop-blur-sm">
                    {employee.status}
                  </span>
                )}
                {employee.hasEmployeeDetails && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-100 border border-emerald-300/30 backdrop-blur-sm flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4" />
                    Fiche complète
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grille des informations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
              </div>
              
              {employee.telephone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-300">
                  <Phone className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{employee.telephone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors duration-300">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium text-gray-900">{formatDate(employee.birthDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors duration-300">
                <User className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                  <p className="font-medium text-gray-900">{employee.username}</p>
                </div>
              </div>
              
              {employee.site && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors duration-300">
                  <Building className="h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-600">Site</p>
                    <p className="font-medium text-gray-900">{employee.site}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-300">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Rôle</p>
                  <p className="font-medium text-gray-900">{employee.role}</p>
                </div>
              </div>
              
              {employee.contractType && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Type de contrat</p>
                    <p className="font-medium text-gray-900">{employee.contractType}</p>
                  </div>
                </div>
              )}
              
              {employee.manager && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors duration-300">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium text-gray-900">{employee.manager}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors duration-300">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Date d'embauche</p>
                  <p className="font-medium text-gray-900">{formatDate(employee.hireDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compétences */}
        {employee.skills && employee.skills.length > 0 && (
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BadgeCheck className="h-5 w-5 text-purple-600" />
                </div>
                Compétences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {employee.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${getSkillColor(index)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations de paie */}
        {employee.hasEmployeeDetails && (
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Banknote className="h-5 w-5 text-green-600" />
                </div>
                Informations de paie
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Salaire de base</span>
                    <span className="font-bold text-green-600">
                      {employee.baseSalary ? `${employee.baseSalary.toLocaleString('fr-FR')} FCFA` : 'Non renseigné'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Banque</span>
                    <span className="font-medium text-gray-900">{employee.bankName || 'Non renseignée'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">RIB</span>
                    <span className="font-medium text-gray-900">{employee.bankAccount || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations sociales et fiscales */}
        {employee.hasEmployeeDetails && (employee.cssNumber || employee.ipresNumber || employee.taxNumber) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Charges sociales */}
            {(employee.cssNumber || employee.ipresNumber) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    Charges sociales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {employee.cssNumber && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">N° CSS</span>
                      <span className="font-medium text-gray-900">{employee.cssNumber}</span>
                    </div>
                  )}
                  {employee.cssRate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taux CSS</span>
                      <span className="font-medium text-gray-900">{employee.cssRate}%</span>
                    </div>
                  )}
                  {employee.ipresNumber && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">N° IPRES</span>
                      <span className="font-medium text-gray-900">{employee.ipresNumber}</span>
                    </div>
                  )}
                  {employee.ipresRate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taux IPRES</span>
                      <span className="font-medium text-gray-900">{employee.ipresRate}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informations fiscales */}
            {employee.taxNumber && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    Informations fiscales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">N° fiscal</span>
                    <span className="font-medium text-gray-900">{employee.taxNumber}</span>
                  </div>
                  {employee.trimfRate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taux TRIMF</span>
                      <span className="font-medium text-gray-900">{employee.trimfRate}%</span>
                    </div>
                  )}
                  {employee.familySituation && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Situation familiale</span>
                      <span className="font-medium text-gray-900">{employee.familySituation}</span>
                    </div>
                  )}
                  {employee.dependents !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Personnes à charge</span>
                      <span className="font-medium text-gray-900">{employee.dependents}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Documents administratifs */}
        {employee.hasEmployeeDetails && employee.idCardNumber && (
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">N° CNI</span>
                    <span className="font-medium text-gray-900">{employee.idCardNumber}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Date d'expiration CNI</span>
                    <span className="font-medium text-gray-900">{formatDate(employee.idCardExpiry)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {employee.documents && employee.documents.length > 0 && (
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {employee.documents.map((doc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group"
                  >
                    <FileText className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeFileContent;