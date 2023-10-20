import React, { useState } from 'react'
import { getSupabaseClient } from '../models/supabase';
import { Auth } from '@supabase/auth-ui-react'

const supabase = getSupabaseClient();

function SignUp() {
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const handleSignUp = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        })

        console.log("Data: "+JSON.stringify(data)+"\nError:"+JSON.stringify(error));
    }

    return (
        <>
        <div>
            <input type='email' placeholder='E-mail' onChange={(e) => {setUser({...user, email: e.target.value})}}></input>
            <input type='password' placeholder='Password' onChange={(e) => {setUser({...user, password: e.target.value})}}></input>
            <button onClick={(e) => {
                e.preventDefault();
                handleSignUp();
            }}>Sign Up</button>
        </div>
        </>
    )
}

export default SignUp