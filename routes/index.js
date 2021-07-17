const router = require("express").Router();
const passport = require("passport");

const User = require("../models/User");
const Book = require("../models/Book");

const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: "desc" }).exec();
    res.render("index", { books });
  } catch (e) {
    console.log(e);
    res.render("index", { books: [] });
  }
});

router.get("/login", checkUnauthenticate, (req, res) => {
  res.render("authen/login");
});

router.post(
  "/login",
  checkUnauthenticate,
  passport.authenticate("local", {
    successRedirect: "/",
    successMessage: "welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/register", checkUnauthenticate, (req, res) => {
  res.render("authen/register");
});

router.post("/register", checkUnauthenticate, async (req, res) => {
  const data = getFormData(req, ["email", "password", "name"]);

  if (data.password != null) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = new User(data);
  try {
    await user.save();
    req.flash("success", "register success");
    res.redirect("/login");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

router.delete("/logout", checkAuthenticate, (req, res) => {
  req.logout();
  res.redirect("/");
});

// function
function getFormData(req, fields) {
  const data = {};
  if (!Array.isArray(fields)) return data;

  fields.forEach((field) => {
    const val = req.body[field];
    const condition = val != null && val != "";
    condition ? (data[field] = val) : "";
  });
  return data;
}

function checkAuthenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkUnauthenticate(req, res, next) {
  if (req.isUnauthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
