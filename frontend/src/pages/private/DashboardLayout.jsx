import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import styles from "./DashboardLayout.module.css"
export default function DashboardLayout() {
  return (
    <div>
        <Header/>
        <Sidebar/>
        <div style={{width:"100%", height:"100vh", backgroundColor:"#f5f5f5", marginLeft:"200px", marginTop:"50px"}}>
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
    roles: ["admin"]
  },
];

function Sidebar(){
    const userRole = JSON.parse(localStorage.getItem("user")).role;
    return(
        <div style={{width:"200px", height:"100vh", backgroundColor:"#f5f5f5", position:"fixed", top:"0", left:"0"}}>
            <h1>Sidebar</h1>
            {navItems.filter((item) => item.roles.includes(userRole)).map((item) => (
              <NavLink key={item.path} className={({isActive}) => isActive ? styles.active : ""} to={item.path}>{item.label}</NavLink>
            ))}
        </div>
    )
}

function Header(){
    return(
        <div style={{textAlign:"center", width:"100%", height:"50px", backgroundColor:"#f5f5f5", position:"fixed", top:"0", right:"0", marginLeft:"200px"}}>
            <h1>Header</h1>
        </div>
    )
}