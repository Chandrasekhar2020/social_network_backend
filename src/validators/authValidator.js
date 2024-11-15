const validateSignup = (req, res, next) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password || !displayName ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email and password' });
  }
  
  next();
};

module.exports = {
  validateSignup,
  validateLogin
}; 
