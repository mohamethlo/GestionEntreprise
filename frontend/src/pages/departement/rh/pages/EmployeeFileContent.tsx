import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { employeeService } from "@/api/employeeService";
import EmployeeFileContent, { Employee } from "./GestionEmploye/DetailsEmployee";
import AddEmployeeForm from "./GestionEmploye/AddEmployeeForm";

const EmployeeFilePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error("Erreur de chargement :", error);
        Swal.fire("Erreur", "Impossible de charger les employés", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (newEmployee: Omit<Employee, 'id'>) => {
    try {
      const created = await employeeService.create(newEmployee);
      setEmployees(prev => [created, ...prev]);

      await Swal.fire({
        title: "Succès !",
        text: `Employé ${newEmployee.firstName} ${newEmployee.lastName} ajouté avec succès !`,
        icon: "success",
      });

      return true;
    } catch (error) {
      console.error("Erreur API :", error);
      Swal.fire("Erreur", "Échec de l'ajout de l'employé", "error");
      return false;
    }
  };

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

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement des employés...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-700">Liste des employés</h2>
        <AddEmployeeForm onAddEmployee={handleAddEmployee} />
      </div>

      <div className="flex justify-center">
        <Input
          placeholder="Rechercher un employé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun employé trouvé.
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <Card
              key={emp.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedEmployee(emp)}
            >
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
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeFilePage;