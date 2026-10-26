function notFoundHandler(req, res, next) {
  res.status(404).render('pages/404', {
    title: 'Page Not Found | Ayush Jha',
    activePage: '404',
    message: 'The page you are looking for does not exist or has been moved.',
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error('[Global Error]:', err);

  // CSRF token error
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('pages/500', {
      title: 'Session Expired | Ayush Jha',
      activePage: '500',
      message: 'Invalid or expired form session. Please refresh and try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : null,
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).render('pages/500', {
    title: 'Server Error | Ayush Jha',
    activePage: '500',
    message: 'Something went wrong on our end. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err.message : null,
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
