import createClient from 'openapi-fetch';
import type { paths, components } from '../types/api';

// Types générés automatiquement depuis la spec OpenAPI (npm run generate-types)
type TripRead = components['schemas']['Trip.jsonld-trip.read_global.read'];
type TripReadCollection = components['schemas']['Trip.jsonld-trip.readcollection_global.readcollection'];
type TripWrite = components['schemas']['Trip-trip.create'];
type Trip = TripRead;
type ParticipantRead = components['schemas']['Participant.jsonld-participant.read'];
type ParticipantWrite = components['schemas']['Participant-participant.write'];
type Participant = ParticipantRead;
type ParticipantTripRead = components['schemas']['ParticipantTrip.jsonld-trip.read_global.read'];
type ParticipantTripWrite = components['schemas']['ParticipantTrip-participantTrip.write'];
type MealRead = components['schemas']['Meal.jsonld-meal.read'];
type MealWrite = components['schemas']['Meal-meal.write'];
type Meal = MealRead;
type RecipeRead = components['schemas']['Recipe.jsonld-recipe.read'];
type RecipeWrite = components['schemas']['Recipe-recipe.write'];
type Recipe = RecipeRead;
type IngredientRead = components['schemas']['Ingredient.jsonld-ingredient.read'];
type IngredientWrite = components['schemas']['Ingredient-ingredient.write'];
type Ingredient = IngredientRead;

// Client openapi-fetch typé — les paths/params/réponses sont déduits de api.d.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000/api').replace(/\/api$/, '');

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
  },
});

// Ré-export des types pour faciliter les imports
export type { Trip, TripRead, TripWrite, TripReadCollection, Participant, ParticipantRead, ParticipantWrite, ParticipantTripRead, ParticipantTripWrite, Meal, MealRead, MealWrite, Recipe, RecipeRead, RecipeWrite, Ingredient, IngredientRead, IngredientWrite };

// Fonction utilitaire pour normaliser les réponses Hydra
function normalizeHydra(data: unknown): any {
  if (!data || typeof data !== 'object') return data;
  const obj = data as Record<string, unknown>;
  if ('hydra:member' in obj) return obj;
  if ('member' in obj) {
    return {
      ...obj,
      'hydra:member': obj.member,
      'hydra:totalItems': obj.totalItems,
    };
  }
  return obj;
}

// API Services

import { format as fnsFormat } from 'date-fns';

/** Normalise une valeur de nightsPresent (objet { date: Date } ou string) vers 'yyyy-MM-dd' */
const toDateStr = (v: any): string => {
  if (v && typeof v === 'object' && v.date) {
    return fnsFormat(v.date as Date, 'yyyy-MM-dd');
  }
  if (v instanceof Date) {
    return fnsFormat(v, 'yyyy-MM-dd');
  }
  return String(v).slice(0, 10);
};

/**
 * Calcule les coûts par participant en divisant le coût de chaque nuit
 * par le nombre de personnes présentes cette nuit-là.
 */
export function calculateCosts(t: TripRead) {
  const costPerNight = (t.cottageCost ?? 0) / (t.nights || 1);

  // Construit l'ensemble des dates de nuit pour le trip
  const startDate = t.startDate ? new Date(t.startDate) : null;
  const nightDates: string[] = [];
  if (startDate) {
    for (let i = 0; i < t.nights; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      nightDates.push(d.toISOString().slice(0, 10));
    }
  }

  // Pour chaque nuit, compte combien de participants sont présents
  const nightPresenceCount: Record<string, number> = {};
  for (const nightDate of nightDates) {
    nightPresenceCount[nightDate] = 0;
  }

  const ptData = (t.participantTrips ?? []).map((pt: any) => {
    const nights = (pt.nightsPresent ?? []).map(toDateStr).filter((d: string) => nightDates.includes(d));
    for (const n of nights) {
      nightPresenceCount[n] = (nightPresenceCount[n] || 0) + 1;
    }
    return {
      id: pt.participant?.id,
      name: pt.participant?.name,
      ptId: pt.id,
      nights,
    };
  });

  // Calcule le coût par participant : somme des (costPerNight / nbPresents) pour chaque nuit présente
  const participants = ptData.map((pt) => {
    let totalCost = 0;
    for (const n of pt.nights) {
      const count = nightPresenceCount[n] || 1;
      totalCost += costPerNight / count;
    }
    return {
      id: pt.id,
      name: pt.name,
      nights_count: pt.nights.length,
      total_cost: Math.round(totalCost * 100) / 100,
    };
  });

  return {
    cost_per_night: Math.round(costPerNight * 100) / 100,
    participants,
  };
}

