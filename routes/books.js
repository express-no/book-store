const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Book = require("../models/Book");
const Author = require("../models/Author");

const uploadPath = path.join("public", Book.coverImageBasePath);
const upload = multer({ dest: uploadPath });

const fields = [
  "title",
  "author",
  "publishDate",
  "pageCount",
  "cover",
  "description",
];

// list
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }

  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }

  try {
    //search book
    const books = await query.exec();
    res.render("books/index", { books, searchOptions: req.query });
  } catch {
    const books = [];

    res.render("books/index", { books, searchOptions: req.query });
  }
});

// create new
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});
router.post("/", upload.single("cover"), async (req, res) => {
  const data = getFormData(req);

  if (req.file != null) data.cover = req.file.filename;

  try {
    const book = await Book.create(data);

    req.flash("success", "Created book success");
    // res.redirect(`/books/${book.id}`);
    res.redirect("/books");
  } catch (e) {
    if (e.code == 11000) {
      req.flash("error", "this title is already registed");
    } else {
      req.flash("error", e.message);
    }
    if (data.cover != null) {
      removeCover(data.cover);
    }
    res.redirect("/books/new");
  }
});

// showbooks
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Book.findById(id).populate("author");

    res.render("books/show", { book });
  } catch {
    req.flash("error", "Got error!");
    res.redirect("/books");
  }
});

// edit
router.get("/:id/edit", async (req, res) => {
  const id = req.params.id;
  try {
    const book = await Book.findById(id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/books");
  }
});
router.put("/:id", upload.single("cover"), async (req, res) => {
  const id = req.params.id;

  const data = getFormData(req);

  if (req.file != null) {
    data[req.file.fieldname] = req.file.filename;
  }
  try {
    const book = await Book.findByIdAndUpdate(id, data);

    if (book == null) {
      req.flash("error", "Book is not existed");
      return res.redirect(`/books`);
    }

    if (req.file != null) {
      removeCover(req.file.fieldname);
    }
    req.flash("success", "Updated book success");
    res.redirect(`/books/${book.id}`);
  } catch {
    req.flash("error", "Error updating book");
    res.redirect(`/books`);
  }
});

// delete
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    console.log(book);

    if (book == null) {
      req.flash("error", "Book is not existed");
      return res.redirect("/books");
    }
    req.flash("success", "deleted success");
    res.redirect("/books");
  } catch {
    console.log("Error deleting book");
    res.redirect("/books");
  }
});

function renderNewPage(res, book) {
  renderFormPage(res, "new", book);
}

function renderEditPage(res, book) {
  renderFormPage(res, "edit", book);
}

async function renderFormPage(res, form, book) {
  try {
    const authors = await Author.find();
    res.render(`books/${form}`, { book, authors });
  } catch {
    res.redirect("/books");
  }
}

function getFormData(req, array = fields) {
  const data = {};

  array.forEach((field) =>
    req.body[field] != null ? (data[field] = req.body[field]) : ""
  );
  return data;
}

function removeCover(name) {
  if (name != "")
    fs.unlink(path.join(uploadPath, name), (e) =>
      e != null ? console.error(e) : ""
    );
}

module.exports = router;
