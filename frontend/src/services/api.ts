import axios from 'axios';
import type { HydraCollection, Trip, Participant, Meal, Recipe, Ingredient } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
  },
});

// Ré-export des types pour faciliter les imports
export type { Trip, Participant, Meal, Recipe, Ingredient, HydraCollection };

// Fonction utilitaire pour normaliser les réponses API
function normalizeResponse(data: any): any {
  if (!data) return data;

  // Si c'est déjà au format hydra:member, on retourne tel quel
  if ('hydra:member' in data) {
    return data;
  }

  // Sinon, on convertit member en hydra:member pour la compatibilité
  if ('member' in data && !('hydra:member' in data)) {
    return {
      ...data,
      'hydra:member': data.member,
      'hydra:totalItems': data.totalItems,
    };
  }

  return data;
}

// API Services
export const tripService = {
  getAll: async () => {
    const response = await api.get<any>('/trips');
    return normalizeResponse(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  },

  create: async (trip: Partial<Trip>) => {
    const response = await api.post<Trip>('/trips', trip);
    return response.data;
  },

  update: async (id: number, trip: Partial<Trip>) => {
    const response = await api.put<Trip>(`/trips/${id}`, trip);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/trips/${id}`);
  },

  getCosts: async (id: number) => {
    const response = await api.get(`/trips/${id}/costs`);
    return response.data;
  },
};

export const participantService = {
  getAll: async () => {
    const response = await api.get<any>('/participants');
    return normalizeResponse(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get<Participant>(`/participants/${id}`);
    return response.data;
  },

  create: async (participant: Partial<Participant>) => {
    const response = await api.post<Participant>('/participants', participant);
    return response.data;
  },

  update: async (id: number, participant: Partial<Participant>) => {
    const response = await api.put<Participant>(`/participants/${id}`, participant);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/participants/${id}`);
  },

  addNight: async (id: number, nightNumber: number) => {
    const response = await api.post<Participant>(`/participants/${id}/nights/${nightNumber}`);
    return response.data;
  },

  removeNight: async (id: number, nightNumber: number) => {
    await api.delete(`/participants/${id}/nights/${nightNumber}`);
  },

  getByTrip: async (tripId: number) => {
    const response = await api.get<any>('/participants', {
      params: { trip: tripId }
    });
    return normalizeResponse(response.data);
  },
};

export const mealService = {
  getAll: async () => {
    const response = await api.get<any>('/meals');
    return normalizeResponse(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get<Meal>(`/meals/${id}`);
    return response.data;
  },

  create: async (meal: Partial<Meal>) => {
    const response = await api.post<Meal>('/meals', meal);
    return response.data;
  },

  update: async (id: number, meal: Partial<Meal>) => {
    const response = await api.put<Meal>(`/meals/${id}`, meal);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/meals/${id}`);
  },

  getIngredients: async (id: number) => {
    const response = await api.get(`/meals/${id}/ingredients`);
    return response.data;
  },

  getByTrip: async (tripId: number) => {
    const response = await api.get<any>('/meals', {
      params: { trip: tripId }
    });
    return normalizeResponse(response.data);
  },
};

export const recipeService = {
  getAll: async () => {
    const response = await api.get<any>('/recipes');
    return normalizeResponse(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get<Recipe>(`/recipes/${id}`);
    return response.data;
  },

  create: async (recipe: Partial<Recipe>) => {
    const response = await api.post<Recipe>('/recipes', recipe);
    return response.data;
  },

  update: async (id: number, recipe: Partial<Recipe>) => {
    const response = await api.put<Recipe>(`/recipes/${id}`, recipe);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/recipes/${id}`);
  },
};

export const ingredientService = {
  getAll: async () => {
    const response = await api.get<any>('/ingredients');
    return normalizeResponse(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get<Ingredient>(`/ingredients/${id}`);
    return response.data;
  },

  create: async (ingredient: Partial<Ingredient>) => {
    const response = await api.post<Ingredient>('/ingredients', ingredient);
    return response.data;
  },

  update: async (id: number, ingredient: Partial<Ingredient>) => {
    const response = await api.put<Ingredient>(`/ingredients/${id}`, ingredient);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/ingredients/${id}`);
  },

  getCategories: async () => {
    const response = await api.get<string[]>('/ingredients/categories');
    return response.data;
  },
};
