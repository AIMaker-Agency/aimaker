import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getSupabaseClient } from '../models/supabase';
import Modal from './Modal';
import SignIn from './SignIn';
import SignUp from './SignUp';

function HomeNavBar() {

  const supabase = getSupabaseClient();

  const [session, setSession] = useState(null);
  const [modal, setModal] = useState({
    isShowing: false,
    title: '',
    isSignIn: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if(session && session.user){
        setModal({...modal, isShowing: false});
      }
    }) 

    return () => subscription.unsubscribe()
  },[])

  return (
    <div className='home-navbar'>
      <div className='home-navbar-items'>
        <NavLink className={'home-navbar-item'} to={"./"} >Home</NavLink>
        <NavLink className={'home-navbar-item'} to={"./imagine"}>Imagine</NavLink>
        <NavLink className={'home-navbar-item'} to={"./ido2020"}>IDO 2020</NavLink>
        <NavLink className={'home-navbar-item'} to={"./social-contract"}>About social contract</NavLink>
        <NavLink className={'home-navbar-item'} to={"./members"}>Members</NavLink>
      </div>
      <div className='home-navbar-login-btns'>
        { !session ? <>
        <a className='home-navbar-item' onClick={e => {
          e.preventDefault();
          setModal({...modal, title: 'Sign in', isShowing: true, isSignIn: true});
        }}>Sign In</a>
        <a className='home-navbar-item' onClick={e => {e.preventDefault(); setModal({...modal, title: 'Sign up', isShowing: true, isSignIn: false});;}}>Sign Up</a></>
        :
        <>
        <a className='home-navbar-item' onClick={(e) => {
          e.preventDefault();
          supabase.auth.signOut();
        }}>Log out</a>
        </>}
      </div>
      {modal.isShowing ? 
      <Modal title={modal.title} handleShow={() => {setModal({...modal, isShowing: false})}}>
        {modal.isSignIn ? <SignIn/> : <SignUp/>}
      </Modal> : <></>}
    </div>
  )
}

export default HomeNavBar