import React from 'react';
import { Link } from 'react-router-dom';
import {usePrivateQuery} from '../../hooks/usePrivateQuery';
import Loader from '../../components/loader/Loader';
export default function Users() {
  const {data, isLoading, isError} = usePrivateQuery(["users"], "/users");

  console.log(data)
  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return <div>Error</div>
  }

  return (
    <div>
        <h1>Users Page</h1>

        <br />
        <Link to="/admin/dashboard"><button className='border border-gray-300 rounded-md p-2'>Dashboard</button></Link>
        <Link to="/admin/users/create"><button className='border border-gray-300 rounded-md p-2'>Create User</button></Link>
        <div className='flex flex-col gap-2'>
            {data?.users?.map((user) => (
                <div key={user.id}>
                  <p>{user.name}</p>
                  <p>{user.role}</p>
                  <p>{user.id}</p>
                </div>
            ))}
        </div>
    </div>
  )
}
