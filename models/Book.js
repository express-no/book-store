const mongoose = require("mongoose");

const coverImageBasePath = "uploads/bookCovers";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, "author is required"],
      ref: "author",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    pageCount: {
      type: Number,
    },
    cover: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

bookSchema.virtual("coverImagePath").get(function () {
  if (this.cover != null) return `/${coverImageBasePath}/${this.cover}`;
});

module.exports = mongoose.model("book", bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;
