import React from 'react';
import { Menu, X, Sliders } from 'lucide-react';
import { PersonalProfile } from '../types';

interface HeaderProps {
  profile: PersonalProfile;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAdminActive: boolean;
  setIsAdminActive: (active: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
}

export default function Header({
  profile,
  currentPage,
  setCurrentPage,
  isAdminActive,
  setIsAdminActive,
  setSelectedProjectId,
}: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: '01 Home' },
    { id: 'projects', label: '02 Projects' },
    { id: 'about', label: '03 About me' },
    { id: 'resume', label: '04 Resume' },
    { id: 'archive', label: '05 Articles & Analysis' },
    { id: 'contact', label: '06 Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    setIsAdminActive(false);
    setSelectedProjectId(null);
    setCurrentPage(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminToggle = () => {
    setIsAdminActive(!isAdminActive);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-luxury-bg/90 backdrop-blur-md border-b border-luxury-black/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5 sm:py-7 flex justify-between items-center">
        {/* Logo/Name */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group focus:outline-none"
        >
          <div className="font-display text-lg sm:text-xl font-medium tracking-widest text-luxury-black transition-colors duration-300 group-hover:text-luxury-olive">
            {profile.englishName}
          </div>
          {profile.title && (
            <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-luxury-gray mt-0.5 font-light">
              {profile.title}
            </div>
          )}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = !isAdminActive && currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-sans text-xs uppercase tracking-[0.15em] transition-all duration-300 relative py-1 focus:outline-none cursor-pointer ${
                  isActive
                    ? 'text-luxury-olive font-medium'
                    : 'text-luxury-gray hover:text-luxury-black'
                }`}
              >
                {item.label.split(' ').slice(1).join(' ')}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-olive animate-fade-in" />
                )}
              </button>
            );
          })}

          {/* Luxury Brand Admin Portal Button */}
          <button
            onClick={handleAdminToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-300 font-sans text-[10px] uppercase tracking-[0.2em] ${
              isAdminActive
                ? 'bg-luxury-black border-luxury-black text-luxury-bg'
                : 'border-luxury-olive/30 text-luxury-olive hover:bg-luxury-olive/10 hover:border-luxury-olive'
            }`}
          >
            <Sliders size={11} />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={handleAdminToggle}
            className={`p-1.5 border transition-all duration-300 ${
              isAdminActive
                ? 'bg-luxury-black border-luxury-black text-white'
                : 'border-luxury-olive/20 text-luxury-olive'
            }`}
            title="Admin Portal"
          >
            <Sliders size={13} />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-luxury-black hover:text-luxury-olive p-1 focus:outline-none"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-luxury-bg border-b border-luxury-black/5 px-6 sm:px-12 py-8 animate-fade-in">
          <nav className="flex flex-col space-y-5">
            {navItems.map((item) => {
              const isActive = !isAdminActive && currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left font-sans text-sm uppercase tracking-[0.15em] py-1 ${
                    isActive ? 'text-luxury-olive font-medium' : 'text-luxury-gray'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-4 border-t border-luxury-black/5">
              <button
                onClick={handleAdminToggle}
                className="w-full flex items-center justify-center gap-2 py-3 border border-luxury-olive/30 text-luxury-olive font-sans text-xs uppercase tracking-[0.2em] hover:bg-luxury-olive/10"
              >
                <Sliders size={13} />
                <span>Admin CMS Portal</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
