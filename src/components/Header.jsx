import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar";

import { logout, clearUser } from "../features/auth/authSlice";

const Header = () => {
  const menuRef = useRef();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
    navigate("/");
  };

  const toggleMenu = (e) => {
    menuRef.current.toggle(e);
  };

  const menuItems = [
    // {
    //   label: "Profile Settings",
    //   command: () => navigate("/profile"),
    // },
    {
      label: "Logout",
      className: "text-red-500 font-semibold",
      command: () => onLogout(),
    },
  ];

  return (
    <div className="">
      <nav className="shadow-lg glass sticky top-0 z-40 border-b border-white/20 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              {/* <div className="w-28 h-12 p-2 bg-[#6a008e] rounded-lg flex items-center justify-center">
                <Link to="/">
                  <img
                    src="/images/logo-white.webp"
                    alt="Tritek Academy Logo"
                  />
                </Link>
              </div> */}
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-8">
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              )}
              {isAuthenticated ? (
                <div
                  className="flex px-2 py-1.5 gap-2 items-center cursor-pointer shadow rounded-md bg-white"
                  onClick={toggleMenu}
                >
                  <Menu model={menuItems} popup ref={menuRef} />

                  <div className="text-sm font-semibold">{user?.name}</div>
                  <Avatar
                    label={`${user?.name.split(" ")[0].charAt(0)}${user?.name.split(" ")[1].charAt(0)}`}
                    shape="circle"
                    style={{ backgroundColor: "#6a008e", color: "#ffffff" }}
                    //size="large"
                  />
                </div>
              ) : (
                <button
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
