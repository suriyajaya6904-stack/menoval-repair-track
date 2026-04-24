const Shop = require('../models/Shop');
const Subscription = require('../models/Subscription');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAllBusinessTypes } = require('../config/businessTypeRegistry');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await Shop.findOne({ email }).select('_id ownerName email shopName password whatsappConnected businessType');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.ownerName,
        email: user.email,
        shopName: user.shopName,
        businessType: user.businessType || 'repair',
        whatsappConnected: user.whatsappConnected
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

const me = async (req, res) => {
  try {
    const user = await Shop.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    // Return with generic name property for frontend compatibility for now
    res.status(200).json({
      ...user._doc,
      name: user.ownerName
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, shopName, businessType = 'repair' } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Validate businessType
    const validTypes = getAllBusinessTypes().map(t => t.key);
    if (!validTypes.includes(businessType)) {
      return res.status(400).json({ error: 'Invalid business type selected' });
    }

    const existingUser = await Shop.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A shop with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newShop = new Shop({
      ownerName: name,
      email,
      shopName,
      businessType,
      password: hashedPassword,
      isActive: true
    });
    await newShop.save();

    // Create 7-day trial subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const subscription = await Subscription.create({
      shopId: newShop._id,
      plan: 'starter',
      billingCycle: 'monthly',
      status: 'trial',
      startDate: new Date(),
      endDate
    });
    newShop.subscription = subscription._id;
    await newShop.save();

    const token = jwt.sign({ id: newShop._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        _id: newShop._id,
        name: newShop.ownerName,
        email: newShop.email,
        shopName: newShop.shopName,
        businessType: newShop.businessType,
        whatsappConnected: false
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

module.exports = { login, me, register };
