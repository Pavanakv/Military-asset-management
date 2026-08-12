// controllers/purchaseController.js
import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId and a positive quantity are required.' });
    }

    const purchase = await prisma.purchase.create({
      data: {
        baseId: parseInt(baseId, 10),
        equipmentTypeId: parseInt(equipmentTypeId, 10),
        quantity: parseInt(quantity, 10),
        purchasedById: userId,
        date: date ? new Date(date) : new Date(),
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit({
      userId,
      action: 'PURCHASE',
      details: `Purchased ${purchase.quantity}x ${purchase.equipmentType.name} for base #${purchase.baseId}.`,
    });

    return res.status(201).json(purchase);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const listPurchases = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;
    const where = {};
    if (baseId) where.baseId = parseInt(baseId, 10);
    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId, 10);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: { base: true, equipmentType: true, purchasedBy: { select: { id: true, username: true } } },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json(purchases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
