
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isRTL } = useLanguage();

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-gradient-to-br from-background to-background/95",
      isRTL && "rtl"
    )}>
      <Navbar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          isMobileMenuOpen && "pt-16 sm:pt-0"
        )}
      >
        <Outlet />
      </main>
      <div className="py-4 text-center text-xs text-muted-foreground bg-background/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} CampusLink AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Layout;
