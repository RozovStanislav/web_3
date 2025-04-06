from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import telebot
import threading
from threading import Lock
import logging
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Конфигурация бота
API_TOKEN = '6848579773:AAE4_d_a_6CgCTd4UR3fP1Zt2WlRgfb31yk'
bot = telebot.TeleBot(API_TOKEN)
user_messages = {}
messages_lock = Lock()

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "service": "Telegram Bot WebSocket Server",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

# WebSocket события
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connection_response', {'status': 'connected'})

@socketio.on('register')
def handle_register(data):
    chat_id = data.get('chat_id')
    if chat_id:
        logger.info(f"Client registered chat_id: {chat_id}")
        emit('registration_confirmed', {'chat_id': chat_id, 'status': 'success'})
    else:
        emit('registration_error', {'error': 'chat_id required'})

# Обработчик сообщений Telegram
@bot.message_handler(func=lambda message: True)
def handle_telegram_message(message):
    try:
        chat_id = message.chat.id
        text = message.text

        with messages_lock:
            if chat_id not in user_messages:
                user_messages[chat_id] = []
            user_messages[chat_id].append({
                "from": "bot",
                "text": text,
                "timestamp": datetime.now().isoformat()
            })

        socketio.emit('new_message', {
            'chat_id': str(chat_id),
            'text': text,
            'sender': 'bot',
            'timestamp': datetime.now().isoformat()
        }, room=str(chat_id))
        
        logger.info(f"Message forwarded to WS: {text}")

    except Exception as e:
        logger.error(f"Error handling Telegram message: {e}")

def run_bot():
    try:
        bot.remove_webhook()
        logger.info("Webhook removed, starting polling...")
        bot.polling(
            none_stop=True,
            interval=1,
            timeout=30,
            allowed_updates=["message", "callback_query"]
        )
    except Exception as e:
        logger.error(f"Bot polling error: {e}")
        threading.Timer(5, run_bot).start()

if __name__ == '__main__':
    bot_thread = threading.Thread(target=run_bot, daemon=True)
    bot_thread.start()
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False,
        allow_unsafe_werkzeug=True
    )