import React, { useState } from 'react';
import type { Trip, Participant } from '../types/api';
import { participantService } from '../services/api';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarProps {
  trip: Trip;
  participants: Participant[];
  onParticipantsChange: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ trip, participants, onParticipantsChange }) => {
  const [updating, setUpdating] = useState<number | null>(null);

  const generateDates = () => {
    const dates = [];
    const startDate = new Date(trip.startDate);

    for (let i = 0; i < trip.nights; i++) {
      dates.push({
        nightNumber: i + 1,
        date: addDays(startDate, i),
      });
    }
    return dates;
  };

  const toggleNight = async (participantId: number, nightNumber: number, isPresent: boolean) => {
    try {
      setUpdating(nightNumber);
      if (isPresent) {
        await participantService.removeNight(participantId, nightNumber);
      } else {
        await participantService.addNight(participantId, nightNumber);
      }
      onParticipantsChange();
    } catch (error) {
      console.error('Error toggling night:', error);
      alert('Erreur lors de la mise à jour de la présence');
    } finally {
      setUpdating(null);
    }
  };

  const dates = generateDates();

  const getNightsPresent = (participant: Participant): number[] => {
    return participant.nightsPresent || [];
  };

  return (
    <div className="calendar">
      <div className="calendar-grid">
        {/* Header row */}
        <div className="calendar-header-cell"></div>
        {dates.map((date) => (
          <div key={date.nightNumber} className="calendar-date-header">
            <div className="night-number">Nuit {date.nightNumber}</div>
            <div className="night-date">
              {format(date.date, 'dd MMM', { locale: fr })}
            </div>
          </div>
        ))}

        {/* Participant rows */}
        {participants.map((participant) => {
          const nightsPresent = getNightsPresent(participant);

          return (
            <React.Fragment key={participant.id}>
              <div className="calendar-participant-name">
                {participant.name}
              </div>
              {dates.map((date) => {
                const isPresent = nightsPresent.includes(date.nightNumber);
                const isUpdating = updating === date.nightNumber;

                return (
                  <div key={date.nightNumber} className="calendar-cell">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() =>
                        participant.id && toggleNight(participant.id, date.nightNumber, isPresent)
                      }
                      disabled={isUpdating}
                      className="night-checkbox"
                    />
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {participants.length === 0 && (
        <p className="empty-state">Ajoutez des participants pour voir le calendrier.</p>
      )}
    </div>
  );
};

export default Calendar;
