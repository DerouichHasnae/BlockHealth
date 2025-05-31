import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "../CSS/AbouUs.css";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-us-container">
      <NavBar />
      
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">About Our Platform</h1>
          <p className="hero-subtitle">Revolutionizing Healthcare with Blockchain Technology</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content-wrapper">
        {/* Team Section */}
        <section className="about-section team-section">
          <div className="section-header">
            <h2 className="section-title">Our Visionary Team</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar doctor-avatar"></div>
              <h3>Medical Experts</h3>
              <p>Board-certified physicians ensuring clinical accuracy</p>
            </div>
            
            <div className="team-card">
              <div className="team-avatar tech-avatar"></div>
              <h3>Tech Innovators</h3>
              <p>Blockchain developers building secure solutions</p>
            </div>
            
            <div className="team-card">
              <div className="team-avatar design-avatar"></div>
              <h3>UX Specialists</h3>
              <p>Creating intuitive healthcare experiences</p>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="about-section features-section">
          <div className="section-header">
            <h2 className="section-title">Platform Capabilities</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="features-tabs">
            <div className="feature-tab active">
              <h3>For Healthcare Providers</h3>
              <ul>
                <li>Secure access to complete patient histories</li>
                <li>Real-time collaboration tools</li>
                <li>Integrated treatment planning</li>
                <li>Automated record updates</li>
              </ul>
            </div>
            
            <div className="feature-tab">
              <h3>For Patients</h3>
              <ul>
                <li>Complete ownership of health data</li>
                <li>Granular access permissions</li>
                <li>Secure document uploads</li>
                <li>Treatment timeline visualization</li>
              </ul>
            </div>
            
            <div className="feature-tab">
              <h3>For Diagnostic Centers</h3>
              <ul>
                <li>Seamless report integration</li>
                <li>Automated physician notifications</li>
                <li>Tamper-proof record keeping</li>
                <li>Regulatory compliance tools</li>
              </ul>
            </div>
          </div>
          
          <div className="tech-badge-container">
            <div className="tech-badge ethereum">
              <span>Ethereum Blockchain</span>
            </div>
            <div className="tech-badge ipfs">
              <span>IPFS Storage</span>
            </div>
            <div className="tech-badge smart-contracts">
              <span>Smart Contracts</span>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="about-section mission-section">
          <div className="mission-card">
            <h2>Our Commitment to Security</h2>
            <p>
              We leverage cutting-edge blockchain technology to ensure your health data 
              remains private, secure, and under your control. Our decentralized approach 
              eliminates single points of failure while providing immutable audit trails 
              for all record access.
            </p>
            <div className="security-stats">
              <div className="stat">
                <div className="stat-value">256-bit</div>
                <div className="stat-label">Encryption</div>
              </div>
              <div className="stat">
                <div className="stat-value">100%</div>
                <div className="stat-label">Data Ownership</div>
              </div>
              <div className="stat">
                <div className="stat-value">Zero</div>
                <div className="stat-label">Third-party Access</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section contact-section">
          <div className="contact-card">
            <h2>Ready to Transform Healthcare?</h2>
            <p>Get in touch with our team to learn more about our platform</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon email-icon"></div>
                <span>contact@ehrexample.com</span>
              </div>
              <div className="contact-method">
                <div className="contact-icon phone-icon"></div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-method">
                <div className="contact-icon address-icon"></div>
                <span>123 Blockchain Ave, Tech City</span>
              </div>
            </div>
            
            <button 
              className="cta-button"
              onClick={() => navigate("/contact")}
            >
              Contact Our Team
            </button>
          </div>
        </section>
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <button 
          className="back-home-button"
          onClick={() => navigate("/")}
        >
          ← Return to Home
        </button>
      </div>
    </div>
  );
};

export default AboutUs;