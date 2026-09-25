const chatContent = document.getElementById("chatContent");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChatButton");
const welcome = document.getElementById("welcome");

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

        addMessage(data.answer, "ai");

    } catch (error) {

        console.error("Erro:", error);

        loadingMessage.remove();

        addMessage(
            "Não consegui conectar ao servidor da CCSIA. Verifique se o servidor está funcionando.",
            "ai"
        );

    } finally {

        sendButton.disabled = false;
    }
}


// Adiciona uma mensagem no chat
function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add("message", type);

    const avatar = document.createElement("div");

    avatar.classList.add(
        "message-avatar",
        type === "ai"
            ? "ai-avatar"
            : "user-avatar"
    );

    avatar.textContent =
        type === "ai"
            ? "🧠"
            : "👤";

    const content = document.createElement("div");

    content.classList.add("message-content");

    const name = document.createElement("div");

    name.classList.add("message-name");

    name.textContent =
        type === "ai"
            ? "CCSIA"
            : "Você";

    const textElement = document.createElement("div");

    textElement.classList.add("message-text");

    textElement.textContent = text;

    content.appendChild(name);

    content.appendChild(textElement);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);

    chatContent.scrollTop =
        chatContent.scrollHeight;

    return message;
}


// Mensagem de carregamento
function addLoadingMessage() {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        "ai"
    );

    const avatar = document.createElement("div");

    avatar.classList.add(
        "message-avatar",
        "ai-avatar"
    );

    avatar.textContent = "🧠";

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

    typing.classList.add("typing");

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


// Enter envia a mensagem
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


// Botão enviar
sendButton.addEventListener(
    "click",
    sendMessage
);


// Ajusta altura do campo
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


// Sugestões
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


// Nova conversa
newChatButton.addEventListener(
    "click",
    function() {

        location.reload();
    }
);