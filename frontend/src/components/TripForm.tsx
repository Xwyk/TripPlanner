import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type TripRead, tripService } from '../services/api';

interface TripFormProps {
  trip?: TripRead;
}

const TripForm: React.FC<TripFormProps> = ({ trip }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: trip?.name || '',
    nights: trip?.nights || 1,
    cottageCost: trip?.cottageCost?.toString() || '',
    startDate: trip?.startDate || '',
    description: trip?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name,
        nights: formData.nights,
        cottageCost: formData.cottageCost === '' ? 0 : parseFloat(formData.cottageCost),
        startDate: formData.startDate || undefined,
        description: formData.description || null,
      };

      if (trip?.id) {
        await tripService.update(trip.id, payload);
      } else {
        await tripService.create(payload);
      }

      navigate('/trips');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du voyage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  return (
    <div className="trip-form">
      <div className="form-header">
        <h2>{trip?.id ? 'Modifier le Voyage' : 'Nouveau Voyage'}</h2>
        <Link to="/trips" className="btn btn-secondary">
          Retour
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du voyage *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nights">Nombre de nuits *</label>
            <input
              type="number"
              id="nights"
              name="nights"
              value={formData.nights}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cottageCost">Budget total (€) *</label>
            <input
              type="number"
              id="cottageCost"
              name="cottageCost"
              value={formData.cottageCost}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Date de début *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : trip?.id ? 'Mettre à jour' : 'Créer le voyage'}
          </button>
          <Link to="/trips" className="btn btn-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
