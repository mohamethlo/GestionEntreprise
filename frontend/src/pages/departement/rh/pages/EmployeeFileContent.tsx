// src/components/rh/pages/EmployeeFileContent.jsx

import React from 'react';

const EmployeeFileContent = () => {
    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm mb-6">
                        <span className="text-3xl">👤</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Fiche Employé
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Gérez la consultation, l'édition et la création des fiches individuelles 
                        des employés de votre organisation.
                    </p>
                </div>

                {/* Cartes de fonctionnalités */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg">🔍</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Recherche</h3>
                        <p className="text-sm text-gray-600">
                            Recherchez rapidement un employé par nom, département ou matricule
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg">📝</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Édition</h3>
                        <p className="text-sm text-gray-600">
                            Modifiez les informations personnelles et professionnelles des employés
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg">➕</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Création</h3>
                        <p className="text-sm text-gray-600">
                            Ajoutez de nouveaux employés au système en quelques clics
                        </p>
                    </div>
                </div>

                {/* Section d'action */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                        Commencez dès maintenant
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Utilisez la barre de recherche pour trouver un employé ou créez une nouvelle fiche.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 shadow-sm">
                            Rechercher un employé
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300 shadow-sm">
                            Nouvelle fiche
                        </button>
                    </div>
                </div>

                {/* Note informative */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Ajoutez ici la logique de recherche d'employés et les détails du dossier.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFileContent;