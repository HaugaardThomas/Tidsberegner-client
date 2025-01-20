import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// COMPONENTS
import Navbar from './components/Navbar';
import TimeRegistration from "./components/TimeRegistration";

// PAGES
import Home from './pages/Home';
import About from './pages/About';

const App = () => {

  return (
    // <Router>
    //   <Navbar />
    //   <div className="app-container">
    //     <Routes>
    //       <Route exact path="/" element={<Home />} />
    //       <Route path="/about" element={<About />} />
    //     </Routes>
    //   </div>
    // </Router>
    <div className="App">
    <TimeRegistration />
  </div>
  )
}

export default App;