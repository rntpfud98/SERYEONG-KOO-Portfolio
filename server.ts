import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to support large base64 uploads (PDFs)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Settings > Secrets에서 키를 등록해 주세요.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST API for PDF Project Parsing
app.post("/api/parse-project-pdf", async (req, res) => {
  try {
    const { pdfBase64, originalFileName } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: "PDF 파일 데이터가 유실되었습니다." });
    }

    // Clean up base64 prefix if present
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

    const ai = getAI();

    // Define the exact schema matching Seryeong's Project interface
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { 
          type: Type.STRING, 
          description: "Full title of the case study. E.g., 'SENSORY RETAIL: Spatial Engagement Playbook for Maison Margiela'" 
        },
        category: { 
          type: Type.STRING, 
          description: "Must be exactly one of: 'Branding', 'Marketing', 'Retail', 'Research', 'Exhibition'" 
        },
        duration: { 
          type: Type.STRING, 
          description: "Approximate project duration, e.g., 'Feb 2026 – May 2026' or 'Spring 2026'" 
        },
        role: { 
          type: Type.STRING, 
          description: "Role of Seryeong Koo, e.g., 'Retail Experience Designer', 'Lead Strategist', etc." 
        },
        client: { 
          type: Type.STRING, 
          description: "Client or class name, e.g., 'FIT Spatial Retailing Seminar Project', 'Personal Project'" 
        },
        tools: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Tools used, e.g., AutoCAD, SketchUp, InDesign, WGSN, Figma, material-sourcing, Excel"
        },
        coverImage: { 
          type: Type.STRING, 
          description: "A highly relevant, high-resolution aesthetic Unsplash image URL that represents the theme, e.g., a luxury boutique interior, fashion showroom, abstract minimal design, etc." 
        },
        isFeatured: { 
          type: Type.BOOLEAN, 
          description: "Whether this is featured. Defaults to true." 
        },
        overview: { 
          type: Type.STRING, 
          description: "A compelling 2-3 sentence overview introducing the project's essence." 
        },
        objective: { 
          type: Type.STRING, 
          description: "The core strategic objective/target of this project." 
        },
        challenge: { 
          type: Type.STRING, 
          description: "The primary strategic, business, or creative challenge being addressed." 
        },
        research: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: { 
              type: Type.STRING, 
              description: "A detailed paragraph summarizing structural analysis, surveys, and primary qualitative market research findings." 
            },
            competitorMapping: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  brand: { type: Type.STRING, description: "Name of the competitor brand" },
                  price: { type: Type.STRING, description: "Price level, e.g., '$$$', '$$$$'" },
                  positioning: { type: Type.STRING, description: "Market positioning, e.g., 'Subversive Brutalism', 'Extreme Quiet Luxury'" },
                  strengths: { type: Type.STRING, description: "Key competitor strengths" }
                },
                required: ["brand", "price", "positioning", "strengths"]
              },
              description: "List of 2-4 key competitor brands analyzed"
            },
            consumerInsight: { 
              type: Type.STRING, 
              description: "A solid block detailing the core consumer behavioral insight found from research." 
            },
            trendAnalysis: { 
              type: Type.STRING, 
              description: "Macro-trend shifting or design evolution observed in the industry." 
            },
            surveyData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING, description: "Name of the metric, e.g., 'Olfactory Recall Rate'" },
                  value: { type: Type.INTEGER, description: "Value from 0 to 100 representing survey percentage" }
                },
                required: ["metric", "value"]
              },
              description: "List of 2-4 key statistics/metrics from consumer surveys"
            }
          },
          required: ["marketAnalysis", "competitorMapping", "consumerInsight", "trendAnalysis", "surveyData"]
        },
        insights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Punchy, elegant title for the insight pillar" },
              body: { type: Type.STRING, description: "Deep analysis or explanation of this insight" }
            },
            required: ["title", "body"]
          },
          description: "Exactly 3 distinct strategic insights discovered during research"
        },
        strategy: {
          type: Type.OBJECT,
          properties: {
            targetAudience: { 
              type: Type.STRING, 
              description: "Detailed psychographic & demographic target consumer persona." 
            },
            positioningStatement: { 
              type: Type.STRING, 
              description: "A single, strong positioning statement defining the unique proposition." 
            },
            corePillars: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 core strategic pillars of the action plan"
            },
            retailPlan: { 
              type: Type.STRING, 
              description: "The concrete spatial, distribution, or physical/digital activation plan." 
            }
          },
          required: ["targetAudience", "positioningStatement", "corePillars", "retailPlan"]
        },
        execution: { 
          type: Type.STRING, 
          description: "Detailed description of how Seryeong executed the project (e.g., AutoCAD drawings, InDesign templates, physical mockups)." 
        },
        outcome: { 
          type: Type.STRING, 
          description: "Measurable or qualitative success, conglomerate feedback, presentations, and projected impacts." 
        },
        reflection: { 
          type: Type.STRING, 
          description: "Seryeong's personal, mature designer/strategist reflection about this project's learning curve." 
        }
      },
      required: [
        "title", "category", "duration", "role", "client", "tools", "coverImage", "isFeatured",
        "overview", "objective", "challenge", "research", "insights", "strategy", "execution", "outcome", "reflection"
      ]
    };

    const pdfPart = {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data
      }
    };

    const textPart = {
      text: `당신은 최고급 럭셔리 패션 브랜드 경영 및 공간 전략 전문가이자 수석 디렉터입니다.
첨부된 PDF 문서를 면밀하게 분석하여, 패션 비즈니스 학도인 구세령(Seryeong Koo)의 포트폴리오 케이스 스터디 데이터로 완벽하게 가공하여 반환하십시오.

[지침]
1. PDF의 내용을 최대한 충실히 파싱하여, 구세령의 학문적 깊이와 하이엔드 감성이 물씬 묻어나는 고품격 한국어 텍스트로 보완하십시오.
2. PDF에 명시되지 않은 전략적 디테일(경쟁 브랜드 맵핑, 타겟 오디언스, 실행 계획, 수치화된 설문 조사 가상 데이터 등)이 있더라도, 주제와 어울리도록 업계 최고 전문가 수준에서 가장 현실적이고 매력적인 내용으로 완전하게 작성 및 보완해 주십시오. (절대 빈값이나 플레이스홀더를 남기지 마십시오)
3. 카테고리는 반드시 'Branding', 'Marketing', 'Retail', 'Research', 'Exhibition' 중 가장 어울리는 하나를 지정하십시오.
4. coverImage 필드에는 이 프로젝트의 미학적 테마를 멋지게 반영할 수 있는 고화질 Unsplash 이미지 URL(예: 패션 위크, 공간 디자인, 예술품, 브루탈리즘 등)을 제안하십시오.
5. insights 리스트는 반드시 3개의 명확하고 개성 넘치는 인사이트 필라로 채워주십시오.
6. corePillars는 기획의 핵심축 3개를 리스트 형태로 작성하십시오.
7. 모든 설문 데이터(surveyData)와 경쟁사 속성(competitorMapping)을 완벽한 객체 리스트로 구성하십시오.
8. 출력은 반드시 주어진 JSON 스키마를 100% 준수해야 합니다. 마크다운(\`\`\`json) 기호 없이 순수 JSON 텍스트만 출력하십시오.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [pdfPart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini로부터 데이터를 받지 못했습니다.");
    }

    const parsedProject = JSON.parse(resultText);
    
    // Generate an ID for the new project
    parsedProject.id = `project-pdf-${Date.now()}`;
    
    return res.json({ project: parsedProject });
  } catch (err: any) {
    console.error("PDF Parsing error:", err);
    return res.status(500).json({ error: err.message || "PDF 파일을 파싱하는 데 실패했습니다." });
  }
});

// GET Portfolio Data
app.get("/api/portfolio-data", (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), "src/data/portfolio_db.json");
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, "utf-8");
      return res.json(JSON.parse(raw));
    }
    return res.json(null);
  } catch (err: any) {
    console.error("Error reading portfolio-data:", err);
    return res.status(500).json({ error: "Failed to read portfolio data" });
  }
});

// POST Portfolio Data
app.post("/api/portfolio-data", (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), "src/data/portfolio_db.json");
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(req.body, null, 2), "utf-8");
    return res.json({ success: true });
  } catch (err: any) {
    console.error("Error writing portfolio-data:", err);
    return res.status(500).json({ error: "Failed to save portfolio data" });
  }
});

// POST Upload File (PDF / Images)
app.post("/api/upload-file", (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data || !filename) {
      return res.status(400).json({ error: "파일 데이터 또는 파일 이름이 유실되었습니다." });
    }

    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Content, "base64");

    const uploadDir = path.join(process.cwd(), "src/assets/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean filename
    const ext = path.extname(filename);
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeFilename = `${base}_${Date.now()}${ext}`;
    const targetPath = path.join(uploadDir, safeFilename);

    fs.writeFileSync(targetPath, buffer);

    return res.json({ url: `/src/assets/uploads/${safeFilename}` });
  } catch (err: any) {
    console.error("File upload error:", err);
    return res.status(500).json({ error: err.message || "파일 업로드에 실패했습니다." });
  }
});

// Setup Vite Dev Server / Prod Serving
async function startServer() {
  // Serve local static assets directly from workspace so dynamic references like "/src/assets/images/..." work in both dev and prod
  app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Full-stack Server running on port ${PORT}`);
  });
}

startServer();
