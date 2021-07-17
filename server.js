if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const express = require("express");
const layouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const passport = require("passport");
const MongoStore = require("connect-mongo");

const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
const bookRouter = require("./routes/books");
const userRouter = require("./routes/users");
const initializePassport = require("./passport-config");

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected mongodb !");
});
db.on("error", (err) => {
  console.error(err);
});

initializePassport(passport);

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(layouts);
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(cookieParser());
app.use(flash());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.login = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);
app.use("/users", userRouter);

app.listen(port, () => console.log(`App is listening on ${port}`));
