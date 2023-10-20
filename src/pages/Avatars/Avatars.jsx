import React, { useEffect, useState } from 'react'
import {getSupabaseClient} from '../../models/supabase'
import CreateTalk from './components/CreateTalk';
import { useNavigate } from 'react-router-dom';

const supabase = getSupabaseClient()

function Avatars() {
    
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      }) 

      return () => subscription.unsubscribe()
    },[])

    return (<>
      <button onClick={(e) => {e.preventDefault(); supabase.auth.signOut(); navigate('../login')}}>Quit</button>
      {<CreateTalk user={session ? session.user : null}/>}
    </>)
}

export default Avatars