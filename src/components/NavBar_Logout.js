import React from "react";
import { useNavigate } from "react-router-dom";


const NavBar_Logout = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black text-white h-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-0">
          {/* Logo */}
          <div className="shrink-0">
          
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4 sm:mt-0">
            <button
              className="text-lg px-3 py-1.5 rounded-md font-medium transition-transform duration-300 ease-in-out transform hover:scale-110"
              onClick={() => navigate("/")}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar_Logout;
