import React from 'react';
import { Button } from "@/components/ui/button";
import { getSkillColor } from '@/utils/skillColors';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  job: string;
  department: string;
  manager: string;
  contractType: string;
  skills: string[];
  documents: string[];
}

interface EmployeeFileContentProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeFileContent: React.FC<EmployeeFileContentProps> = ({ employee, onBack }) => {
  return (
    <div className="p-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-4"
      >
        Retour à la liste
      </Button>
      
      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-bold">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-gray-600">{employee.job}</p>
          <p className="text-gray-600">{employee.department}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Informations personnelles</h3>
            <p>Email: {employee.email}</p>
            <p>Téléphone: {employee.phone}</p>
            <p>Date de naissance: {employee.birthDate}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Informations professionnelles</h3>
            <p>Type de contrat: {employee.contractType}</p>
            <p>Manager: {employee.manager}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Compétences</h3>
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

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Documents</h3>
          <ul className="list-disc pl-5">
            {employee.documents.map((doc, index) => (
              <li key={index} className="text-blue-600 hover:underline">
                <a href={`#${doc}`}>
                  {doc}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFileContent;