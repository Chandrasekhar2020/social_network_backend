const handleError = (res, error) => {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({ error: message });
};

module.exports = { handleError }; 
