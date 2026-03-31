const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // Latest users first
      },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error(`[getUsers Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Create a new brand account
// @route   POST /api/users/brand
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const brandUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'BRAND',
        isVerified: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Brand account created successfully!',
      brand: {
        id: brandUser.id,
        name: brandUser.name,
        email: brandUser.email,
        role: brandUser.role,
      },
    });
  } catch (error) {
    console.error(`[createBrand Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  getUsers,
  createBrand,
};
