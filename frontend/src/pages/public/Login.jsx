import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import {useNavigate, useLocation} from 'react-router-dom'
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

const {auth, setAuth} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

useEffect(() => {
if(auth?.accessToken){
  navigate(from);
}
}, [auth.accessToken, navigate, from]);

async function handleLogin(e) {
  e.preventDefault();

  try {
    const response = await axios.post('/api/auth/login', {
      email: email,
      password: password,
      rememberMe: rememberMe
    }
  );

  const responseData = response.data;

  localStorage.setItem("user", JSON.stringify(responseData.user))

  // Successful login flow
  setAuth({ accessToken: responseData.accessToken });

    navigate(from);
  } catch (error) {
    console.log(error.response.data);
    if(axios.isAxiosError(error) && error.response){
      const errorMessage = error.response.data.message || "Login failed";
      console.log(errorMessage);
    }
  }
}

  return (
    <div>
        <h1>Login Page</h1>
        <Link to="/"><button>Home</button></Link>

        <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/>
            <button type="submit">Login</button>
        </form>
    </div>
  )
}
