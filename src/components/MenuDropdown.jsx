import React from "react";
import { NavLink } from "react-router-dom";

function MenuDropdown({ submenu }) {
  return (
    <>
      <div className="home-navbar-dropdown-menu">
        {submenu.map((item, index) => (
          <NavLink
            key={"dropdown-item-" + index}
            className={"home-navbar-item"}
            to={item.url}
          >
            {item.title}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default MenuDropdown;
