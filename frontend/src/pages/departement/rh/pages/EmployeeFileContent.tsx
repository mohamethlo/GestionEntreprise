import React, { useState } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmployeeFileContent, { Employee } from "./components/rh/EmployeeFileContent";
import AddEmployeeForm from "./components/rh/AddEmployeeForm";

const employeesMock: Employee[] = [
  {
    id: 1,
    firstName: "Aboubacar",
    lastName: "Sonko",
    birthDate: "12/05/1990",
    email: "aba.sonko@email.com",
    phone: "+221770000000",
    job: "Développeur Fullstack",
    department: "IT",
    manager: "Mme Ndiaye",
    contractType: "CDI",
    skills: ["React", "Node.js", "TypeScript"],
    documents: ["CV.pdf", "Lettre de motivation.pdf"]
  },
  {
    id: 2,
    firstName: "Moussa",
    lastName: "Ali",
    birthDate: "15/08/1985",
    email: "moussa.ali@email.com",
    phone: "+221771111111",
    job: "Développeur Frontend",
    department: "IT",
    manager: "M. Diop",
    contractType: "CDI",
    skills: ["React", "Flutter"],
    documents: ["Contrat de travail.pdf"]
  },
  {
    id: 3,
    firstName: "Fatou",
    lastName: "Diallo",
    birthDate: "15/08/1985",
    email: "fatou.diallo@email.com",
    phone: "+221771111111",
    job: "Secretaire",
    department: "Ressources Humaines",
    manager: "M. Diop",
    contractType: "CDI",
    skills: ["Gestion RH", "Paie"],
    documents: ["Contrat de travail.pdf"]
  },
  {
    id: 4,
    firstName: "Mamadou",
    lastName: "Cisse",
    birthDate: "15/08/1985",
    email: "mamadou.cisse@email.com",
    phone: "+221771111111",
    job: "Comptable",
    department: "Comptabilité",
    manager: "M. Diop",
    contractType: "CDI",
    skills: ["Gestion RH", "Paie"],
    documents: ["Contrat de travail.pdf"]
  },
  {
    id: 5,
    firstName: "Yakar",
    lastName: "Diop",
    birthDate: "15/08/1985",
    email: "yakar.diop@email.com",
    phone: "+221771111111",
    job: "Commercial",
    department: "Vente",
    manager: "M. Diop",
    contractType: "CDI",
    skills: ["Gestion RH", "Paie"],
    documents: ["Contrat de travail.pdf"]
  },
  {
    id: 6,
    firstName: "Sow",
    lastName: "Diallo",
    birthDate: "15/08/1985",
    email: "sow.diallo@email.com",
    phone: "+221771111111",
    job: "Administrateur Système",
    department: "IT",
    manager: "M. Diop",
    contractType: "CDI",
    skills: ["Windows", "Linux", "MacOS"],
    documents: ["cv.pdf", "lettre de motivation.pdf"]
  }
];

const EmployeeFilePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(employeesMock);

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.job.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedEmployee) {
    return (
      <EmployeeFileContent
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
      />
    );
  }

  const handleAddEmployee = async (newEmployee: Omit<Employee, 'id'>) => {
    try {
      const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
      const employeeWithId: Employee = { ...newEmployee, id: newId };
      
      // Mise à jour de l'état avec le nouvel employé
      setEmployees(prevEmployees => [employeeWithId, ...prevEmployees]);
      
      // Afficher une notification de succès avec SweetAlert2
      const result = await Swal.fire({
        title: 'Succès !',
        text: `Employé ${newEmployee.firstName} ${newEmployee.lastName} ajouté avec succès !`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
      // Fermer le modal après la confirmation
      if (result.isConfirmed) {
        // Le modal se fermera automatiquement grâce à la prop open/onOpenChange
        // car nous avons défini setOpen(false) dans le composant AddEmployeeForm
      }
      
      // Ici, vous pourriez ajouter un appel API pour sauvegarder en base de données
      // Exemple :
      // const response = await fetch('/api/employees', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(employeeWithId)
      // });
      // const data = await response.json();
      
      return true; // Indiquer que l'ajout s'est bien passé
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      await Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajout de l\'employé',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false; // Indiquer qu'il y a eu une erreur
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-700">Liste des employés</h2>
        <AddEmployeeForm onAddEmployee={handleAddEmployee} />
      </div>

      <div className="flex justify-center">
        <Input
          placeholder="Rechercher un employé par nom, prénom ou poste..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun employé trouvé. Commencez par en ajouter un !
          </div>
        ) : (
          filteredEmployees.map(emp => (
          <Card key={emp.id} className="cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedEmployee(emp)}>
            <CardHeader>
              <CardTitle>{emp.firstName} {emp.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Poste :</strong> {emp.job}</p>
              <p><strong>Département :</strong> {emp.department}</p>
              <p><strong>Email :</strong> {emp.email}</p>
              <Button className="mt-2 w-full" onClick={() => setSelectedEmployee(emp)}>
                Voir la fiche
              </Button>
            </CardContent>
          </Card>
        )))
        }
      </div>
    </div>
  );
};

export default EmployeeFilePage;
