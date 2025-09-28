// src/components/rh/pages/EmployeeFileContent.jsx

import React from 'react';

const EmployeeFileContent = () => {
    return (
        <div className="p-10 text-center space-y-4">
            <h2 className="text-3xl font-bold text-commercial">Fiche Employé</h2>
            <p className="text-lg text-muted-foreground">
                Ici, vous gérerez la consultation, l'édition et la création des fiches individuelles des employés.
            </p>
            <div className="text-6xl pt-5">👤</div>
            <p className="text-sm text-gray-500">Ajoutez ici la logique de recherche d'employés et les détails du dossier.</p>
        </div>
    );
};

export default EmployeeFileContent;