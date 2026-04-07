import React from 'react'

export default function Settings() {
  return (
    <div>
        <h1>Settings</h1>

        <form action="">
            <label htmlFor="password">Password</label>
            <input className='border border-gray-300 rounded-md p-2' type="password" id="password" name="password" />
            <button className='border border-gray-300 rounded-md p-2' type="submit">Update Password</button>
        </form>
    </div>
  )
}
