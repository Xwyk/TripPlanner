// Types pour les réponses API Platform
export type HydraCollection<T> = {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
  };
};

export type HydraResource<T> = {
  '@context': string;
  '@id': string;
  '@type': string;
} & T;

// Types des entités
export interface Trip {
  id?: number;
  '@id'?: string;
  name: string;
  nights: number;
  totalBudget: string;
  startDate: string;
  description?: string;
  createdAt?: string;
  participants?: Participant[];
  meals?: Meal[];
  costPerNight?: number;
  participantsCosts?: Record<string, number>;
}

export interface Participant {
  id?: number;
  '@id'?: string;
  name: string;
  email?: string;
  arrivalDate?: string;
  departureDate?: string;
  nightsPresent?: number[];
  trip?: string | Trip;
  createdAt?: string;
  nightsCount?: number;
}

export interface Meal {
  id?: number;
  '@id'?: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  description?: string;
  numberOfPortions: number;
  estimatedCost?: string;
  trip: string | Trip;
  recipes?: Recipe[];
  participants?: Participant[];
  costPerPortion?: number;
}

export interface Recipe {
  id?: number;
  '@id'?: string;
  name: string;
  description?: string;
  defaultPortions: number;
  instructions?: string;
  estimatedCost?: string;
  recipeIngredients?: RecipeIngredient[];
  costPerPortion?: number;
}

export interface Ingredient {
  id?: number;
  '@id'?: string;
  name: string;
  defaultUnit?: string;
  defaultQuantity?: string;
  averagePrice?: string;
  category?: string;
  notes?: string;
  pricePerUnit?: number;
}

export interface RecipeIngredient {
  id?: number;
  '@id'?: string;
  quantity: number;
  unit?: string;
  preparationNotes?: string;
  recipe?: string | Recipe;
  ingredient?: Ingredient;
}
