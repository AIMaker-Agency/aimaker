import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../models/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { useNavigate } from "react-router-dom";

const supabase = getSupabaseClient();

function SignIn() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    isError: false,
    message: "",
  });

  const handleFocus = () => {
    setError({ isError: false, message: "" });
  };

  const validateData = () => {
    if (user.email === "") {
      setError({ isError: true, message: "Please, enter your e-mail" });
      return false;
    }

    if (user.password === "") {
      setError({ isError: true, message: "Please, enter your password" });
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      // navigate('/avatars')
      setError({ isError: true, message: error.message });
    }
  };

  return (
    <>
      <div className="sign-in-container">
        {error.isError && (
          <div className="sign-in-message-error">{error.message}</div>
        )}
        <input
          type="email"
          placeholder="E-mail"
          className="text-input"
          onFocus={(e) => setError({ ...error, isError: false })}
          onChange={(e) => {
            setUser({ ...user, email: e.target.value });
          }}
        ></input>
        <input
          type="password"
          placeholder="Password"
          className="text-input"
          onFocus={(e) => setError({ ...error, isError: false })}
          onChange={(e) => {
            setUser({ ...user, password: e.target.value });
          }}
        ></input>
        <button
          className="button-1"
          onClick={(e) => {
            e.preventDefault();
            if (validateData()) {
              handleSignIn();
            }
          }}
        >
          Sign In
        </button>
      </div>
    </>
  );
}

export default SignIn;
