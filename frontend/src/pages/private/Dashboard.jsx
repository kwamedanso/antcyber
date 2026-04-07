import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'

export default function Dashboard() {
  const {setAuth} = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  async function logout(){
    try {
     await axiosPrivate.get('/api/auth/logout', {withCredentials: true})
      localStorage.removeItem("user");
      setAuth({});
      navigate('/login', {replace: true})

    } catch (error) {
      console.log(error.response.data)
      localStorage.removeItem("user");
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setAuth({});
      navigate('/login', {replace: true})
    }
  }
  
  return (
    <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <Link to='/'><button className='border border-gray-300 rounded-md p-2'>Home</button></Link>
        <br />
        <Link to="/admin/users"><button className='border border-gray-300 rounded-md p-2'>Users</button></Link>
        <br />
        <br />
        <button className='border border-gray-300 rounded-md p-2' onClick={() => logout()}>Logout</button>
    </div>
  )
}
