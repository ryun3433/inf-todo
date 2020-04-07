const mongoose = require("mongoose");
const bycript = require("bcrypt");
const soltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    bycript.genSalt(soltRounds, (err, salt) => {
      if (err) return next(err);
      bycript.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = (plainPassword, user, cb) => {
  bycript.compare(plainPassword, user.password, (err, isMatch) => {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

userSchema.methods.generateToken = (user, cb) => {
  const token = jwt.sign(user._id.toString(), "secretToken");
  user.token = token;
  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

// userSchema.statics.findByToken = (token, cb) => {

//   jwt.verify(token, "secretToken", (err, decoded) => {
//     user.fineOne({ _id: decoded, token: token }, (err, user) => {
//       if (err) return cb(err);
//       cb(null, user);
//     });
//   });
// };

const User = mongoose.model("User", userSchema);

module.exports = { User };
