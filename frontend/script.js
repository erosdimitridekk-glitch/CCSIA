const chatContent = document.getElementById("chatContent");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChatButton");
const welcome = document.getElementById("welcome");


// ==========================================
// CONVERTE A RESPOSTA DA IA EM HTML BONITO
// ==========================================

function formatAIResponse(text) {

    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    formatted = formatted.replace(
        /^### (.+)$/gm,
        "<h3>$1</h3>"
    );

    formatted = formatted.replace(
        /^## (.+)$/gm,
        "<h2>$1</h2>"
    );

    formatted = formatted.replace(
        /^# (.+)$/gm,
        "<h1>$1</h1>"
    );

    formatted = formatted.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );

    formatted = formatted.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    formatted = formatted.replace(
        /^[•\-] (.+)$/gm,
        "<li>$1</li>"
    );

    formatted = formatted.replace(
        /(<li>.*<\/li>\n?)+/g,
        function(match) {
            return "<ul>" + match + "</ul>";
        }
    );

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );

    formatted = formatted.replace(
        /(<\/h[1-3]>)<br>/g,
        "$1"
    );

    formatted = formatted.replace(
        /<br><ul>/g,
        "<ul>"
    );

    formatted = formatted.replace(
        /<\/ul><br>/g,
        "</ul>"
    );

    return formatted;
}


// ==========================================
// CRIA AVATAR
// ==========================================

function createAvatar(type) {

    const avatar = document.createElement("div");

    avatar.classList.add(
        "message-avatar",
        type === "ai"
            ? "ai-avatar"
            : "user-avatar"
    );

    if (type === "ai") {

        const logo = document.createElement("img");

        logo.src = "logo.png";
        logo.alt = "Logo da CCSIA";

        avatar.appendChild(logo);

    } else {

        avatar.textContent = "👤";
    }

    return avatar;
}


// ==========================================
// ENVIA MENSAGEM
// ==========================================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    if (welcome) {
        welcome.remove();
    }

    addMessage(message, "user");

    messageInput.value = "";

    resetTextarea();

    sendButton.disabled = true;

    const loadingMessage = addLoadingMessage();

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        loadingMessage.remove();

        if (!response.ok) {

            addMessage(
                "Desculpe, ocorreu um erro ao falar com a CCSIA.",
                "ai"
            );

            console.error(data);

            return;
        }

        // ==========================================
        // NOVO: RESPOSTA COM EFEITO DE DIGITAÇÃO
        // ==========================================

        await addTypingMessage(
            data.answer,
            "ai"
        );

    } catch (error) {

        console.error("Erro:", error);

        loadingMessage.remove();

        await addTypingMessage(
            "Não consegui conectar ao servidor da CCSIA. Verifique se o servidor está funcionando.",
            "ai"
        );

    } finally {

        sendButton.disabled = false;
    }
}


// ==========================================
// ADICIONA MENSAGEM NORMAL
// ==========================================

function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        type
    );

    const avatar = createAvatar(type);

    const content = document.createElement("div");

    content.classList.add(
        "message-content"
    );

    const name = document.createElement("div");

    name.classList.add(
        "message-name"
    );

    name.textContent =
        type === "ai"
            ? "CCSIA"
            : "Você";

    const textElement = document.createElement("div");

    textElement.classList.add(
        "message-text"
    );

    if (type === "ai") {

        textElement.innerHTML =
            formatAIResponse(text);

    } else {

        textElement.textContent =
            text;
    }

    content.appendChild(name);

    content.appendChild(textElement);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);

    chatContent.scrollTop =
        chatContent.scrollHeight;

    return message;
}


// ==========================================
// NOVO: DIGITAÇÃO DA CCSIA
// ==========================================

async function addTypingMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        type
    );

    const avatar = createAvatar(type);

    const content = document.createElement("div");

    content.classList.add(
        "message-content"
    );

    const name = document.createElement("div");

    name.classList.add(
        "message-name"
    );

    name.textContent = "CCSIA";

    const textElement = document.createElement("div");

    textElement.classList.add(
        "message-text"
    );

    content.appendChild(name);

    content.appendChild(textElement);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);


    // ==========================================
    // DIGITAÇÃO
    // ==========================================

    let currentText = "";

    const speed = 12;

    for (let i = 0; i < text.length; i++) {

        currentText += text[i];

        textElement.innerHTML =
            formatAIResponse(currentText);

        chatContent.scrollTop =
            chatContent.scrollHeight;

        await new Promise(
            resolve => setTimeout(resolve, speed)
        );
    }

    return message;
}


// ==========================================
// MENSAGEM DE CARREGAMENTO
// ==========================================

function addLoadingMessage() {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        "ai"
    );

    const avatar = createAvatar("ai");

    const content = document.createElement("div");

    content.classList.add(
        "message-content"
    );

    const name = document.createElement("div");

    name.classList.add(
        "message-name"
    );

    name.textContent = "CCSIA";

    const text = document.createElement("div");

    text.classList.add(
        "message-text"
    );

    const typing = document.createElement("div");

    typing.classList.add(
        "typing"
    );

    for (let i = 0; i < 3; i++) {

        const dot =
            document.createElement("span");

        typing.appendChild(dot);
    }

    text.appendChild(typing);

    content.appendChild(name);

    content.appendChild(text);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);

    chatContent.scrollTop =
        chatContent.scrollHeight;

    return message;
}


// ==========================================
// ENTER ENVIA
// ==========================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// ==========================================
// BOTÃO ENVIAR
// ==========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// AJUSTA ALTURA
// ==========================================

messageInput.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                120
            ) + "px";
    }
);


function resetTextarea() {

    messageInput.style.height =
        "auto";
}


// ==========================================
// SUGESTÕES
// ==========================================

document.addEventListener(
    "click",
    function(event) {

        const suggestion =
            event.target.closest(
                ".suggestion"
            );

        if (!suggestion) return;

        const question =
            suggestion.dataset.question;

        messageInput.value =
            question;

        messageInput.focus();

        messageInput.dispatchEvent(
            new Event("input")
        );
    }
);


// ==========================================
// NOVA CONVERSA
// ==========================================

newChatButton.addEventListener(
    "click",
    function() {

        location.reload();

    }
);
