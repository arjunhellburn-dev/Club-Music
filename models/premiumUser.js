import mongoose from "mongoose";

const premiumUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    default: null,
  },
  grantedBy: {
    type: String,
    default: null,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: true,
  },
});

const PremiumUser = mongoose.model("PremiumUser", premiumUserSchema);

export default PremiumUser;
