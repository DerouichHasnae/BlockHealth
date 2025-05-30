import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserMd, FaUserInjured, FaStethoscope } from "react-icons/fa";
import  Footer from "./Footer";
import "../CSS/NavBar.css";
import logosvg from "../data/images/logo.png";
import user from "../data/images/user.svg";
import tick from "../data/images/tick.svg";
import down from "../data/images/upload.svg";
import store from "../data/images/store.png";
import doc from "../data/images/doc.svg";
import disease from "../data/images/disease.png";
import doctor from "../data/images/Dr Andrew.jpg";
import { motion } from "framer-motion";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div>
      <header className="header" id="header">
        <nav className="nav container">
          <div className="logo">
             <FaStethoscope className="register-icon" />
            <NavLink to="/" className="nav-logo">
              BlockHealth
            </NavLink>
          </div>

          <div className="nav-menu" id="nav-menu">
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "nav-link active" : "nav-link"
                  }
                  end
                >
                  Home
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink 
                  to="/AboutPage"
                  className={({ isActive }) => 
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  About Us
                </NavLink>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleScrollToSection('about')}
                >
                  Get Started
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleScrollToSection('services')}
                >
                  Services
                </button>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleScrollToSection('contact')}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div className="nav-buttons">
            <Link to="/login" className="button button-header log">
              Log In
            </Link>
            <Link to="/register" className="button button-header">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {location.pathname === '/' && (
        <main className="main">
          {/* Section Home */}
          <section className="home section container" id="home">
            <div className="home-content">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="doctor-image-container"
              >
                <img
                  className="doctor-image"
                  src={doctor}
                  alt="Doctor illustration"
                />
                <div className="trust-badge">
                  100%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="home-text"
              >
                <h1 className="home-title">
                  Bienvenue sur <span className="highlight">BlockHealth</span>
                </h1>
                <p className="home-description">
                  BlockHealth est une plateforme sécurisée basée sur la blockchain 
                  pour le stockage de données hautement sensibles relatives aux patients.
                  Partage efficace entre établissements pour un diagnostic et traitement optimaux.
                </p>
                <Link
                  to="/register"
                  className="join-button"
                >
                  Rejoignez-nous !
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Section About (Get Started) */}
          <section className="services section container" id="about">
            <h2 className="section-title">Getting started is quick and easy</h2>
            <div className="services-container">
              <div className="services-data">
                <h3 className="services-subtitle">Register Yourself</h3>
                <img className="services-img" src={user} alt="User icon" />
                <p className="services-description">
                  Register yourself to the locker, secured by blockchain technology.
                </p>
              </div>
              <div className="services-data">
                <h3 className="services-subtitle">Authenticate Yourself</h3>
                <img className="services-img" src={tick} alt="Tick icon" />
                <p className="services-description">
                  Log In with your credentials.
                </p>
              </div>
              <div className="services-data">
                <h3 className="services-subtitle">Upload your Data</h3>
                <img className="services-img" src={down} alt="Upload icon" />
                <p className="services-description">
                  Create, update, or view your health record information.
                </p>
              </div>
            </div>
          </section>

          {/* Section Services */}
          <section className="services section container" id="services">
            <h2 className="section-title">Services we deliver</h2>
            <div className="services-container">
              <div className="services-data">
                <h3 className="services-subtitle">Maintaining Medical Records</h3>
                <img className="services-img" src={store} alt="Storage icon" />
                <p className="services-description">
                  Keep track of your medical records, enabled by blockchain technology.
                </p>
              </div>
              <div className="services-data">
                <h3 className="services-subtitle">Connect With Doctors</h3>
                <img className="services-img" src={doc} alt="Doctor icon" />
                <p className="services-description">
                  Share your records with our trusted medical experts, to get a prescription.
                </p>
              </div>
              <div className="services-data">
                <h3 className="services-subtitle">Disease Prediction Model</h3>
                <img className="services-img" src={disease} alt="Disease icon" />
                <p className="services-description">
                  Get a quick diagnosis about diseases you might suffer from, based on our ML model.
                </p>
              </div>
            </div>
          </section>

          {/* Section Contact */}
          <section className="contact section container" id="contact">
            <div className="contact-container">
              <div className="contact-content">
                <h2 className="section-title-center">Contact Us</h2>
                <p className="contact-description">
                  You can contact us from here, you can write to us,
                  call us for suggestions and enhancements.
                </p>
              </div>

              <ul className="contact-content contact-list">
                <li className="contact-address">
                  Telephone: <span className="contact-information">+91 9129916977</span>
                </li>
                <li className="contact-address">
                  Email: <span className="contact-information">CHU@gmail.com</span>
                </li>
                <li className="contact-address">
                  Location: <span className="contact-information">Fes</span>
                </li>
              </ul>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14874.196331166764!2d81.6050291!3d21.2497222!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x21543965c50c43c7!2sNational%20Institute%20of%20Technology(NIT)%2C%20Raipur!5e0!3m2!1sen!2sin!4v1674894759884!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: "0", borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
                className="contact-map"
              ></iframe>
            </div>
          </section>
        </main>
      )}
  
    
    </div>
  );
};

export default NavBar;