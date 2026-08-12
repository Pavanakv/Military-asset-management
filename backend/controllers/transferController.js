// controllers/transferController.js
import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

// Recompute a base's current closing balance for one equipment type, used to
// stop a transfer from sending out more stock than the base actually has.
const getAvailableQuantity = async (tx, baseId, equipmentTypeId) => {
  const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
    tx.purchase.aggregate({ _sum: { quantity: true }, where: { baseId, equipmentTypeId } }),
    tx.transfer.aggregate({ _sum: { quantity: true }, where: { destinationBaseId: baseId, equipmentTypeId } }),
    tx.transfer.aggregate({ _sum: { quantity: true }, where: { sourceBaseId: baseId, equipmentTypeId } }),
    tx.assignment.aggregate({ _sum: { quantity: true }, where: { baseId, equipmentTypeId } }),
    tx.expenditure.aggregate({ _sum: { quantity: true }, where: { baseId, equipmentTypeId } }),
  ]);
  const p = purchases._sum.quantity || 0;
  const ti = transfersIn._sum.quantity || 0;
  const to = transfersOut._sum.quantity || 0;
  const a = assigned._sum.quantity || 0;
  const e = expended._sum.quantity || 0;
  return p + ti - to - a - e;
};

export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    const srcId = parseInt(sourceBaseId, 10);
    const destId = parseInt(destinationBaseId, 10);
    const eqId = parseInt(equipmentTypeId, 10);
    const qty = parseInt(quantity, 10);

    if (!srcId || !destId || !eqId || !qty || qty <= 0) {
      return res.status(400).json({ message: 'sourceBaseId, destinationBaseId, equipmentTypeId and a positive quantity are required.' });
    }
    if (srcId === destId) {
      return res.status(400).json({ message: 'Source and destination base must be different.' });
    }

    // Everything below runs inside one DB transaction: either the transfer
    // record + audit log both commit, or nothing does (BEGIN...COMMIT/ROLLBACK).
    const result = await prisma.$transaction(async (tx) => {
      const available = await getAvailableQuantity(tx, srcId, eqId);
      if (available < qty) {
        throw new Error(`Insufficient stock at source base: only ${available} available.`);
      }

      const transfer = await tx.transfer.create({
        data: {
          sourceBaseId: srcId,
          destinationBaseId: destId,
          equipmentTypeId: eqId,
          quantity: qty,
          status: 'COMPLETED',
          initiatedById: userId,
        },
        include: { sourceBase: true, destinationBase: true, equipmentType: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'TRANSFER',
          details: `Transferred ${qty}x ${transfer.equipmentType.name} from Base #${srcId} to Base #${destId}.`,
        },
      });

      return transfer;
    });

    return res.status(201).json({ message: 'Transfer completed successfully', transfer: result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const listTransfers = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;
    const where = {};
    if (baseId) {
      const id = parseInt(baseId, 10);
      where.OR = [{ sourceBaseId: id }, { destinationBaseId: id }];
    }
    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId, 10);
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        sourceBase: true,
        destinationBase: true,
        equipmentType: true,
        initiatedBy: { select: { id: true, username: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    return res.status(200).json(transfers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
