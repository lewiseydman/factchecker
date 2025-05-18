import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link to="/about" className="text-gray-500 hover:text-gray-700">
              About
            </Link>
            <Link to="/methodology" className="text-gray-500 hover:text-gray-700">
              Methodology
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700">
              Terms
            </Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-700">
              Contact
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} FactCheck. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
