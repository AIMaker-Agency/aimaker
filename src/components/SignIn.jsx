import React, { useEffect, useState } from 'react'
import { getSupabaseClient } from '../models/supabase';
import { Auth } from '@supabase/auth-ui-react'
import { useNavigate } from 'react-router-dom';

const supabase = getSupabaseClient();

function SignIn() {

    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        })

        if(!error){
            // navigate('/avatars')
        }
    }

    return (
        <>
        <div>
            <input type='email' placeholder='E-mail' onChange={(e) => {setUser({...user, email: e.target.value})}}></input>
            <input type='password' placeholder='Password' onChange={(e) => {setUser({...user, password: e.target.value})}}></input>
            <button onClick={(e) => {
                e.preventDefault();
                handleSignIn();
            }}>Sign In</button>
        </div>
        </>
    )
}

export default SignIn