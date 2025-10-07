import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Assurez-vous que cette URL est correcte
});

// Ajout d'un intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Le token a expiré ou est invalide
      console.log('Session expirée, redirection...');
      // Supprimez le token du stockage local
      localStorage.removeItem('accessToken'); 
      // Redirigez vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;