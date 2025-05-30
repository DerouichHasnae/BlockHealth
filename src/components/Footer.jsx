import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faMapMarkerAlt, faPhone, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import "../CSS/Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setNewsletterStatus("success");
      setEmail("");
      setTimeout(() => setNewsletterStatus(null), 3000);
    } else {
      setNewsletterStatus("error");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-wave"></div>
      <div className="footer-container">
        <div className="footer-content">
          {/* About Us */}
          <div className="footer-section about">
            <h3 className="footer-title">Global Health Initiative</h3>
            <p className="footer-text">
              We are a non-profit dedicated to improving healthcare access and security worldwide through blockchain innovation.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section links">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link" tabIndex="0">Our Mission</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Success Stories</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Volunteer</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Annual Report</a>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div className="footer-section programs">
            <h3 className="footer-title">Our Programs</h3>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link" tabIndex="0">Vaccine Access</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Emergency Response</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Medical Training</a>
              </li>
              <li>
                <a href="#" className="footer-link" tabIndex="0">Research Grants</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-contact">
              <li className="contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                <span>123 Health Avenue, Geneva, Switzerland</span>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                <a href="tel:+41221234567" className="contact-link">+41 22 123 4567</a>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                <a href="mailto:contact@globalhealth.org" className="contact-link">contact@globalhealth.org</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="footer-section newsletter">
            <h3 className="footer-title">Stay Updated</h3>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="newsletter-input"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="newsletter-button">Subscribe</button>
            </form>
            {newsletterStatus === "success" && (
              <p className="newsletter-message success">Subscribed successfully!</p>
            )}
            {newsletterStatus === "error" && (
              <p className="newsletter-message error">Please enter a valid email.</p>
            )}
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Global Health Initiative. All rights reserved.</p>
          <div className="legal-links">
            <a href="#" className="legal-link" tabIndex="0">Privacy Policy</a>
            <a href="#" className="legal-link" tabIndex="0">Terms of Service</a>
            <a href="#" className="legal-link" tabIndex="0">Sitemap</a>
          </div>
          <button onClick={scrollToTop} className="scroll-to-top" aria-label="Scroll to top">
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;