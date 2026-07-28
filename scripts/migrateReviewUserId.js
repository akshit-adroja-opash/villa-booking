const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Direct MongoDB connection
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

// Import models
const Review = require('../models/Review').default;
const User = require('../models/User').default;

async function migrateReviews() {
  try {
    await dbConnect();

    // Get all reviews without userId
    const reviewsWithoutUserId = await Review.find({ userId: null });

    // For each review, try to find the user by name
    for (const review of reviewsWithoutUserId) {
      // Try to find user by name
      const user = await User.findOne({ 
        name: { $regex: new RegExp(`^${review.name}$`, 'i') } 
      });

      if (user) {
        review.userId = user._id;
        await review.save();
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateReviews();
