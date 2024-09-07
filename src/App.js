import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CityTable from './components/CityTable';
import WeatherPage from './components/WeatherPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CityTable />} />
        <Route path="/weather/:city/:lat/:lon" element={<WeatherPage />} />
      </Routes>
    </Router>
  );
};

export default App;
