import React, { useEffect, useState } from 'react';
import { type Meal, type Recipe, mealService } from '../services/api';
import MealForm, { type MealFormMode } from './MealForm';
import RecipeForm from './RecipeForm';
import Modal from './Modal';

interface ParticipantInfo {
  id: number;
  name: string;
}

interface MealListProps {
  tripId?: number;
  participants?: ParticipantInfo[];
  startDate?: string;
}

const MealList: React.FC<MealListProps> = ({ tripId, participants = [], startDate }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<{ mode: MealFormMode; meal: Meal | null } | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadMeals();
  }, [tripId]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      let response;
      if (tripId) {
        response = await mealService.getByTrip(tripId);
      } else {
        response = await mealService.getAll();
      }
      setMeals(response['hydra:member'] || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des repas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) return;
    try {
      await mealService.delete(id);
      setMeals(meals.filter(meal => meal.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du repas');
      console.error(err);
    }
  };

  const getMealTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
    return emojis[type] || '🍽️';
  };

  const getMealParticipants = (meal: Meal): ParticipantInfo[] => {
    const pms = (meal as any).participantMeals ?? [];
    return pms.map((pm: any) => pm.participant).filter((p: any) => p?.id && p?.name);
  };

  const getMealRecipes = (meal: Meal): { name: string; recipe: any }[] => {
    const recipes = (meal as any).recipes ?? [];
    return recipes.filter((r: any) => r?.name).map((r: any) => ({ name: r.name, recipe: r }));
  };

  const mealsByDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const key = meal.date ?? '';
    if (!acc[key]) acc[key] = [];
    acc[key].push(meal);
    return acc;
  }, {});

  const mealTypeOrder: Record<string, number> = { breakfast: 0, lunch: 1, snack: 2, dinner: 3 };
  const sortedDates = Object.keys(mealsByDate).filter(Boolean).sort();

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="meal-list">
      <div className="meal-list-header">
        <h2>Repas ({meals.length})</h2>
        {tripId && !formMode && (
          <button onClick={() => setFormMode({ mode: 'create', meal: null })} className="btn btn-primary">
            + Nouveau Repas
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {formMode && tripId && (
        <Modal
          open={!!formMode}
          onClose={() => setFormMode(null)}
          title={formMode.mode === 'create' ? 'Nouveau repas' : 'Modifier le repas'}
        >
          <MealForm
            mode={formMode.mode}
            tripId={tripId}
            startDate={startDate}
            meal={formMode.meal}
            participants={participants}
            onSave={() => { setFormMode(null); loadMeals(); }}
            onCancel={() => setFormMode(null)}
          />
        </Modal>
      )}

      {editRecipe && tripId && (
        <Modal
          open={!!editRecipe}
          onClose={() => setEditRecipe(null)}
          title="Modifier la recette"
        >
          <RecipeForm
            mode="edit"
            tripId={tripId}
            recipe={editRecipe}
            onSave={() => { setEditRecipe(null); loadMeals(); }}
            onCancel={() => setEditRecipe(null)}
          />
        </Modal>
      )}

      {meals.length === 0 && !formMode ? (
        <p className="empty-state">Aucun repas planifié pour le moment.</p>
      ) : (
        <table className="meal-table">
          <thead>
            <tr>
              <th>Repas</th>
              <th>Participants</th>
              <th>Recettes</th>
              <th>Coût</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((date) => {
              const dayMeals = mealsByDate[date]
                .sort((a, b) => (mealTypeOrder[a.mealType ?? ''] ?? 99) - (mealTypeOrder[b.mealType ?? ''] ?? 99));

              return (
                <React.Fragment key={date}>
                  <tr className="meal-date-row">
                    <td colSpan={5}>{formatDateShort(date)}</td>
                  </tr>
                  {dayMeals.map((meal) => {
                    const mealParticipants = getMealParticipants(meal);
                    const mealRecipes = getMealRecipes(meal);

                    return (
                      <tr key={meal.id} className="meal-row">
                        <td>
                          <span className="meal-type-icon">{meal.mealType ? getMealTypeEmoji(meal.mealType) : ''}</span>
                          {meal.name}
                        </td>
                        <td className="meal-participants-cell">
                          <span className="participant-count">{mealParticipants.length}</span>
                          {mealParticipants.length > 0 && (
                            <span className="participant-names"> — {mealParticipants.map(p => p.name).join(', ')}</span>
                          )}
                        </td>
                        <td>
                          {mealRecipes.length > 0 ? mealRecipes.map((r, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && ', '}
                              <span>
                                {r.name}
                                <button type="button" onClick={() => setEditRecipe(r.recipe)} className="btn btn-sm btn-secondary" title="Modifier la recette" style={{ marginLeft: '0.3em', padding: '0 0.3em' }}>✎</button>
                              </span>
                            </React.Fragment>
                          )) : '-'}
                        </td>
                        <td>
                          {(meal as any).totalCost != null || (meal as any).costPerPortion != null ? (
                            <>
                              {(meal as any).costPerPortion != null && `${(meal as any).costPerPortion.toFixed(2)}€/pers`}
                              {(meal as any).totalCost != null && ` (${(meal as any).totalCost.toFixed(2)}€ total)`}
                            </>
                          ) : '-'}
                        </td>
                        <td className="meal-actions-cell">
                          <button onClick={() => setFormMode({ mode: 'edit', meal })} className="btn btn-sm btn-secondary">
                            Modifier
                          </button>
                          <button onClick={() => meal.id && deleteMeal(meal.id)} className="btn btn-sm btn-danger">
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const formatMoney = (amount: string): string => {
  return `${parseFloat(amount).toFixed(2)}€`;
};

export default MealList;
