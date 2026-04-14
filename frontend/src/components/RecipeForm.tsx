import React, { useEffect, useState } from 'react';
import { type Recipe, recipeService, ingredientService } from '../services/api';

interface IngredientInfo {
  '@id': string;
  id: number;
  name: string;
}

interface RecipeIngredientEntry {
  id?: number;
  ingredient: string;
  quantityPerPerson: string;
  unit: string;
  pricePerPerson: string;
  priceMode: 'perPerson' | 'forN';
  priceForN: string;
  forNPersons: string;
}

export type RecipeFormMode = 'create' | 'edit';

interface RecipeFormProps {
  mode: RecipeFormMode;
  tripId: number;
  recipe?: Recipe | null;
  onSave: () => void;
  onCancel: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  mode, tripId, recipe, onSave, onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientEntry[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', category: '' });

  useEffect(() => {
    ingredientService.getAll().then(res => {
      const list = (res?.['hydra:member'] ?? []) as IngredientInfo[];
      setAllIngredients(list.filter(i => i?.id && i?.name));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === 'edit' && recipe) {
      setName(recipe.name ?? '');
      setDescription(recipe.description ?? '');
      setInstructions(recipe.instructions ?? '');
      const existing = (recipe as any).recipeIngredients ?? [];
      setRecipeIngredients(existing.map((ri: any) => ({
        id: ri.id,
        ingredient: ri.ingredient?.['@id'] ?? ri.ingredient ?? '',
        quantityPerPerson: ri.quantityPerPerson?.toString() ?? ri.quantity?.toString() ?? '',
        unit: ri.unit ?? '',
        pricePerPerson: ri.pricePerPerson ?? '',
        priceMode: 'perPerson' as const,
        priceForN: '',
        forNPersons: '',
      })));
    }
  }, [mode, recipe]);

  const addIngredientRow = () => {
    setRecipeIngredients(prev => [...prev, { ingredient: '', quantityPerPerson: '', unit: '', pricePerPerson: '', priceMode: 'perPerson', priceForN: '', forNPersons: '' }]);
  };

  const updateIngredientRow = (index: number, field: keyof RecipeIngredientEntry, value: string) => {
    setRecipeIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeIngredientRow = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateIngredient = async () => {
    if (!newIngredient.name.trim()) return;
    try {
      await ingredientService.create({
        name: newIngredient.name,
        category: newIngredient.category || null,
      } as any);
      const res = await ingredientService.getAll();
      const list = (res?.['hydra:member'] ?? []) as IngredientInfo[];
      setAllIngredients(list.filter(i => i?.id && i?.name));
      setNewIngredient({ name: '', category: '' });
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
      const ingredientsPayload = recipeIngredients
        .filter(ri => ri.ingredient)
        .map(ri => {
          let pricePerPerson: string | null = null;
          if (ri.priceMode === 'forN' && ri.priceForN && ri.forNPersons) {
            const n = parseFloat(ri.forNPersons);
            if (n > 0) {
              pricePerPerson = (parseFloat(ri.priceForN) / n).toFixed(2);
            }
          } else if (ri.pricePerPerson) {
            pricePerPerson = ri.pricePerPerson;
          }
          return {
            ...(ri.id ? { id: ri.id } : {}),
            ingredient: ri.ingredient,
            quantityPerPerson: parseFloat(ri.quantityPerPerson) || 0,
            unit: ri.unit || null,
            pricePerPerson,
          };
        });

      const payload: any = {
        name,
        description: description || null,
        instructions: instructions || null,
        recipeIngredients: ingredientsPayload,
        trip: `/api/trips/${tripId}`,
      };

      if (mode === 'create') {
        await recipeService.create(payload);
      } else {
        await recipeService.update(recipe!.id!, payload);
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
    <form className="recipe-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div className="meal-form-section">
        <h4>Recette</h4>
        <div className="meal-form-fields">
          <label>Nom <input value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>Description <input value={description} onChange={e => setDescription(e.target.value)} /></label>
          <label>Instructions <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} /></label>
        </div>
      </div>

      <div className="meal-form-section">
        <h4>Ingrédients ({recipeIngredients.length})</h4>
        {recipeIngredients.map((ri, idx) => (
          <div key={idx} className="recipe-ingredient-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', alignItems: 'center', marginBottom: '0.5em' }}>
            <select value={ri.ingredient} onChange={e => updateIngredientRow(idx, 'ingredient', e.target.value)}>
              <option value="">-- Ingrédient --</option>
              {allIngredients.map(i => (
                <option key={i.id} value={i['@id']}>{i.name}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Qté/pers" value={ri.quantityPerPerson} onChange={e => updateIngredientRow(idx, 'quantityPerPerson', e.target.value)} />
            <input placeholder="Unité" value={ri.unit} onChange={e => updateIngredientRow(idx, 'unit', e.target.value)} />
            <select value={ri.priceMode} onChange={e => updateIngredientRow(idx, 'priceMode', e.target.value)}>
              <option value="perPerson">Prix/pers</option>
              <option value="forN">Prix pour N pers.</option>
            </select>
            {ri.priceMode === 'perPerson' ? (
              <input type="number" step="0.01" placeholder="Prix/pers (€)" value={ri.pricePerPerson} onChange={e => updateIngredientRow(idx, 'pricePerPerson', e.target.value)} />
            ) : (
              <>
                <input type="number" step="0.01" placeholder="Prix total (€)" value={ri.priceForN} onChange={e => updateIngredientRow(idx, 'priceForN', e.target.value)} />
                <input type="number" step="1" min="1" placeholder="pour N pers." value={ri.forNPersons} onChange={e => updateIngredientRow(idx, 'forNPersons', e.target.value)} />
                {ri.priceForN && ri.forNPersons && parseFloat(ri.forNPersons) > 0 && (
                  <span style={{ fontSize: '0.85em', color: '#666' }}>
                    = {(parseFloat(ri.priceForN) / parseFloat(ri.forNPersons)).toFixed(2)}€/pers
                  </span>
                )}
              </>
            )}
            <button type="button" onClick={() => removeIngredientRow(idx)} className="btn btn-sm btn-danger">✕</button>
          </div>
        ))}
        <button type="button" onClick={addIngredientRow} className="btn btn-sm btn-secondary">+ Ajouter un ingrédient</button>
      </div>

      <div className="meal-form-section">
        {showNewIngredient ? (
          <div className="inline-create-form">
            <input placeholder="Nom" value={newIngredient.name} onChange={e => setNewIngredient(f => ({ ...f, name: e.target.value }))} />
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

export default RecipeForm;
