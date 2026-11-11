
const RATE_LIMITS = Object.freeze({
  "join-room": {
    limit: 10,
    windowMs: 60_000,
  },

  "send-message": {
    limit: 30,
    windowMs: 10_000,
  },

  "code-change": {
    limit: 60,
    windowMs: 10_000,
  },

  "cursor-change": {
    limit: 120,
    windowMs: 10_000,
  },

  "language-change": {
    limit: 20,
    windowMs: 10_000,
  },

  offer: {
    limit: 20,
    windowMs: 10_000,
  },

  answer: {
    limit: 20,
    windowMs: 10_000,
  },

  "ice-candidate": {
    limit: 120,
    windowMs: 10_000,
  },

  "interview-ended": {
    limit: 5,
    windowMs: 60_000,
  },

  "screen-share-started": {
    limit: 10,
    windowMs: 60_000,
  },

  "screen-share-stopped": {
    limit: 10,
    windowMs: 60_000,
  },

  "leave-room": {
    limit: 10,
    windowMs: 60_000,
  },
});

const attachSocketRateLimit = (socket) => {
  const counters = new Map();

  socket.use((packet, next) => {
    const eventName = packet[0];

    const config = RATE_LIMITS[eventName];

    // Ignore events that do not have an explicit limit.
    if (!config) {
      return next();
    }

    const now = Date.now();
    const current = counters.get(eventName);

    if (!current || now >= current.resetAt) {
      counters.set(eventName, {
        count: 1,
        resetAt: now + config.windowMs,
      });

      return next();
    }

    if (current.count >= config.limit) {
      const retryAfterMs = Math.max(
        0,
        current.resetAt - now
      );

      socket.emit("socket-rate-limit", {
        event: eventName,
        retryAfterMs,
      });

      return;
    }

    current.count += 1;

    return next();
  });

  socket.on("disconnect", () => {
    counters.clear();
  });
};

export default attachSocketRateLimit;
