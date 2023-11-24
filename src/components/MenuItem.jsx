import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import MenuDropdown from "./MenuDropdown";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

function MenuItem({ onClick, item }) {
  const [menuShow, setMenuShow] = useState(false);

  const handleShow = () => {
    setMenuShow(!menuShow);
  };

  return (
    <>
      {item.submenu ? (
        <div onClick={handleShow} className={"home-navbar-item"}>
          <div className="home-navbar-dropdown">
            <div className="home-navbar-dropdown-title">
              <div aria-haspopup={"menu"}>{item.title}</div>
              <div className="home-navbar-dropdown-icon">
                <MdOutlineKeyboardArrowDown />
              </div>
            </div>
            {menuShow && <MenuDropdown submenu={item.submenu} />}
          </div>
        </div>
      ) : (
        <NavLink className={"home-navbar-item"} onClick={onClick} to={item.url}>
          {item.title}
        </NavLink>
      )}
    </>
  );
}

export default MenuItem;
