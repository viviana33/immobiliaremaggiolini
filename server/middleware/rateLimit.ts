import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Pulizia periodica dello store (ogni 10 minuti)
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = "Troppi tentativi. Riprova più tardi.",
    keyGenerator = (req: Request) => {
      // Usa IP del client (considera anche proxy)
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';
      return ip;
    }
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      // Nuova finestra temporale
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }

    next();
  };
}

// Rate limiter specifico per subscription (5 richieste ogni 15 minuti per email)
export function subscriptionRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    maxRequests: 5,
    message: "Troppe richieste di iscrizione. Riprova tra qualche minuto.",
    keyGenerator: (req: Request) => {
      // Rate limit basato su email E IP per prevenire abusi
      const email = req.body?.email || 'no-email';
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';
      return `subscription:${email}:${ip}`;
    }
  });
}
