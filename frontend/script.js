const chatContent = document.getElementById("chatContent");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChatButton");
const welcome = document.getElementById("welcome");


// ==========================================
// CONVERTE A RESPOSTA DA IA EM HTML
// ==========================================

function formatAIResponse(text) {

    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Títulos
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

    // Negrito
    formatted = formatted.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Itálico
    formatted = formatted.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );

    // Código
    formatted = formatted.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    // Listas
    formatted = formatted.replace(
        /^[•\-] (.+)$/gm,
        "<li>$1</li>"
    );

    // Junta listas consecutivas
    formatted = formatted.replace(
        /(<li>.*<\/li>\n?)+/g,
        function(match) {
            return "<ul>" + match + "</ul>";
        }
    );

    // Quebras de linha
    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );

    // Remove quebra depois de títulos
    formatted = formatted.replace(
        /(<\/h[1-3]>)<br>/g,
        "$1"
    );

    // Remove quebra antes de listas
    formatted = formatted.replace(
        /<br><ul>/g,
        "<ul>"
    );

    // Remove quebra depois de listas
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

    // Avatar da CCSIA
    if (type === "ai") {

        const logo = document.createElement("img");

        logo.src = "logo.png";
        logo.alt = "Logo da CCSIA";

        avatar.appendChild(logo);

    } else {

        // Avatar do usuário
        avatar.textContent = "👤";
    }

    return avatar;
}


// ==========================================
// BOTÃO COPIAR
// ==========================================

function createCopyButton(text) {

    const copyButton = document.createElement("button");

    copyButton.classList.add("copy-button");

    copyButton.type = "button";

    copyButton.innerHTML = "📋 Copiar";


    copyButton.addEventListener(
        "click",
        async function() {

            try {

                await navigator.clipboard.writeText(text);

                copyButton.innerHTML = "✓ Copiado!";

                copyButton.classList.add("copied");


                setTimeout(
                    function() {

                        copyButton.innerHTML =
                            "📋 Copiar";

                        copyButton.classList.remove(
                            "copied"
                        );

                    },
                    2000
                );


            } catch (error) {

                console.error(
                    "Não foi possível copiar:",
                    error
                );

                copyButton.innerHTML =
                    "❌ Erro";


                setTimeout(
                    function() {

                        copyButton.innerHTML =
                            "📋 Copiar";

                    },
                    2000
                );
            }
        }
    );

    return copyButton;
}


// ==========================================
// ENVIA MENSAGEM
// ==========================================

async function sendMessage() {

    const message =
        messageInput.value.trim();

    if (!message) return;


    // Remove tela inicial
    if (welcome) {
        welcome.remove();
    }


    // Mostra mensagem do usuário
    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    resetTextarea();

    sendButton.disabled = true;


    // Mostra carregamento
    const loadingMessage =
        addLoadingMessage();


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        const data =
            await response.json();


        loadingMessage.remove();


        if (!response.ok) {

            addMessage(
                "Desculpe, ocorreu um erro ao falar com a CCSIA.",
                "ai"
            );

            console.error(data);

            return;
        }


        // Resposta com animação
        await addTypingMessage(
            data.answer,
            "ai"
        );


    } catch (error) {

        console.error(
            "Erro:",
            error
        );


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

function addMessage(
    text,
    type
) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        type
    );


    // Avatar
    const avatar =
        createAvatar(type);


    // Conteúdo
    const content =
        document.createElement("div");


    content.classList.add(
        "message-content"
    );


    // Nome
    const name =
        document.createElement("div");


    name.classList.add(
        "message-name"
    );


    name.textContent =
        type === "ai"
            ? "CCSIA"
            : "Você";


    // Texto
    const textElement =
        document.createElement("div");


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


    // Adiciona elementos
    content.appendChild(name);

    content.appendChild(
        textElement
    );


    // Botão copiar somente para IA
    if (type === "ai") {

        const copyButton =
            createCopyButton(text);

        content.appendChild(
            copyButton
        );
    }


    message.appendChild(
        avatar
    );

    message.appendChild(
        content
    );


    chatContent.appendChild(
        message
    );


    // Rola para o final
    chatContent.scrollTop =
        chatContent.scrollHeight;


    return message;
}


// ==========================================
// RESPOSTA COM ANIMAÇÃO DE DIGITAÇÃO
// ==========================================

