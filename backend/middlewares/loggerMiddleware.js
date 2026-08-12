// middlewares/loggerMiddleware.js
import prisma from '../config/db.js';

// Call this from controllers right after a successful mutation.
// Never throws — a logging failure should not roll back or fail the request.
export const logAudit = async ({ userId, action, details }) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, details },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

// Simple request logger for dev visibility (used alongside morgan in server.js).
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
};
