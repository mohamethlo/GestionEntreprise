import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { employeeService, EmployeeData, UpdateEmployeeDetailsData } from "@/api/employeeService";
import EmployeeFileContent from "./GestionEmploye/DetailsEmployee";
import AddEmployeeForm from "./GestionEmploye/AddEmployeeForm";
import { Search, Users, UserPlus, FileText, Mail, Phone, Building, Briefcase, BadgeCheck, Clock } from "lucide-react";

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
      Swal.fire({
        title: "Erreur", 
        text: "Impossible de charger les employés", 
        icon: "error",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployeeDetails = async (userId: number, data: UpdateEmployeeDetailsData) => {
    try {
      await employeeService.updateEmployeeDetails(userId, data);
      
      await fetchEmployees();
      
      if (selectedEmployee && selectedEmployee.userId === userId) {
        const updatedEmployees = await employeeService.getAll();
        const updatedEmployee = updatedEmployees.find(emp => emp.userId === userId);
        if (updatedEmployee) {
          setSelectedEmployee(updatedEmployee);
        }
      }

      await Swal.fire({
        title: "Succès !",
        text: "Fiche employé mise à jour avec succès !",
        icon: "success",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#10b981'
      });

      return true;
    } catch (error) {
      console.error("Erreur API :", error);
      Swal.fire({
        title: "Erreur", 
        text: "Échec de la mise à jour de la fiche employé", 
        icon: "error",
        background: '#1f2937',
        color: 'white',
        confirmButtonColor: '#3b82f6'
      });
      return false;
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action supprimera uniquement la fiche employé, pas l'utilisateur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: '#1f2937',
      color: 'white'
    });

    if (result.isConfirmed) {
      try {
        await employeeService.deleteEmployeeDetails(employeeId);
        await fetchEmployees();
        
        Swal.fire({
          title: "Supprimé !", 
          text: "La fiche employé a été supprimée.", 
          icon: "success",
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#10b981'
        });
        
        if (selectedEmployee && selectedEmployee.employeeId === employeeId) {
          setSelectedEmployee(null);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        Swal.fire({
          title: "Erreur", 
          text: "Impossible de supprimer la fiche employé", 
          icon: "error",
          background: '#1f2937',
          color: 'white',
          confirmButtonColor: '#3b82f6'
        });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <EmployeeFileContent
          employee={selectedEmployee}
          onBack={() => setSelectedEmployee(null)}
        />
        <div className="p-4 flex gap-4 flex-wrap">
          <AddEmployeeForm 
            employee={selectedEmployee}
            onUpdateEmployee={handleUpdateEmployeeDetails}
          />
          {selectedEmployee.hasEmployeeDetails && selectedEmployee.employeeId && (
            <Button 
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Users className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
              <Users className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="transform hover:translate-x-1 transition-transform duration-300">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Gestion des Employés
              </h2>
              <p className="text-gray-600 mt-1">
                Gérez et organisez les fiches de vos collaborateurs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-gray-900">{employees.length}</span>
                <span>utilisateur(s)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-gray-900">
                  {employees.filter(e => e.hasEmployeeDetails).length}
                </span>
                <span>fiche(s) employé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" style={{color:"black"}}/>
            <Input
              placeholder="Rechercher un employé (nom, prénom, poste, email)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg"
              style={{color:"black"}}
            />
          </div>
        </div>

        {/* Grille des employés */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-bounce mb-4">
                <Users className="h-16 w-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {employees.length === 0 ? "Aucun employé" : "Aucun résultat"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {employees.length === 0 
                  ? "Commencez par ajouter vos premiers employés à la plateforme."
                  : "Aucun employé ne correspond à votre recherche. Essayez d'autres termes."
                }
              </p>
            </div>
          ) : (
            filteredEmployees.map((emp, index) => (
              <Card
                key={emp.userId}
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer backdrop-blur-sm relative overflow-hidden ${
                  !emp.hasEmployeeDetails 
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200' 
                    : 'bg-gradient-to-br from-white to-blue-50/50 border border-blue-100'
                }`}
                onClick={() => setSelectedEmployee(emp)}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-700" />
                
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {emp.prenom.charAt(0)}{emp.nom.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {emp.prenom} {emp.nom}
                        </h3>
                        <p className="text-sm text-gray-600">{emp.role}</p>
                      </div>
                    </div>
                    {!emp.hasEmployeeDetails ? (
                      <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg transform hover:scale-110 transition-transform duration-300">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Sans fiche
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
                        <BadgeCheck className="h-3 w-3 inline mr-1" />
                        Fiche complète
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="space-y-3 text-sm">
                    {/* Informations de contact */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    
                    {emp.telephone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span>{emp.telephone}</span>
                      </div>
                    )}
                    
                    {emp.job && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span>{emp.job}</span>
                      </div>
                    )}
                    
                    {emp.department && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building className="h-4 w-4 text-orange-500" />
                        <span>{emp.department}</span>
                      </div>
                    )}
                    
                    {/* Statuts */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        emp.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {emp.is_active ? '🟢 Actif' : '🔴 Inactif'}
                      </span>
                      {emp.status && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                          {emp.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Bouton d'action */}
                  <Button 
                    className={`mt-4 w-full font-semibold py-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
                      emp.hasEmployeeDetails 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployee(emp);
                    }}
                  >
                    {emp.hasEmployeeDetails ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Voir la fiche
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer la fiche
                      </>
                    )}
                  </Button>
                </CardContent>

                {/* Barre de progression décorative */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                  !emp.hasEmployeeDetails 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform origin-left scale-x-0 group-hover:scale-x-100`} />
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeFilePage;