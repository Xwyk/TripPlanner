import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['mealsList', 'mealForm', 'ingredientsList'];
    static values = { tripId: Number, apiBaseUrl: String };

    connect() {
        this.loadMeals();
    }

    async loadMeals() {
        try {
            const response = await fetch(`${this.apiBaseUrlValue}/meals?trip=${this.tripIdValue}`);
            const meals = await response.json();
            this.renderMeals(meals);
        } catch (error) {
            console.error('Error loading meals:', error);
        }
    }

    renderMeals(meals) {
        if (!this.hasMealsListTarget) return;

        this.mealsListTarget.innerHTML = meals.map(meal => `
            <div class="meal-card">
                <h3>${meal.name}</h3>
                <p>Date: ${meal.date}</p>
                <p>Type: ${this.translateMealType(meal.mealType)}</p>
                <p>Portions: ${meal.numberOfPortions}</p>
                <p>Coût estimé: ${meal.estimatedCost}€</p>
                <button data-action="click->meal#showIngredients" data-meal-id="${meal.id}">
                    Voir ingrédients
                </button>
            </div>
        `).join('');
    }

    async showIngredients(event) {
        const mealId = event.target.dataset.mealId;
        try {
            const response = await fetch(`${this.apiBaseUrlValue}/meals/${mealId}/ingredients`);
            const data = await response.json();
            this.renderIngredients(data);
        } catch (error) {
            console.error('Error loading ingredients:', error);
        }
    }

    renderIngredients(data) {
        if (!this.hasIngredientsListTarget) return;

        const ingredientsHTML = data.ingredients.map(ing => `
            <div class="ingredient-item">
                <span class="ingredient-name">${ing.name}</span>
                <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
            </div>
        `).join('');

        this.ingredientsListTarget.innerHTML = `
            <div class="ingredients-panel">
                <h3>Ingrédients pour ${data.meal_name}</h3>
                <p>Nombre de portions: ${data.number_of_portions}</p>
                <p>Coût par portion: ${data.cost_per_portion.toFixed(2)}€</p>
                <div class="ingredients-list">
                    ${ingredientsHTML}
                </div>
            </div>
        `;
    }

    async createMeal(event) {
        event.preventDefault();

        const formData = new FormData(this.mealFormTarget);
        const mealData = {
            name: formData.get('name'),
            mealType: formData.get('mealType'),
            date: formData.get('date'),
            numberOfPortions: parseInt(formData.get('numberOfPortions')),
            estimatedCost: formData.get('estimatedCost'),
            trip: `/api/trips/${this.tripIdValue}`
        };

        try {
            const response = await fetch(`${this.apiBaseUrlValue}/meals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealData)
            });

            if (response.ok) {
                this.mealFormTarget.reset();
                this.loadMeals();
            }
        } catch (error) {
            console.error('Error creating meal:', error);
        }
    }

    translateMealType(type) {
        const translations = {
            'breakfast': 'Petit-déjeuner',
            'lunch': 'Déjeuner',
            'dinner': 'Dîner',
            'snack': 'En-cas'
        };
        return translations[type] || type;
    }
}
