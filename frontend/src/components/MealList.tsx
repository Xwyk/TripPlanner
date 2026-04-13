import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Meal } from '../types/api';
import { mealService } from '../services/api';

interface MealListProps {
  tripId?: number;
}

const MealList: React.FC<MealListProps> = ({ tripId }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }

    try {
      await mealService.delete(id);
      setMeals(meals.filter(meal => meal.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du repas');
      console.error(err);
    }
  };

  const getMealTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'En-cas',
    };
    return labels[type] || type;
  };

  const getMealTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    };
    return emojis[type] || '🍽️';
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="meal-list">
      <div className="meal-list-header">
        <h2>🍽️ Repas ({meals.length})</h2>
        {tripId && (
          <Link to={`/trips/${tripId}/meals/new`} className="btn btn-primary">
            + Nouveau Repas
          </Link>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {meals.length === 0 ? (
        <p className="empty-state">Aucun repas planifié pour le moment.</p>
      ) : (
        <div className="meal-cards">
          {meals.map((meal) => (
            <div key={meal.id} className="meal-card">
              <div className="meal-header">
                <h3>
                  {getMealTypeEmoji(meal.mealType)} {meal.name}
                </h3>
                <span className="meal-type-badge">{getMealTypeLabel(meal.mealType)}</span>
              </div>
              <div className="meal-info">
                <p><strong>Date:</strong> {formatDate(meal.date)}</p>
                <p><strong>Portions:</strong> {meal.numberOfPortions}</p>
                {meal.estimatedCost && (
                  <>
                    <p><strong>Coût estimé:</strong> {formatMoney(meal.estimatedCost)}</p>
                    {meal.costPerPortion && (
                      <p><strong>Coût par portion:</strong> {formatMoney(meal.costPerPortion.toString())}</p>
                    )}
                  </>
                )}
              </div>
              <div className="meal-actions">
                <Link to={`/meals/${meal.id}/ingredients`} className="btn btn-sm btn-secondary">
                  Voir ingrédients
                </Link>
                <Link to={`/meals/${meal.id}/edit`} className="btn btn-sm btn-secondary">
                  Modifier
                </Link>
                <button
                  onClick={() => meal.id && deleteMeal(meal.id)}
                  className="btn btn-sm btn-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatMoney = (amount: string): string => {
  return `${parseFloat(amount).toFixed(2)}€`;
};

export default MealList;
