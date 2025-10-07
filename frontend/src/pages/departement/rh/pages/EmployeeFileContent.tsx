import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { employeeService, EmployeeData, UpdateEmployeeDetailsData } from "@/api/employeeService";
import EmployeeFileContent from "./GestionEmploye/DetailsEmployee";
import AddEmployeeForm from "./GestionEmploye/AddEmployeeForm";

const EmployeeFilePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  const handleUpdateEmployeeDetails = async (userId: number, data: UpdateEmployeeDetailsData) => {
    try {
      await employeeService.updateEmployeeDetails(userId, data);
      
      // Recharger la liste des employés
      await fetchEmployees();
      
      // Mettre à jour l'employé sélectionné si c'est celui qu'on a modifié
      if (selectedEmployee && selectedEmployee.userId === userId) {
        const updatedEmployees = await employeeService.getAll();
        const updatedEmployee = updatedEmployees.find(emp => emp.userId === userId);
        if (updatedEmployee) {
          setSelectedEmployee(updatedEmployee);
        }
      }

      await Swal.fire({
        title: "Succès !",
        text: `Fiche employé mise à jour avec succès !`,
        icon: "success",
      });

      return true;
    } catch (error) {
      console.error("Erreur API :", error);
      Swal.fire("Erreur", "Échec de la mise à jour de la fiche employé", "error");
      return false;
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action supprimera uniquement la fiche employé, pas l'utilisateur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        await employeeService.deleteEmployeeDetails(employeeId);
        await fetchEmployees();
        
        Swal.fire("Supprimé !", "La fiche employé a été supprimée.", "success");
        
        // Si on était en train de voir cet employé, retourner à la liste
        if (selectedEmployee && selectedEmployee.employeeId === employeeId) {
          setSelectedEmployee(null);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        Swal.fire("Erreur", "Impossible de supprimer la fiche employé", "error");
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.prenom.toLowerCase().includes(search.toLowerCase()) ||
    emp.nom.toLowerCase().includes(search.toLowerCase()) ||
    (emp.job && emp.job.toLowerCase().includes(search.toLowerCase())) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedEmployee) {
    return (
      <div>
        <EmployeeFileContent
          employee={selectedEmployee}
          onBack={() => setSelectedEmployee(null)}
        />
        <div className="p-4 flex gap-4">
          <AddEmployeeForm 
            employee={selectedEmployee}
            onUpdateEmployee={handleUpdateEmployeeDetails}
          />
          {selectedEmployee.hasEmployeeDetails && selectedEmployee.employeeId && (
            <Button 
              variant="destructive"
              onClick={() => handleDeleteEmployee(selectedEmployee.employeeId!)}
            >
              🗑️ Supprimer la fiche employé
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement des employés...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-700">Gestion des Employés</h2>
        <div className="text-sm text-gray-600">
          {employees.length} utilisateur(s) • {employees.filter(e => e.hasEmployeeDetails).length} fiche(s) employé
        </div>
      </div>

      <div className="flex justify-center">
        <Input
          placeholder="Rechercher un employé (nom, prénom, poste, email)..."
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
              key={emp.userId}
              className={`cursor-pointer hover:shadow-lg transition ${
                !emp.hasEmployeeDetails ? 'border-orange-300 bg-orange-50' : 'border-blue-200'
              }`}
              onClick={() => setSelectedEmployee(emp)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{emp.prenom} {emp.nom}</span>
                  {!emp.hasEmployeeDetails && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                      Sans fiche
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Rôle :</strong> {emp.role}</p>
                  {emp.job && <p><strong>Poste :</strong> {emp.job}</p>}
                  {emp.department && <p><strong>Département :</strong> {emp.department}</p>}
                  <p><strong>Email :</strong> {emp.email}</p>
                  <p><strong>Téléphone :</strong> {emp.telephone}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      emp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {emp.status && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {emp.status}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="mt-4 w-full" 
                  variant={emp.hasEmployeeDetails ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(emp);
                  }}
                >
                  {emp.hasEmployeeDetails ? ' Voir la fiche' : '➕ Créer la fiche'}
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