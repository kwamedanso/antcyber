import React from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

export default function Register() {

let name = "Kwame";
let email = "kwame@gmail.com";
let password = "Kwame@123$$";
let role = "administrator";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role
      });
      console.log(response.data.message);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };
  return (
    <div>
        <h1>Register Page</h1>
        <Link to="/"><button>Home</button></Link>
        <button onClick={handleRegister}>Register</button>
        {/* <p>{message}</p> */}
    </div>
  )
}
