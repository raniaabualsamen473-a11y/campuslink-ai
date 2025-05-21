
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="glass border-t border-white/20 shadow-glass-lg backdrop-blur-lg bg-campus-darkPurple/80 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
                alt="CampusLink AI Logo" 
                className="h-8 w-8 object-contain"
              />
              <h3 className="text-xl font-bold">CampusLink AI</h3>
            </div>
            <p className="text-sm opacity-80">
              AI-powered class scheduling solution for university students.
              Find section swaps, petition for new classes, and connect with peers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm opacity-80 hover:opacity-100 hover:text-campus-lightPurple transition-all duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/swap-requests" className="text-sm opacity-80 hover:opacity-100 hover:text-campus-lightPurple transition-all duration-300">
                  Swap Requests
                </Link>
              </li>
              <li>
                <Link to="/petitions" className="text-sm opacity-80 hover:opacity-100 hover:text-campus-lightPurple transition-all duration-300">
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
              className="text-sm text-campus-lightPurple hover:underline transition-all duration-300"
            >
              support@campuslinkAI.edu
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-4">
          <p className="text-sm opacity-60 text-center">
            © {new Date().getFullYear()} CampusLink AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
