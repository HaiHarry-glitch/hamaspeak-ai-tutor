
import React from 'react';
import { Link } from 'react-router-dom';
import HamaspeakLogo from './HamaspeakLogo';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="no-underline">
          <HamaspeakLogo />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-hamaspeak-dark hover:text-hamaspeak-purple transition-colors">
            Trang chủ
          </Link>
          <Link to="/method" className="text-hamaspeak-dark hover:text-hamaspeak-purple transition-colors">
            Phương pháp
          </Link>
          <Link to="/study" className="text-hamaspeak-dark hover:text-hamaspeak-purple transition-colors">
            Học ngay
          </Link>
          <Link to="/about" className="text-hamaspeak-dark hover:text-hamaspeak-purple transition-colors">
            Giới thiệu
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button className="glass-button">
            Đăng nhập
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
