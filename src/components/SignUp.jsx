import React, { useState } from "react";
import {
  checkDBUsers,
  getSupabaseAdmin,
  getSupabaseClient,
} from "../models/supabase";
import { Auth } from "@supabase/auth-ui-react";

// const supabase = getSupabaseClient();
const supabase = getSupabaseAdmin();

function SignUp() {
  const [isSendEmail, setSendEmail] = useState(false);

  const [buttonSignUp, setButtonSignUp] = useState({
    isDisable: false,
    text: "Sign Up",
  });

  const [error, setError] = useState({
    isError: false,
    message: "",
  });

  const [user, setUser] = useState({
    name: "",
    last_name: "",
    username: "",
    phone: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignUp = async () => {
    setButtonSignUp({ isDisable: true, text: "Loading..." });
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (!error) {
      const { userResponse } = await supabase.auth.updateUser({
        phone: user.phone,
      });

      const { errorInsert } = await supabase.from("users").insert({
        uid: data.user.id,
        name: user.name,
        last_name: user.last_name,
        fullname: user.name + " " + user.last_name,
        username: user.username,
        phone: user.phone,
      });

      if (!errorInsert) {
        setButtonSignUp({ isDisable: false, text: "Sign Up" });
        setSendEmail(true);
      }
    } else {
      setError({ isError: true, message: error.message });
      setButtonSignUp({ isDisable: false, text: "Sign Up" });
    }
  };

  const handleFocus = () => {
    setError({ isError: false, message: "" });
  };

  const validateData = () => {
    let isDataEmpty = false;
    for (const [key, value] of Object.entries(user)) {
      isDataEmpty = isDataEmpty || value.length == 0;
    }
    if (isDataEmpty) {
      setError({ isError: true, message: "Please fill all fields" });
      return false;
    }

    if (user.email !== user.confirmEmail) {
      setError({ isError: true, message: "E-mails don't match" });
      return false;
    }

    if (user.password !== user.confirmPassword) {
      setError({ isError: true, message: "Passwords don't match" });
      return false;
    }

    return true;
  };

  return (
    <>
      <div className="sign-up-container">
        {!isSendEmail ? (
          <>
            {error.isError && (
              <div className="sign-up-message-error">{error.message}</div>
            )}
            <input
              type="text"
              placeholder="Username"
              className="text-input"
              onFocus={(e) => {
                handleFocus();
              }}
              onChange={(e) => {
                setUser({ ...user, username: e.target.value });
              }}
            ></input>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "calc(100% + 0.6rem)",
              }}
            >
              <input
                style={{ marginRight: "5px" }}
                type="text"
                placeholder="Name"
                className="text-input"
                onFocus={(e) => {
                  handleFocus();
                }}
                onChange={(e) => {
                  setUser({ ...user, name: e.target.value });
                }}
              ></input>
              <input
                style={{ marginLeft: "5px" }}
                type="text"
                placeholder="Last names"
                className="text-input"
                onFocus={(e) => {
                  handleFocus();
                }}
                onChange={(e) => {
                  setUser({
                    ...user,
                    last_name: e.target.value,
                  });
                }}
              ></input>
            </div>
            <input
              type="tel"
              placeholder="Phone"
              className="text-input"
              onFocus={(e) => {
                handleFocus();
              }}
              onChange={(e) => {
                setUser({ ...user, phone: e.target.value });
              }}
            ></input>
            <input
              type="email"
              placeholder="E-mail"
              className="text-input"
              onFocus={(e) => {
                handleFocus();
              }}
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });
              }}
            ></input>
            <input
              type="email"
              placeholder="Confirm e-mail"
              className="text-input"
              onFocus={(e) => {
                handleFocus();
              }}
              onChange={(e) => {
                setUser({
                  ...user,
                  confirmEmail: e.target.value,
                });
              }}
            ></input>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "calc(100% + 0.6rem)",
              }}
            >
              <input
                style={{ marginRight: "5px" }}
                type="password"
                placeholder="Password"
                className="text-input"
                onFocus={(e) => {
                  handleFocus();
                }}
                onChange={(e) => {
                  setUser({
                    ...user,
                    password: e.target.value,
                  });
                }}
              ></input>
              <input
                style={{ marginLeft: "5px" }}
                type="password"
                placeholder="Confirm password"
                className="text-input"
                onFocus={(e) => {
                  handleFocus();
                }}
                onChange={(e) => {
                  setUser({
                    ...user,
                    confirmPassword: e.target.value,
                  });
                }}
              ></input>
            </div>
            <button
              className="button-1"
              disabled={buttonSignUp.isDisable}
              onClick={async (e) => {
                e.preventDefault();
                if (validateData()) {
                  handleSignUp();
                }
              }}
            >
              {buttonSignUp.text}
            </button>
          </>
        ) : (
          <>
            <div>Please confirm registration in the email sent</div>
          </>
        )}
      </div>
    </>
  );
}

export default SignUp;
