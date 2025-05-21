
const Footer = () => {
  return (
    <footer className="glass border-t border-white/20 shadow-glass-lg backdrop-blur-lg bg-campus-darkPurple/80 text-white py-4">
      <div className="container mx-auto px-4">
        <p className="text-sm opacity-60 text-center">
          © {new Date().getFullYear()} CampusLink AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
