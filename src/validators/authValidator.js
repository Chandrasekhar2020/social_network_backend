const validateSignup = (req, res, next) => {
  const { email, password, displayName, phoneNumber } = req.body;
  
  if (!email || !password || !displayName || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (displayName.length < 3) {
    return res.status(400).json({ error: 'Display name must be at least 3 characters' });
  }

  if (phoneNumber.length != 10) {
    return res.status(400).json({ error: 'Phone number should be of length 10'});
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
