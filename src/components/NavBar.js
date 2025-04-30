import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import logosvg from "../data/logo.png";
import user from "../data/user.svg";
import tick from "../data/tick.svg";
import down from "../data/upload.svg";
import store from "../data/store.png";
import doc from "../data/doc.svg";
import disease from "../data/disease.png";
import doctor from "../data/Dr Andrew.jpg";
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
            <img className="logo-img" src={logosvg} alt="MediVault Logo" />
            <NavLink to="/" className="nav__logo">
              BlockHealth
            </NavLink>
          </div>

          <div className="nav__menu" id="nav-menu">
            <ul className="nav__list">
              <li className="nav__item">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "nav__link active" : "nav__link"
                  }
                  end
                >
                  Home
                </NavLink>
              </li>

              <li className="nav__item">
                <NavLink 
                  to="/AboutPage"  // Changé de "/about" à "/AboutPage"
                  className={({ isActive }) => 
                    isActive ? "nav__link active" : "nav__link"
                  }
                >
                  About Us
                </NavLink>
              </li>

              <li className="nav__item">
                <button
                  className="nav__link"
                  onClick={() => handleScrollToSection('about')}
                >
                  Get Started
                </button>
              </li>

              <li className="nav__item">
                <button
                  className="nav__link"
                  onClick={() => handleScrollToSection('services')}
                >
                  Services
                </button>
              </li>

              <li className="nav__item">
                <button
                  className="nav__link"
                  onClick={() => handleScrollToSection('contact')}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div className="nav__buttons">
            <Link to="/login" className="button button__header log">
              Log In
            </Link>
            <Link to="/register" className="button button__header">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main className="main">
      
      {/* Section Home */}
      <section className="home section container min-h-screen flex items-center" id="home">
        <div className="flex flex-col md:flex-row items-center gap-16 w-full">
          {/* Image avec animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex-shrink-0"
          >
            <img
              className="w-72 h-72 rounded-full object-cover border-8 border-white shadow-2xl"
              src={doctor}
              alt="Doctor illustration"
            />
            <div className="absolute -right-5 -top-5 bg-blue-600 text-white 
              rounded-full w-16 h-16 flex items-center justify-center 
              font-bold text-xl shadow-lg">
              100%
            </div>
          </motion.div>

          {/* Texte animé */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl text-center md:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight mb-6">
              Bienvenue sur <span className="text-blue-600">BlockHealth</span>
            </h1>
            <p className="text-blue-800 text-lg mb-8 leading-relaxed">
              MediVault est une plateforme sécurisée basée sur la blockchain 
              pour le stockage de données hautement sensibles relatives aux patients.
              Partage efficace entre établissements pour un diagnostic et traitement optimaux.
            </p>
            <Link
              to="/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white 
                font-semibold py-4 px-8 rounded-full shadow-lg transition duration-300"
            >
              Rejoignez-nous !
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Section About (Get Started) */}
      <section className="services section container py-16" id="about">
        <h2 className="section__title text-3xl font-bold text-blue-900 text-center mb-12">Getting started is quick and easy</h2>
        <div className="services__container grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Register Yourself</h3>
            <img className="services__img mx-auto w-24 h-24" src={user} alt="User icon" />
            <p className="services__description text-blue-800 mt-4">
              Register yourself to the locker, secured by blockchain technology.
            </p>
          </div>

          {/* Step 2 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Authenticate Yourself</h3>
            <img className="services__img mx-auto w-24 h-24" src={tick} alt="Tick icon" />
            <p className="services__description text-blue-800 mt-4">
              Log In with your credentials.
            </p>
          </div>

          {/* Step 3 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Upload your Data</h3>
            <img className="services__img mx-auto w-24 h-24" src={down} alt="Upload icon" />
            <p className="services__description text-blue-800 mt-4">
              Create, update, or view your health record information.
            </p>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="services section container py-16" id="services">
        <h2 className="section__title text-3xl font-bold text-blue-900 text-center mb-12">Services we deliver</h2>
        <div className="services__container grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Maintaining Medical Records</h3>
            <img className="services__img mx-auto w-24 h-24" src={store} alt="Storage icon" />
            <p className="services__description text-blue-800 mt-4">
              Keep track of your medical records, enabled by blockchain technology.
            </p>
          </div>

          {/* Service 2 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Connect With Doctors</h3>
            <img className="services__img mx-auto w-24 h-24" src={doc} alt="Doctor icon" />
            <p className="services__description text-blue-800 mt-4">
              Share your records with our trusted medical experts, to get a prescription.
            </p>
          </div>

          {/* Service 3 */}
          <div className="services__data text-center">
            <h3 className="services__subtitle text-xl font-semibold text-blue-700">Disease Prediction Model</h3>
            <img className="services__img mx-auto w-24 h-24" src={disease} alt="Disease icon" />
            <p className="services__description text-blue-800 mt-4">
              Get a quick diagnosis about diseases you might suffer from, based on our ML model.
            </p>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="contact section container" id="contact">
          <div className="contact__container grid">
            <div className="contact__content">
              <h2 className="section__title-center">Contact Us</h2>
              <p className="contact__description">
                You can contact us from here, you can write to us,
                call us for suggestions and enhancements.
              </p>
            </div>

            <ul className="contact__content grid">
              <li className="contact__address">
                Telephone: <span className="contact__information">+91 9129916977</span>
              </li>
              <li className="contact__address">
                Email: <span className="contact__information">CHU@gmail.com</span>
              </li>
              <li className="contact__address">
                Location: <span className="contact__information">Fes </span>
              </li>
            </ul>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14874.196331166764!2d81.6050291!3d21.2497222!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x21543965c50c43c7!2sNational%20Institute%20of%20Technology(NIT)%2C%20Raipur!5e0!3m2!1sen!2sin!4v1674894759884!5m2!1sen!2sin"
              width="300"
              height="200"
              style={{ border: "0" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>
        </section>
      
    </main>
    </div>
  );
};

export default NavBar;