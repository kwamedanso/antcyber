import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from "./DashboardLayout.module.css"
import useAuth from '../../hooks/useAuth';


export default function DashboardLayout() {
  const {auth} = useAuth();
  return (
    <div>
        <Header/>
        <Sidebar/>
        <div style={{width:"100%", height:"100vh", backgroundColor:"#f5f5f5", marginLeft:"200px", marginTop:"50px", padding:"10px"}}>
        <Outlet/>
        </div>
    </div>
  )
}

const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    roles: ["administrator", "staff"]
  },
  {
    path: "/admin/users",
    label: "Users",
    roles: ["administrator"]
  },
];

function Sidebar(){
    const {auth} = useAuth();
    const userRole = auth?.user?.role;
    return(
        <div style={{width:"200px", height:"100vh", backgroundColor:"#f5f5f5", position:"fixed", top:"0", left:"0", borderRight:"1px solid #000000ff"}}>
            <h1>Sidebar</h1>
            {navItems.filter((item) => item.roles.includes(userRole)).map((item) => (
                <div key={item.label}>
                <NavLink className={({isActive}) => isActive ? styles.active : ""} to={item.path}>{item.label}</NavLink>
               
                </div>
            ))}
        </div>
    )
}

function Header(){
    return(
        <div style={{textAlign:"center", width:"100%", height:"50px", backgroundColor:"#f5f5f5", position:"fixed", top:"0", right:"0", marginLeft:"200px", borderBottom:"1px solid #000000ff", padding:"10px"}}>
            <h1>Header</h1>
        </div>
    )
}