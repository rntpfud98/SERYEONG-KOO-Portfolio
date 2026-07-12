import IDBImage from "./IDBImage";
import { set as idbSet } from "idb-keyval";
import React from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  FileDown,
  FileUp,
  Sliders,
  CheckCircle,
  Eye,
  AlertTriangle,
  User,
  Briefcase,
  FileText,
  Archive,
  Grid,
  Mail
} from 'lucide-react';
import { PortfolioData, Project, ArchiveItem, EducationItem, ExperienceItem, AwardItem, } from '../types';

interface AdminPanelProps {
  portfolioData: PortfolioData;
  onSave: (newData: PortfolioData) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

export default function AdminPanel({
  portfolioData,
  onSave,
  onResetToDefault,
  onClose,
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'profile' | 'projects' | 'resume' | 'archive' | 'contact' | 'system'>('profile');
  
  // Custom non-blocking modal state to bypass iframe confirm/alert blocks
  const [modalConfig, setModalConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert';
    onConfirm: () => void;
  } | null>(null);

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        setModalConfig(null);
      }
    });
  };

  const showCustomAlert = (title: string, message: string, onConfirm?: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setModalConfig(null);
      }
    });
  };
  
  // Local clones of data for editing
  const [profile, setProfile] = React.useState({ ...portfolioData.profile });
  const [contact, setContact] = React.useState({ ...portfolioData.contact });
  const [resume, setResume] = React.useState({ ...portfolioData.resume });
  const [archive, setArchive] = React.useState<ArchiveItem[]>([...portfolioData.archive]);
  const [projects, setProjects] = React.useState<Project[]>([...portfolioData.projects]);
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(projects[0]?.id || null);

  // Selected sub-items for detail editing
  const [editingArchiveId, setEditingArchiveId] = React.useState<string | null>(archive[0]?.id || null);

  // Success notifications
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Ref for file import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profileImage' | 'coverImage'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('이미지 크기가 2.5MB를 초과합니다. 더 작은 이미지를 선택해 주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = `img_${Date.now()}`;
        await idbSet(key, base64String);
        setProfile((prev) => ({
          ...prev,
          [type]: `idb://${key}`,
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  // Project Manager
  const getSelectedProject = () => projects.find((p) => p.id === editingProjectId);
  const handleProjectFieldChange = (projectId: string, field: keyof Project, val: any) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, [field]: val } : p));
  };
  const addNewProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'New Project',
      category: 'Branding',
      duration: '2025',
      description: 'Project description',
      coverImage: ''
    };
    setProjects([newProj, ...projects]);
    setEditingProjectId(newProj.id);
  };
  const deleteProject = (id: string) => {
    showCustomConfirm(
      'Delete Project',
      'Are you sure you want to delete this project?',
      () => {
        const remaining = projects.filter(p => p.id !== id);
        setProjects(remaining);
        setEditingProjectId(remaining[0]?.id || null);
      }
    );
  };
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        showCustomAlert('Image Size Limit', 'Image size exceeds 2.5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = `img_${Date.now()}`;
        await idbSet(key, base64String);
        handleProjectFieldChange(projectId, 'coverImage', `idb://${key}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectDetailImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    
    const currentImages = proj.detailImages || [];
    const newImages: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Some images exceed 5MB. They will be skipped.');
        continue;
      }
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64String = await base64Promise;
      const key = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await idbSet(key, base64String);
      newImages.push(`idb://${key}`);
    }

    if (newImages.length > 0) {
      handleProjectFieldChange(projectId, 'detailImages', [...currentImages, ...newImages]);
    }
  };

  const handleRemoveDetailImage = (projectId: string, indexToRemove: number) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.detailImages) return;
    const newImages = proj.detailImages.filter((_, idx) => idx !== indexToRemove);
    handleProjectFieldChange(projectId, 'detailImages', newImages);
  };
  const handleArchiveImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    archiveId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        showCustomAlert('이미지 크기 초과', '이미지 크기가 2.5MB를 초과합니다. 더 작은 이미지를 선택해 주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = `img_${Date.now()}`;
        await idbSet(key, base64String);
        handleArchiveFieldChange(archiveId, 'coverImage', `idb://${key}`);
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleResumePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, lang: 'ko' | 'en') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showCustomAlert('File Size Limit', 'File size exceeds 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = `pdf_${lang}_${Date.now()}`;
        await idbSet(key, base64String);
        setContact((prev) => ({ ...prev, [lang === 'ko' ? 'resumePdfUrlKo' : 'resumePdfUrlEn']: `idb://${key}` }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [showSuccess, setShowSuccess] = React.useState(false);
  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const handleGlobalSave = () => {
    try {
      const updatedData: PortfolioData = {
        profile,
        contact,
        projects,
        resume,
        archive,
      };
      onSave(updatedData);
      triggerSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving');
    }
  };

  // Profile Competency and Snapshot managers
  const handleCompetencyChange = (index: number, val: string) => {
    const updated = [...profile.competencies];
    updated[index] = val;
    setProfile({ ...profile, competencies: updated });
  };

  const addCompetency = () => {
    setProfile({ ...profile, competencies: [...profile.competencies, 'New Strategic Competency'] });
  };

  const removeCompetency = (index: number) => {
    setProfile({ ...profile, competencies: profile.competencies.filter((_, i) => i !== index) });
  };

  const handleSnapshotChange = (index: number, val: string) => {
    const updated = [...profile.experienceSnapshot];
    updated[index] = val;
    setProfile({ ...profile, experienceSnapshot: updated });
  };

  const addSnapshot = () => {
    setProfile({ ...profile, experienceSnapshot: [...profile.experienceSnapshot, 'New Milestone / Role'] });
  };

  const removeSnapshot = (index: number) => {
    setProfile({ ...profile, experienceSnapshot: profile.experienceSnapshot.filter((_, i) => i !== index) });
  };

  // Resume item list editors
  const handleEducationChange = (index: number, field: keyof EducationItem, val: string) => {
    const list = [...resume.education];
    list[index] = { ...list[index], [field]: val };
    setResume({ ...resume, education: list });
  };

  const addEducation = () => {
    const newItem: EducationItem = { degree: 'M.S. in Luxury Management', school: 'SDA Bocconi, Milan', duration: '2027 – 2028', details: 'Core focuses on bespoke logistics.' };
    setResume({ ...resume, education: [...resume.education, newItem] });
  };

  const removeEducation = (index: number) => {
    setResume({ ...resume, education: resume.education.filter((_, i) => i !== index) });
  };

  const handleExperienceChange = (index: number, field: keyof ExperienceItem, val: any) => {
    const list = [...resume.experience];
    list[index] = { ...list[index], [field]: val };
    setResume({ ...resume, experience: list });
  };

  const addExperience = () => {
    const newItem: ExperienceItem = {
      role: 'Fashion Analyst Intern',
      company: 'Kering Group',
      duration: 'Summer 2026',
      location: 'Milan, Italy',
      details: ['Assisted in digital merchandise optimization maps.']
    };
    setResume({ ...resume, experience: [...resume.experience, newItem] });
  };

  const removeExperience = (index: number) => {
    setResume({ ...resume, experience: resume.experience.filter((_, i) => i !== index) });
  };

  const handleAwardChange = (index: number, field: keyof AwardItem, val: string) => {
    const list = [...resume.awards];
    list[index] = { ...list[index], [field]: val };
    setResume({ ...resume, awards: list });
  };

  const addAward = () => {
    const newItem: AwardItem = { title: 'LVMH Next Gen finalist', issuer: 'LVMH Paris', year: '2026' };
    setResume({ ...resume, awards: [...resume.awards, newItem] });
  };

  const removeAward = (index: number) => {
    setResume({ ...resume, awards: resume.awards.filter((_, i) => i !== index) });
  };

  // Archive items
  const handleArchiveFieldChange = (id: string, field: keyof ArchiveItem, val: any) => {
    setArchive(
      archive.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: val };
        }
        return a;
      })
    );
  };

  const addNewArchive = () => {
    const newId = `archive-${Date.now()}`;
    const newItem: ArchiveItem = {
      id: newId,
      title: 'New Analytical Research Document',
      type: 'Research Notes',
      date: 'Spring 2026',
      coverImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200',
      description: 'Abstract and high-level summaries of supplementary fashion analysis.',
      content: 'In-depth text or presentation notes supporting the fashion brand business model.',
      readTime: '3 min read'
    };
    setArchive([...archive, newItem]);
    setEditingArchiveId(newId);
  };

  const deleteArchive = (id: string) => {
    showCustomConfirm(
      'Delete Archive Document',
      'Are you sure you want to delete this archive document?',
      () => {
        const remaining = archive.filter((a) => a.id !== id);
        setArchive(remaining);
        setEditingArchiveId(remaining[0]?.id || null);
      }
    );
  };

  // System Diagnostics (JSON Export/Import)
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ profile, contact, resume, archive }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${profile.englishName.toLowerCase().replace(/\s+/g, '_')}_portfolio_cms.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (files && files.length > 0) {
      fileReader.readAsText(files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.profile && parsed.resume && parsed.archive && parsed.contact) {
            setProfile(parsed.profile);
            setContact(parsed.contact);
            setResume(parsed.resume);
            setArchive(parsed.archive);
            if (parsed.archive[0]) setEditingArchiveId(parsed.archive[0].id);
            setErrorMsg(null);
            showCustomAlert('Backup Imported', 'Portfolio backup data imported successfully! Click "Save All Changes" to apply.');
          } else {
            setErrorMsg('Invalid backup file. Required keys (profile, resume, archive, contact) are missing.');
          }
        } catch (err) {
          setErrorMsg('Failed to parse JSON backup file. Ensure file is structured properly.');
        }
      };
    }
  };

  const triggerReset = () => {
    showCustomConfirm(
      'Reset Portfolio Data',
      'CAUTION: This will wipe out all custom local changes and restore the pristine FIT/Parsons student portfolio database. Proceed?',
      () => {
        onResetToDefault();
        showCustomAlert('Database Restored', 'Pristine default datasets loaded. App reloaded.', () => {
          onClose();
        });
      }
    );
  };

  const selectedArch = archive.find((a) => a.id === editingArchiveId);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 animate-fade-in bg-luxury-bg">
      {/* CMS Header Block */}
      <div className="border-b border-luxury-black/10 pb-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-bold block mb-1">
            Studio CMS Panel
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-luxury-black">
            Brand Administration Hub
          </h1>
          <p className="font-sans text-xs text-luxury-gray mt-1 font-light">
            Real-time visual content editor. Persists automatically to local sandbox. Export backups anytime.
          </p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-luxury-black/20 text-luxury-black hover:bg-luxury-beige/40 transition-colors font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview Site</span>
          </button>
          
          <button
            onClick={handleGlobalSave}
            className="px-5 py-2 bg-luxury-olive hover:bg-luxury-black text-white transition-all duration-300 font-sans text-xs uppercase tracking-wider flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Save size={13} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-luxury-black text-luxury-bg p-4 mb-8 flex items-center gap-3 animate-fade-in border-l-4 border-luxury-olive">
          <CheckCircle size={18} className="text-luxury-olive" />
          <span className="font-sans text-xs uppercase tracking-widest font-semibold">
            All database modifications compiled and saved successfully to browser state.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 mb-8 flex items-center gap-3 animate-fade-in border-l-4 border-red-600">
          <AlertTriangle size={18} className="text-red-600" />
          <span className="font-sans text-xs font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* CMS Two Column Swiss Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Navigation Rail (Left Column) */}
        <div className="lg:col-span-3 flex flex-col space-y-2 border-b lg:border-b-0 lg:border-r border-luxury-black/5 pb-6 lg:pb-0 lg:pr-6">
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-luxury-gray block mb-3 pl-2">
            CMS Divisions
          </span>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <User size={14} className="text-luxury-olive" />
            <span>01. Profile & Links</span>
          </button>
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'projects'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <Grid size={14} className="text-luxury-olive" />
            <span>02. Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('resume')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'resume'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <FileText size={14} className="text-luxury-olive" />
            <span>03. Resume / CV</span>
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'archive'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <Archive size={14} className="text-luxury-olive" />
            <span>04. Studio Archive ({archive.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('contact')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'contact'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <Mail size={14} className="text-luxury-olive" />
            <span>05. Contact Info</span>
          </button>

          <button
            onClick={() => setActiveSubTab('system')}
            className={`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer ${
              activeSubTab === 'system'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }`}
          >
            <Sliders size={14} className="text-luxury-olive" />
            <span>06. Backup & Diagnostics</span>
          </button>
        </div>

        {/* Editing Core Block (Right Column) */}
        <div className="lg:col-span-9 bg-luxury-beige/10 border border-luxury-black/5 p-6 sm:p-10 space-y-8 min-h-[60vh]">
          
          {/* TAB 1: Profile and Contacts */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-display text-xl text-luxury-black border-b border-luxury-black/10 pb-3 font-semibold">
                Strategic Profile Editor
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">English Name</label>
                  <input
                    type="text"
                    value={profile.englishName}
                    onChange={(e) => setProfile({ ...profile, englishName: e.target.value })}
                    className="w-full bg-luxury-bg border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Korean Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-luxury-bg border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Global Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full bg-luxury-bg border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                />
              </div>

              {/* Profile Image & Upload */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Aesthetic Portrait Image (프로필 사진)</label>
                <div className="flex gap-4 items-start bg-luxury-beige/10 p-3 border border-luxury-black/5">
                  <div className="w-16 h-16 bg-luxury-beige/20 border border-luxury-black/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {profile.profileImage ? (
                      <IDBImage src={profile.profileImage} alt="Portrait Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-sans text-[10px] text-luxury-gray/60">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={profile.profileImage}
                      onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                      className="w-full bg-luxury-bg border border-luxury-black/10 px-3 py-1.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1.5 border border-luxury-black/15 bg-luxury-bg hover:bg-luxury-beige/30 transition-colors font-sans text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                        <FileUp size={11} className="text-luxury-olive" />
                        <span>Upload File (파일 선택)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'profileImage')}
                          className="hidden"
                        />
                      </label>
                      <span className="font-mono text-[8px] text-luxury-gray">Max 2.5MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Cover Image & Upload */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Home Cover Moodboard Image (홈 대형 무드보드 사진)</label>
                <div className="flex gap-4 items-start bg-luxury-beige/10 p-3 border border-luxury-black/5">
                  <div className="w-24 h-16 bg-luxury-beige/20 border border-luxury-black/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {profile.coverImage ? (
                      <IDBImage src={profile.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-sans text-[10px] text-luxury-gray/60">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Cover Image URL or Base64"
                      value={profile.coverImage || ''}
                      onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
                      className="w-full bg-luxury-bg border border-luxury-black/10 px-3 py-1.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1.5 border border-luxury-black/15 bg-luxury-bg hover:bg-luxury-beige/30 transition-colors font-sans text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                        <FileUp size={11} className="text-luxury-olive" />
                        <span>Upload File (파일 선택)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'coverImage')}
                          className="hidden"
                        />
                      </label>
                      <span className="font-mono text-[8px] text-luxury-gray">Max 2.5MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Primary Tagline (Hero Subtitle)</label>
                <textarea
                  rows={3}
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="w-full bg-luxury-bg border border-luxury-black/10 p-4 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Comprehensive Biography (Professional Statement)</label>
                <textarea
                  rows={6}
                  value={profile.profileText}
                  onChange={(e) => setProfile({ ...profile, profileText: e.target.value })}
                  className="w-full bg-luxury-bg border border-luxury-black/10 p-4 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                />
              </div>

              {/* Core Competencies List Editor */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-t border-luxury-black/5 pt-4">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold">Core Competencies</label>
                  <button
                    onClick={addCompetency}
                    className="text-luxury-olive hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={11} />
                    <span>Add Competency</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.competencies.map((comp, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={comp}
                        onChange={(e) => handleCompetencyChange(idx, e.target.value)}
                        className="flex-1 bg-luxury-bg border border-luxury-black/10 px-3 py-2 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                      />
                      <button
                        onClick={() => removeCompetency(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 focus:outline-none"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Highlights Snapshots */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-t border-luxury-black/5 pt-4">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold">Experience Snapshots</label>
                  <button
                    onClick={addSnapshot}
                    className="text-luxury-olive hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={11} />
                    <span>Add Milestone</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {profile.experienceSnapshot.map((snap, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={snap}
                        onChange={(e) => handleSnapshotChange(idx, e.target.value)}
                        className="flex-1 bg-luxury-bg border border-luxury-black/10 px-3 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                      />
                      <button
                        onClick={() => removeSnapshot(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 focus:outline-none"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}


          {/* TAB 2: Projects */}
          {activeSubTab === 'projects' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-luxury-black/10 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-luxury-black uppercase tracking-tight">Projects</h2>
                  <p className="font-sans text-xs text-luxury-gray mt-1">Manage project portfolios and PDFs.</p>
                </div>
                <button
                  onClick={addNewProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-luxury-olive text-luxury-bg text-[10px] uppercase tracking-widest hover:bg-luxury-black transition-colors"
                >
                  <Plus size={12} /> Add Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setEditingProjectId(p.id)}
                      className={`p-3 border cursor-pointer transition-colors ${
                        editingProjectId === p.id
                          ? 'border-luxury-olive bg-luxury-beige/30'
                          : 'border-luxury-black/10 hover:border-luxury-olive/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <h4 className="font-sans text-xs font-semibold text-luxury-black truncate">{p.title || 'Untitled'}</h4>
                          <span className="font-mono text-[9px] text-luxury-gray">{p.category}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                          className="text-luxury-gray hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-luxury-gray font-mono text-[10px] border border-dashed border-luxury-black/10">
                      No projects yet.
                    </div>
                  )}
                </div>
                <div className="md:col-span-8">
                  {getSelectedProject() ? (() => {
                    const selectedProj = getSelectedProject()!;
                    return (
                      <div className="space-y-8 bg-white p-6 border border-luxury-black/5">
                        <div className="space-y-4">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold border-b border-luxury-black/5 pb-2">
                            Basic Info
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Full Project Title</label>
                              <input
                                type="text"
                                value={selectedProj.title}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'title', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Category</label>
                              <input
                                type="text"
                                value={selectedProj.category}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'category', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Project Duration</label>
                              <input
                                type="text"
                                value={selectedProj.duration}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'duration', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Short Description</label>
                              <textarea
                                value={selectedProj.description || ''}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'description', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors resize-y min-h-[40px]"
                                placeholder="Brief overview of the project..."
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Detail Description (Project Page)</label>
                              <textarea
                                value={selectedProj.detailDescription || ''}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'detailDescription', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors resize-y min-h-[80px]"
                                placeholder="Detailed explanation for the project detail page..."
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Website URL (Optional)</label>
                              <input
                                type="url"
                                value={selectedProj.websiteUrl || ''}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'websiteUrl', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-luxury-black/5">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold pb-2">
                            Cover Image
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Cover Image (Thumbnail)</label>
                              <div className="flex items-start gap-4">
                                <div className="w-24 h-16 bg-luxury-beige/20 border border-luxury-black/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                                  {selectedProj.coverImage ? (
                                    <IDBImage src={selectedProj.coverImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-sans text-[10px] text-luxury-gray/60">No Image</span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                  <label className="cursor-pointer text-[10px] font-mono text-luxury-olive hover:text-luxury-black border border-luxury-olive/30 hover:border-luxury-black px-2 py-1 text-center transition-colors">
                                    <span>Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleProjectImageUpload(e, selectedProj.id)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                                                      </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-luxury-black/5">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold pb-2">
                            Detail Images
                          </h3>
                          <div className="space-y-4">
                            <label className="cursor-pointer text-[10px] font-mono text-luxury-bg bg-luxury-black hover:bg-luxury-olive px-3 py-2 text-center transition-colors inline-block">
                              <span>Upload Detail Images</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleProjectDetailImagesUpload(e, selectedProj.id)}
                                className="hidden"
                              />
                            </label>
                            
                            {selectedProj.detailImages && selectedProj.detailImages.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {selectedProj.detailImages.map((img, idx) => (
                                  <div key={idx} className="relative group aspect-[4/3] border border-luxury-black/10 overflow-hidden bg-luxury-beige/20">
                                    <IDBImage src={img} className="w-full h-full object-cover" />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveDetailImage(selectedProj.id, idx); }}
                                      className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove Image"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="h-full flex items-center justify-center text-luxury-gray font-mono text-xs border border-dashed border-luxury-black/10 bg-white min-h-[300px]">
                      Select a project to edit details
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Resume (CV) Editor */}
          {activeSubTab === 'resume' && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="font-display text-xl text-luxury-black border-b border-luxury-black/10 pb-3 font-semibold">
                Professional Resume (CV) CMS
              </h2>

              {/* PDF Resumes Upload Section */}
              <div className="bg-luxury-beige/20 border border-luxury-black/5 p-6 space-y-4">
                <h3 className="font-display text-base italic text-luxury-black border-b border-luxury-black/10 pb-2 flex items-center gap-2">
                  <FileText size={15} className="text-luxury-olive" />
                  <span>Resume PDF Files Management (이력서 PDF 파일 관리)</span>
                </h3>
                <p className="font-sans text-xs text-luxury-gray leading-relaxed">
                  국문 및 영문 이력서 PDF 파일을 업로드합니다. 업로드된 파일은 메인 웹사이트의 Resume 페이지에서 방문자가 직접 다운로드할 수 있습니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Korean Resume Upload */}
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Korean Resume PDF (국문 이력서)</label>
                    <div className="flex items-center gap-4 bg-white p-3 border border-luxury-black/5 rounded">
                      <div className="flex-1 truncate">
                        {contact.resumePdfUrlKo ? (
                          <span className="font-mono text-[10px] text-luxury-olive font-semibold truncate block">
                            {contact.resumePdfUrlKo.startsWith('idb://') ? 'Uploaded Local PDF (국문) ✓' : contact.resumePdfUrlKo}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-luxury-gray italic">No PDF uploaded</span>
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-mono text-[10px] uppercase tracking-widest shrink-0 rounded text-center">
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleResumePdfUpload(e, 'ko')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* English Resume Upload */}
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">English Resume PDF (영문 이력서)</label>
                    <div className="flex items-center gap-4 bg-white p-3 border border-luxury-black/5 rounded">
                      <div className="flex-1 truncate">
                        {contact.resumePdfUrlEn ? (
                          <span className="font-mono text-[10px] text-luxury-olive font-semibold truncate block">
                            {contact.resumePdfUrlEn.startsWith('idb://') ? 'Uploaded Local PDF (영문) ✓' : contact.resumePdfUrlEn}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-luxury-gray italic">No PDF uploaded</span>
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-mono text-[10px] uppercase tracking-widest shrink-0 rounded text-center">
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleResumePdfUpload(e, 'en')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-luxury-black/5 pb-2">
                  <h3 className="font-display text-lg italic text-luxury-black">Academic Education</h3>
                  <button
                    onClick={addEducation}
                    className="text-luxury-olive hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={11} />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="border border-luxury-black/5 p-4 bg-luxury-bg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">University</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Duration</label>
                          <input
                            type="text"
                            value={edu.duration}
                            onChange={(e) => handleEducationChange(idx, 'duration', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Academic Details & Achievements</label>
                        <input
                          type="text"
                          value={edu.details || ''}
                          onChange={(e) => handleEducationChange(idx, 'details', e.target.value)}
                          className="w-full bg-white border border-luxury-black/10 px-3 py-1.5 text-xs font-light"
                          placeholder="Honors, Dean's List, Major Projects..."
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1 w-1/3">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">GPA/Index</label>
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs font-mono"
                            placeholder="GPA: 3.9"
                          />
                        </div>
                        <button
                          onClick={() => removeEducation(idx)}
                          className="text-red-500 hover:text-red-700 font-sans text-[10px] uppercase flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience list */}
              <div className="space-y-4 border-t border-luxury-black/5 pt-6">
                <div className="flex justify-between items-center border-b border-luxury-black/5 pb-2">
                  <h3 className="font-display text-lg italic text-luxury-black">Professional Experience</h3>
                  <button
                    onClick={addExperience}
                    className="text-luxury-olive hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={11} />
                    <span>Add Job</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="border border-luxury-black/5 p-4 bg-luxury-bg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Position Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Corporate Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                            className="w-full bg-white border border-luxury-black/10 px-3 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Responsibilities & Core Milestones (One per line)</label>
                        <textarea
                          rows={3}
                          value={exp.details.join('\n')}
                          onChange={(e) => handleExperienceChange(idx, 'details', e.target.value.split('\n').filter(Boolean))}
                          className="w-full bg-white border border-luxury-black/10 p-3 font-sans text-xs focus:outline-none"
                        />
                      </div>

                      <div className="text-right">
                        <button
                          onClick={() => removeExperience(idx)}
                          className="text-red-500 hover:text-red-700 font-sans text-[10px] uppercase flex items-center gap-1 inline-flex focus:outline-none"
                        >
                          <Trash2 size={12} />
                          <span>Delete Role</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills and Languages Comma Sep fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-luxury-black/5 pt-6">
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Strategic Methodological Skills (Comma Separated)</label>
                  <textarea
                    rows={4}
                    value={resume.skills.join(', ')}
                    onChange={(e) => setResume({ ...resume, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-luxury-bg border border-luxury-black/10 p-3 font-sans text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Language Proficiencies (Comma Separated)</label>
                  <textarea
                    rows={4}
                    value={resume.languages.join(', ')}
                    onChange={(e) => setResume({ ...resume, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-luxury-bg border border-luxury-black/10 p-3 font-sans text-xs"
                  />
                </div>
              </div>

              {/* Awards list */}
              <div className="space-y-4 border-t border-luxury-black/5 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg italic text-luxury-black">Awards & Commendations</h3>
                  <button
                    onClick={addAward}
                    className="text-luxury-olive hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={11} />
                    <span>Add Award</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.awards.map((aw, idx) => (
                    <div key={idx} className="border border-luxury-black/5 p-4 bg-luxury-bg flex gap-2 items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={aw.title}
                          onChange={(e) => handleAwardChange(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-luxury-black/10 px-2 py-1 text-xs font-semibold"
                          placeholder="Award name"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aw.issuer}
                            onChange={(e) => handleAwardChange(idx, 'issuer', e.target.value)}
                            className="flex-1 bg-white border border-luxury-black/10 px-2 py-0.5 text-[10px]"
                            placeholder="Issuer"
                          />
                          <input
                            type="text"
                            value={aw.year}
                            onChange={(e) => handleAwardChange(idx, 'year', e.target.value)}
                            className="w-16 bg-white border border-luxury-black/10 px-2 py-0.5 text-[10px] font-mono text-center"
                            placeholder="Year"
                          />
                        </div>
                      </div>
                      <button onClick={() => removeAward(idx)} className="text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Archive Items */}
          {activeSubTab === 'archive' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-luxury-black/10 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-luxury-black uppercase tracking-tight">Studio Archive</h2>
                  <p className="font-sans text-xs text-luxury-gray mt-1">Manage documents, notebook archives, and research findings.</p>
                </div>
                <button
                  onClick={addNewArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-luxury-olive text-luxury-bg text-[10px] uppercase tracking-widest hover:bg-luxury-black transition-colors focus:outline-none cursor-pointer"
                >
                  <Plus size={12} /> Add Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Archive List Sidebar */}
                <div className="md:col-span-4 space-y-2">
                  {archive.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setEditingArchiveId(a.id)}
                      className={`p-3 border cursor-pointer transition-colors ${
                        editingArchiveId === a.id
                          ? 'border-luxury-olive bg-luxury-beige/30'
                          : 'border-luxury-black/10 hover:border-luxury-olive/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <h4 className="font-sans text-xs font-semibold text-luxury-black truncate">{a.title || 'Untitled'}</h4>
                          <span className="font-mono text-[9px] text-luxury-olive font-bold uppercase tracking-wider block mt-1">{a.type}</span>
                          <span className="font-sans text-[9px] text-luxury-gray block">{a.date}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteArchive(a.id); }}
                          className="text-luxury-gray hover:text-red-600 transition-colors shrink-0 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {archive.length === 0 && (
                    <div className="text-center py-8 text-luxury-gray font-mono text-[10px] border border-dashed border-luxury-black/10">
                      No archive documents yet.
                    </div>
                  )}
                </div>

                {/* Archive Editor Form */}
                <div className="md:col-span-8">
                  {selectedArch ? (
                    <div className="space-y-8 bg-white p-6 border border-luxury-black/5">
                      <div className="space-y-4">
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold border-b border-luxury-black/5 pb-2">
                          Document Details: {selectedArch.title.substring(0, 30)}...
                        </h3>

                        <div className="space-y-2">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Document Title</label>
                          <input
                            type="text"
                            value={selectedArch.title}
                            onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'title', e.target.value)}
                            className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-2">
                            <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Classification Type</label>
                            <select
                              value={selectedArch.type}
                              onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'type', e.target.value)}
                              className="w-full bg-luxury-bg border border-luxury-black/10 px-3 py-2 text-xs focus:outline-none focus:border-luxury-olive"
                            >
                              <option value="Research Notes">Research Notes</option>
                              <option value="Campaign Collection">Campaign Collection</option>
                              <option value="Exhibition">Exhibition</option>
                              <option value="Presentation">Presentation</option>
                              <option value="Process">Process</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Date Created</label>
                            <input
                              type="text"
                              value={selectedArch.date}
                              onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'date', e.target.value)}
                              className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Read Time (e.g., 5 min read)</label>
                            <input
                              type="text"
                              value={selectedArch.readTime || ''}
                              onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'readTime', e.target.value)}
                              placeholder="e.g., 5 min read"
                              className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-luxury-black/5">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold pb-2">
                            Aesthetic Cover Attachment (Image)
                          </h3>
                          <div className="flex gap-4 items-start bg-luxury-beige/10 p-3 border border-luxury-black/5">
                            <div className="w-24 h-16 bg-luxury-beige/20 border border-luxury-black/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                              {selectedArch.coverImage ? (
                                <IDBImage src={selectedArch.coverImage} alt="Archive Cover" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-sans text-[10px] text-luxury-gray/60">No Image</span>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Image URL or Base64"
                                value={selectedArch.coverImage}
                                onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'coverImage', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer text-[10px] font-mono text-luxury-olive hover:text-luxury-black border border-luxury-olive/30 hover:border-luxury-black px-2.5 py-1 text-center transition-colors">
                                  <span>Upload Cover Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleArchiveImageUpload(e, selectedArch.id)}
                                    className="hidden"
                                  />
                                </label>
                                <span className="font-mono text-[8px] text-luxury-gray">Max 2.5MB</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-luxury-black/5">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Brief Abstract Description</label>
                          <textarea
                            rows={3}
                            value={selectedArch.description}
                            onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors resize-y"
                            placeholder="Brief abstract summary..."
                          />
                        </div>

                        <div className="space-y-2 pt-4 border-t border-luxury-black/5">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Document Body Narrative (Full Transcript)</label>
                          <textarea
                            rows={8}
                            value={selectedArch.content || ''}
                            onChange={(e) => handleArchiveFieldChange(selectedArch.id, 'content', e.target.value)}
                            className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors font-light resize-y"
                            placeholder="Add substantial archive transcripts, quotes, or moodboard findings here..."
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-luxury-gray font-mono text-xs border border-dashed border-luxury-black/10 bg-white min-h-[300px]">
                      Select an archive document to edit details
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Contact Page & Resumes Manager */}
          {activeSubTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl text-luxury-black border-b border-luxury-black/10 pb-3 font-semibold">
                Contact Page & Resumes Manager
              </h2>

              <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light">
                Contact 페이지에 나타나는 타이틀 문구와 하단 설명 문구, 그리고 이메일 및 소셜 미디어 채널 링크를 실시간으로 커스터마이징하고 이력서 PDF를 업로드합니다.
              </p>

              <div className="border border-luxury-black/10 p-6 bg-luxury-bg space-y-6">
                <h3 className="font-display text-lg italic text-luxury-black">
                  Corporate Communication & Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Contact Heading (Contact 페이지 제목)</label>
                    <input
                      type="text"
                      value={contact.contactTitle || ''}
                      placeholder="CONTACT ME"
                      onChange={(e) => setContact({ ...contact, contactTitle: e.target.value })}
                      className="w-full bg-white border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Contact Footnote (하단 상세 설명 문구)</label>
                    <input
                      type="text"
                      value={contact.footnote || ''}
                      placeholder="Based in New York & Seoul. Available for global brand strategy roles."
                      onChange={(e) => setContact({ ...contact, footnote: e.target.value })}
                      className="w-full bg-white border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Email Address</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full bg-white border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">LinkedIn Handle</label>
                    <input
                      type="text"
                      value={contact.linkedin}
                      onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                      className="w-full bg-white border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Instagram Handle</label>
                    <input
                      type="text"
                      value={contact.instagram}
                      onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                      className="w-full bg-white border border-luxury-black/10 px-4 py-2.5 font-sans text-xs text-luxury-black focus:outline-none focus:border-luxury-olive"
                    />
                  </div>
                </div>
              </div>

              {/* PDF Resumes Upload Section */}
              <div className="bg-luxury-beige/20 border border-luxury-black/5 p-6 space-y-4">
                <h3 className="font-display text-base italic text-luxury-black border-b border-luxury-black/10 pb-2 flex items-center gap-2">
                  <FileText size={15} className="text-luxury-olive" />
                  <span>Resume PDF Files Management (이력서 PDF 파일 관리)</span>
                </h3>
                <p className="font-sans text-xs text-luxury-gray leading-relaxed">
                  국문 및 영문 이력서 PDF 파일을 업로드합니다. 업로드된 파일은 메인 웹사이트의 Resume 페이지에서 방문자가 직접 다운로드할 수 있습니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Korean Resume Upload */}
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">Korean Resume PDF (국문 이력서)</label>
                    <div className="flex items-center gap-4 bg-white p-3 border border-luxury-black/5 rounded">
                      <div className="flex-1 truncate">
                        {contact.resumePdfUrlKo ? (
                          <span className="font-mono text-[10px] text-luxury-olive font-semibold truncate block">
                            {contact.resumePdfUrlKo.startsWith('idb://') ? 'Uploaded Local PDF (국문) ✓' : contact.resumePdfUrlKo}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-luxury-gray italic">No PDF uploaded</span>
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-mono text-[10px] uppercase tracking-widest shrink-0 rounded text-center">
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleResumePdfUpload(e, 'ko')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* English Resume Upload */}
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray block">English Resume PDF (영문 이력서)</label>
                    <div className="flex items-center gap-4 bg-white p-3 border border-luxury-black/5 rounded">
                      <div className="flex-1 truncate">
                        {contact.resumePdfUrlEn ? (
                          <span className="font-mono text-[10px] text-luxury-olive font-semibold truncate block">
                            {contact.resumePdfUrlEn.startsWith('idb://') ? 'Uploaded Local PDF (영문) ✓' : contact.resumePdfUrlEn}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-luxury-gray italic">No PDF uploaded</span>
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-luxury-black hover:bg-luxury-olive text-white transition-colors font-mono text-[10px] uppercase tracking-widest shrink-0 rounded text-center">
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleResumePdfUpload(e, 'en')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: System Diagnostics & Local Database Management */}
          {activeSubTab === 'system' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display text-xl text-luxury-black border-b border-luxury-black/10 pb-3 font-semibold">
                Database Backup & Diagnostic Settings
              </h2>

              <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light">
                This website compiles all user inputs into a structured local database file held securely inside the browser's Sandbox state (`localStorage`). To prevent data loss or to migrate this custom portfolio content, use the tools below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Export Card */}
                <div className="border border-luxury-black/10 p-6 bg-luxury-bg space-y-4">
                  <div className="flex items-center gap-2 text-luxury-olive">
                    <FileDown size={18} />
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold">Export Portfolio Backup</span>
                  </div>
                  <p className="font-sans text-xs text-luxury-gray font-light">
                    Downloads a local, clean copy of the complete portfolio database (JSON) containing all projects, images, bio items, and resume elements.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 bg-luxury-black hover:bg-luxury-olive text-luxury-bg font-sans text-xs uppercase tracking-widest transition-colors focus:outline-none cursor-pointer"
                  >
                    Download JSON Backup
                  </button>
                </div>

                {/* Import Card */}
                <div className="border border-luxury-black/10 p-6 bg-luxury-bg space-y-4">
                  <div className="flex items-center gap-2 text-luxury-olive">
                    <FileUp size={18} />
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold">Import Portfolio Backup</span>
                  </div>
                  <p className="font-sans text-xs text-luxury-gray font-light">
                    Uploads and parses a previously exported `.json` portfolio file. This replaces the active sandbox editing database immediately.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border border-luxury-black/30 hover:bg-luxury-beige/40 text-luxury-black font-sans text-xs uppercase tracking-widest transition-colors focus:outline-none cursor-pointer"
                  >
                    Select & Load Backup File
                  </button>
                </div>
              </div>

              {/* Reset Default Data block */}
              <div className="border border-red-200 bg-red-50/20 p-6 mt-12 space-y-4">
                <div className="flex items-center gap-2 text-red-700">
                  <RotateCcw size={18} />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">Hard Database Reset</span>
                </div>
                <p className="font-sans text-xs text-luxury-gray font-light">
                  If you wish to clear all mock content and revert the entire layout back to the pristine default Parsons/FIT "Seryeong Koo" student portfolio dataset, trigger this operation. **This cannot be undone unless you downloaded a backup above.**
                </p>
                <button
                  onClick={triggerReset}
                  className="py-2.5 px-6 border border-red-600 hover:bg-red-600 hover:text-white text-red-600 font-sans text-xs uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer"
                >
                  Wipe & Restore Default Data
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
      
      {/* Custom dialog modal to bypass browser confirm/alert blocks in iframes */}
      {modalConfig && modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-luxury-bg border border-luxury-black/15 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive font-bold block">
                Studio Verification
              </span>
              <h3 className="font-display text-lg font-semibold text-luxury-black uppercase tracking-tight">
                {modalConfig.title}
              </h3>
              <p className="font-sans text-xs text-luxury-gray leading-relaxed font-light">
                {modalConfig.message}
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={() => setModalConfig(null)}
                  className="px-4 py-2 border border-luxury-black/15 text-luxury-gray hover:text-luxury-black font-sans text-[10px] uppercase tracking-wider transition-colors cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={modalConfig.onConfirm}
                className="px-4 py-2 bg-luxury-olive hover:bg-luxury-black text-white font-sans text-[10px] uppercase tracking-wider transition-colors cursor-pointer focus:outline-none"
              >
                {modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
