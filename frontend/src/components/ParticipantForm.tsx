import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Trip } from '../types/api';
import { tripService, participantService } from '../services/api';

const ParticipantForm: React.FC = () => {
  const { tripId, participantId } = useParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    arrivalDate: '',
    departureDate: '',
    nightsPresent: [] as number[],
    trip: '',
  });

  useEffect(() => {
    loadTrips();
    if (participantId) {
      loadParticipant(parseInt(participantId));
    }
  }, [participantId, tripId]);

  const loadTrips = async () => {
    try {
      const response = await tripService.getAll();
      setTrips(response['hydra:member'] || []);

      if (tripId) {
        setFormData(prev => ({ ...prev, trip: `/api/trips/${tripId}` }));
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    }
  };

  const loadParticipant = async (id: number) => {
    try {
      setLoading(true);
      const data = await participantService.getById(id);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        arrivalDate: data.arrivalDate || '',
        departureDate: data.departureDate || '',
        nightsPresent: data.nightsPresent || [],
        trip: typeof data.trip === 'string' ? data.trip : data.trip?.['@id'] || '',
      });
    } catch (err) {
      setError('Erreur lors du chargement du participant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (participantId) {
        await participantService.update(parseInt(participantId), formData);
      } else {
        await participantService.create(formData);
      }

      navigate(formData.trip ? `/trips/${formData.trip.split('/').pop()}` : '/trips');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du participant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && participantId) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="participant-form">
      <div className="form-header">
        <h2>{participantId ? 'Modifier le Participant' : 'Nouveau Participant'}</h2>
        <Link to={tripId ? `/trips/${tripId}` : '/trips'} className="btn btn-secondary">
          Retour
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="trip">Voyage *</label>
          <select
            id="trip"
            name="trip"
            value={formData.trip}
            onChange={handleChange}
            required
            disabled={!!tripId}
          >
            <option value="">Sélectionnez un voyage</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip['@id']}>
                {trip.name} - {trip.startDate}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Nom *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="arrivalDate">Date d'arrivée</label>
            <input
              type="date"
              id="arrivalDate"
              name="arrivalDate"
              value={formData.arrivalDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="departureDate">Date de départ</label>
            <input
              type="date"
              id="departureDate"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-info">
          <p>ℹ️ Les nuits de présence pourront être définies via le calendrier après la création.</p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : participantId ? 'Mettre à jour' : 'Créer le participant'}
          </button>
          <Link to={tripId ? `/trips/${tripId}` : '/trips'} className="btn btn-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ParticipantForm;
