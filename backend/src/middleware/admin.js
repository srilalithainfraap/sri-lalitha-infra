// Must be used AFTER the protect middleware (req.user must exist)
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Forbidden — admin access required');
  }
  next();
}

module.exports = { adminOnly };
