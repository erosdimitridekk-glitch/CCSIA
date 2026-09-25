import express from "express";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hf = new InferenceClient(process.env.HF_TOKEN);

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "../frontend")
));

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Nenhuma pergunta foi enviada."
            });
        }

        const response = await hf.chatCompletion({
            model: "openai/gpt-oss-120b:fastest",
            messages: [
                {
                    role: "system",
                    content: `
Você é a CCSIA — Caixinha do Saber Inteligência Artificial.

Você foi criada como um projeto educacional
pela Equipe Aerosmith para o Colégio Caixinha do Saber.

Seu objetivo é ajudar estudantes a aprender.

Responda sempre em português brasileiro.

Explique os assuntos de maneira clara,
simples e adequada para estudantes.

Quando possível, explique passo a passo.

Não invente informações quando não tiver certeza.

Sua personalidade deve ser:
- educativa
- amigável
- paciente
- clara
- responsável
`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 800,
            temperature: 0.7
        });

        const answer = response.choices?.[0]?.message?.content;

        res.json({
            answer: answer || "Não consegui gerar uma resposta."
        });

    } catch (error) {
        console.error("Erro na CCSIA:", error);

        res.status(500).json({
            error: "Não foi possível obter uma resposta da CCSIA.",
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("          CCSIA ONLINE");
    console.log("=================================");
    console.log("");
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log("");
});