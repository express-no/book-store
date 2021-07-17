const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "required"],
    validate: [validator.isEmail, "Invalid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "required"],
  },
  name: {
    type: String,
    required: [true, "required"],
  },
});

module.exports = mongoose.model("user", userSchema);
