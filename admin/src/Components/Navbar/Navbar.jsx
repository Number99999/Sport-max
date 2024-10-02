import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import avatar_admin from '../../assets/avt_admin.png'

export const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img className="nav-logo__img" src={logo} alt="" />
        <div className='nav__wrap-brand'>
          <p className='nav__brand-name'>
            SPORT MAX
          </p>
          <p className='nav__brand-name-rule'>Quản trị viên</p>
        </div>
      </div>
      <img className="nav-Profile" src={avatar_admin} alt="" />
    </div>
  )
}

export default Navbar;  
