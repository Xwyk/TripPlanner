import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import TripDetails from './components/TripDetails';
import ParticipantForm from './components/ParticipantForm';
import MealList from './components/MealList';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1>🏕️ TripPlanner</h1>
            <p>Planifiez vos voyages, gérez les budgets et les repas</p>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Navigate to="/trips" replace />} />
              <Route path="/trips" element={<TripList />} />
              <Route path="/trips/new" element={<TripForm />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/trips/:id/edit" element={<TripForm />} />
              <Route path="/trips/:tripId/participants/new" element={<ParticipantForm />} />
              <Route path="/participants/:id/edit" element={<ParticipantForm />} />
              <Route path="/meals" element={<MealList />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>TripPlanner © 2026 - Planifiez vos aventures!</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
