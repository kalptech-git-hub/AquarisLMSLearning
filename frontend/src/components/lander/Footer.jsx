// Footer.jsx
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    // was: className="bg-[#0B1F4D] text-gray-300 -mx-20"
    <footer className="bg-[#0B1F4D] text-gray-300 md:-mx-20">
      {/* was: className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10" */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Nihongo <span className="text-red-400">LMS</span>
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Learn Japanese the modern way — structured lessons, expert
            trainers, and progress tracking, all in one place.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          {/* was: className="space-y-3 text-sm" */}
          <ul className="space-y-3 text-sm break-words">
            <li className="flex items-center gap-3">
              <FiMail className="text-red-400 shrink-0" />
              support@nihongolms.com
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="text-red-400 shrink-0" />
              +91 1234567890
            </li>
            <li className="flex items-center gap-3">
              <FiMapPin className="text-red-400 shrink-0" />
              Pune, Maharashtra, India
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            
              <a href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaFacebookF />
            </a>
            
              <a href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaInstagram />
            </a>
            
              <a href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaTwitter />
            </a>
            
              <a href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

      </div>

            {/* Bottom bar */}
      {/* was: className="border-t border-white/10 py-5 text-center text-sm text-gray-400", then className="border-t border-white/10 py-5 px-4 text-center text-xs sm:text-sm text-gray-400" — last line was getting clipped at the very bottom of the scrollable area on some phones, added extra bottom padding so there's room to scroll it fully into view */}
            {/* was: pb-10 — still not enough clearance on some phone viewports, bumped to pb-20 to match the pattern used elsewhere */}
      {/* was: py-5 px-4 pb-20 — pb-20 applied at every width, leaving a large empty band under the copyright line on desktop/tablet. Now pb-20 stays on phone only (for the clipping fix), and sm: and up use normal py-5 spacing. */}
<div className="border-t border-white/10 pt-5 pb-20 sm:py-5 px-4 text-center text-xs sm:text-sm text-gray-400">
        © {new Date().getFullYear()} Nihongo LMS. Developed & Designed by{" "} 
        <span className="text-red-400 font-semibold">Kalp Technologies Pvt. Ltd., Pune. </span>
          All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;