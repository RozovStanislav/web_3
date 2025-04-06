import telebot
from telebot import apihelper

# Ваш токен
BOT_TOKEN = '6988421773:AAFHpqFJcf2DyQeTlhjPtaSBxxIWR9WXJSI'

# Создание бота
bot = telebot.TeleBot(BOT_TOKEN)

# Удаление вебхука
apihelper.delete_webhook(BOT_TOKEN)

# Получение обновлений
def get_updates():
    updates = bot.get_updates()
    return updates

# Обработка обновлений
def handle_updates(updates):
    for update in updates:
        chat_id = update.message.chat.id
        text = update.message.text
        bot.send_message(chat_id, f"Вы написали: {text}")

# Основной цикл
if __name__ == "__main__":
    updates = get_updates()
    handle_updates(updates)
