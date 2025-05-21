import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
            <Link to="/about" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
              About
            </Link>
            <Link to="/methodology" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
              Methodology
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
              Terms
            </Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-700 text-sm sm:text-base">
              Contact
            </Link>
          </div>
          <div className="mt-6 md:mt-0">
            <p className="text-center md:text-right text-gray-500 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} FactCheck. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
