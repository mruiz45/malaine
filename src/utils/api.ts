/**
 * Utilitaire pour effectuer des appels API sécurisés
 * Tous les appels à Supabase doivent passer par ces fonctions
 */

// Options de base pour les requêtes fetch
const baseOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials, // Pour inclure les cookies
};

// Fonction générique pour les appels API
async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const mergedOptions = {
    ...baseOptions,
    ...options,
    headers: {
      ...baseOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(`/api${endpoint}`, mergedOptions);
  
  // Si la réponse n'est pas OK, on lance une erreur
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }
  
  // Sinon on retourne les données
  return response.json();
}

// Fonctions spécifiques pour chaque type de requête
export const api = {
  get: <T = any>(endpoint: string, options: RequestInit = {}) => 
    fetchAPI<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, data: any, options: RequestInit = {}) =>
    fetchAPI<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T = any>(endpoint: string, data: any, options: RequestInit = {}) =>
    fetchAPI<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T = any>(endpoint: string, options: RequestInit = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Fonctions d'authentification
export const auth = {
  signIn: (email: string, password: string) =>
    api.post<{ user: any; session: any }>('/auth/signin', { email, password }),
  
  signOut: () => api.post('/auth/signout', {}),
  
  getSession: () => api.get<{ user: any }>('/auth/session'),
};

export default api;