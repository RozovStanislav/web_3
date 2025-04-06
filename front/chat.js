document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.querySelector('.close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const quickReplies = document.getElementById('quick-replies');

    // Настройки бота
    const BOT_TOKEN = '6988421773:AAFHpqFJcf2DyQeTlhjPtaSBxxIWR9WXJSI';
    const CHAT_ID = '808803838';
    const CHAT_HISTORY_KEY = 'chatHistory';

    // Подключение к WebSocket-серверу
    const socket = new WebSocket(`ws://${window.location.hostname}:5000`);

    // Регистрация chat_id при подключении
    socket.onopen = function() {
        console.log('WebSocket подключён');
        socket.send(JSON.stringify({
            event: 'register',
            data: { chat_id: CHAT_ID }
        }));
    };

    // Обработчик входящих сообщений
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.event === 'new_message' && data.data.chat_id == CHAT_ID) {
            addMessage(data.data.text, 'bot');
        }
    };

    socket.onerror = function(error) {
        console.error('WebSocket ошибка:', error);
        addMessage("Проблемы с соединением. Попробуйте обновить страницу.", 'bot');
    };

    // Проверка настроек бота
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Не настроен Telegram бот! Укажите BOT_TOKEN и CHAT_ID');
        addMessage("Чат временно не работает. Настройки бота не указаны.", 'bot');
    }

    // Показать/скрыть чат
    chatToggle.addEventListener('click', () => chatWidget.classList.toggle('hidden'));
    closeChat.addEventListener('click', () => chatWidget.classList.add('hidden'));

    // Отправка сообщения
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            showTypingIndicator();

            // Отправка через WebSocket
            socket.send(JSON.stringify({
                event: 'user_message',
                data: {
                    chat_id: CHAT_ID,
                    message: message
                }
            }));

            setTimeout(() => {
                hideTypingIndicator();
                respondToUser(message);
            }, 1000 + Math.random() * 2000);
        }
    }

    // Ответ бота (заглушка)
    function respondToUser(userMessage) {
        const botResponses = [
            "Спасибо за сообщение! Я передал его администратору.",
            "Интересный вопрос! Уточню информацию и отвечу позже.",
            "Записал ваш вопрос. Ответим в ближайшее время!"
        ];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        addMessage(randomResponse, 'bot');
    }

    // Быстрые ответы
    quickReplies.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            const reply = e.target.textContent;
            addMessage(reply, 'user');
            showTypingIndicator();
            
            socket.send(JSON.stringify({
                event: 'user_message',
                data: {
                    chat_id: CHAT_ID,
                    message: reply
                }
            }));

            setTimeout(() => {
                hideTypingIndicator();
                handleQuickReply(reply);
            }, 1000);
        }
    });

    // Обработка быстрых ответов
    function handleQuickReply(reply) {
        const responses = {
            "Как добавить растение?": "Чтобы добавить растение:\n1. Перейдите в раздел 'Добавить растение'\n2. Заполните форму\n3. Укажите название, описание и фото\n4. Нажмите 'Отправить'",
            "Как работает обмен?": "Процесс обмена:\n1. Найдите растение в каталоге\n2. Нажмите 'Предложить обмен'\n3. Дождитесь ответа владельца\n4. Договоритесь о встрече"
        };
        addMessage(responses[reply] || "Спасибо за вопрос! Я свяжусь с вами позже.", 'bot');
    }

    // Вспомогательные функции
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        saveChatHistory();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(typingDiv);
    }

    function hideTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    function saveChatHistory() {
        const messages = Array.from(chatMessages.children)
            .filter(el => el.id !== 'typing-indicator')
            .map(el => ({ text: el.innerHTML, class: el.className }));
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }

    function loadChatHistory() {
        const history = localStorage.getItem(CHAT_HISTORY_KEY);
        if (history) {
            chatMessages.innerHTML = '';
            JSON.parse(history).forEach(msg => {
                const div = document.createElement('div');
                div.className = msg.class;
                div.innerHTML = msg.text;
                chatMessages.appendChild(div);
            });
        } else {
            // Приветственное сообщение только при первом открытии
            setTimeout(() => {
                addMessage("Привет! Я бот 'Мухоловка'. Чем могу помочь?", 'bot');
            }, 1500);
        }
    }

    // Инициализация
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    loadChatHistory();
});