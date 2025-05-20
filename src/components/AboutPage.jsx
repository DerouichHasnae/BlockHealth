import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "../CSS/AbouUs.css";
const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-us">
      <NavBar />
      <div className="content-container">
        <div className="about-content">
          <h1 className="content-title">About Us</h1>
          <div className="content-section">
            <h2>Who We Are</h2>
            <p>
              We are a dedicated team of healthcare professionals and
              technologists committed to revolutionizing the way Electronic
              Health Records (EHR) are managed. Our mission is to provide a
              secure, efficient, and user-friendly platform for managing EHR.
            </p>

            <h2>What We Do</h2>
            <p>
              Our EHR management system provides a comprehensive solution for
              Doctors, Patients, and Diagnostic Centers. We leverage the
              power of Ethereum blockchain for secure data storage and smart
              contracts for access control and data management.
            </p>

            <h3>For Doctors</h3>
            <p>
              Doctors can access the patient list assigned to them, view
              patient records and medical history, and write comments and
              treatment plans for treating patients.
            </p>

            <h3>For Patients</h3>
            <p>
              Patients can view their own medical records and history, upload
              new medical records, test reports, and other documents, and
              grant access to doctors.
            </p>

            <h3>For Diagnostic Centers</h3>
            <p>
              Diagnostic Centers can view comments and treatment plans from
              doctors and upload EHR reports to patient records.
            </p>

            <h2>Our Commitment</h2>
            <p>
              We are committed to ensuring the integrity and security of
              patient data. Our system ensures that only authorized users
              have access to patient records. Patients have control over who
              can access their medical records and can grant or revoke access
              as needed.
            </p>

            <h2>Contact Us</h2>
            <p>
              We'd love to hear from you! If you have any questions or
              feedback, please feel free to contact us on Phone: +123 456 7890, Email: example@company.com.
            </p>
          </div>
        </div>
      </div>
      <div className="button-container">
        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          Back to Home Page
        </button>
      </div>
    </div>
  );
};

export default AboutUs;