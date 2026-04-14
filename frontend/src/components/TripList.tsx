import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type TripReadCollection, tripService } from '../services/api';

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<TripReadCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAll();
      setTrips(response['hydra:member'] || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des voyages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?')) {
      return;
    }

    try {
      await tripService.delete(id);
      setTrips(trips.filter(trip => trip.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du voyage');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="trip-list">
      <div className="trip-list-header">
        <h2>Mes Voyages</h2>
        <Link to="/trips/new" className="btn btn-primary">
          + Nouveau Voyage
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state">
          <p>Aucun voyage pour le moment.</p>
          <p>Créez votre premier voyage pour commencer !</p>
        </div>
      ) : (
        <div className="trip-cards">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <h3>{trip.name}</h3>
              <div className="trip-info">
                <p><strong>Dates:</strong> {trip.startDate ? formatDate(trip.startDate) : 'N/A'} ({trip.nights} nuits)</p>
                <p><strong>Budget:</strong> {formatMoney(trip.cottageCost?.toString() ?? '0')}</p>
              </div>
              <div className="trip-actions">
                <Link to={`/trips/${trip.id}`} className="btn btn-secondary">
                  Voir détails
                </Link>
                <Link to={`/trips/${trip.id}/edit`} className="btn btn-secondary">
                  Modifier
                </Link>
                <button
                  onClick={() => trip.id && deleteTrip(trip.id)}
                  className="btn btn-danger"
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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatMoney = (amount: string): string => {
  return `${parseFloat(amount).toFixed(2)}€`;
};

export default TripList;
