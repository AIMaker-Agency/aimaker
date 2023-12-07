import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../models/supabase";
import Modal from "./Modal";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import MenuItem from "./MenuItem";
import styled from "styled-components";

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
      url: "/home/",
      title: "Home",
    },
    {
      url: "/home/imagine",
      title: "Imagine",
    },
    {
      url: "/home/ido2020",
      title: "IDO 2020",
    },
    // {
    //   url: './social-contract', title: 'About social contract',
    // },
    {
      url: "/home/members",
      title: "Members",
    },
    {
      url: "/home/",
      title: "Demos",
      submenu: [
        {
          url: "/avatars",
          title: "Avatars",
        },
        {
          url: "/chat",
          title: "Chat with AI Maker",
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

  const handleVisibilityMenu = () => {
    setMenuItemsVisible(!menuItemsVisible);
  };

  return (
    <NavBar>
      <div className="home-navbar">
        <div
          className="button-burguer"
          onClick={(e) => {
            e.preventDefault();
            setMenuItemsVisible(!menuItemsVisible);
          }}
        >
          <input id="menu-toggle" type="checkbox" />
          <label className="menu-button-container" htmlFor="menu-toggle">
            <div className="menu-button"></div>
          </label>
        </div>
        <div
          className={`home-navbar-items ${menuItemsVisible ? "active" : ""}`}
        >
          {MenuItems &&
            MenuItems.map((item, index) => (
              <MenuItem
                key={"menu-item-" + index}
                onClick={handleVisibilityMenu}
                item={item}
              />
            ))}
        </div>
      </div>
      <div className="home-navbar-login-btns">
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
    </NavBar>
  );
}

export default HomeNavBar;

const NavBar = styled.nav`
  background-color: #eeeeee;
  width: 80%;
  padding: 0px 2rem;
  box-sizing: border-box;
  margin: 1rem 0px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  height: 3.2rem;

  .home-navbar,
  .home-navbar-login-btns {
    display: flex;
    flex: 1;
    align-items: center;
    position: relative;
    list-style: none;

    .home-navbar-items {
      display: flex;
      height: 3.1rem;

      @media (max-width: 768px) {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 3rem;
        background-color: #eee;
        &.active {
          display: flex;
        }
      }
    }

    .button-burguer {
      @media (min-width: 768px) {
        display: none;
      }
    }

    .home-navbar-item {
      @media (min-width: 768px) {
        width: max-content;
      }
    }

    .home-navbar-item,
    .button-burguer {
      padding: 1rem;
      text-decoration: none;
      font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
      color: #222222;
      font-weight: bold;
      background-color: #eee;

      .home-navbar-dropdown-title {
        display: flex;
        column-gap: 2px;

        .home-navbar-dropdown-icon {
          margin-top: 2px;

          @media (max-width: 768px) {
            transform: rotate(-90deg);
            margin-top: 0px;
          }
        }
      }

      .home-navbar-dropdown {
        position: relative;
      }

      .home-navbar-dropdown-menu {
        position: absolute;
        display: flex;
        flex-direction: column;

        .home-navbar-item {
          width: 100%;
          &:hover {
            background-color: #abababff;
          }
        }
      }

      @media (max-width: 768px) {
        .home-navbar-dropdown-menu {
          left: 5.4rem;
          top: 1px;
        }
      }

      @media (min-width: 768px) {
        .home-navbar-dropdown-menu {
          left: -1rem;
          top: 3.35rem;
        }
      }
    }

    .home-navbar-item:hover,
    .button-burguer:hover {
      background-color: #abababff;
      cursor: pointer;
    }
  }

  .home-navbar-login-btns {
    @media (max-width: 768px) {
      flex: 5;
    }
  }

  .home-navbar-login-btns {
    justify-content: flex-end;
  }
`;
