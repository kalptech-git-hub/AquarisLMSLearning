import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";

// const LogoutButton = ({ open }) => {
const LogoutButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // New line added - for collapse of sidebar--
  // const [open, setOpen] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-3 w-full py-3 ${!open ? "px-2 justify-center" : "px-4 justify-start"} rounded-lg hover:bg-slate-200 transition-all cursor-pointer`}

        title="Logout"
      >
        <FiLogOut className={`${open
          ? "text-lg"
          : "text-xl mx-auto transition-all"
          }`} />

        <span className={`transition-all duration-300 ${!open && "hidden"}`}>Logout</span>
      </button>

      {/* was:
{isOpen && (
  <LogoutModal onClose={() => setIsOpen(false)} onLogout={handleLogout} />
)}
*/}
      {isOpen &&
        createPortal(
          <LogoutModal
            onClose={() => setIsOpen(false)}
            onLogout={handleLogout}
          />,
          document.body
        )}
    </>
  );
};

export default LogoutButton;
