import React, { useEffect, useState } from 'react';
import { type Meal, mealService, participantMealService, recipeService, ingredientService } from '../services/api';
import { format } from 'date-fns';

interface ParticipantInfo {
  id: number;
  name: string;
}

interface RecipeInfo {
  '@id': string;
  id: number;
  name: string;
}

interface IngredientInfo {
  '@id': string;
  id: number;
  name: string;
  defaultUnit?: string | null;
}

export type MealFormMode = 'create' | 'edit';

interface MealFormProps {
  mode: MealFormMode;
  tripId: number;
  startDate?: string;
  meal?: Meal | null;
  participants: ParticipantInfo[];
  onSave: () => void;
  onCancel: () => void;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Petit-déjeuner' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'snack', label: 'Goûter' },
  { value: 'dinner', label: 'Dîner' },
];

const getMealParticipants = (meal: Meal): ParticipantInfo[] => {
  const pms = (meal as any).participantMeals ?? [];
  return pms.map((pm: any) => pm.participant).filter((p: any) => p?.id && p?.name);
};

const getMealRecipes = (meal: Meal): RecipeInfo[] => {
  const recipes = (meal as any).recipes ?? [];
  return recipes.filter((r: any) => r?.['@id'] && r?.id && r?.name);
};

const MealForm: React.FC<MealFormProps> = ({
  mode, tripId, startDate, meal, participants, onSave, onCancel,
}) => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [date, setDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<number>>(new Set());
  const [selectedRecipeIris, setSelectedRecipeIris] = useState<string[]>([]);
  const [allRecipes, setAllRecipes] = useState<RecipeInfo[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline creation forms
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', defaultPortions: '4' });
  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', defaultUnit: '', category: '' });

  const loadRecipes = () => {
    recipeService.getAll().then(res => {
      const list = (res?.['hydra:member'] ?? []) as RecipeInfo[];
      setAllRecipes(list.filter(r => r?.id && r?.name));
    }).catch(() => {});
  };

  const loadIngredients = () => {
    ingredientService.getAll().then(res => {
      const list = (res?.['hydra:member'] ?? []) as IngredientInfo[];
      setAllIngredients(list.filter(i => i?.id && i?.name));
    }).catch(() => {});
  };

  useEffect(() => {
    if (mode === 'edit' && meal) {
      setName(meal.name ?? '');
      setMealType(meal.mealType ?? 'breakfast');
      setDate(meal.date ? format(new Date(meal.date), 'yyyy-MM-dd') : '');
      setEstimatedCost(meal.estimatedCost ?? '');
      setSelectedParticipantIds(new Set(getMealParticipants(meal).map(p => p.id)));
      setSelectedRecipeIris(getMealRecipes(meal).map(r => r['@id']));
    } else if (mode === 'create' && startDate) {
      setDate(format(new Date(startDate), 'yyyy-MM-dd'));
      setSelectedParticipantIds(new Set(participants.map(p => p.id)));
    }
  }, [mode, meal, startDate]);

  useEffect(() => { loadRecipes(); loadIngredients(); }, []);

  const toggleParticipant = (id: number) => {
    setSelectedParticipantIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleRecipe = (iri: string) => {
    setSelectedRecipeIris(prev =>
      prev.includes(iri) ? prev.filter(r => r !== iri) : [...prev, iri]
    );
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.name.trim()) return;
    try {
      const created = await recipeService.create({
        name: newRecipe.name,
        defaultPortions: parseInt(newRecipe.defaultPortions) || 4,
      } as any);
      loadRecipes();
      if (created?.['@id']) {
        setSelectedRecipeIris(prev => [...prev, created['@id']]);
      }
      setNewRecipe({ name: '', defaultPortions: '4' });
      setShowNewRecipe(false);
    } catch (err) {
      console.error('Error creating recipe:', err);
    }
  };

  const handleCreateIngredient = async () => {
    if (!newIngredient.name.trim()) return;
    try {
      await ingredientService.create({
        name: newIngredient.name,
        defaultUnit: newIngredient.defaultUnit || null,
        category: newIngredient.category || null,
      } as any);
      loadIngredients();
      setNewIngredient({ name: '', defaultUnit: '', category: '' });
      setShowNewIngredient(false);
    } catch (err) {
      console.error('Error creating ingredient:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const mealData: any = {
        name, mealType,
        date: new Date(date).toISOString(),
        estimatedCost: estimatedCost || null,
        trip: `/api/trips/${tripId}`,
        recipes: selectedRecipeIris,
      };

      let savedMeal: any;

      if (mode === 'create') {
        savedMeal = await mealService.create(mealData);
      } else {
        await mealService.update(meal!.id!, {
          name, mealType,
          date: new Date(date).toISOString(),
          estimatedCost: estimatedCost || null,
          recipes: selectedRecipeIris,
        });
        savedMeal = meal;
      }

      const mealIri = savedMeal?.['@id'] ?? `/api/meals/${savedMeal?.id ?? meal?.id}`;

      if (mode === 'edit' && meal) {
        const currentIds = new Set(getMealParticipants(meal).map(p => p.id));
        const toAdd = [...selectedParticipantIds].filter(id => !currentIds.has(id));
        const toRemove = getMealParticipants(meal).filter(p => !selectedParticipantIds.has(p.id));
        await Promise.all([
          ...toAdd.map(pId =>
            participantMealService.create({ participant: `/api/participants/${pId}`, meal: mealIri })
          ),
          ...toRemove.map(pm => {
            const pmEntry = (meal as any).participantMeals?.find((p: any) => p.participant?.id === pm.id);
            return pmEntry?.id ? participantMealService.delete(pmEntry.id) : Promise.resolve();
          }),
        ]);
      } else if (mode === 'create') {
        await Promise.all(
          [...selectedParticipantIds].map(pId =>
            participantMealService.create({ participant: `/api/participants/${pId}`, meal: mealIri })
          )
        );
      }

      onSave();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div className="meal-form-section">
        <h4>Repas</h4>
        <div className="meal-form-fields">
          <label>Nom <input value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>Type
            <select value={mealType} onChange={e => setMealType(e.target.value)}>
              {MEAL_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>Date <input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
          <label>Coût estimé (€) <input type="number" step="0.01" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} /></label>
        </div>
      </div>

      <div className="meal-form-section">
        <h4>Participants ({selectedParticipantIds.size})</h4>
        <div className="meal-form-checkboxes">
          {participants.map(p => (
            <label key={p.id} className="form-checkbox">
              <input type="checkbox" checked={selectedParticipantIds.has(p.id)} onChange={() => toggleParticipant(p.id)} />
              {p.name}
            </label>
          ))}
          {participants.length === 0 && <p className="empty-hint">Aucun participant dans le trip.</p>}
        </div>
      </div>

      <div className="meal-form-section">
        <h4>Recettes ({selectedRecipeIris.length})</h4>
        <div className="meal-form-checkboxes">
          {allRecipes.map(r => (
            <label key={r.id} className="form-checkbox">
              <input type="checkbox" checked={selectedRecipeIris.includes(r['@id'])} onChange={() => toggleRecipe(r['@id'])} />
              {r.name}
            </label>
          ))}
        </div>
        {showNewRecipe ? (
          <div className="inline-create-form">
            <input placeholder="Nom" value={newRecipe.name} onChange={e => setNewRecipe(f => ({ ...f, name: e.target.value }))} />
            <input type="number" placeholder="Portions par défaut" value={newRecipe.defaultPortions} onChange={e => setNewRecipe(f => ({ ...f, defaultPortions: e.target.value }))} />
            <button type="button" onClick={handleCreateRecipe} className="btn btn-sm btn-primary">Créer</button>
            <button type="button" onClick={() => setShowNewRecipe(false)} className="btn btn-sm btn-secondary">Annuler</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowNewRecipe(true)} className="btn btn-sm btn-secondary">
            + Nouvelle recette
          </button>
        )}
      </div>

      <div className="meal-form-section">
        <h4>Ingrédients ({allIngredients.length})</h4>
        <div className="meal-form-taglist">
          {allIngredients.map(i => (
            <span key={i.id} className="tag">
              {i.name}{i.defaultUnit ? ` (${i.defaultUnit})` : ''}
            </span>
          ))}
          {allIngredients.length === 0 && <p className="empty-hint">Aucun ingrédient disponible.</p>}
        </div>
        {showNewIngredient ? (
          <div className="inline-create-form">
            <input placeholder="Nom" value={newIngredient.name} onChange={e => setNewIngredient(f => ({ ...f, name: e.target.value }))} />
            <input placeholder="Unité (ex: g, L)" value={newIngredient.defaultUnit} onChange={e => setNewIngredient(f => ({ ...f, defaultUnit: e.target.value }))} />
            <input placeholder="Catégorie" value={newIngredient.category} onChange={e => setNewIngredient(f => ({ ...f, category: e.target.value }))} />
            <button type="button" onClick={handleCreateIngredient} className="btn btn-sm btn-primary">Créer</button>
            <button type="button" onClick={() => setShowNewIngredient(false)} className="btn btn-sm btn-secondary">Annuler</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowNewIngredient(true)} className="btn btn-sm btn-secondary">
            + Nouvel ingrédient
          </button>
        )}
      </div>

      <div className="meal-form-actions">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Sauvegarde...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
};

export default MealForm;
