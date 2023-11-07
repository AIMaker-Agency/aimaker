import React, { useState } from "react";
import SignIn from "../../components/SignIn";
import SignUp from "../../components/SignUp";

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <div>
        <h1>AIMaker</h1>
        <h3>Login</h3>
        <li>
          <ul
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(false);
            }}
          >
            Sign In
          </ul>
          <ul
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(true);
            }}
          >
            Sign Up
          </ul>
        </li>
        {isSignUp ? <SignUp /> : <SignIn />}
      </div>
    </>
  );
}

export default Login;
