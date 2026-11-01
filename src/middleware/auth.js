function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    if (req.session.userRole && req.session.userRole !== 'admin') {
      if (req.xhr || req.headers.accept?.includes('application/json') || req.method === 'DELETE') {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
      }
      return res.status(403).send('Forbidden: Admin access required');
    }
    return next();
  }

  if (req.xhr || req.headers.accept?.includes('application/json') || req.method === 'DELETE') {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required' });
  }

  req.session.returnTo = req.originalUrl;
  return res.redirect('/admin/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  return next();
}

module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated,
};

