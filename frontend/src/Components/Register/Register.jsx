import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css'

const Register = () => {


  // state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');
  const [error, setError] = useState(''); 


  // navigate route
  const navigate = useNavigate();

  const LoginPage = () => {
      navigate("/login");
  };


  // handle register submit form
  const handleSubmit = async (e) => {

    e.preventDefault();

    // Frontend validation: Check if any fields are empty
    if (!username || !email || !password || !confPassword) {
      setMessage('All input is required');
      setMessageColor('red');
      return; // Stop further execution if any field is empty
    }

    // Check if password and confirm password match
    if (password !== confPassword) {
      setError('Passwords do not match!');
      setMessage('Passwords do not match');
      setMessageColor('red');
      return; 
    }

    try {
      console.log('tt');
      const response = await axios.post('http://localhost:5000/api/register', { username, email, password });
      console.log(response.data);
      setMessage(response.data.message);

      if (response.data.message === 'Your registration already successfully') {
        setMessageColor('#1fc035');
        navigate('/register');
      } else if (response.data.message === 'Email already exists. Try logging in.') {
          setMessageColor('red');
          navigate('/register');
      } 

    } catch (error) {
      console.error(error);
      setError('Failed to register. Please try again.');
    }
  };

  
  // user interface
  return (
    <div className="register-container">
      <h1>Register</h1>
      <p>Already have an account? <span className='login-link' onClick={LoginPage}>Login</span></p>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {message && <p style={{color: messageColor, fontSize: "8pt", marginTop: "8px"}}>{message}</p>}
    </div>
  );
};

export default Register;