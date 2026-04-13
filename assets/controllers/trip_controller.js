import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['tripsList', 'tripForm', 'tripDetails'];
    static values = { apiBaseUrl: String };

    connect() {
        this.loadTrips();
    }

    async loadTrips() {
        try {
            const response = await fetch(`${this.apiBaseUrlValue}/trips`);
            const trips = await response.json();
            this.renderTrips(trips);
        } catch (error) {
            console.error('Error loading trips:', error);
        }
    }

    renderTrips(trips) {
        if (!this.hasTripsListTarget) return;

        this.tripsListTarget.innerHTML = trips.map(trip => `
            <div class="trip-card" data-trip-id="${trip.id}">
                <h3>${trip.name}</h3>
                <p>Dates: ${trip.startDate} (${trip.nights} nuits)</p>
                <p>Budget: ${trip.totalBudget}€</p>
                <button data-action="click->trip#showTrip" data-trip-id="${trip.id}">
                    Voir détails
                </button>
            </div>
        `).join('');
    }

    async showTrip(event) {
        const tripId = event.target.dataset.tripId;
        try {
            const response = await fetch(`${this.apiBaseUrlValue}/trips/${tripId}`);
            const trip = await response.json();

            // Load costs
            const costsResponse = await fetch(`${this.apiBaseUrlValue}/trips/${tripId}/costs`);
            const costs = await costsResponse.json();

            this.renderTripDetails(trip, costs);
        } catch (error) {
            console.error('Error loading trip details:', error);
        }
    }

    renderTripDetails(trip, costs) {
        if (!this.hasTripDetailsTarget) return;

        const participantsList = costs.participants.map(p => `
            <div class="participant-cost">
                <h4>${p.name}</h4>
                <p>Nuits présentes: ${p.nights_count}</p>
                <p>Coût total: ${p.total_cost.toFixed(2)}€</p>
            </div>
        `).join('');

        this.tripDetailsTarget.innerHTML = `
            <div class="trip-details">
                <h2>${trip.name}</h2>
                <p>Budget total: ${trip.totalBudget}€</p>
                <p>Coût par nuit: ${costs.cost_per_night.toFixed(2)}€</p>
                <h3>Coûts par participant</h3>
                <div class="participants-costs">
                    ${participantsList}
                </div>
            </div>
        `;
    }

    async createTrip(event) {
        event.preventDefault();

        const formData = new FormData(this.tripFormTarget);
        const tripData = {
            name: formData.get('name'),
            nights: parseInt(formData.get('nights')),
            totalBudget: formData.get('totalBudget'),
            startDate: formData.get('startDate'),
            description: formData.get('description')
        };

        try {
            const response = await fetch(`${this.apiBaseUrlValue}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tripData)
            });

            if (response.ok) {
                this.tripFormTarget.reset();
                this.loadTrips();
            }
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    }
}
