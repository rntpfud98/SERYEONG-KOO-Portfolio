export interface Project {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  detailDescription?: string;
  websiteUrl?: string;
  coverImage: string;
  detailImages?: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  duration: string;
  gpa?: string;
  details?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  location: string;
  details: string[];
}

export interface LeadershipItem {
  role: string;
  organization: string;
  duration: string;
  details: string;
}

export interface AwardItem {
  title: string;
  issuer: string;
  year: string;
}

export interface ResumeData {
  education: EducationItem[];
  experience: ExperienceItem[];
  leadership: LeadershipItem[];
  awards: AwardItem[];
  skills: string[];
  languages: string[];
}

export interface ArchiveItem {
  id: string;
  title: string;
  type: 'Research Notes' | 'Campaign Collection' | 'Exhibition' | 'Presentation' | 'Process';
  date: string;
  coverImage: string;
  description: string;
  detailDescription?: string;
  websiteUrl?: string;
  content?: string;
  linkUrl?: string;
  readTime?: string;
}

export interface PersonalProfile {
  name: string;
  englishName: string;
  title: string;
  tagline: string;
  profileText: string;
  profileImage: string;
  coverImage?: string;
  competencies: string[];
  experienceSnapshot: string[];
}

export interface ContactLinks {
  email: string;
  linkedin: string;
  instagram: string;
  resumePdfUrl: string;
  resumePdfUrlKo?: string;
  resumePdfUrlEn?: string;
  contactTitle?: string;
  footnote?: string;
}

export interface PortfolioData {
  profile: PersonalProfile;
  projects: Project[];
  resume: ResumeData;
  archive: ArchiveItem[];
  contact: ContactLinks;
}
