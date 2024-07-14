import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String
    }
  });
  userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  });
  
  userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };
const User = mongoose.model("User", userSchema);

export default User;
