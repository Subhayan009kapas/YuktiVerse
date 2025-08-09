import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // empty for Google login
  pic: { type: String, default: "" }, // Google profile pic if available
  googleId: { type: String, default: null } // Google user ID
}, { timestamps: true });

export default mongoose.model("User", userSchema);
