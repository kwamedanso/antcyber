import React from 'react'
import {Link} from 'react-router-dom'

export default function CreateUser() {
  return (
    <div>
        <h1>Create User</h1>
        <form>
            <input type="text" placeholder="Name" className='border border-gray-300 rounded-md px-3 py-2' />
            <input type="email" placeholder="Email" className='border border-gray-300 rounded-md px-3 py-2' />
            <input type="password" placeholder="Password" className='border border-gray-300 rounded-md px-3 py-2' />
            <button type="submit">Create</button>
        </form>
        <br />
        <Link to="/admin/users"><button>Back</button></Link>
    </div>
  )
}
