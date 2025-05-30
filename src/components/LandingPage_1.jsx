import React, { useState } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer"



function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  function onEnter() {
    setIsHovered(true);
  }
  function onLeave() {
    setIsHovered(false);
  }

  return (
    <div>
        <NavBar></NavBar>
          <Footer></Footer>
    </div>
  );
}

export default LandingPage;