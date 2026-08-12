// middlewares/rbacMiddleware.js

// Restricts a route to a given set of roles.
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level.',
      });
    }
    next();
  };
};

// Admins see everything. Base Commanders and Logistics Officers are pinned
// to their own base_id regardless of what query params / body they send.
export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (!req.user.baseId) {
    return res.status(403).json({ message: 'User is not assigned to a base.' });
  }

  // Force query context to the user's assigned base — clients cannot override this.
  req.query.baseId = String(req.user.baseId);
  next();
};

// For write operations (purchases, assignments, expenditures) where the base
// is supplied in the body — non-admins can only ever write to their own base.
export const enforceBaseScopeBody = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (!req.user.baseId) {
    return res.status(403).json({ message: 'User is not assigned to a base.' });
  }

  req.body.baseId = req.user.baseId;
  next();
};

// Transfers touch two bases. Non-admins may only initiate transfers whose
// source base is their own base (they can still send stock to any destination).
export const enforceTransferSourceScope = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (!req.user.baseId) {
    return res.status(403).json({ message: 'User is not assigned to a base.' });
  }

  req.body.sourceBaseId = req.user.baseId;
  next();
};
