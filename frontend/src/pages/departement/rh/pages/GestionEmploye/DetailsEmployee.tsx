import React from 'react';
import { Button } from "@/components/ui/button";
import { getSkillColor } from '@/utils/skillColors';
import { EmployeeData } from '@/api/employeeService';

interface EmployeeFileContentProps {
  employee: EmployeeData;
  onBack: () => void;
}

const EmployeeFileContent: React.FC<EmployeeFileContentProps> = ({ employee, onBack }) => {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Non renseigné';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-4"
      >
        ← Retour à la liste
      </Button>
      
      <div className="grid gap-4">
        {/* En-tête */}
        <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-3xl font-bold text-blue-900">
            {employee.prenom} {employee.nom}
          </h2>
          <p className="text-lg text-blue-700 mt-1">{employee.job || 'Poste non renseigné'}</p>
          <p className="text-blue-600">{employee.department || 'Département non renseigné'}</p>
          <div className="mt-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {employee.is_active ? 'Actif' : 'Inactif'}
            </span>
            {employee.status && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {employee.status}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Informations personnelles */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">👤 Informations personnelles</h3>
            <div className="space-y-2">
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Téléphone:</strong> {employee.telephone}</p>
              <p><strong>Date de naissance:</strong> {formatDate(employee.birthDate)}</p>
              <p><strong>Nom d'utilisateur:</strong> {employee.username}</p>
              <p><strong>Site:</strong> {employee.site || 'Non renseigné'}</p>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">💼 Informations professionnelles</h3>
            <div className="space-y-2">
              <p><strong>Rôle:</strong> {employee.role}</p>
              <p><strong>Type de contrat:</strong> {employee.contractType || 'Non renseigné'}</p>
              <p><strong>Manager:</strong> {employee.manager || 'Non renseigné'}</p>
              <p><strong>Date d'embauche:</strong> {formatDate(employee.hireDate)}</p>
            </div>
          </div>
        </div>

        {/* Compétences */}
        {employee.skills && employee.skills.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">🎯 Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className={`${getSkillColor(index)} px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Informations de paie */}
        {employee.hasEmployeeDetails && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">💰 Informations de paie</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Salaire de base:</strong> {employee.baseSalary ? `${employee.baseSalary.toLocaleString('fr-FR')} FCFA` : 'Non renseigné'}</p>
                <p><strong>Banque:</strong> {employee.bankName || 'Non renseignée'}</p>
                <p><strong>RIB:</strong> {employee.bankAccount || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charges sociales */}
        {employee.hasEmployeeDetails && (employee.cssNumber || employee.ipresNumber) && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">🏥 Charges sociales</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>N° CSS:</strong> {employee.cssNumber || 'Non renseigné'}</p>
                <p><strong>Taux CSS:</strong> {employee.cssRate ? `${employee.cssRate}%` : 'Non renseigné'}</p>
              </div>
              <div>
                <p><strong>N° IPRES:</strong> {employee.ipresNumber || 'Non renseigné'}</p>
                <p><strong>Taux IPRES:</strong> {employee.ipresRate ? `${employee.ipresRate}%` : 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Impôts */}
        {employee.hasEmployeeDetails && employee.taxNumber && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">📊 Informations fiscales</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>N° fiscal:</strong> {employee.taxNumber}</p>
                <p><strong>Taux TRIMF:</strong> {employee.trimfRate ? `${employee.trimfRate}%` : 'Non renseigné'}</p>
              </div>
              <div>
                <p><strong>Situation familiale:</strong> {employee.familySituation || 'Non renseignée'}</p>
                <p><strong>Personnes à charge:</strong> {employee.dependents ?? 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents administratifs */}
        {employee.hasEmployeeDetails && employee.idCardNumber && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">📄 Documents administratifs</h3>
            <div className="space-y-2">
              <p><strong>N° CNI:</strong> {employee.idCardNumber}</p>
              <p><strong>Date d'expiration CNI:</strong> {formatDate(employee.idCardExpiry)}</p>
            </div>
          </div>
        )}

        {/* Documents */}
        {employee.documents && employee.documents.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">📎 Documents</h3>
            <ul className="list-disc pl-5 space-y-1">
              {employee.documents.map((doc, index) => (
                <li key={index} className="text-blue-600 hover:underline cursor-pointer">
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeFileContent;