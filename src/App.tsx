import IDBImage from "./components/IDBImage";
import ProjectPDFViewer from "./components/ProjectPDFViewer";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Mail,
  Linkedin,
  Instagram,
  FileText,
  Sliders,
  ChevronRight,
  Check,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  PenTool,
  FileSpreadsheet
} from 'lucide-react';

import { PortfolioData, ArchiveItem } from './types';
import { defaultPortfolioData } from './data/defaultData';
import { set as idbSet, get as idbGet } from 'idb-keyval';
import { formatExternalUrl } from './utils/url';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

const LOCAL_STORAGE_KEY = 'seryeong_portfolio_db_v5';

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
  spring: 3,
  summer: 6,
  fall: 9, autumn: 9,
  winter: 12
};

function parseDatePart(part: string): { year: number; month: number } {
  const normalized = part.toLowerCase();
  
  if (normalized.includes('present') || normalized.includes('now') || normalized.includes('진행중') || normalized.includes('현재')) {
    return { year: 9999, month: 12 };
  }
  
  const yearMatch = normalized.match(/\b(19\d{2}|20\d{2})\b/);
  let year = 0;
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  } else {
    const shortYearMatch = normalized.match(/\b(\d{2})\b/);
    if (shortYearMatch) {
      const yy = parseInt(shortYearMatch[1], 10);
      year = yy < 50 ? 2000 + yy : 1900 + yy;
    }
  }
  
  let month = 0;
  const words = normalized.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (MONTH_MAP[cleanWord]) {
      month = MONTH_MAP[cleanWord];
      break;
    }
  }
  
  return { year, month };
}

function getProjectScore(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(/[-–~]|\bto\b/i);
  const endPart = parts[parts.length - 1]?.trim() || duration;
  const { year, month } = parseDatePart(endPart);
  return year * 100 + month;
}

export default function App() {
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep/shallow merge to guarantee all sections (like 'contact') are present and have default fallbacks
        return {
          ...defaultPortfolioData,
          ...parsed,
          profile: parsed.profile ? { ...defaultPortfolioData.profile, ...parsed.profile } : defaultPortfolioData.profile,
          resume: parsed.resume ? { ...defaultPortfolioData.resume, ...parsed.resume } : defaultPortfolioData.resume,
          contact: parsed.contact ? { ...defaultPortfolioData.contact, ...parsed.contact } : defaultPortfolioData.contact,
          projects: parsed.projects || defaultPortfolioData.projects,
          archive: parsed.archive || defaultPortfolioData.archive,
        };
      } catch (e) {
        console.error('Error parsing stored portfolio database', e);
      }
    }
    return defaultPortfolioData;
  });

  const [currentPage, setCurrentPage] = React.useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<string>('All');
  const [isAdminActive, setIsAdminActive] = React.useState<boolean>(false);
  const [selectedArchiveId, setSelectedArchiveId] = React.useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = React.useState<boolean>(false);

  // Password-protected CMS Admin entry
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState<boolean>(false);
  const [passwordInput, setPasswordInput] = React.useState<string>('');
  const [passwordError, setPasswordError] = React.useState<string>('');

  React.useEffect(() => {
    let migrated = false;
    const migrateData = async () => {
      try {
        const newData = JSON.parse(JSON.stringify(portfolioData));
        
        const processString = async (str) => {
          if (str && str.startsWith('data:image/')) {
            const key = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await idbSet(key, str);
            migrated = true;
            return `idb://${key}`;
          }
          return str;
        };

        const traverse = async (obj) => {
          if (!obj) return;
          for (const k in obj) {
            if (typeof obj[k] === 'string') {
              obj[k] = await processString(obj[k]);
            } else if (typeof obj[k] === 'object') {
              await traverse(obj[k]);
            }
          }
        };

        await traverse(newData);

        if (migrated) {
          setPortfolioData(newData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
          console.log('Migrated base64 images to IndexedDB');
        }
      } catch (error) {
        console.error('Data migration error safely caught:', error);
      }
    };

    migrateData();
  }, []);


  const handleSetIsAdminActive = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isAdminActive) : val;
    if (nextVal) {
      setIsPasswordModalOpen(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setIsAdminActive(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0824') {
      setIsAdminActive(true);
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('올바르지 않은 비밀번호입니다. 다시 시도해 주세요.');
    }
  };

  // Sync back to local storage
  const handleSaveData = (newData: PortfolioData) => {
    setPortfolioData(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleDownloadResume = async (url: string | undefined, lang: string) => {
    if (!url || url === '#') {
      alert(lang === 'ko' ? '국문 이력서 다운로드 (준비 중입니다)' : '영문 이력서 다운로드 (준비 중입니다)');
      return;
    }
    
    try {
      let finalUrl = url;
      if (url.startsWith('idb://')) {
        const key = url.replace('idb://', '');
        const data = await idbGet(key);
        if (data && typeof data === 'string' && data.startsWith('data:')) {
          const res = await fetch(data);
          const blob = await res.blob();
          finalUrl = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = finalUrl;
          a.download = `Resume_${lang.toUpperCase()}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(finalUrl), 1000);
          return;
        } else {
          alert('저장된 PDF 데이터를 불러올 수 없습니다. (' + (data ? '잘못된 형식' : '데이터 없음') + ')');
          return;
        }
      }
      
      window.open(finalUrl, '_blank');
    } catch (err) {
      console.error("Error downloading resume:", err);
      alert("Error downloading resume: " + err);
    }
  };

  const handleResumePdfUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>, lang: 'ko' | 'en') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기가 10MB를 초과할 수 없습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const key = `pdf_${lang}_${Date.now()}`;
          await idbSet(key, base64String);
          
          const updatedContact = {
            ...portfolioData.contact,
            [lang === 'ko' ? 'resumePdfUrlKo' : 'resumePdfUrlEn']: `idb://${key}`
          };
          
          const updatedData = {
            ...portfolioData,
            contact: updatedContact
          };
          
          handleSaveData(updatedData);
          alert(lang === 'ko' ? '국문 이력서가 성공적으로 업로드되었습니다.' : '영문 이력서가 성공적으로 업로드되었습니다.');
        } catch (err) {
          console.error("Error uploading file:", err);
          alert("업로드 중 오류가 발생했습니다.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPortfolioData(defaultPortfolioData);
    setCurrentPage('home');
    setSelectedProjectId(null);
    setIsAdminActive(false);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(portfolioData.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Extract variables
  const { profile, projects, resume, archive, contact } = portfolioData;

  // Sort projects so that the most recent ones automatically appear at the top
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => getProjectScore(b.duration) - getProjectScore(a.duration));
  }, [projects]);

  // Filter project grid (always show all projects)
  const filteredProjects = sortedProjects;

  // Featured projects for Hero list
  const featuredProjects = sortedProjects.slice(0, 4);

  return (
    <div className="min-h-screen bg-luxury-bg text-luxury-black font-sans selection:bg-luxury-olive selection:text-white flex flex-col justify-between">
      
      {/* Top Admin Warning Strip (Only visible in CMS Admin mode) */}
      <AnimatePresence>
        {isAdminActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-luxury-black text-luxury-bg text-[10px] uppercase tracking-[0.25em] py-2 px-6 sm:px-12 flex justify-between items-center border-b border-luxury-olive/30 font-mono text-center"
          >
            <div className="flex items-center gap-2 mx-auto">
              <span className="w-1.5 h-1.5 bg-luxury-olive rounded-full animate-pulse" />
              <span>Aesthetic Administration Sandbox Mode Active &mdash; Customize Everything Below</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <Header
        profile={profile}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdminActive={isAdminActive}
        setIsAdminActive={handleSetIsAdminActive}
        setSelectedProjectId={setSelectedProjectId}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* Active CMS Dashboard mode override */}
          {isAdminActive ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <AdminPanel
                portfolioData={portfolioData}
                onSave={handleSaveData}
                onResetToDefault={handleResetToDefault}
                onClose={() => setIsAdminActive(false)}
              />
            </motion.div>

          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */
            <motion.div
              key={`casestudy-${selectedProjectId}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <ProjectPDFViewer
                project={projects.find((p) => p.id === selectedProjectId)!}
                onBack={() => setSelectedProjectId(null)}
              />
            </motion.div>
          ) : (
            /* Traditional Tab Routers */
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              
              {/* PAGE 1: HOME */}
              {currentPage === 'home' && (
                <div className="space-y-24">
                  {/* Hero Intro Grid */}
                  <section className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 sm:pt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Editorial Main Title */}
                    <div className="lg:col-span-8 space-y-4">
                      <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-luxury-black leading-none uppercase">
                        {profile.englishName}
                      </h1>
                      <div className="font-display text-3xl sm:text-4xl italic font-light lowercase text-luxury-olive">
                        portfolio
                      </div>
                    </div>

                    {/* Secondary Competency List and short Intro */}
                    <div className="lg:col-span-4 lg:pt-14 space-y-6 border-l border-luxury-black/15 pl-6 sm:pl-8">
                      <p className="font-sans text-sm text-luxury-gray leading-relaxed font-light">
                        {profile.tagline}
                      </p>
                      <div className="space-y-2 pt-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive block font-bold">
                          Core Verticals
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['Brand Strategy', 'Marketing', 'Consumer Insight', 'Retail', 'Merchandising'].map((tag, i) => (
                            <span
                              key={i}
                              className="font-sans text-[10px] uppercase tracking-wider text-luxury-black border border-luxury-black/10 px-2.5 py-1 bg-luxury-beige/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* High-end Full Width Cover Banner */}
                  <section className="w-full h-[55vh] sm:h-[75vh] overflow-hidden border-y border-luxury-black/10 relative bg-luxury-beige/10">
                    <IDBImage
                      src={profile.coverImage || "/src/assets/images/seryeong_attached_collage_1783323872970.jpg"}
                      alt="Seryeong Koo Lifestyle Moodboard"
                      className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-luxury-black/[0.04]" />
                  </section>




                  {/* Selected Works Swiss Grid */}
                  <section className="max-w-7xl mx-auto px-6 sm:px-12">
                    <div className="border-b border-luxury-black/10 pb-4 mb-12 flex justify-between items-end">
                      <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-luxury-black uppercase">
                        Selected Works
                      </h2>
                      <button
                        onClick={() => setCurrentPage('projects')}
                        className="font-sans text-[10px] uppercase tracking-[0.25em] text-luxury-olive hover:text-luxury-black transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <span>View All Projects</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                      {featuredProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => handleProjectClick(proj.id)}
                          className="group cursor-pointer space-y-4"
                        >
                          <div className="w-full aspect-[4/3] overflow-hidden border border-luxury-black/5 relative bg-luxury-beige/30">
                            <IDBImage
                              src={proj.coverImage}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale-[25%]"
                            />
                            <div className="absolute top-4 right-4 bg-luxury-black text-luxury-bg text-[9px] uppercase tracking-widest px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              View Project
                            </div>
                          </div>

                          <div className="flex justify-between items-start pt-1">
                            <div className="space-y-2 w-full pr-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-display text-xl sm:text-2xl text-luxury-black font-medium leading-tight group-hover:text-luxury-olive transition-colors">
                                  {proj.title}
                                </h3>
                              </div>
                              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive font-semibold block">
                                {proj.category} &mdash; {proj.duration}
                              </div>
                              {proj.description && (
                                <p className="font-sans text-sm text-luxury-gray line-clamp-2 leading-relaxed">
                                  {proj.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-luxury-gray group-hover:text-luxury-black transition-colors mt-1.5 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resume Download Buttons under projects */}
                    <div className="mt-16 pt-8 border-t border-luxury-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="space-y-1">
                        <h4 className="font-display text-lg text-luxury-black uppercase tracking-wider font-medium">Resume</h4>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => handleDownloadResume(contact.resumePdfUrlKo, 'ko')}
                          className="px-5 py-3 border border-luxury-black/25 hover:border-luxury-olive hover:bg-luxury-beige/30 text-luxury-black transition-all font-sans text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
                        >
                          <Download size={13} className="text-luxury-olive" />
                          <span>국문 이력서 다운로드 (KO)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadResume(contact.resumePdfUrlEn, 'en')}
                          className="px-5 py-3 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-sans text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
                        >
                          <Download size={13} />
                          <span>English Resume (EN)</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Clean, Humble One Line Quote Callout */}
                  <section className="max-w-7xl mx-auto px-6 sm:px-12 py-12 border-t border-b border-luxury-black/5 flex justify-center text-center">
                    <div className="max-w-3xl space-y-4">
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-luxury-gray font-bold block">
                        Personal Statement
                      </span>
                      <p className="font-display text-2xl sm:text-3xl italic font-light text-luxury-black leading-relaxed">
                        "I aspire to bridge people, cultures, and brands through the power of fashion. By combining creative thinking with strategic insight, I aim to build meaningful brand experiences that inspire connection and create lasting value."
                      </p>
                    </div>
                  </section>

                </div>
              )}


              {/* PAGE 2: PROJECTS DIRECTORY */}
              {currentPage === 'projects' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 space-y-16">
                  {/* Title */}
                  <div className="border-b border-luxury-black/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block mb-1">
                        Professional Portfolios
                      </span>
                      <h1 className="font-display text-4xl sm:text-5xl text-luxury-black font-medium tracking-tight uppercase">
                        Projects
                      </h1>
                    </div>
                  </div>

                  {/* Dynamic Projects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                      {filteredProjects.map((proj) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4 }}
                          key={proj.id}
                          onClick={() => handleProjectClick(proj.id)}
                          className="group cursor-pointer space-y-4"
                        >
                          <div className="w-full aspect-[4/3] overflow-hidden border border-luxury-black/5 relative bg-luxury-beige/30">
                            <IDBImage
                              src={proj.coverImage}
                              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-luxury-black/5 group-hover:bg-transparent transition-colors" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-display text-lg font-medium text-luxury-black leading-snug group-hover:text-luxury-olive transition-colors">
                                {proj.title}
                              </h3>
                              <span className="font-mono text-[9px] text-luxury-gray">{proj.duration}</span>
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-semibold block">
                              {proj.category}
                            </span>
                            {proj.description && (
                              <p className="font-sans text-xs text-luxury-gray line-clamp-3 leading-relaxed">
                                {proj.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* PAGE 3: ABOUT */}
              {currentPage === 'about' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 space-y-24">
                  {/* Split Layout: Portrait Left, Content Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    
                    {/* Left Column: Portrait & Name Card (Side-by-side Layout) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Portrait Image (Clean modern design, more compact size) */}
                        <div className="w-[150px] sm:w-[180px] aspect-[3/4] overflow-hidden border border-luxury-black/10 bg-luxury-beige/5 shrink-0 mx-auto sm:mx-0">
                          <IDBImage
                            src={profile.profileImage}
                            alt={profile.englishName}
                            className="w-full h-full object-cover transition-all duration-700 hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        {/* Name & Contact Details beside the photo */}
                        <div className="flex-1 space-y-5 text-center sm:text-left w-full">
                          <div className="space-y-1">
                            <h2 className="font-display text-2xl font-semibold text-luxury-black tracking-tight leading-tight">
                              {profile.englishName}
                            </h2>
                            <span className="font-sans text-[11px] text-luxury-gray block uppercase tracking-[0.2em] font-medium">
                              {profile.name}
                            </span>
                          </div>

                          <div className="border-t border-luxury-black/10 pt-4 space-y-4">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-bold block">
                              Contact
                            </span>
                            <div className="space-y-3">
                              <div className="space-y-0.5">
                                <span className="font-mono text-[8px] text-luxury-gray uppercase block tracking-wider">Email</span>
                                <a 
                                  href={`mailto:${contact.email}`} 
                                  className="font-sans text-xs text-luxury-black hover:text-luxury-olive transition-colors break-all underline decoration-luxury-black/10 hover:decoration-luxury-olive/50 underline-offset-2"
                                >
                                  {contact.email}
                                </a>
                              </div>
                              {contact.linkedin && contact.linkedin !== '#' && (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[8px] text-luxury-gray uppercase block tracking-wider">LinkedIn</span>
                                  <a 
                                    href={contact.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-sans text-xs text-luxury-black hover:text-luxury-olive transition-colors break-all underline decoration-luxury-black/10 hover:decoration-luxury-olive/50 underline-offset-2"
                                  >
                                    LinkedIn Profile
                                  </a>
                                </div>
                              )}
                              {contact.instagram && contact.instagram !== '#' && (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[8px] text-luxury-gray uppercase block tracking-wider">Instagram</span>
                                  <a 
                                    href={contact.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-sans text-xs text-luxury-black hover:text-luxury-olive transition-colors break-all underline decoration-luxury-black/10 hover:decoration-luxury-olive/50 underline-offset-2"
                                  >
                                    Instagram Profile
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Small subtle summary note */}
                      <div className="hidden lg:block border-l border-luxury-olive/30 pl-4 py-1">
                        <p className="font-sans text-[11px] text-luxury-gray italic leading-relaxed">
                          "{profile.tagline || 'Consumer insight and sensory brand architecture.'}"
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Structured Information Categories */}
                    <div className="lg:col-span-7 space-y-12">
                      
                      {/* 1. ABOUT ME */}
                      <section className="space-y-4">
                        <div className="border-b border-luxury-black/10 pb-2 flex justify-between items-end">
                          <h3 className="font-display text-lg font-medium uppercase tracking-wider text-luxury-black">
                            About Me
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive">
                            [01 / Identity]
                          </span>
                        </div>
                        <div className="space-y-4">
                          <p className="font-sans text-sm text-luxury-black leading-relaxed font-normal whitespace-pre-line">
                            {profile.profileText}
                          </p>
                          
                          {/* Experience Snapshot integrated elegantly here */}
                          {profile.experienceSnapshot && profile.experienceSnapshot.length > 0 && (
                            <div className="pt-4 space-y-3">
                              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-luxury-olive font-semibold block">
                                Experience Milestones
                              </span>
                              <div className="divide-y divide-luxury-black/10">
                                {profile.experienceSnapshot.map((snap, idx) => (
                                  <div
                                    key={idx}
                                    className="py-3 flex items-start gap-4 transition-colors hover:bg-luxury-beige/10"
                                  >
                                    <span className="font-mono text-[10px] text-luxury-olive font-bold mt-0.5">
                                      0{idx + 1}
                                    </span>
                                    <p className="font-sans text-xs text-luxury-black font-normal leading-relaxed">
                                      {snap}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* 2. EDUCATION */}
                      <section className="space-y-4">
                        <div className="border-b border-luxury-black/10 pb-2 flex justify-between items-end">
                          <h3 className="font-display text-lg font-medium uppercase tracking-wider text-luxury-black">
                            Education
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive">
                            [02 / Academic Pedigree]
                          </span>
                        </div>
                        <div className="space-y-6">
                          {resume.education.map((edu, idx) => (
                            <div key={idx} className="border-l border-luxury-black/15 pl-4 py-1 space-y-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                                <span className="font-sans text-xs text-luxury-olive font-semibold uppercase tracking-wider">
                                  {edu.school}
                                </span>
                                <span className="font-mono text-[10px] text-luxury-gray">{edu.duration}</span>
                              </div>
                              <h4 className="font-display text-lg font-medium text-luxury-black">
                                {edu.degree}
                              </h4>
                              {edu.gpa && (
                                <span className="inline-block bg-luxury-beige/40 px-2 py-0.5 rounded font-mono text-[10px] text-luxury-olive font-medium mt-1">
                                  {edu.gpa}
                                </span>
                              )}
                              {edu.details && (
                                <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light pt-1">
                                  {edu.details}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* 3. SKILLS */}
                      <section className="space-y-4">
                        <div className="border-b border-luxury-black/10 pb-2 flex justify-between items-end">
                          <h3 className="font-display text-lg font-medium uppercase tracking-wider text-luxury-black">
                            Skills
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive">
                            [03 / Expertise]
                          </span>
                        </div>
                        <div className="space-y-6 pt-1">
                          {/* Core Competencies list */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                            {profile.competencies.map((comp, idx) => (
                              <div
                                key={idx}
                                className="font-sans text-xs uppercase tracking-wider text-luxury-black py-2.5 border-b border-luxury-black/5 flex justify-between items-center group hover:border-luxury-olive/30 transition-colors"
                              >
                                <span>{comp}</span>
                                <ChevronRight size={10} className="text-luxury-olive opacity-50 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))}
                          </div>

                          {/* Simple Tools & Software row */}
                          <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-luxury-black/5">
                            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-luxury-gray">
                              Software Proficiency:
                            </span>
                            <div className="flex items-center gap-3">
                              {/* Photoshop */}
                              <div className="relative group w-8 h-8 rounded border border-luxury-black/10 flex items-center justify-center bg-white hover:border-[#00C8FF] hover:shadow-sm transition-all duration-300" title="Photoshop">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="24" rx="4" fill="#001C3A"/>
                                  <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" stroke="#00C8FF" stroke-width="1"/>
                                  <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="#00C8FF" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="10">Ps</text>
                                </svg>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-black text-white text-[9px] font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-10">
                                  Photoshop
                                </span>
                              </div>

                              {/* Illustrator */}
                              <div className="relative group w-8 h-8 rounded border border-luxury-black/10 flex items-center justify-center bg-white hover:border-[#FF9A00] hover:shadow-sm transition-all duration-300" title="Illustrator">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="24" rx="4" fill="#261300"/>
                                  <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" stroke="#FF9A00" stroke-width="1"/>
                                  <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="#FF9A00" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="10">Ai</text>
                                </svg>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-black text-white text-[9px] font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-10">
                                  Illustrator
                                </span>
                              </div>

                              {/* Excel */}
                              <div className="relative group w-8 h-8 rounded border border-luxury-black/10 flex items-center justify-center bg-white hover:border-[#107C41] hover:shadow-sm transition-all duration-300" title="Excel">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="10" y="4" width="18" height="24" rx="2" fill="#107C41" />
                                  <rect x="4" y="8" width="14" height="16" rx="1.5" fill="#1F9A55" />
                                  <path d="M8 12.5L10.5 16L8 19.5H9.5L11.25 17L13 19.5H14.5L12 16L14.5 12.5H13L11.25 15L9.5 12.5H8Z" fill="#FFFFFF" />
                                </svg>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-black text-white text-[9px] font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-10">
                                  Excel
                                </span>
                              </div>

                              {/* Word */}
                              <div className="relative group w-8 h-8 rounded border border-luxury-black/10 flex items-center justify-center bg-white hover:border-[#2B579A] hover:shadow-sm transition-all duration-300" title="Word">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="10" y="4" width="18" height="24" rx="2" fill="#0F4C81" />
                                  <rect x="4" y="8" width="14" height="16" rx="1.5" fill="#2B579A" />
                                  <path d="M7.5 12.5L9.5 19.5H11L12 15.5L13 19.5H14.5L16.5 12.5H15L13.75 17.5L12.5 12.5H11.5L10.25 17.5L9 12.5H7.5Z" fill="#FFFFFF" />
                                </svg>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-black text-white text-[9px] font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-10">
                                  Word
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 4. LANGUAGE */}
                      <section className="space-y-4">
                        <div className="border-b border-luxury-black/10 pb-2 flex justify-between items-end">
                          <h3 className="font-display text-lg font-medium uppercase tracking-wider text-luxury-black">
                            Language
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive">
                            [04 / Linguistics]
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                          {resume.languages.map((lang, idx) => {
                            const parts = lang.split(' ');
                            const mainLang = parts[0];
                            const proficiency = parts.slice(1).join(' ') || 'Fluent';
                            return (
                              <div
                                key={idx}
                                className="flex justify-between items-baseline py-2 border-b border-luxury-black/5"
                              >
                                <span className="font-sans text-xs font-semibold text-luxury-black">{mainLang}</span>
                                <span className="font-mono text-[10px] text-luxury-olive uppercase tracking-wider">{proficiency}</span>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: RESUME (CV) */}
              {currentPage === 'resume' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 space-y-16">
                  {/* Header Title with PDF download button */}
                  <div className="border-b border-luxury-black/10 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                      <h1 className="font-display text-4xl sm:text-5xl text-luxury-black font-medium tracking-tight uppercase">
                        Resume
                      </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                      {/* Korean Resume Controls */}
                      <button
                        onClick={() => handleDownloadResume(contact.resumePdfUrlKo, 'ko')}
                        className="px-5 py-3 border border-luxury-black/25 hover:border-luxury-olive hover:bg-luxury-beige/30 text-luxury-black transition-all font-sans text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 focus:outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <Download size={13} className="text-luxury-olive" />
                        <span>국문 이력서 다운로드 (KO)</span>
                      </button>

                      {/* English Resume Controls */}
                      <button
                        onClick={() => handleDownloadResume(contact.resumePdfUrlEn, 'en')}
                        className="px-5 py-3 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-sans text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 focus:outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <Download size={13} />
                        <span>English Resume (EN)</span>
                      </button>
                    </div>
                  </div>

                  {/* Split Swiss Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    {/* Left Column: Education and Experience */}
                    <div className="lg:col-span-8 space-y-12">
                      {/* Education Block */}
                      <div className="space-y-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold block">
                          [Academic Education]
                        </span>
                        
                        <div className="space-y-6">
                          {resume.education.map((edu, idx) => (
                            <div key={idx} className="border-l border-luxury-black/20 pl-6 relative space-y-1">
                              <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-luxury-olive border border-luxury-bg rounded-full" />
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 font-mono text-xs text-luxury-olive">
                                <span className="font-semibold">{edu.school}</span>
                                <span className="text-luxury-gray">{edu.duration}</span>
                              </div>
                              <h4 className="font-display text-xl font-medium text-luxury-black">
                                {edu.degree}
                              </h4>
                              {edu.gpa && <p className="font-sans text-xs text-luxury-olive font-semibold">{edu.gpa}</p>}
                              {edu.details && (
                                <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light pt-1">
                                  {edu.details}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Block */}
                      <div className="space-y-6 border-t border-luxury-black/5 pt-10">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold block">
                          [Corporate & Creative Experience]
                        </span>

                        <div className="space-y-8">
                          {resume.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-3">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                <div>
                                  <h4 className="font-display text-xl font-medium text-luxury-black">
                                    {exp.role}
                                  </h4>
                                  <span className="font-sans text-xs text-luxury-olive font-semibold block">
                                    {exp.company} &mdash; <span className="font-light italic">{exp.location}</span>
                                  </span>
                                </div>
                                <span className="font-mono text-xs text-luxury-gray">{exp.duration}</span>
                              </div>

                              <ul className="space-y-1.5 list-disc list-inside font-sans text-xs text-luxury-gray leading-relaxed font-light">
                                {exp.details.map((detail, dIdx) => (
                                  <li key={dIdx}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Skills, Awards, Languages */}
                    <div className="lg:col-span-4 space-y-10 lg:border-l lg:border-luxury-black/10 lg:pl-8">
                      {/* Strategic Skills */}
                      <div className="space-y-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold block">
                          Methodologies
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {resume.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-luxury-beige/40 text-luxury-black border border-luxury-black/5 text-xs font-mono"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Awards & Distinctions */}
                      <div className="space-y-4 border-t border-luxury-black/5 pt-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold block">
                          Awards & Honors
                        </span>
                        <div className="space-y-3">
                          {resume.awards.map((aw, i) => (
                            <div key={i} className="space-y-0.5 text-xs">
                              <div className="flex justify-between items-center font-semibold text-luxury-black">
                                <span>{aw.title}</span>
                                <span className="font-mono text-luxury-gray font-light">{aw.year}</span>
                              </div>
                              <p className="text-luxury-gray font-light">{aw.issuer}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="space-y-4 border-t border-luxury-black/5 pt-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold block">
                          Languages
                        </span>
                        <div className="space-y-2">
                          {resume.languages.map((lang, i) => (
                            <div key={i} className="flex justify-between text-xs font-sans text-luxury-black">
                              <span className="font-semibold">{lang.split(' ')[0]}</span>
                              <span className="text-luxury-gray italic">{lang.split(' ').slice(1).join(' ') || 'Proficient'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* PAGE 5: STUDIO ARCHIVE */}
              {currentPage === 'archive' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 space-y-16">
                  {/* Header */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block mb-1">
                      Secondary Documents
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl text-luxury-black font-medium tracking-tight uppercase">
                      Articles & Analysis
                    </h1>
                    <p className="font-sans text-xs text-luxury-gray mt-1 font-light">
                      Supplementary research notebooks, conceptual campaign decks, material processes, and presentation scripts.
                    </p>
                  </div>

                  {/* Archive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {archive.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedArchiveId(selectedArchiveId === item.id ? null : item.id)}
                        className={`border bg-white flex flex-col justify-between cursor-pointer transition-all duration-300 group hover:shadow-md ${
                          selectedArchiveId === item.id
                            ? 'border-luxury-black bg-white ring-1 ring-luxury-black/10'
                            : 'border-luxury-black/10 hover:border-luxury-black/30'
                        }`}
                      >
                        <div>
                          {/* Cover Image */}
                          {item.coverImage && (
                            <div className="aspect-[16/10] overflow-hidden border-b border-luxury-black/10 bg-luxury-beige/5 relative">
                              <IDBImage
                                src={item.coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          <div className="p-6 space-y-4">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] text-luxury-gray uppercase tracking-wider">
                              <span className="text-luxury-olive font-bold">{item.type}</span>
                              <span className="text-luxury-black/10">•</span>
                              <span>{item.date}</span>
                              {item.readTime && (
                                <>
                                  <span className="text-luxury-black/10">•</span>
                                  <span className="text-luxury-olive font-semibold bg-luxury-olive/5 px-2 py-0.5 rounded-sm">{item.readTime}</span>
                                </>
                              )}
                            </div>

                            <h3 className="font-display text-lg sm:text-xl font-semibold text-luxury-black leading-snug group-hover:text-luxury-olive transition-colors">
                              {item.title}
                            </h3>

                            <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light line-clamp-3">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2">
                          {/* Slide open transcripts */}
                          <AnimatePresence>
                            {selectedArchiveId === item.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden border-t border-luxury-black/10 pt-4 mt-2 text-xs font-sans text-luxury-black leading-relaxed space-y-4"
                                onClick={(e) => e.stopPropagation()} // Prevent closing card when clicking inside text
                              >
                                <div className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-bold">
                                  Article Narrative & Analysis
                                </div>
                                <p className="whitespace-pre-line text-luxury-black font-normal bg-luxury-beige/10 p-3 border border-luxury-black/5 rounded-sm">
                                  {item.content}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-between items-center pt-4 border-t border-luxury-black/5 mt-2 font-mono text-[9px] uppercase tracking-wider text-luxury-olive">
                            <span className="font-bold">{selectedArchiveId === item.id ? '[Close Article]' : '[Read Full Article]'}</span>
                            <ChevronRight
                              size={12}
                              className={`transition-transform duration-300 ${
                                selectedArchiveId === item.id ? 'rotate-90 text-luxury-black' : 'text-luxury-olive group-hover:translate-x-0.5'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAGE 6: CONTACT */}
              {currentPage === 'contact' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 flex flex-col justify-between min-h-[60vh] w-full">
                  
                  {/* Top Section: Left-aligned big title */}
                  <div className="text-left space-y-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block">
                      [06 / Get In Touch]
                    </span>
                    <h1 className="font-display text-4xl sm:text-7xl font-light tracking-tight text-luxury-black uppercase">
                      Contact & Info
                    </h1>
                  </div>

                  {/* Middle Spacer to push elements to bottom */}
                  <div className="flex-1 min-h-[8rem]" />

                  {/* Bottom Section: Row of email and social media links */}
                  <div className="border-t border-luxury-black/15 pt-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    
                    {/* Email */}
                    <button
                      onClick={copyEmailToClipboard}
                      className="group flex flex-col items-start text-left focus:outline-none cursor-pointer w-full"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive mb-1 font-bold">
                        Email Address
                      </span>
                      <span className="font-display text-lg sm:text-2xl font-medium text-luxury-black group-hover:text-luxury-olive transition-colors break-all border-b border-transparent group-hover:border-luxury-olive/30 pb-0.5">
                        {contact.email}
                      </span>
                      {copiedEmail && (
                        <span className="font-mono text-[8px] uppercase tracking-widest text-luxury-olive mt-1.5 font-bold animate-fade-in">
                          [Copied to clipboard]
                        </span>
                      )}
                    </button>

                    {/* LinkedIn */}
                    {contact.linkedin && contact.linkedin !== '#' && (
                      <a
                        href={formatExternalUrl(contact.linkedin)}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col items-start text-left w-full"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive mb-1 font-bold">
                          LinkedIn
                        </span>
                        <span className="font-display text-lg sm:text-2xl font-medium text-luxury-black group-hover:text-luxury-olive transition-colors border-b border-transparent group-hover:border-luxury-olive/30 pb-0.5">
                          LINKEDIN PROFILE
                        </span>
                      </a>
                    )}

                    {/* Instagram */}
                    {contact.instagram && contact.instagram !== '#' && (
                      <a
                        href={formatExternalUrl(contact.instagram)}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col items-start text-left w-full"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive mb-1 font-bold">
                          Instagram
                        </span>
                        <span className="font-display text-lg sm:text-2xl font-medium text-luxury-black group-hover:text-luxury-olive transition-colors border-b border-transparent group-hover:border-luxury-olive/30 pb-0.5">
                          INSTAGRAM PROFILE
                        </span>
                      </a>
                    )}

                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Footer */}
      <Footer
        portfolioData={portfolioData}
        setCurrentPage={setCurrentPage}
        setIsAdminActive={handleSetIsAdminActive}
        setSelectedProjectId={setSelectedProjectId}
        isAdminActive={isAdminActive}
      />

      {/* Elegant Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-luxury-bg border border-luxury-olive/30 max-w-md w-full p-8 sm:p-10 shadow-2xl relative"
            >
              {/* Decorative top border highlight */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-luxury-olive" />

              <div className="text-center space-y-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block">
                  Security Access
                </span>
                <h2 className="font-display text-2xl uppercase tracking-wider text-luxury-black font-medium">
                  Administrator Entry
                </h2>
                <p className="font-sans text-xs text-luxury-gray leading-relaxed max-w-xs mx-auto">
                  관리자 권한을 인증하기 위해 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-gray font-semibold">
                    Access Key
                  </label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    autoFocus
                    className="w-full text-center tracking-[0.5em] font-mono py-3.5 px-4 bg-white/50 border border-luxury-black/10 focus:border-luxury-olive focus:ring-1 focus:ring-luxury-olive/20 outline-none text-luxury-black transition-all text-lg placeholder:tracking-normal placeholder:text-luxury-gray/30"
                  />
                  {passwordError && (
                    <p className="text-red-500 font-sans text-xs mt-2 text-center">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPasswordInput('');
                      setPasswordError('');
                    }}
                    className="flex-1 py-3 border border-luxury-black/15 hover:bg-luxury-beige/30 font-mono text-[10px] uppercase tracking-wider transition-colors text-luxury-gray hover:text-luxury-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-luxury-black text-white hover:bg-luxury-olive font-mono text-[10px] uppercase tracking-wider transition-colors"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
