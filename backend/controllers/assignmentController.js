// controllers/assignmentController.js
import prisma from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !assignedTo) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity and assignedTo are required.' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        baseId: parseInt(baseId, 10),
        equipmentTypeId: parseInt(equipmentTypeId, 10),
        quantity: parseInt(quantity, 10),
        assignedTo,
        assignedById: userId,
        date: date ? new Date(date) : new Date(),
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit({
      userId,
      action: 'ASSIGNMENT',
      details: `Assigned ${assignment.quantity}x ${assignment.equipmentType.name} to ${assignedTo} at base #${assignment.baseId}.`,
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const listAssignments = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const where = {};
    if (baseId) where.baseId = parseInt(baseId, 10);
    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId, 10);

    const assignments = await prisma.assignment.findMany({
      where,
      include: { base: true, equipmentType: true, assignedBy: { select: { id: true, username: true } } },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason, date } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId and a positive quantity are required.' });
    }

    const expenditure = await prisma.expenditure.create({
      data: {
        baseId: parseInt(baseId, 10),
        equipmentTypeId: parseInt(equipmentTypeId, 10),
        quantity: parseInt(quantity, 10),
        reason: reason || null,
        recordedById: userId,
        date: date ? new Date(date) : new Date(),
      },
      include: { base: true, equipmentType: true },
    });

    await logAudit({
      userId,
      action: 'EXPENDITURE',
      details: `Recorded expenditure of ${expenditure.quantity}x ${expenditure.equipmentType.name} at base #${expenditure.baseId}.`,
    });

    return res.status(201).json(expenditure);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const listExpenditures = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const where = {};
    if (baseId) where.baseId = parseInt(baseId, 10);
    if (equipmentTypeId) where.equipmentTypeId = parseInt(equipmentTypeId, 10);

    const expenditures = await prisma.expenditure.findMany({
      where,
      include: { base: true, equipmentType: true, recordedBy: { select: { id: true, username: true } } },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(expenditures);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
