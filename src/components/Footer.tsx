import { Mail, Linkedin, Instagram, ArrowUp, Sliders } from 'lucide-react';
import { PortfolioData } from '../types';
import { formatExternalUrl } from '../utils/url';

interface FooterProps {
  portfolioData: PortfolioData;
  setCurrentPage: (page: string) => void;
  setIsAdminActive: (active: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
  isAdminActive: boolean;
}

export default function Footer({
  portfolioData,
  setCurrentPage,
  setIsAdminActive,
  setSelectedProjectId,
  isAdminActive,
}: FooterProps) {
  const { contact, profile } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageClick = (pageId: string) => {
    setIsAdminActive(false);
    setSelectedProjectId(null);
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-luxury-bg border-t border-luxury-black/10 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Large Editorial Call to Action */}
        <div className="mb-8">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block">
            Collaborations & Inquiries
          </span>
        </div>

        {/* Swiss Grid Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-luxury-black/5">
          {/* Column 1: Short summary */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-display text-xl italic font-medium text-luxury-black">
              {profile.englishName} &copy; 2026
            </h3>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed max-w-sm">
              Applying rigorous research, systemic brand analysis, and immersive retail merchanidising strategies to define the future architecture of premium luxury brands.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-luxury-olive block font-medium">
              Sitemap
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePageClick('home')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                01 Home
              </button>
              <button
                onClick={() => handlePageClick('projects')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                02 Projects
              </button>
              <button
                onClick={() => handlePageClick('about')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                03 About me
              </button>
              <button
                onClick={() => handlePageClick('resume')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                04 Resume
              </button>
              <button
                onClick={() => handlePageClick('archive')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                05 Articles & Analysis
              </button>
              <button
                onClick={() => handlePageClick('contact')}
                className="text-left font-sans text-xs text-luxury-gray hover:text-luxury-black transition-colors"
              >
                06 Contact
              </button>
            </div>
          </div>

          {/* Column 3: Contacts */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-luxury-olive block font-medium">
              Get in Touch
            </span>
            <div className="space-y-2 font-mono text-xs">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-luxury-gray hover:text-luxury-black transition-colors group"
              >
                <Mail size={12} className="text-luxury-olive group-hover:text-luxury-black" />
                <span>{contact.email}</span>
              </a>
              <a
                href={formatExternalUrl(contact.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-luxury-gray hover:text-luxury-black transition-colors group"
              >
                <Linkedin size={12} className="text-luxury-olive group-hover:text-luxury-black" />
                <span>LinkedIn</span>
              </a>
              <a
                href={formatExternalUrl(contact.instagram)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-luxury-gray hover:text-luxury-black transition-colors group"
              >
                <Instagram size={12} className="text-luxury-olive group-hover:text-luxury-black" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Line Info */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <div className="font-mono text-[9px] text-luxury-gray flex items-center gap-2">
            <span>ARTICLES & ANALYSIS 2026. ALL RIGHTS RESERVED.</span>
            <span className="text-luxury-black/10">|</span>
            <button
              onClick={() => {
                setIsAdminActive(!isAdminActive);
                scrollToTop();
              }}
              className="hover:text-luxury-black flex items-center gap-1 uppercase transition-colors"
            >
              <Sliders size={10} />
              <span>[CMS Admin Panel]</span>
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-luxury-olive hover:text-luxury-black transition-colors py-1 group"
          >
            <span>Back to top</span>
            <ArrowUp size={11} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
