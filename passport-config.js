const LocalStrateygy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("./models/User");

function initialize(passport) {
  passport.use(
    new LocalStrateygy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (user == null) {
            return done(null, false, { message: "user is not existed" });
          }
          if (!(await bcrypt.compare(password, user.password))) {
            return done(null, false, { message: "incorrect password" });
          }

          return done(null, user);
        } catch (e) {
          return done(e, false, { message: "error!" });
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
}

module.exports = initialize;
