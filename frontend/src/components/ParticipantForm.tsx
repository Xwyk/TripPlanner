import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { type TripReadCollection, tripService, participantService, participantTripService } from '../services/api';

const ParticipantForm: React.FC = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripReadCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    trip: '',
  });

  useEffect(() => {
    loadTrips();
  }, [tripId]);

  const loadTrips = async () => {
    try {
      const response = await tripService.getAll();
      const list = response?.['hydra:member'] || [];
      setTrips(list);
      if (tripId) {
        setFormData(prev => ({ ...prev, trip: `/api/trips/${tripId}` }));
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Créer le participant
      const participant = await participantService.create({
        name: formData.name,
        email: formData.email || null,
      } as any);

      if (!participant) throw new Error('Participant creation failed');

      // Lier au trip via ParticipantTrip
      const pt = (participant as any);
      await participantTripService.create({
        participant: pt['@id'] || `/api/participants/${pt.id}`,
        trip: formData.trip,
      } as any);

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

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="participant-form">
      <div className="form-header">
        <h2>Nouveau Participant</h2>
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
            {trips.map((trip: any) => (
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

        <div className="form-info">
          <p>Les nuits de présence pourront être définies via le calendrier après la création.</p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Créer le participant'}
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
