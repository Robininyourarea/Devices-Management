import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css'

import axios from 'axios';

const Login = ({ updateAuthStatus }) => {

  // state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');


  // navigate route
  const navigate = useNavigate();

  const RegisterPage = () => {
    navigate("/register");
  };


  // handle login submit form
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      // console.log('0')
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      console.log(response.data.message)
      setMessage(response.data.message);
      
      console.log(message);
      if (response.data.message === 'Login successful') {
        // set token into localstorage
        // console.log('1')
        localStorage.setItem('token', response.data.accessToken);
        // Update authentication status
        updateAuthStatus();
        navigate('/devices');
      } else if (response.data.message === 'Incorrect password') {
          setMessage('Incorrect password');
          navigate('/login');
      } else if (response.data.message === 'This username not registered') {
          setMessage('This username not registered');
          navigate('/login');
      }

    } catch (error) {
      // console.log('1');
      setMessage('Login failed. Please try again.');
    }
  };


  // user interface
  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>
        Don't have an account?{' '}
        <span className="register" onClick={RegisterPage}>
          Sign Up
        </span>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
  
      {message && <p style={{color: "red", fontSize: "8pt", marginTop: "8px"}}>{message}</p>}
  
    </div>
  );
};

export default Login;