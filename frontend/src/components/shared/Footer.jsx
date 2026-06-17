import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-gray-800 dark:bg-[#0b1120] dark:border-t dark:border-[#1e3a5f] text-white py-8 transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About US */}
        <div>
          <h2 className="text-lg font-semibold mb-4">About Us</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            We are SKNCOE NSS, the Unit the stands with Pride and Honour.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-gray-400 dark:text-gray-500">
            <li>
              <Link to={"/"} className="hover:text-white transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link to={"/about"} className="hover:text-white transition-colors duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link to={"/news"} className="hover:text-white transition-colors duration-200">
                News Articles
              </Link>
            </li>
            <li>
              <Link to={"/activities"} className="hover:text-white transition-colors duration-200">
                Activites
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            <span className="font-bold">Address: </span>NSS Room, -1 Floor, Old
            SKNCOE Building
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Vadgaon Bk., Pune - 41</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            <span className="font-bold">Email: </span>
            <a href="mailto:skncoenss@gmail.com" className="hover:text-white transition-colors duration-200">
              skncoenss@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Social Media Links and Copyright */}
      <div className="mt-8 border-t border-gray-700 dark:border-[#1e3a5f] pt-6 text-center text-gray-500 text-sm">
        <p>Follow us on:</p>
        <div className="flex justify-center space-x-4 mt-3">
          <a href="#" className="hover:text-white transition-colors duration-200">
            Facebook
          </a>
          <a
            href="https://instagram.com/skncoe_nss?igshid=MzRlODBiNWFlZA=="
            className="hover:text-white transition-colors duration-200"
          >
            Instagram
          </a>
          <a href="https://youtube.com/@NSSSKNCOE" className="hover:text-white transition-colors duration-200">
            Youtube
          </a>
          <a
            href="https://www.linkedin.com/in/nss-skncoe"
            className="hover:text-white transition-colors duration-200"
          >
            LinkedIn
          </a>
          <a href="https://twitter.com/skncoe_nss" className="hover:text-white transition-colors duration-200">
            X
          </a>
        </div>

        <p className="mt-4">
          &copy;{new Date().getFullYear()} SKNCOE NSS. All Rights Reserved.
        </p>
        <p className="mt-4">
          Made with ❤️ by <a href="https://suyashchavan.me" className="font-bold hover:text-white transition-colors duration-200">Tech Decoder</a>.
        </p>
      </div>
    </div>
  );
};

export default Footer;
