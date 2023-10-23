import React from 'react'
import HomeNavBar from '../../components/Home-navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Imagine from './Pages/Imagine/Imagine'
import SocialContract from './Pages/SocialContract/SocialContract'
import Members from './Pages/Members/Members'
import Ido2020 from './Pages/IDO2020/Ido2020'

function Homepage() {
  return (
    <div className='home'>
      <div className='home-title'>AI Maker</div>
      <HomeNavBar/>
      <div className='home-content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/imagine' element={<Imagine/>} />
          <Route path='/ido2020' element={<Ido2020/>}/>
          <Route path='/social-contract' element={<SocialContract/>} />
          <Route path='/members' element={<Members/>} />
        </Routes>
      </div>
    </div>
  )
}

export default Homepage