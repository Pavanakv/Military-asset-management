// controllers/assetController.js
// Dynamic inventory calculation — balances are derived from the movement
// tables on every request rather than stored/duplicated anywhere.
import prisma from '../config/db.js';

const toInt = (v) => (v === undefined || v === null || v === '' ? null : parseInt(v, 10));
const toDate = (v) => (v ? new Date(v) : null);

// Sums quantity from a model for rows matching the shared filters, optionally
// restricted to a date range and a specific "date field" (createdAt by default).
const sumQuantity = async (model, where) => {
  const result = await model.aggregate({ _sum: { quantity: true }, where });
  return result._sum.quantity || 0;
};

const buildFilters = ({ baseId, equipmentTypeId, startDate, endDate }, baseField = 'baseId') => {
  const where = {};
  if (baseId) where[baseField] = toInt(baseId);
  if (equipmentTypeId) where.equipmentTypeId = toInt(equipmentTypeId);
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = toDate(startDate);
    if (endDate) where.createdAt.lte = toDate(endDate);
  }
  return where;
};

// GET /api/assets/dashboard?baseId=&equipmentTypeId=&startDate=&endDate=
export const getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;

    // --- Opening balance: everything that happened strictly BEFORE startDate ---
    let openingBalance = 0;
    if (startDate) {
      const priorWhere = { equipmentTypeId: equipmentTypeId ? toInt(equipmentTypeId) : undefined, createdAt: { lt: toDate(startDate) } };
      const priorBaseWhere = { ...priorWhere, ...(baseId ? { baseId: toInt(baseId) } : {}) };
      const priorSourceWhere = { ...priorWhere, ...(baseId ? { sourceBaseId: toInt(baseId) } : {}) };
      const priorDestWhere = { ...priorWhere, ...(baseId ? { destinationBaseId: toInt(baseId) } : {}) };

      const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
        sumQuantity(prisma.purchase, priorBaseWhere),
        sumQuantity(prisma.transfer, priorDestWhere),
        sumQuantity(prisma.transfer, priorSourceWhere),
        sumQuantity(prisma.assignment, priorBaseWhere),
        sumQuantity(prisma.expenditure, priorBaseWhere),
      ]);
      openingBalance = purchases + transfersIn - transfersOut - assigned - expended;
    }

    // --- Movements within the selected window ---
    const purchaseWhere = buildFilters({ baseId, equipmentTypeId, startDate, endDate }, 'baseId');
    const transferInWhere = buildFilters({ baseId, equipmentTypeId, startDate, endDate }, 'destinationBaseId');
    const transferOutWhere = buildFilters({ baseId, equipmentTypeId, startDate, endDate }, 'sourceBaseId');
    const assignedWhere = buildFilters({ baseId, equipmentTypeId, startDate, endDate }, 'baseId');
    const expendedWhere = buildFilters({ baseId, equipmentTypeId, startDate, endDate }, 'baseId');

    const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
      sumQuantity(prisma.purchase, purchaseWhere),
      sumQuantity(prisma.transfer, transferInWhere),
      sumQuantity(prisma.transfer, transferOutWhere),
      sumQuantity(prisma.assignment, assignedWhere),
      sumQuantity(prisma.expenditure, expendedWhere),
    ]);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    return res.status(200).json({
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/assets/bases
export const listBases = async (req, res) => {
  try {
    // Non-admins (scoped by enforceBaseScope) only ever see their own base.
    const where = req.query.baseId ? { id: toInt(req.query.baseId) } : {};
    const bases = await prisma.base.findMany({ where, orderBy: { name: 'asc' } });
    return res.status(200).json(bases);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/assets/bases  (Admin only)
export const createBase = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) return res.status(400).json({ message: 'name and location are required.' });
    const base = await prisma.base.create({ data: { name, location } });
    return res.status(201).json(base);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/assets/equipment-types
export const listEquipmentTypes = async (req, res) => {
  try {
    const types = await prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/assets/equipment-types (Admin only)
export const createEquipmentType = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'name and category are required.' });
    const type = await prisma.equipmentType.create({ data: { name, category } });
    return res.status(201).json(type);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
