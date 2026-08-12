// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role, baseId: user.baseId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    await logAudit({ userId: user.id, action: 'LOGIN', details: `User ${user.username} logged in.` });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin-only: create new users (commanders/logistics officers)
export const registerUser = async (req, res) => {
  try {
    const { username, password, role, baseId } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'username, password and role are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, passwordHash, role, baseId: baseId || null },
    });

    await logAudit({
      userId: req.user?.id ?? null,
      action: 'USER_CREATED',
      details: `Created user ${user.username} with role ${user.role}.`,
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.baseId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, baseId: true, base: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
