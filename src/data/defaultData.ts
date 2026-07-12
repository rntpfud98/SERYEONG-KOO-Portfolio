import { PortfolioData } from '../types';

export const defaultPortfolioData: PortfolioData = {
  projects: [],
  profile: {
    name: "구세령",
    englishName: "SERYEONG KOO",
    title: "",
    tagline: "I bridge the gap between luxury heritage and contemporary market intelligence. Translating consumer psychology into high-performance retail and brand experiences.",
    profileText: "As a Fashion Business student specializing in Global Brand Management at FIT (Fashion Institute of Technology), I combine analytical market intelligence with a refined cultural sensibility. My work focuses on re-engineering luxury brand positioning, devising data-backed consumer targeting campaigns, and designing immersive retail environments that cultivate lifelong brand equity. I believe luxury is not merely an aesthetic, but a rigorous business discipline centered on deep emotional resonance and structured storytelling.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
    coverImage: "/src/assets/images/seryeong_attached_collage_1783323872970.jpg",
    competencies: [
      "Brand Equity Strategy",
      "Consumer Behavior & Segmentation",
      "Market Trend Forecasting",
      "Competitor Landscape Mapping",
      "Quantitative & Qualitative Surveying",
      "Immersive Visual Merchandising",
      "Socio-Cultural Trend Mapping"
    ],
    experienceSnapshot: [
      "Fashion Brand Strategy Intern at LVMH, Paris",
      "Visual Merchandising Assistant at Maison Margiela Boutique, NYC",
      "Trend Researcher at FIT Future Fashion Lab",
      "Honorable Mention, Parsons Creative Business Competition 2025"
    ]
  },
  resume: {
    education: [
      {
        degree: "B.S. in Fashion Business Management",
        school: "FIT (Fashion Institute of Technology), New York",
        duration: "2022 – 2026",
        gpa: "GPA: 3.92 / 4.0 (Summa Cum Laude)",
        details: "Specialized in Global Brand Management and Luxury Merchandising. President of the Luxury Business Association. Awarded Outstanding Graduate Thesis on Circular Luxury Logistics."
      },
      {
        degree: "Executive Program in Luxury Brand Strategy",
        school: "Polimoda, Florence",
        duration: "Summer 2024",
        details: "Intensive European luxury fashion market study, focused on artisanal craftsmanship heritage, leather supply chains, and Italian brand storytelling structures."
      }
    ],
    experience: [
      {
        role: "Global Brand Strategy Intern",
        company: "LVMH Group (Fashion Division)",
        duration: "June 2025 – Aug 2025",
        location: "Paris, France",
        details: [
          "Assisted the global marketing team in analyzing cross-border luxury purchasing patterns for Gen Z consumers in the APAC market, feeding directly into H2 marketing budgets.",
          "Conducted competitive pricing analyses across 14 competing luxury houses to optimize leather-goods pricing corridors.",
          "Co-authored a 40-page report on K-Pop global ambassador ROI, leading to a reallocation of influencer marketing spend."
        ]
      },
      {
        role: "Visual Merchandising Coordinator",
        company: "Maison Margiela Flagship Boutique",
        duration: "Sept 2024 – May 2025",
        location: "New York, NY",
        details: [
          "Executed weekly floor resets in alignment with Paris corporate VM guidelines, maintaining meticulous brand visual standards.",
          "Curated the boutique's sensory environments, optimizing acoustics and scent diffusers which increased store dwell time by 18%.",
          "Managed stock allocation and visual product placement for the exclusive Margiela x Gentle Monster collaboration drop, resulting in a 100% sell-out on day one."
        ]
      },
      {
        role: "Luxury Retail Advisory Lead",
        company: "Saks Fifth Avenue",
        duration: "June 2023 – Aug 2024",
        location: "New York, NY",
        details: [
          "Cultivated personalized luxury shopping portfolios for high-net-worth VIP clients, achieving over $320,000 in personal sales.",
          "Analyzed luxury buying feedback and product performance to brief retail buying directors on underperforming collections."
        ]
      }
    ],
    leadership: [
      {
        role: "President",
        organization: "FIT Luxury Retail Association",
        duration: "Sept 2024 – Present",
        details: "Curate monthly industry panels featuring executives from Chanel, Hermès, and Estée Lauder. Manage a budget of $12,000 and coordinate annual networking events for 250+ students."
      },
      {
        role: "Student Mentor",
        organization: "FIT Future Fashion Lab",
        duration: "Jan 2024 – Present",
        details: "Guide junior students in using database programs like WGSN, Euromonitor, and SPSS for their academic research papers."
      }
    ],
    awards: [
      {
        title: "Outstanding Graduate Thesis Award",
        issuer: "FIT Academic Senate",
        year: "2026"
      },
      {
        title: "Global Luxury Innovation Scholar",
        issuer: "LVMH Talent Network",
        year: "2025"
      },
      {
        title: "Parsons Business Design Challenge - 1st Place",
        issuer: "Parsons School of Design",
        year: "2024"
      }
    ],
    skills: [
      "Brand Equity Strategy",
      "Market Intelligence & Research",
      "Competitor Landscape Audits",
      "Quantitative Data Analysis (SPSS, Excel)",
      "Visual Merchandising (VM)",
      "WGSN & Euromonitor Analytics",
      "Creative Direction & Layouts",
      "Reverse Logistics Modelling"
    ],
    languages: [
      "Korean (Native)",
      "English (Bilingual Proficiency)",
      "French (Intermediate Conversational)"
    ]
  },
  archive: [
    {
      id: "archive-1",
      title: "The K-Pop Ambassadorship Paradox in Parisian Haute Couture",
      type: "Research Notes",
      date: "May 2025",
      coverImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200",
      description: "A comprehensive academic research note mapping the return on investment (ROI) of Korean entertainment ambassadors for historic French couture houses. Analyzes digital Earned Media Value (EMV) vs. physical retail conversions.",
      content: "This research note explores the shift from Hollywood glamour to K-Pop celebrity dominance in luxury fashion. Based on a analysis of 1.2M social media posts and retail traffic data in Seoul and Paris, the research reveals that while K-Pop ambassadors drive unprecedented short-term digital engagement (EMV increases up to 300%), physical boutique transactions for high-jewelry and couture categories see a delayed conversion, indicating that K-Pop ambassadorship serves primarily as a top-of-funnel brand awareness driver rather than an immediate luxury volume engine.",
      linkUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200",
      readTime: "5 min read"
    },
    {
      id: "archive-2",
      title: "Acne Studios 'The Denims' Spatial Pop-up Campaign",
      type: "Campaign Collection",
      date: "Nov 2024",
      coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      description: "A complete marketing deck and 3D space mockup for a proposed Acne Studios pop-up in Seoul's Hannam-dong, centering denim custom-tailoring as a tactile community experience.",
      content: "A 360-degree omnichannel marketing proposal designed to elevate Acne Studios' core denim division. The pop-up concept centers on a brutalist concrete water-tank structure where clients watch their denim jackets being custom-distressed and dyed in real-time. This tactile, noisy industrial experience emphasizes Acne Studios' raw artistic heritage and luxury subversiveness.",
      linkUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      readTime: "4 min read"
    },
    {
      id: "archive-3",
      title: "Frama x Minimalist Clay - Spatial Dialogue Concept",
      type: "Exhibition",
      date: "Jan 2025",
      coverImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
      description: "Visual layout and curation proposal for a joint exhibition between Copenhagen-based lifestyle design studio Frama and contemporary Korean ceramicists at Seoul Design Week '25.",
      content: "A physical exhibition design exploring the convergence of Scandinavian slow living and Korean pottery. This layout blueprint organizes a 120㎡ exhibition space around custom hand-plastered podiums, organic clay installations, and calculated natural light corridors, creating an immersive, sensory-deprived gallery that encourages quiet, prolonged brand-philosophy contemplation.",
      linkUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
      readTime: "3 min read"
    },
    {
      id: "archive-4",
      title: "Marine Serre: Regenerated Moon Prints Moodboard & Sourcing Process",
      type: "Process",
      date: "Aug 2025",
      coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
      description: "Under-the-hood process documentation tracking the physical supply chain of discarded materials up to their regeneration into Marine Serre signature moon-print silks.",
      content: "This process archive acts as a behind-the-scenes visual journal. It details our field visits to post-consumer textile processing centers in northern France, tracing the sorting, chemical fiber breakdown, spinning, and printing steps that convert industrial waste into runway-ready luxury fabrics, proving the rigor of high-fashion sustainability.",
      linkUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
      readTime: "6 min read"
    }
  ],
  contact: {
    email: "rntpfud98@gmail.com",
    linkedin: "linkedin.com/in/seryeong-koo",
    instagram: "instagram.com/seryeong.studio",
    resumePdfUrl: "#",
    resumePdfUrlKo: "#",
    resumePdfUrlEn: "#",
    contactTitle: "CONTACT ME",
    footnote: "Based in New York & Seoul. Available for global brand strategy roles."
  }
};
