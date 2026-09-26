const chatContent =
    document.getElementById("chatContent");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChatButton");

const welcome =
    document.getElementById("welcome");

const themeButton =
    document.getElementById("themeButton");

const menuButton =
    document.getElementById("menuButton");

const closeMenuButton =
    document.getElementById("closeMenuButton");

const menuOverlay =
    document.getElementById("menuOverlay");

const sidebar =
    document.getElementById("sidebar");

const historyList =
    document.getElementById("historyList");


/* ================================= */
/* FORMATAÇÃO DA RESPOSTA */
/* ================================= */

function formatAIResponse(text) {

    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    formatted =
        formatted.replace(
            /^### (.+)$/gm,
            "<h3>$1</h3>"
        );

    formatted =
        formatted.replace(
            /^## (.+)$/gm,
            "<h2>$1</h2>"
        );

    formatted =
        formatted.replace(
            /^# (.+)$/gm,
            "<h1>$1</h1>"
        );

    formatted =
        formatted.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

    formatted =
        formatted.replace(
            /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
            "<em>$1</em>"
        );

    formatted =
        formatted.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

    formatted =
        formatted.replace(
            /^[•\-] (.+)$/gm,
            "<li>$1</li>"
        );

    formatted =
        formatted.replace(
            /(<li>.*<\/li>\n?)+/g,
            function(match) {
                return "<ul>" + match + "</ul>";
            }
        );

    formatted =
        formatted.replace(/\n/g, "<br>");

    formatted =
        formatted.replace(
            /(<\/h[1-3]>)<br>/g,
            "$1"
        );

    formatted =
        formatted.replace(
            /<br><ul>/g,
            "<ul>"
        );

    formatted =
        formatted.replace(
            /<\/ul><br>/g,
            "</ul>"
        );

    return formatted;
}


/* ================================= */
/* AVATAR */
/* ================================= */

function createAvatar(type) {

    const avatar =
        document.createElement("div");

    avatar.classList.add(
        "message-avatar",
        type === "ai"
            ? "ai-avatar"
            : "user-avatar"
    );

    if (type === "ai") {

        const logo =
            document.createElement("img");

        logo.src = "logo.png";

        logo.alt =
            "Logo da CCSIA";

        avatar.appendChild(logo);

    } else {

        avatar.textContent = "👤";

    }

    return avatar;
}


/* ================================= */
/* BOTÃO COPIAR */
/* ================================= */

