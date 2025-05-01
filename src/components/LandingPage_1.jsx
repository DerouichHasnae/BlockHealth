import React, { useState } from "react";
import NavBar from "./NavBar";




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
    </div>
  );
}

export default LandingPage;