import { Link } from "wouter";
import { BurgerMenu } from "./BurgerMenu";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">fact_check</span>
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-800">
            FactCheck
          </Link>
        </div>
        
        <BurgerMenu />
      </div>
    </header>
  );
};

export default Header;