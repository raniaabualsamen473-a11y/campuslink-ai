
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

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
    <nav className="glass sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-glass dark:bg-slate-900/50 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-1.5">
              <img 
                src="https://pbqpbupsmzafbzlxccov.supabase.co/storage/v1/object/public/logo//CampusLink.ai(Logo)%20(Logo).png" 
                alt="CampusLink AI Logo" 
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold text-campus-darkPurple dark:text-white">CampusLink</span>
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? "bg-campus-purple/20 text-campus-darkPurple shadow-neon-purple dark:text-white dark:bg-campus-purple/30"
                        : "text-gray-700 hover:bg-white/10 hover:text-campus-purple dark:text-gray-300 dark:hover:text-campus-lightPurple"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            <div className="ml-4 flex items-center space-x-2">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-foreground truncate">{email}</p>
                    <p className="text-xs text-muted-foreground">Logged In</p>
                  </div>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={handleSignOut}
                    className="text-foreground hover:text-campus-purple"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="neon"
                  className="btn-glow"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden gap-2">
            {/* Theme Toggle for Mobile */}
            <ThemeToggle />
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-white/10 hover:text-campus-purple focus:outline-none transition-all duration-300 dark:text-gray-300 dark:hover:text-campus-lightPurple"
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
        } sm:hidden absolute w-full glass backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-glass-lg animate-fade-in dark:bg-slate-900/50 dark:border-white/10`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks
            .filter(link => !link.authRequired || (link.authRequired && user))
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-campus-purple/20 text-campus-darkPurple shadow-neon-purple dark:text-white dark:bg-campus-purple/30"
                    : "text-gray-700 hover:bg-white/10 hover:text-campus-purple dark:text-gray-300 dark:hover:text-campus-lightPurple"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">{email}</p>
                  <p className="text-xs text-muted-foreground">Logged In</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-white/10 hover:text-campus-purple transition-all duration-300 dark:text-gray-300 dark:hover:text-campus-lightPurple"
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
                className="block px-3 py-2 rounded-lg text-base font-medium bg-campus-purple text-white hover:bg-campus-neonPurple shadow-neon-purple hover:shadow-neon-purple-lg transition-all duration-300"
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
