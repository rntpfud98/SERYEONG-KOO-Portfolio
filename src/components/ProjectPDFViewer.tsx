import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import IDBImage from './IDBImage';

interface ProjectDetailViewerProps {
  project: Project;
  onBack: () => void;
}

export default function ProjectPDFViewer({ project, onBack }: ProjectDetailViewerProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImgIndex(0);
  }, [project.id]);

  const hasDetailImages = project.detailImages && project.detailImages.length > 0;
  const hasContent = hasDetailImages || !!project.detailDescription || !!project.description || !!project.websiteUrl;

  return (
    <div className="min-h-screen bg-luxury-bg">
      {/* Top Nav */}
      <div className="sticky top-0 z-40 bg-luxury-bg/90 backdrop-blur-md border-b border-luxury-black/5 px-6 py-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-luxury-gray hover:text-luxury-black transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>
        <div className="font-display text-lg text-luxury-black truncate max-w-md text-center">
          {project.title}
        </div>
        <div className="w-24" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {!hasContent ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-luxury-gray space-y-4">
            <IDBImage src={project.coverImage} className="w-64 h-48 object-cover grayscale opacity-50" />
            <p className="font-mono text-xs uppercase tracking-widest">No details uploaded for this project.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Project Header Info */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive">
                {project.category} &mdash; {project.duration}
              </div>
              {project.description && (
                <p className="font-sans text-sm text-luxury-black/80 leading-relaxed font-medium">
                  {project.description}
                </p>
              )}
              {project.detailDescription && (
                <div className="font-sans text-sm text-luxury-black/90 leading-relaxed text-left mt-12 whitespace-pre-wrap">
                  {project.detailDescription}
                </div>
              )}
              {project.websiteUrl && (
                <div className="pt-8">
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white transition-all duration-300 font-mono text-xs uppercase tracking-widest mx-auto"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Images Gallery */}
            {hasDetailImages && (
              <div className="space-y-6 w-full">
                {/* Main Selected Image Viewer */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[75vh] bg-luxury-beige/10 border border-luxury-black/5 overflow-hidden flex items-center justify-center shadow-sm select-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImgIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="w-full h-full flex items-center justify-center p-4 cursor-pointer"
                      onClick={() => {
                        if (project.detailImages!.length > 1) {
                          setActiveImgIndex((prev) => (prev < project.detailImages!.length - 1 ? prev + 1 : 0));
                        }
                      }}
                    >
                      <IDBImage
                        src={project.detailImages![activeImgIndex]}
                        className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-500"
                        alt={`${project.title} Detail ${activeImgIndex + 1}`}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation overlay buttons */}
                  {project.detailImages!.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : project.detailImages!.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-luxury-bg/90 hover:bg-luxury-bg border border-luxury-black/10 flex items-center justify-center text-luxury-black shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1 focus:ring-luxury-olive active:scale-95"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImgIndex((prev) => (prev < project.detailImages!.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-luxury-bg/90 hover:bg-luxury-bg border border-luxury-black/10 flex items-center justify-center text-luxury-black shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1 focus:ring-luxury-olive active:scale-95"
                        aria-label="Next image"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-4 right-4 bg-luxury-black/75 backdrop-blur-sm text-luxury-bg px-3 py-1 font-mono text-[9px] uppercase tracking-[0.15em] rounded-full">
                    {activeImgIndex + 1} / {project.detailImages!.length}
                  </div>
                </div>

                {/* Horizontal Scrolling Thumbnails Row */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">
                      Gallery &mdash; Click to enlarge
                    </span>
                    {project.detailImages!.length > 1 && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive">
                        {project.detailImages!.length} images uploaded
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-luxury-olive/20 scrollbar-track-transparent snap-x">
                    {project.detailImages!.map((img, idx) => {
                      const isActive = idx === activeImgIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={`relative flex-shrink-0 w-24 h-16 sm:w-32 sm:h-20 bg-luxury-beige/5 border transition-all duration-300 overflow-hidden group focus:outline-none snap-start ${
                            isActive
                              ? 'border-luxury-olive ring-1 ring-luxury-olive'
                              : 'border-luxury-black/10 hover:border-luxury-olive/50'
                          }`}
                        >
                          <IDBImage
                            src={img}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isActive ? 'scale-105' : 'opacity-70 group-hover:opacity-100 group-hover:scale-102'
                            }`}
                            alt={`${project.title} Thumbnail ${idx + 1}`}
                          />
                          <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-transparent' : 'bg-luxury-black/5 group-hover:bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
