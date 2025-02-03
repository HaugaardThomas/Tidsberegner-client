import React from "react";
import "./App.css";
import { HashRouter, Routes, Route } from 'react-router-dom';


// COMPONENTS
import Navbar from './components/Navbar';
import TimeRegistration from "./components/TimeRegistration";

// PAGES
import Home from './pages/Home';
import About from './pages/About';

const App = () => {

  return (
    <HashRouter>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<TimeRegistration />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </HashRouter>
  //   <div className="App">
  //   <TimeRegistration />
  // </div>
  )
}

export default App;