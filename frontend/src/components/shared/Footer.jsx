import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About US */}
        <div>
          <h2 className="text-lg font-semibold mb-4">About Us</h2>
          <p className="text-gray-400 text-sm">
            We are SKNCOE NSS, the Unit the stands with Pride and Honour.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to={"/"} className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to={"/about"} className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to={"/news"} className="hover:text-white">
                News Articles
              </Link>
            </li>
            <li>
              <Link to={"/activities"} className="hover:text-white">
                Activites
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-400 text-sm">
            <span className="font-bold">Address: </span>NSS Room, -1 Floor, Old
            SKNCOE Building
          </p>
          <p className="text-gray-400 text-sm">Vadgaon Bk., Pune - 41</p>
          <p className="text-gray-400 text-sm">
            <span className="font-bold">Email: </span>
            <a
              href="mailto:skncoenss@gmail.com"
              className="hover:text-white"
            >
              skncoenss@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Social Media Links and Copyright */}
      <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
        <p>Follow us on:</p>
        <div className="flex justify-center space-x-4 mt-3">
          <a href="#" className="hover:text-white">
            Facebook
          </a>
          <a
            href="https://instagram.com/skncoe_nss?igshid=MzRlODBiNWFlZA=="
            className="hover:text-white"
          >
            Instagram
          </a>
          <a href="https://youtube.com/@NSSSKNCOE" className="hover:text-white">
            Youtube
          </a>
          <a
            href="https://www.linkedin.com/in/nss-skncoe"
            className="hover:text-white"
          >
            LinkedIn
          </a>
          <a href="https://twitter.com/skncoe_nss" className="hover:text-white">
            X
          </a>
        </div>

        <p className="mt-4">
          &copy; {new Date().getFullYear()} SKNCOE NSS. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
