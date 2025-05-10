
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMobileMenuOpen]);

  const isLoggedIn = false; // Replace with actual authentication logic

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard", protected: true },
    { name: "Swap Requests", path: "/swap-requests", protected: true },
    { name: "Petitions", path: "/petitions", protected: true },
  ];

  const filteredNavLinks = isLoggedIn
    ? navLinks
    : navLinks.filter((link) => !link.protected);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-campus-blue to-campus-teal bg-clip-text text-transparent">
                CampusLink AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-medium transition-colors hover:text-campus-teal ${
                  location.pathname === link.path
                    ? "text-campus-teal border-b-2 border-campus-teal"
                    : "text-campus-darkGray"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <Button variant="outline">Sign Out</Button>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white md:hidden">
          <div className="flex flex-col p-4 space-y-4">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 text-lg font-medium transition-colors hover:text-campus-teal ${
                  location.pathname === link.path
                    ? "text-campus-teal"
                    : "text-campus-darkGray"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  asChild
                  variant="default"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