function createCopyButton(text) {

    const copyButton =
        document.createElement("button");

    copyButton.classList.add(
        "copy-button"
    );

    copyButton.type = "button";

    copyButton.innerHTML =
        "📋 Copiar";


    copyButton.addEventListener(
        "click",
        async function() {

            try {

                await navigator.clipboard
                    .writeText(text);

                copyButton.innerHTML =
                    "✓ Copiado!";

                copyButton.classList.add(
                    "copied"
                );


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


/* ================================= */
/* ENVIAR MENSAGEM */
/* ================================= */

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) return;


    if (welcome) {
        welcome.remove();
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    resetTextarea();

    sendButton.disabled = true;


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

                    body:
                        JSON.stringify({
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


/* ================================= */
/* ADICIONAR MENSAGEM */
/* ================================= */

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.classList.add(
        "message",
        type
    );


    const avatar =
        createAvatar(type);


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
        type === "ai"
            ? "CCSIA"
            : "Você";


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


    content.appendChild(name);

    content.appendChild(textElement);


    if (type === "ai") {

        const copyButton =
            createCopyButton(text);

        content.appendChild(
            copyButton
        );

    }


    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);


    chatContent.scrollTop =
        chatContent.scrollHeight;


    return message;
}


/* ================================= */
/* EFEITO DIGITANDO */
/* ================================= */

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


    const avatar =
        createAvatar(type);


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


    const textElement =
        document.createElement("div");

    textElement.classList.add(
        "message-text"
    );


    content.appendChild(name);

    content.appendChild(
        textElement
    );


    message.appendChild(avatar);

    message.appendChild(content);

    chatContent.appendChild(message);


    let currentText = "";

    const speed = 12;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        currentText += text[i];


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


    const copyButton =
        createCopyButton(text);


    content.appendChild(
        copyButton
    );


    chatContent.scrollTop =
        chatContent.scrollHeight;


    return message;
}


/* ================================= */
/* LOADING */
/* ================================= */

function addLoadingMessage() {

    const message =
        document.createElement("div");

    message.classList.add(
        "message",
        "ai"
    );


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


/* ================================= */
/* TEXTAREA */
/* ================================= */

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


sendButton.addEventListener(
    "click",
    sendMessage
);


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


function resetTextarea() {

    messageInput.style.height =
        "auto";
}


/* ================================= */
/* SUGESTÕES */
/* ================================= */

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


/* ================================= */
/* NOVA CONVERSA */
/* ================================= */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        function() {

            chatContent.innerHTML = `
                <div
                    class="welcome"
                    id="welcome"
                >

                    <div class="welcome-icon">

                        <img
                            src="logo.png"
                            alt="Logo da CCSIA"
                        >

                    </div>

                    <h2>
                        Olá! Eu sou a CCSIA.
                    </h2>

                    <p>
                        A Inteligência Artificial da
                        <strong>Caixinha do Saber</strong>.
                    </p>

                    <span class="welcome-description">
                        Faça uma pergunta e comece a aprender.
                    </span>

                    <div class="suggestions">

                        <button
                            class="suggestion"
                            data-question="Explique a matemática de uma forma simples."
                        >
                            <span>📐</span>

                            <div>
                                <strong>Matemática</strong>
                                <small>
                                    Aprenda um conceito
                                </small>
                            </div>
                        </button>

                        <button
                            class="suggestion"
                            data-question="Explique o que foi a Revolução Industrial."
                        >
                            <span>🌎</span>

                            <div>
                                <strong>História</strong>
                                <small>
                                    Conheça acontecimentos
                                </small>
                            </div>
                        </button>

                        <button
                            class="suggestion"
                            data-question="Explique como funciona a programação para iniciantes."
                        >
                            <span>💻</span>

                            <div>
                                <strong>Tecnologia</strong>
                                <small>
                                    Descubra como funciona
                                </small>
                            </div>
                        </button>

                        <button
                            class="suggestion"
                            data-question="Explique o que é inteligência artificial."
                        >
                            <span>🤖</span>

                            <div>
                                <strong>IA</strong>
                                <small>
                                    Entenda a tecnologia
                                </small>
                            </div>
                        </button>

                    </div>

                </div>
            `;


            messageInput.value = "";

            resetTextarea();

            closeMobileMenu();

            messageInput.focus();

        }
    );

}


/* ================================= */
/* MODO ESCURO */
/* ================================= */

if (themeButton) {

    function updateThemeButton() {

        const darkMode =
            document.body.classList
                .contains("dark-mode");


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


    themeButton.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark-mode"
            );


            const darkMode =
                document.body.classList
                    .contains("dark-mode");


            localStorage.setItem(
                "ccsia-theme",
                darkMode
                    ? "dark"
                    : "light"
            );


            updateThemeButton();

        }
    );


    const savedTheme =
        localStorage.getItem(
            "ccsia-theme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeButton();

}


/* ================================= */
/* MENU MOBILE */
/* ================================= */

function openMobileMenu() {

    if (!sidebar) return;

    sidebar.classList.add(
        "mobile-open"
    );

    menuOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


function closeMobileMenu() {

    if (!sidebar) return;

    sidebar.classList.remove(
        "mobile-open"
    );

    menuOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openMobileMenu
    );

}


if (closeMenuButton) {

    closeMenuButton.addEventListener(
        "click",
        closeMobileMenu
    );

}


if (menuOverlay) {

    menuOverlay.addEventListener(
        "click",
        closeMobileMenu
    );

}


/* ================================= */
/* CTRL + SHIFT + D */
/* ================================= */

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
