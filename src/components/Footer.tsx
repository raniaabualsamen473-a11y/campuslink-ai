
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-campus-blue text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CampusLink AI</h3>
            <p className="text-sm opacity-80">
              AI-powered class scheduling solution for university students.
              Find section swaps, petition for new classes, and connect with peers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm opacity-80 hover:opacity-100 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/swap-requests" className="text-sm opacity-80 hover:opacity-100 transition">
                  Swap Requests
                </Link>
              </li>
              <li>
                <Link to="/petitions" className="text-sm opacity-80 hover:opacity-100 transition">
                  Petitions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm opacity-80 mb-2">
              Have questions or feedback?
            </p>
            <a
              href="mailto:support@campuslinkAI.edu"
              className="text-sm text-campus-teal hover:underline"
            >
              support@campuslinkAI.edu
            </a>
          </div>
        </div>
        <div className="border-t border-white border-opacity-20 mt-8 pt-4">
          <p className="text-sm opacity-60 text-center">
            © {new Date().getFullYear()} CampusLink AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
