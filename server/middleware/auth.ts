import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: "Non autorizzato" });
  }
  next();
}

export function requireCronToken(req: Request, res: Response, next: NextFunction) {
  const cronToken = process.env.CRON_TOKEN;
  
  if (!cronToken) {
    return res.status(500).json({ 
      success: false, 
      message: "CRON_TOKEN non configurato sul server" 
    });
  }

  const providedToken = req.headers["x-cron-token"] || req.query.token;
  
  if (providedToken !== cronToken) {
    return res.status(401).json({ 
      success: false, 
      message: "Token non autorizzato" 
    });
  }
  
  next();
}
