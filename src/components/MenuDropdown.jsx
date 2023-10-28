import React from 'react'
import { NavLink } from 'react-router-dom'

function MenuDropdown({submenu}) {
  return (
    <>
    <ul className='home-navbar-dropdown-menu'>
        {submenu.map((item, index) => <li key={'dropdown-item-'+index}><NavLink className={'home-navbar-item'} to={item.url}>{item.title}</NavLink></li>)}
    </ul>
    </>
  )
}

export default MenuDropdown