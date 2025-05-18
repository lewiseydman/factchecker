import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/about">
              <a className="text-gray-500 hover:text-gray-700">About</a>
            </Link>
            <Link href="/methodology">
              <a className="text-gray-500 hover:text-gray-700">Methodology</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-500 hover:text-gray-700">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-500 hover:text-gray-700">Terms</a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-500 hover:text-gray-700">Contact</a>
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
