import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
            <Link to="/methodology" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm sm:text-base transition-colors">
              Methodology
            </Link>
            <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm sm:text-base transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm sm:text-base transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm sm:text-base transition-colors">
              Contact
            </Link>
          </div>
          <div className="mt-6 md:mt-0">
            <p className="text-center md:text-right text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} FactCheck. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