export const tripService = {
  getAll: async () => {
    const { data } = await client.GET('/api/trips', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/trips/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (trip: TripWrite) => {
    const { data } = await client.POST('/api/trips', { body: trip as any });
    return data;
  },

  update: async (id: number, trip: TripWrite) => {
    const { data } = await client.PUT('/api/trips/{id}', { params: { path: { id: String(id) } }, body: trip as any });
    return data;
  },

  delete: async (id: number) => {
    await client.DELETE('/api/trips/{id}', { params: { path: { id: String(id) } } });
  },

  getCosts: async (id: number) => {
    const { data: trip } = await client.GET('/api/trips/{id}', { params: { path: { id: String(id) } } });
    if (!trip) return null;
    return calculateCosts(trip as TripRead);
  },
};

export const participantService = {
  getAll: async () => {
    const { data } = await client.GET('/api/participants', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/participants/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (participant: ParticipantWrite) => {
    const { data } = await client.POST('/api/participants', { body: participant as any });
    return data;
  },

  update: async (id: number, participant: Partial<ParticipantWrite>) => {
    const { data } = await client.PUT('/api/participants/{id}', { params: { path: { id: String(id) } }, body: participant as any });
    return data;
  },

  delete: async (id: number) => {
    await client.DELETE('/api/participants/{id}', { params: { path: { id: String(id) } } });
  },

  addNight: async (id: number, nightNumber: number) => {
    // Endpoint custom non dans la spec OpenAPI — on utilise fetch directement
    const response = await fetch(`${API_BASE_URL}/participants/${id}/nights/${nightNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ld+json', 'Accept': 'application/ld+json' },
    });
    return response.json();
  },

  removeNight: async (id: number, nightNumber: number) => {
    await fetch(`${API_BASE_URL}/participants/${id}/nights/${nightNumber}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/ld+json', 'Accept': 'application/ld+json' },
    });
  },

  getByTrip: async (tripId: number) => {
    const { data } = await client.GET('/api/participant_trips', { params: { query: { trip: `/api/trips/${tripId}` } } });
    return data ? normalizeHydra(data) : null;
  },
};

export const participantTripService = {
  getAll: async () => {
    const { data } = await client.GET('/api/participant_trips', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/participant_trips/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (participantTrip: ParticipantTripWrite) => {
    const { data } = await client.POST('/api/participant_trips', { body: participantTrip as any });
    return data;
  },

  update: async (id: number, participantTrip: Partial<ParticipantTripWrite>) => {
    const { data } = await client.PUT('/api/participant_trips/{id}', { params: { path: { id: String(id) } }, body: participantTrip as any });
    return data;
  },

  delete: async (id: number) => {
    await client.DELETE('/api/participant_trips/{id}', { params: { path: { id: String(id) } } });
  },

  getByTrip: async (tripId: number) => {
    const { data } = await client.GET('/api/participant_trips', { params: { query: { trip: `/api/trips/${tripId}` } } });
    return data ? normalizeHydra(data) : null;
  },
};

export const participantMealService = {
  create: async (participantMeal: { participant: string; meal: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/participant_meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ld+json', 'Accept': 'application/ld+json' },
      body: JSON.stringify(participantMeal),
    });
    return response.json();
  },

  delete: async (id: number) => {
    await fetch(`${API_BASE_URL}/api/participant_meals/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/ld+json', 'Accept': 'application/ld+json' },
    });
  },
};

export const mealService = {
  getAll: async () => {
    const { data } = await client.GET('/api/meals', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/meals/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (meal: MealWrite) => {
    const { data } = await client.POST('/api/meals', { body: meal as any });
    return data;
  },

  update: async (id: number, meal: Partial<MealWrite>) => {
    const response = await fetch(`${API_BASE_URL}/api/meals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/ld+json' },
      body: JSON.stringify(meal),
    });
    return response.json();
  },

  delete: async (id: number) => {
    await client.DELETE('/api/meals/{id}', { params: { path: { id: String(id) } } });
  },

  getIngredients: async (id: number) => {
    // Endpoint custom non dans la spec OpenAPI
    const response = await fetch(`${API_BASE_URL}/meals/${id}/ingredients`, {
      headers: { 'Accept': 'application/ld+json' },
    });
    return response.json();
  },

  getByTrip: async (tripId: number) => {
    const { data } = await client.GET('/api/meals', { params: { query: { trip: String(tripId) } } });
    return data ? normalizeHydra(data) : null;
  },
};

export const recipeService = {
  getAll: async () => {
    const { data } = await client.GET('/api/recipes', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/recipes/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (recipe: RecipeWrite) => {
    const { data } = await client.POST('/api/recipes', { body: recipe as any });
    return data;
  },

  update: async (id: number, recipe: RecipeWrite) => {
    const { data } = await client.PUT('/api/recipes/{id}', { params: { path: { id: String(id) } }, body: recipe as any });
    return data;
  },

  delete: async (id: number) => {
    await client.DELETE('/api/recipes/{id}', { params: { path: { id: String(id) } } });
  },
};

export const ingredientService = {
  getAll: async () => {
    const { data } = await client.GET('/api/ingredients', {});
    return data ? normalizeHydra(data) : null;
  },

  getById: async (id: number) => {
    const { data } = await client.GET('/api/ingredients/{id}', { params: { path: { id: String(id) } } });
    return data ?? null;
  },

  create: async (ingredient: IngredientWrite) => {
    const { data } = await client.POST('/api/ingredients', { body: ingredient as any });
    return data;
  },

  update: async (id: number, ingredient: IngredientWrite) => {
    const { data } = await client.PUT('/api/ingredients/{id}', { params: { path: { id: String(id) } }, body: ingredient as any });
    return data;
  },

  delete: async (id: number) => {
    await client.DELETE('/api/ingredients/{id}', { params: { path: { id: String(id) } } });
  },

  getCategories: async () => {
    // Endpoint custom non dans la spec OpenAPI
    const response = await fetch(`${API_BASE_URL}/ingredients/categories`, {
      headers: { 'Accept': 'application/ld+json' },
    });
    return response.json() as Promise<string[]>;
  },
};
