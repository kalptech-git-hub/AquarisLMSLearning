// Footer.jsx
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0B1F4D] text-gray-300 md:-mx-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Train<span className="text-red-400">Sphere</span>
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Empowering technical learning through structured training,
            practical knowledge, skill development, and professional growth.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm break-words">
            <li className="flex items-center gap-3">
              <FiMail className="text-red-400 shrink-0" />
              Contact Email
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="text-red-400 shrink-0" />
              Contact Number
            </li>
            <li className="flex items-center gap-3">
              <FiMapPin className="text-red-400 shrink-0" />
              Company Address
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaTwitter />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 pt-5 pb-20 sm:py-5 px-4 text-center text-xs sm:text-sm text-gray-400">
        © {new Date().getFullYear()} Kalp Technologies Pvt. Ltd., Pune.
        {" "}All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;