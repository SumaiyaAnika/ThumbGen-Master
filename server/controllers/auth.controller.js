const User = require('../models/User'); // Assuming you have a Mongoose User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration Logic
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save User
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Login Logic
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};