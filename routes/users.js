const router = require("express").Router();
const User = require("../models/User");

router.get("/profile", async (req, res) => {
  if (req.isUnauthenticated()) return res.redirect("/login");
  const user = req.user;

  res.render("users/profile", { user });
});

module.exports = router;
