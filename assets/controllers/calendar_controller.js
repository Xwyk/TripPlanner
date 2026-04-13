import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['calendar', 'participantSelect', 'nightToggle'];
    static values = {
        tripId: Number,
        nights: Number,
        apiBaseUrl: String
    };

    connect() {
        this.renderCalendar();
    }

    renderCalendar() {
        if (!this.hasCalendarTarget) return;

        const startDate = new Date(this.element.dataset.startDate);
        const nights = this.nightsValue;

        let calendarHTML = '<div class="calendar-grid">';

        // Header avec les dates
        calendarHTML += '<div class="calendar-header"></div>'; // Case vide pour le coin
        for (let i = 1; i <= nights; i++) {
            const nightDate = new Date(startDate);
            nightDate.setDate(startDate.getDate() + i - 1);
            calendarHTML += `
                <div class="calendar-night-header">
                    <div>Nuit ${i}</div>
                    <div class="night-date">${nightDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
                </div>
            `;
        }

        // Récupérer les participants et les afficher
        this.loadParticipants(calendarHTML);
    }

    async loadParticipants(calendarHTML) {
        try {
            const response = await fetch(`${this.apiBaseUrlValue}/participants?trip=${this.tripIdValue}`);
            const participants = await response.json();

            participants.forEach(participant => {
                calendarHTML += this.renderParticipantRow(participant);
            });

            calendarHTML += '</div>';
            this.calendarTarget.innerHTML = calendarHTML;
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    }

    renderParticipantRow(participant) {
        let row = `
            <div class="calendar-participant-row">
                <div class="participant-name">${participant.name}</div>
        `;

        for (let i = 1; i <= this.nightsValue; i++) {
            const isPresent = (participant.nightsPresent || []).includes(i);
            row += `
                <div class="night-cell">
                    <input
                        type="checkbox"
                        data-participant-id="${participant.id}"
                        data-night-number="${i}"
                        ${isPresent ? 'checked' : ''}
                        data-action="change->calendar#toggleNight"
                    >
                </div>
            `;
        }

        row += '</div>';
        return row;
    }

    async toggleNight(event) {
        const participantId = event.target.dataset.participantId;
        const nightNumber = parseInt(event.target.dataset.nightNumber);
        const isChecked = event.target.checked;

        try {
            const method = isChecked ? 'POST' : 'DELETE';
            await fetch(`${this.apiBaseUrlValue}/participants/${participantId}/nights/${nightNumber}`, {
                method: method
            });
        } catch (error) {
            console.error('Error toggling night:', error);
            event.target.checked = !isChecked; // Revert on error
        }
    }

    get startDate() {
        return new Date(this.element.dataset.startDate);
    }
}
