import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faMapMarkerAlt, faPhone } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-[#1a237e] text-white pt-16 pb-8 px-6"> {/* Bleu nuit intense */}
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          {/* About Us */}
          <div className="w-full md:w-1/4">
            <h3 className="font-bold text-2xl mb-4 text-blue-100">Global Health Initiative</h3>
            <p className="mb-4 text-blue-50">
              We are a non-profit organization dedicated to improving healthcare access and security worldwide through innovation and partnerships.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-100 hover:text-white transition">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition">
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition">
                <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full md:w-1/4">
            <h3 className="font-bold text-xl mb-4 text-blue-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Volunteer
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Annual Report
                </a>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div className="w-full md:w-1/4">
            <h3 className="font-bold text-xl mb-4 text-blue-100">Our Programs</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Vaccine Access
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Emergency Response
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Medical Training
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-50 hover:text-white transition hover:underline">
                  Research Grants
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="w-full md:w-1/4">
            <h3 className="font-bold text-xl mb-4 text-blue-100">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 mr-3 text-blue-100" />
                <span className="text-blue-50">123 Health Avenue, Geneva, Switzerland</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="mr-3 text-blue-100" />
                <span className="text-blue-50">+41 22 123 4567</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-100" />
                <span className="text-blue-50">contact@globalhealth.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-blue-400 pt-6 text-center text-blue-100">
          <p>© {new Date().getFullYear()} Global Health Initiative. All rights reserved.</p>
          <p className="mt-2 text-sm">
            <a href="#" className="hover:underline">Privacy Policy</a> |{" "}
            <a href="#" className="hover:underline">Terms of Service</a> |{" "}
            <a href="#" className="hover:underline">Sitemap</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;