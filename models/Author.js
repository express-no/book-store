const mongoose = require("mongoose");
const Book = require("./Book");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    set: capitalize,
  },
});

function capitalize(val) {
  if (typeof val != "string") val = "";
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}

authorSchema.pre("remove", async function (next) {
  try {
    const books = await Book.find({ author: this.id });

    if (books.length > 0) {
      next(new Error("Cant delete this author (still has book)"));
    } else next();
  } catch {
    next(new Error());
  }
});

module.exports = mongoose.model("author", authorSchema);
