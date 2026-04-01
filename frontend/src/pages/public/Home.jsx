import React, {useEffect} from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
export default function Home() {

async function checkServer() {
    try {
      const res = await axios.get("/api/health");
      console.log(res.data)

    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    checkServer()
  }, [])

  return (
    <div>
        <h1>Home Page</h1>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
        <br />
        <Link to="/dashboard"><button>Dashboard</button></Link>
    </div>
  )
}
