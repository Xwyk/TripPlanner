import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Trip, type TripRead, tripService, participantService, mealService, participantMealService, calculateCosts } from '../services/api';
import { addDays, format } from 'date-fns';
import Calendar from './Calendar';
import MealList from './MealList';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const costs = useMemo(() => trip ? calculateCosts(trip) : null, [trip]);

  useEffect(() => {
    loadData(true);
  }, [id]);

  const loadData = async (isInitial = false) => {
    if (!id) return;

    try {
      if (isInitial) setLoading(true);
      const tripData = await tripService.getById(Number.parseInt(id));

      setTrip(tripData as Trip | null);
      setError(null);
    } catch (err) {
      if (isInitial) setError('Erreur lors du chargement des détails du voyage');
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const generateAllMeals = async () => {
    if (!trip?.startDate || !trip?.nights) return;

    const daysCount = trip.nights + 1;
    if (!confirm(`Générer les repas pour ${daysCount} jour(s) ? Cela va créer ${daysCount * 4} repas.`)) return;

    const startDate = new Date(trip.startDate);
    const mealTypes = [
      { type: 'breakfast', name: 'Petit-déjeuner' },
      { type: 'lunch', name: 'Déjeuner' },
      { type: 'snack', name: 'Goûter' },
      { type: 'dinner', name: 'Dîner' },
    ];

    const getParticipantsForDate = (dateStr: string): any[] => {
      return (trip.participantTrips ?? []).filter(
        (pt: any) => (pt.nightsPresent ?? []).includes(dateStr)
      );
    };

    try {
      // 1. Create all meals
      const mealPromises: Promise<any>[] = [];
      const mealInfos: { date: Date; participantIds: number[] }[] = [];

      for (let i = 0; i < daysCount; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const present = i < trip.nights
          ? getParticipantsForDate(dateStr)
          : getParticipantsForDate(format(addDays(startDate, trip.nights - 1), 'yyyy-MM-dd'));
        const participantIds = present.map((pt: any) => pt.participant?.id).filter(Boolean);

        mealInfos.push({ date, participantIds });

        for (const { type, name } of mealTypes) {
          mealPromises.push(
            mealService.create({
              name,
              mealType: type,
              date: date.toISOString(),
              trip: `/api/trips/${trip.id}`,
            } as any)
          );
        }
      }

      const createdMeals = await Promise.all(mealPromises);

      // 2. Link participants to each meal
      const pmPromises: Promise<any>[] = [];
      for (let i = 0; i < createdMeals.length; i++) {
        const meal = createdMeals[i];
        const dayIndex = Math.floor(i / mealTypes.length);
        const { participantIds } = mealInfos[dayIndex];

        for (const pId of participantIds) {
          pmPromises.push(
            participantMealService.create({
              participant: `/api/participants/${pId}`,
              meal: meal['@id'],
            })
          );
        }
      }
      await Promise.all(pmPromises);
      loadData();
    } catch (err) {
      setError('Erreur lors de la génération des repas');
      console.error(err);
    }
  };

  const deleteParticipantTrip = async (ptId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      return;
    }

    try {
      await participantService.delete(ptId);
      loadData();
    } catch (err) {
      setError('Erreur lors de la suppression du participant');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error || !trip) {
    return <div className="error">{error || 'Voyage non trouvé'}</div>;
  }

  return (
    <div className="trip-details">
      <div className="details-header">
        <div>
          <h1>{trip.name}</h1>
          <p className="trip-meta">
            {trip.startDate ? formatDate(trip.startDate) : 'N/A'} - {trip.nights} nuits - Hébergement: {formatMoney(trip.cottageCost?.toString() ?? '0')} - Repas: {costs ? formatMoney(costs.total_meal_cost.toString()) : '-'}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/trips/${trip.id}/edit`} className="btn btn-secondary">
            Modifier
          </Link>
          <Link to={`/trips/${trip.id}/participants/new`} className="btn btn-primary">
            + Ajouter Participant
          </Link>
          <button onClick={generateAllMeals} className="btn btn-secondary">
            Générer tous les repas
          </button>
        </div>
      </div>

      {trip.description && (
        <div className="trip-description">
          <h3>Description</h3>
          <p>{trip.description}</p>
        </div>
      )}

      {/* Budget Overview */}
      {costs && (
        <div className="budget-overview">
          <h2>📊 Budget</h2>
          <div className="budget-stats">
            <div className="stat-card">
              <h4>Hébergement</h4>
              <p className="stat-value">{formatMoney(trip.cottageCost?.toString() ?? '0')}</p>
            </div>
            <div className="stat-card">
              <h4>Repas</h4>
              <p className="stat-value">{formatMoney(costs.total_meal_cost.toString())}</p>
            </div>
            <div className="stat-card">
              <h4>Total</h4>
              <p className="stat-value">{formatMoney((trip.cottageCost + costs.total_meal_cost).toString())}</p>
            </div>
          </div>

          <h3>Coûts par Participant</h3>
          <div className="participants-costs">
            {costs.participants?.map((participant: any) => (
              <div key={participant.id} className="participant-cost-card">
                <h4>{participant.name}</h4>
                <div className="cost-details">
                  <p><strong>{participant.nights_count}</strong> nuits : <strong>{formatMoney(participant.accommodation_cost.toString())}</strong></p>
                  <p><strong>{participant.meals_count}</strong> repas : <strong>{formatMoney(participant.food_cost.toString())}</strong></p>
                  <p>Total: <strong className="cost-total">{formatMoney(participant.total_cost.toString())}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="calendar-section">
        <h2>📅 Calendrier des Présences</h2>
        <Calendar
          trip={trip}
          participantTrips={trip.participantTrips ?? []}
          onParticipantsChange={loadData}
        />
      </div>
      {/* Participants List */}
      <div className="participants-section">
        {trip.participantTrips && trip.participantTrips.length > 0 && (
          <>
            <h2>👥 Participants ({trip.participantTrips.length})</h2>
            {trip.participantTrips.length === 0 ? (
              <p className="empty-state">Aucun participant pour le moment.</p>
            ) : (
              <div className="participants-grid">
                {trip.participantTrips.map((pt: any) => (
                  <div key={pt.id} className="participant-card">
                    <h4>{pt.participant?.name}</h4>
                    <p>Email: <a href={`mailto:${pt.participant?.email}`}>{pt.participant?.email || 'N/A'}</a></p>
                    <p>Nuitées: {pt.nightsCount ?? 0}</p>
                    <div className="participant-actions">
                      <button
                        onClick={() => pt.id && deleteParticipantTrip(pt.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Meals */}
      <div className="meals-section">
        <MealList
          tripId={trip.id}
          startDate={trip.startDate}
          participants={(trip.participantTrips ?? []).map((pt: any) => ({
            id: pt.participant?.id,
            name: pt.participant?.name,
          })).filter((p: any) => p.id && p.name)}
        />
      </div>
    </div>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatMoney = (amount: string): string => {
  return `${Number.parseFloat(amount).toFixed(2)}€`;
};

export default TripDetails;
