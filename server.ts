import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI generation
  app.post("/api/generate-blocks", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing from environment variables.");
        return res.status(500).json({ error: "Configuração da API Key do Gemini não encontrada no servidor." });
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `Você é um designer de newsletters especialista. 
Gere uma estrutura de newsletter em formato JSON baseada na descrição do usuário.
O JSON deve ser um array de objetos seguindo esta estrutura EXATA:
[
  {
    "id": "string",
    "type": "text" | "image" | "button" | "divider" | "emoji" | "icon" | "column-layout",
    "data": { ... }
  }
]

Regras de dados:
- text: { content: string, fontSize: number, color: string, textAlign: 'left'|'center'|'right' }
- image: { url: string, alt: string, borderRadius: number, width: number }
- button: { text: string, url: string, backgroundColor: string, color: string, borderRadius: number, textAlign: 'center' }
- divider: { color: string, height: number, margin: number }
- emoji: { emoji: string, fontSize: number, textAlign: 'center' }
- icon: { iconName: string, size: 'small'|'medium'|'large', color: string }
- column-layout: { columns: 2|3, items: [{ type, data }] }

Importante: Gere IDs únicos.
Retorne APENAS o JSON puro.`;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nPedido do usuário: ${prompt}` }] }],
        config: {
            responseMimeType: "application/json"
        }
      });

      const text = result.text;
      if (!text) {
        throw new Error("A IA não retornou texto.");
      }
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Falha ao gerar blocos com IA" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
