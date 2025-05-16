
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email || null);
  }, [user]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    // Removed Home link as requested
    { name: "Dashboard", path: "/dashboard", authRequired: true },
    { name: "Swap Requests", path: "/swap-requests", authRequired: true },
    { name: "Petitions", path: "/petitions", authRequired: true },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-campus-darkPurple">CampusLink</span>
              <span className="text-lg font-semibold text-campus-purple">AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <div className="flex space-x-4">
              {navLinks
                .filter(link => !link.authRequired || (link.authRequired && user))
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === link.path
                        ? "bg-campus-purple/10 text-campus-darkPurple"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            <div className="ml-4 flex items-center">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-black truncate">{email}</p>
                    <p className="text-xs text-gray-500">Logged In</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="text-gray-700"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-campus-purple hover:bg-campus-darkPurple text-white"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } sm:hidden absolute w-full bg-white border-b shadow-lg`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks
            .filter(link => !link.authRequired || (link.authRequired && user))
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? "bg-campus-purple/10 text-campus-darkPurple"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-black truncate">{email}</p>
                  <p className="text-xs text-gray-500">Logged In</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </div>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium bg-campus-purple text-white hover:bg-campus-darkPurple"
              >
                <div className="flex items-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </div>
              </Link>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
