import React from 'react'
import {Link} from 'react-router-dom'

export default function CreateUser() {
  return (
    <div>
        <h1>Create User</h1>
        <form>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit">Create</button>
        </form>
        <br />
        <Link to="/admin/users"><button>Back</button></Link>
    </div>
  )
}
