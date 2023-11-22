import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getSupabaseClient } from "../models/supabase";
import Modal from "./Modal";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import MenuItem from "./MenuItem";
import { MdOutlineMenu } from "react-icons/md";
import { FaUser } from "react-icons/fa";

function HomeNavBar() {
  const supabase = getSupabaseClient();

  const [session, setSession] = useState(null);
  const [menuLoginVisible, setMenuLoginVisible] = useState(false);
  const [menuItemsVisible, setMenuItemsVisible] = useState(false);
  const [modal, setModal] = useState({
    isShowing: false,
    title: "",
    isSignIn: true,
  });

  const MenuItems = [
    {
      url: "./",
      title: "Home",
    },
    {
      url: "./imagine",
      title: "Imagine",
    },
    {
      url: "./ido2020",
      title: "IDO 2020",
    },
    // {
    //   url: './social-contract', title: 'About social contract',
    // },
    {
      url: "./members",
      title: "Members",
    },
    {
      url: "./",
      title: "Demos",
      submenu: [
        {
          url: "../avatars",
          title: "Avatars",
        },
      ],
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && session.user) {
        setModal({ ...modal, isShowing: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="home-navbar">
      <div className="home-navbar-items">
        {window.innerWidth <= 686 ? (
          <div className="home-navbar-item">
            <div className="home-navbar-dropdown">
              <div
                className="home-navbar-dropdown-title"
                onClick={(e) => setMenuItemsVisible(!menuItemsVisible)}
              >
                <MdOutlineMenu />
                <div>Menu</div>
              </div>
              {menuItemsVisible ? (
                <div className="home-navbar-dropdown-menu">
                  {MenuItems &&
                    MenuItems.map((item, index) => (
                      <MenuItem key={"menu-item-" + index} item={item} />
                    ))}
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <>
            {MenuItems &&
              MenuItems.map((item, index) => (
                <MenuItem key={"menu-item-" + index} item={item} />
              ))}
          </>
        )}
      </div>
      <div className="home-navbar-login-btns">
        {window.innerWidth <= 836 ? (
          <div
            className="home-navbar-item"
            onClick={(e) => setMenuLoginVisible(!menuLoginVisible)}
          >
            <div className="home-navbar-dropdown">
              <div className="home-navbar-dropdown-title">
                <div>
                  <FaUser />
                </div>
              </div>
              {menuLoginVisible ? (
                <>
                  <ul className="home-navbar-dropdown-menu-icon">
                    {!session ? (
                      <>
                        <li>
                          <a
                            className="home-navbar-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setModal({
                                ...modal,
                                title: "Sign in",
                                isShowing: true,
                                isSignIn: true,
                              });
                            }}
                          >
                            Sign In
                          </a>
                        </li>
                        <li>
                          <a
                            className="home-navbar-item"
                            onClick={(e) => {
                              e.preventDefault();
                              setModal({
                                ...modal,
                                title: "Sign up",
                                isShowing: true,
                                isSignIn: false,
                              });
                            }}
                          >
                            Sign Up
                          </a>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <a
                            className="home-navbar-item"
                            onClick={(e) => {
                              e.preventDefault();
                              supabase.auth.signOut();
                            }}
                          >
                            Log out
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <>
            {!session ? (
              <>
                <a
                  className="home-navbar-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setModal({
                      ...modal,
                      title: "Sign in",
                      isShowing: true,
                      isSignIn: true,
                    });
                  }}
                >
                  Sign In
                </a>
                <a
                  className="home-navbar-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setModal({
                      ...modal,
                      title: "Sign up",
                      isShowing: true,
                      isSignIn: false,
                    });
                  }}
                >
                  Sign Up
                </a>
              </>
            ) : (
              <>
                <a
                  className="home-navbar-item"
                  onClick={(e) => {
                    e.preventDefault();
                    supabase.auth.signOut();
                  }}
                >
                  Log out
                </a>
              </>
            )}
          </>
        )}
      </div>
      {modal.isShowing ? (
        <Modal
          title={modal.title}
          handleShow={() => {
            setModal({ ...modal, isShowing: false });
          }}
        >
          {modal.isSignIn ? <SignIn /> : <SignUp />}
        </Modal>
      ) : (
        <></>
      )}
    </div>
  );
}

export default HomeNavBar;
