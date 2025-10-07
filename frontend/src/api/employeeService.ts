// src/api/employeeService.ts
import apiClient from './axiosConfig';
const API_BASE_URL = "http://localhost:5000/api/employees";

export interface EmployeeData {
  userId: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  site: string;
  is_active: boolean;
  hasEmployeeDetails: boolean;
  employeeId?: number | null;
  birthDate?: string | null;
  job?: string | null;
  department?: string | null;
  manager?: string | null;
  contractType?: string | null;
  skills: string[];
  documents: string[];
  status?: string;
  hireDate?: string | null;
  baseSalary?: number | null;
  bankAccount?: string | null;
  bankName?: string | null;
  cssNumber?: string | null;
  ipresNumber?: string | null;
  cssRate?: number | null;
  ipresRate?: number | null;
  taxNumber?: string | null;
  trimfRate?: number | null;
  familySituation?: string | null;
  dependents?: number | null;
  idCardNumber?: string | null;
  idCardExpiry?: string | null;
}

export interface UpdateEmployeeDetailsData {
  birthDate?: string;
  job?: string;
  department?: string;
  manager?: string;
  contractType?: string;
  skills?: string[];
  documents?: string[];
  hireDate?: string;
  status?: string;
  baseSalary?: number;
  bankAccount?: string;
  bankName?: string;
  cssNumber?: string;
  ipresNumber?: string;
  cssRate?: number;
  ipresRate?: number;
  taxNumber?: string;
  trimfRate?: number;
  familySituation?: string;
  dependents?: number;
  idCardNumber?: string;
  idCardExpiry?: string;
}

export const employeeService = {
  // Récupère tous les utilisateurs avec leurs détails employés
  async getAll(): Promise<EmployeeData[]> {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  },

  // Crée ou met à jour les détails d'un employé pour un utilisateur
  async updateEmployeeDetails(userId: number, data: UpdateEmployeeDetailsData) {
    const response = await apiClient.post(`${API_BASE_URL}/user/${userId}`, data);
    return response.data;
  },

  // Récupère les détails d'un employé spécifique
  async getById(employeeId: number) {
    const response = await apiClient.get(`${API_BASE_URL}/${employeeId}`);
    return response.data;
  },

  // Supprime la fiche employé (pas l'utilisateur)
  async deleteEmployeeDetails(employeeId: number) {
    const response = await apiClient.delete(`${API_BASE_URL}/${employeeId}`);
    return response.data;
  },
};