var path = require("path");
var express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");

var app = express();
var port = 3000;

app.use(express.json());
app.use(express.urlencoded());

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/sp-database", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var nameSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("email is invalid");
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot conatin "password"');
      }
    }
  }
});

var User = mongoose.model("User", nameSchema);
const publicDirectoryPath = path.join(__dirname, "/public");
// console.log(__dirname);
app.use(express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  // console.log(__dirname);
  res.sendFile(__dirname + "/home.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (request, response) => {
  // console.log(request.body.password);
  try {
    User.findOne({ email: request.body.email }, (err, user) => {
      if (!user) {
        return response.status(400).send({
          message: "Any user with this email does not exist.Try another one."
        });
      }
      // console.log(request.body.password);
      if (!bcrypt.compareSync(request.body.password, user.password)) {
        return response
          .status(400)
          .send({ message: "Wrong password. Try again." });
      }
      // res.redirect("/user");
      console.log("done");
    });
  } catch (err) {
    // response.send({ message: "not possible" });
    response.status(500).send(err);
  }
});

app.post("/registration", (req, res) => {
  // console.log(req.body.password);
  req.body.password = bcrypt.hashSync(req.body.password, 8);

  var myData = new User(req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      return res.send(
        "A user with that email has already registered. Please use a different email.."
      );
    }
  });
  myData
    .save()
    .then(item => {
      res.send("Name saved to database");
      // res.redirect("/user");
      //   console.log(item);
    })
    .catch(err => {
      // console.log(err);
      res.status(400).send("Unable to register.Please try after sometime.");
    });
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
