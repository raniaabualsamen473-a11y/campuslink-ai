
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-background dark:from-background dark:to-background/95">
      <Navbar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 grid-bg",
          isMobileMenuOpen && "pt-16 sm:pt-0"
        )}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
