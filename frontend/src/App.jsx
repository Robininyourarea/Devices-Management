import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import Register from './Components/Register/Register.jsx';
import Login from './Components/Login/Login.jsx';
import Devices from './Components/Devices/Devices.jsx';

function App() {
  const [isAuthen, setIsAuthen] = useState(false);

  // token authenticate function
  const isAuthenticated = () => {
    // retrieve token from localstorage
    const token = localStorage.getItem('token');
    console.log("Token:", token);

    // check token exist or not
    if (!token) return false;
  
    try {
      // decode token
      const { exp } = jwtDecode(token);
      const expirationDate = new Date(exp * 1000); // Convert to milliseconds
      const currentDate = new Date(Date.now());
      console.log("Token expiration date:", expirationDate.toString());
      console.log("Date now:", currentDate.toString());

      // check token expire
      if (exp * 1000 < Date.now()) {
        console.log("Token has expired");
        localStorage.removeItem('token'); // Remove expired token
        return false;
      }

      // token valid
      console.log("Token is valid");
      return true;
    } catch (error) {
      console.log("Error decoding token:", error);
      return false;
    }
  };

  // Function to update authentication status
  const updateAuthStatus = () => {
    setIsAuthen(isAuthenticated());
  };

  useEffect(() => {
    // Check authentication status on component mount
    updateAuthStatus();
  }, []); // Run only on component mount

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login updateAuthStatus={updateAuthStatus} />} />

          {/* Protected Route */}
          <Route 
            path="/devices" 
            element={
              isAuthen ? <Devices /> : <Navigate to="/login" />
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;