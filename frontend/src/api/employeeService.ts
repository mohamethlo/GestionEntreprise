// src/api/employeeService.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/employees"; // adapte l'URL

export interface EmployeeData {
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

export const employeeService = {
  async getAll() {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  async create(employee: EmployeeData) {
    const response = await axios.post(API_BASE_URL, employee);
    return response.data;
  },

  async getById(id: number) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};
