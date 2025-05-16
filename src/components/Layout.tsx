
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isRTL } = useLanguage();

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-gradient-to-br from-background to-background dark:from-background dark:to-background/95",
      isRTL && "rtl"
    )}>
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
