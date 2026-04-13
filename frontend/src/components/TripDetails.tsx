import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Trip, Participant } from '../types/api';
import { tripService, participantService } from '../services/api';
import Calendar from './Calendar';
import MealList from './MealList';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [costs, setCosts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [tripData, participantsData, costsData] = await Promise.all([
        tripService.getById(parseInt(id)),
        participantService.getByTrip(parseInt(id)),
        tripService.getCosts(parseInt(id))
      ]);

      setTrip(tripData);
      setParticipants(participantsData['hydra:member'] || []);
      setCosts(costsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails du voyage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteParticipant = async (participantId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      return;
    }

    try {
      await participantService.delete(participantId);
      setParticipants(participants.filter(p => p.id !== participantId));
      loadData(); // Reload to update costs
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
            {formatDate(trip.startDate)} - {trip.nights} nuits - Budget: {formatMoney(trip.totalBudget)}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/trips/${trip.id}/edit`} className="btn btn-secondary">
            Modifier
          </Link>
          <Link to={`/trips/${trip.id}/participants/new`} className="btn btn-primary">
            + Ajouter Participant
          </Link>
          <Link to={`/trips/${trip.id}/meals/new`} className="btn btn-primary">
            + Ajouter Repas
          </Link>
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
              <h4>Budget Total</h4>
              <p className="stat-value">{formatMoney(trip.totalBudget)}</p>
            </div>
            <div className="stat-card">
              <h4>Coût par Nuit</h4>
              <p className="stat-value">{costs.cost_per_night ? formatMoney(costs.cost_per_night.toString()) : 'N/A'}</p>
            </div>
            <div className="stat-card">
              <h4>Nombre de Nuits</h4>
              <p className="stat-value">{trip.nights}</p>
            </div>
          </div>

          <h3>Coûts par Participant</h3>
          <div className="participants-costs">
            {costs.participants?.map((participant: any) => (
              <div key={participant.id} className="participant-cost-card">
                <h4>{participant.name}</h4>
                <div className="cost-details">
                  <p>Nuits présentes: <strong>{participant.nights_count}</strong></p>
                  <p>Coût total: <strong className="cost-total">{formatMoney(participant.total_cost.toString())}</strong></p>
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
          participants={participants}
          onParticipantsChange={loadData}
        />
      </div>

      {/* Participants List */}
      <div className="participants-section">
        <h2>👥 Participants ({participants.length})</h2>
        {participants.length === 0 ? (
          <p className="empty-state">Aucun participant pour le moment.</p>
        ) : (
          <div className="participants-grid">
            {participants.map(participant => (
              <div key={participant.id} className="participant-card">
                <h4>{participant.name}</h4>
                <p>Email: {participant.email || 'N/A'}</p>
                <p>Nuits présentes: {participant.nightsCount || 0}</p>
                <div className="participant-actions">
                  <Link to={`/participants/${participant.id}/edit`} className="btn btn-sm btn-secondary">
                    Modifier
                  </Link>
                  <button
                    onClick={() => participant.id && deleteParticipant(participant.id)}
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

      {/* Meals */}
      <div className="meals-section">
        <MealList tripId={trip.id} />
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
  return `${parseFloat(amount).toFixed(2)}€`;
};

export default TripDetails;
