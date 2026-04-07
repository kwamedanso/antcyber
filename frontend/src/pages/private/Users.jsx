import React from 'react'
import { Link } from 'react-router-dom'

export default function Users() {
  return (
    <div>
        <h1>Users Page</h1>

        <br />
        <Link to="/admin/dashboard"><button className='border border-gray-300 rounded-md p-2'>Dashboard</button></Link>
        <Link to="/admin/users/create"><button className='border border-gray-300 rounded-md p-2'>Create User</button></Link>
        <ul>
            <li>User 1</li>
            <li>User 2</li>
            <li>User 3</li>
        </ul>
    </div>
  )
}