async function addTypingMessage(
    text,
    type
) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        type
    );


    // Avatar
    const avatar =
        createAvatar(type);


    // Conteúdo
    const content =
        document.createElement("div");


    content.classList.add(
        "message-content"
    );


    // Nome
    const name =
        document.createElement("div");


    name.classList.add(
        "message-name"
    );


    name.textContent =
        "CCSIA";


    // Texto
    const textElement =
        document.createElement("div");


    textElement.classList.add(
        "message-text"
    );


    content.appendChild(
        name
    );

    content.appendChild(
        textElement
    );


    message.appendChild(
        avatar
    );

    message.appendChild(
        content
    );


    chatContent.appendChild(
        message
    );


    // ==========================================
    // EFEITO DE DIGITAÇÃO
    // ==========================================

    let currentText = "";

    const speed = 12;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        currentText +=
            text[i];


        textElement.innerHTML =
            formatAIResponse(
                currentText
            );


        chatContent.scrollTop =
            chatContent.scrollHeight;


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    speed
                )
        );
    }


    // ==========================================
    // BOTÃO COPIAR
    // ==========================================

    const copyButton =
        createCopyButton(text);


    content.appendChild(
        copyButton
    );


    chatContent.scrollTop =
        chatContent.scrollHeight;


    return message;
}


// ==========================================
// MENSAGEM DE CARREGAMENTO
// ==========================================

function addLoadingMessage() {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        "ai"
    );


    // Logo CCSIA
    const avatar =
        createAvatar("ai");


    const content =
        document.createElement("div");


    content.classList.add(
        "message-content"
    );


    const name =
        document.createElement("div");


    name.classList.add(
        "message-name"
    );


    name.textContent =
        "CCSIA";


    const text =
        document.createElement("div");


    text.classList.add(
        "message-text"
    );


    // Pontinhos de carregamento
    const typing =
        document.createElement("div");


    typing.classList.add(
        "typing"
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement("span");


        typing.appendChild(
            dot
        );
    }


    text.appendChild(
        typing
    );


    content.appendChild(
        name
    );

    content.appendChild(
        text
    );


    message.appendChild(
        avatar
    );

    message.appendChild(
        content
    );


    chatContent.appendChild(
        message
    );


    chatContent.scrollTop =
        chatContent.scrollHeight;


    return message;
}


// ==========================================
// ENTER ENVIA A MENSAGEM
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
// AJUSTA ALTURA DO CAMPO
// ==========================================

messageInput.addEventListener(
    "input",
    function() {

        this.style.height =
            "auto";


        this.style.height =
            Math.min(
                this.scrollHeight,
                120
            ) + "px";
    }
);


// ==========================================
// RESET TEXTAREA
// ==========================================

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

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        function() {

            location.reload();

        }
    );
}


// ==========================================
// MODO ESCURO / MODO CLARO
// ==========================================

const themeButton =
    document.getElementById(
        "themeButton"
    );


if (themeButton) {

    // ------------------------------------------
    // FUNÇÃO PARA ATUALIZAR O BOTÃO
    // ------------------------------------------

    function updateThemeButton() {

        const darkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        if (darkMode) {

            themeButton.textContent =
                "☀️";

            themeButton.title =
                "Modo claro";

            themeButton.setAttribute(
                "aria-label",
                "Ativar modo claro"
            );

        } else {

            themeButton.textContent =
                "🌙";

            themeButton.title =
                "Modo escuro";

            themeButton.setAttribute(
                "aria-label",
                "Ativar modo escuro"
            );
        }
    }


    // ------------------------------------------
    // CLIQUE NO BOTÃO
    // ------------------------------------------

    themeButton.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark-mode"
            );


            const darkMode =
                document.body.classList.contains(
                    "dark-mode"
                );


            // Salva preferência
            localStorage.setItem(
                "ccsia-theme",
                darkMode
                    ? "dark"
                    : "light"
            );


            updateThemeButton();
        }
    );


    // ------------------------------------------
    // RECUPERA TEMA SALVO
    // ------------------------------------------

    const savedTheme =
        localStorage.getItem(
            "ccsia-theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );
    }


    // Atualiza botão
    updateThemeButton();
}


// ==========================================
// ATALHO CTRL + SHIFT + D
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() === "d"
        ) {

            if (!themeButton) return;


            themeButton.click();
        }
    }
);
