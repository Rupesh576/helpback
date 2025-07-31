import jwt from 'jsonwebtoken';

const loginAdmin = (req, res) => {
  const { password } = req.body;
  if (password === process.env.SUPER_ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, role: 'superadmin' });
  }
  if (password === process.env.MODERATOR_PASSWORD) {
    const token = jwt.sign({ role: 'moderator' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, role: 'moderator' });
  }
  res.status(401).json({ message: 'Invalid password' });
};

export { loginAdmin };