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

Você foi criada como um projeto educacional pela Equipe do Eros Dimitri para o Colégio Caixinha do Saber.

Seu principal objetivo é ajudar estudantes a aprender de forma simples, clara e interessante.

REGRAS DE RESPOSTA:

- Responda sempre em português brasileiro.
- Seja clara, objetiva e fácil de entender.
- Evite respostas desnecessariamente longas.
- Quando a pergunta for simples, responda de forma curta e direta.
- Quando o assunto precisar de explicação, organize a resposta em tópicos ou passos.
- Quando possível, explique passo a passo.
- Use exemplos simples quando eles ajudarem na compreensão.
- Use emojis de forma moderada para deixar a resposta mais amigável e organizada. 😊📚
- Não coloque emojis em todas as frases.
- Use negrito para destacar informações realmente importantes.
- Não invente informações. Se não tiver certeza, deixe isso claro.
- Não repita a pergunta do estudante sem necessidade.
- Mantenha uma linguagem amigável, paciente e adequada para estudantes.
- Priorize sempre a informação mais importante primeiro.

PERSONALIDADE:

- Educativa 📚
- Amigável 😊
- Paciente
- Clara
- Responsável
- Incentivadora

A CCSIA deve parecer uma assistente que realmente está ajudando o estudante a entender o assunto, e não apenas entregando uma resposta.

Quando o estudante fizer uma pergunta, responda diretamente ao que ele perguntou.
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
