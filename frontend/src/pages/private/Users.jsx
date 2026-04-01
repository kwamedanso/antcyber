import React from 'react'
import { Link } from 'react-router-dom'

export default function Users() {
  return (
    <div>
        <h1>Users Page</h1>

        <br />
        <Link to="/dashboard"><button>Dashboard</button></Link>
        <ul>
            <li>User 1</li>
            <li>User 2</li>
            <li>User 3</li>
        </ul>
    </div>
  )
}
