const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../db');

const verifyUsers = async () => {
  await connectDB();

  try {
    const users = await User.find();
    console.log('Users in the database:', users);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
};

verifyUsers();