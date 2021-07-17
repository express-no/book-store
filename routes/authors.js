const router = require("express").Router();

const Author = require("../models/Author");
const Book = require("../models/Book");

const fields = ["name"];

router.get("/", async (req, res) => {
  const searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }

  try {
    const authors = await Author.find(searchOptions).sort({ name: "asc" });

    res.render("authors/index", { authors, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

router.post("/", async (req, res) => {
  try {
    const input = getRequest(req);

    const author = await Author.create(input);
    req.flash("success", "Created new author.");
    // res.redirect(`/authors/${author.id}`);
    res.redirect("/authors");
  } catch (e) {
    req.flash("error", "can't create new author.");
    res.redirect("/authors");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (author == null) {
      throw new Error();
    }

    const books = await Book.find({ author: author.id });

    res.render("authors/show", { author, books });
  } catch {
    req.flash("error", "Author is not existed");
    res.redirect("/authors");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author == null) {
      throw new Error();
    }
    res.render("authors/edit", { author });
  } catch {
    req.flash("error", "Author is not existed");
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  const input = { name: req.body.name };
  const id = req.params.id;

  let author;
  try {
    author = await Author.findByIdAndUpdate(id, input);

    req.flash("success", "Updated successful");
    res.redirect(`/authors/${author.id}`);
  } catch (e) {
    console.log(e);
    req.flash("error", "Cannot update author");

    if (author !== null) return res.redirect(`/authors/${author.id}`);
    res.redirect("/authors");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author == null) {
      req.flash("error", "This Author is not existed");
      res.redirect("/authors");
    }

    await author.remove();

    req.flash("success", "deleted success");
    res.redirect("/authors");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/authors");
  }
});

function getRequest(req, keys = fields) {
  const input = {};
  keys.forEach(
    (key) => (input[key] = req.body[key] !== null ? req.body[key] : null)
  );

  return input;
}

module.exports = router;
