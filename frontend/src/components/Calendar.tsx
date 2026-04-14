import { useEffect, useMemo, useRef, useState } from 'react';
import { type Trip, type ParticipantTripRead, participantTripService } from '../services/api';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarProps {
  trip: Trip;
  participantTrips: ParticipantTripRead[];
  onParticipantsChange: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ trip, participantTrips, onParticipantsChange }) => {
  const [updating, setUpdating] = useState<number | null>(null);

  // Local optimistic state: Map<ptId, Set<nightDate>>
  const [localNights, setLocalNights] = useState<Map<number, Set<string>>>(new Map());
  const prevIdsRef = useRef<string>('');

  // Build a key from current participantTrip ids to detect structural changes
  const currentIds = participantTrips.map((pt) => pt.id).join(',');

  // When participantTrips change structurally (add/remove), reset local state
  useEffect(() => {
    if (currentIds !== prevIdsRef.current) {
      prevIdsRef.current = currentIds;
      setLocalNights(new Map());
    }
  }, [currentIds]);

  // Merge server data with optimistic local overrides
  const resolvedNights = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const pt of participantTrips) {
      if (!pt.id) continue;
      const local = localNights.get(pt.id);
      map.set(pt.id, local ?? new Set(
        (pt.nightsPresent ?? []).filter((n): n is string => typeof n === 'string' && n.length > 0)
      ));
    }
    return map;
  }, [participantTrips, localNights]);

  const generateDates = (): { nightNumber: number; date: Date }[] => {
    if (!trip.startDate) return [];
    const startDate = new Date(trip.startDate);
    const dates: { nightNumber: number; date: Date }[] = [];

    for (let i = 0; i < trip.nights; i++) {
      dates.push({
        nightNumber: i + 1,
        date: addDays(startDate, i),
      });
    }
    return dates;
  };

  const toggleNight = async (pt: ParticipantTripRead, nightDate: string, isPresent: boolean) => {
    if (!pt.id) return;

    const serverNights = (pt.nightsPresent ?? []).filter((n): n is string => typeof n === 'string' && n.length > 0);
    const currentLocal = localNights.get(pt.id) ?? new Set(serverNights);
    const updated = isPresent
      ? new Set([...currentLocal].filter((n) => n !== nightDate))
      : new Set([...currentLocal, nightDate]);

    // Optimistic update
    setLocalNights((prev) => new Map(prev).set(pt.id, updated));
    setUpdating(pt.id);

    try {
      await participantTripService.update(pt.id, {
        participant: pt.participant?.id ? `/api/participants/${pt.participant.id}` : undefined,
        trip: trip.id ? `/api/trips/${trip.id}` : undefined,
        nightsPresent: [...updated],
      } as any);
      // Refresh parent data (costs, counts) in background — no visual disruption
      onParticipantsChange();
    } catch (error) {
      console.error('Error toggling night:', error);
      // Revert on error
      setLocalNights((prev) => {
        const next = new Map(prev);
        next.delete(pt.id);
        return next;
      });
    } finally {
      setUpdating(null);
    }
  };

  const dates = generateDates();

  const sortedParticipants = useMemo(
    () => [...participantTrips].sort((a, b) =>
      (a.participant?.name ?? '').localeCompare(b.participant?.name ?? '', 'fr')
    ),
    [participantTrips]
  );

  return (
    <div className="calendar">
      {participantTrips.length === 0 ? (
        <p className="empty-state">Ajoutez des participants pour voir le calendrier.</p>
      ) : (
        <div className="calendar-table-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="calendar-corner-cell"></th>
                {dates.map((date) => (
                  <th key={date.nightNumber} className="calendar-date-header">
                    <div className="night-number">Nuit {date.nightNumber}</div>
                    <div className="night-date">
                      {format(date.date, 'dd MMM', { locale: fr })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedParticipants.map((pt) => {
                const nightsPresent = resolvedNights.get(pt.id!) ?? new Set<string>();

                return (
                  <tr key={pt.id}>
                    <td className="calendar-participant-name">
                      {pt.participant?.name}
                    </td>
                    {dates.map((date) => {
                      const nightDate = format(date.date, 'yyyy-MM-dd');
                      const isPresent = nightsPresent.has(nightDate);
                      const isUpdating = updating === pt.id;
                      return (
                        <td key={date.nightNumber} className="calendar-cell">
                          <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={() => toggleNight(pt, nightDate, isPresent)}
                            disabled={isUpdating}
                            className="night-checkbox"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Calendar;
