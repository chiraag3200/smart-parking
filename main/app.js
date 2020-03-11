var path = require("path");
var express = require("express");
const mongodb = require("mongodb");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { sendWelcomeEmail } = require("../public/emails/accounts");

var app = express();
var port = 3000;

app.use(session({ secret: "XASDASDA" }));

var ssn = {
  email: 0
};

var str,
  sta = 0,
  sta1 = 0,
  sta2 = 0;

app.use(express.json());
app.use(express.urlencoded());

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const MongoClient = mongodb.MongoClient;

const connectionUrl = "mongodb://127.0.0.1:27017";

const databaseName = "sp-database";
const databaseName_1 = "mall-database";

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
app.use(express.static(publicDirectoryPath));

// var auth = (req, res, next) => {
//   if (!ssn.email) {
//     res.send("You are not authorized to view!");
//   } else {
//     next();
//   }
// };

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (request, response) => {
  sta1 = 0;
  mongoose.connect("mongodb://localhost:27017/sp-database", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    User.findOne({ email: request.body.email }, (err, user) => {
      if (!user) {
        return response.status(400).send({
          message: "Any user with this email does not exist.Try another one."
        });
      }
      if (!bcrypt.compareSync(request.body.password, user.password)) {
        sta1 = 1;
      }
      ssn = request.session;
      ssn.email = request.body.email;
    });
  } catch (err) {
    response.status(500).send(err);
  }
});

app.get("/tables", (req, res) => {
  res.send(sta1.toString());
});

app.post("/registration", (req, res) => {
  sta2 = 0;
  req.body.password = bcrypt.hashSync(req.body.password, 8);
  var myData = new User(req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      sta2 = 1;
    }
  });
  ssn = req.session;
  ssn.email = req.body.email;
  myData.save();
  sendWelcomeEmail(req.body.email);
});

app.get("/tabless", (req, res) => {
  res.send(sta2.toString());
});

var profileSchema = new mongoose.Schema({
  vehicle_no: {
    type: String,
    required: true,
    trim: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  phone_no: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  }
});

var User_p = mongoose.model("User_p", profileSchema);

app.post("/profile", (req, res) => {
  MongoClient.connect(
    connectionUrl,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        return console.log(
          "Unable to update profile.Please try after sometime."
        );
      }
      const db = client.db(databaseName);
      db.collection(ssn.email).insertOne(req.body);
    }
  );
  res.redirect("temp.html");
});

app.post("/confirmbooking", (req, res) => {
  MongoClient.connect(
    connectionUrl,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        return console.log("Error!Please try again");
      }
      const db = client.db(databaseName_1);
      str = req.body.entrydate;
      var val1, val2, alp;
      var l1, l2, r1, r2;
      var available = 1;
      db.collection(str)
        .find({ type: str.exittime })
        .toArray((err, result) => {
          for (var i = 0; i < result.length; i++) {
            val1 = 0;
            val2 = 0;
            alp = 0;
            if (
              req.body.entrydate == req.body.exitdate &&
              result[i].entrydate == result[i].exitdate
            ) {
              for (var j = 0; j < result[i].entrytime.length; j++) {
                if (result[i].entrytime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += result[i].entrytime[j];
                  } else {
                    val2 += result[i].entrytime[j];
                  }
                }
              }
              l1 = Number(val1) + Number(val2 * 60);
              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < result[i].exittime.length; j++) {
                if (result[i].exittime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += result[i].exittime[j];
                  } else {
                    val2 += result[i].exittime[j];
                  }
                }
              }
              r1 = Number(val1) + Number(val2 * 60);
              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < req.body.entrytime.length; j++) {
                if (req.body.entrytime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += req.body.entrytime[j];
                  } else {
                    val2 += req.body.entrytime[j];
                  }
                }
              }

              l2 = Number(val1) + Number(val2 * 60);
              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < req.body.exittime.length; j++) {
                if (req.body.exittime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += req.body.exittime[j];
                  } else {
                    val2 += req.body.exittime[j];
                  }
                }
              }
              r2 = Number(val1) + Number(val2 * 60);

              l1 = Math.max(l1, l2);
              r1 = Math.min(r1, r2);

              if (l1 <= r1) available = 0;
            } else {
              for (var j = 0; j < result[i].entrytime.length; j++) {
                if (result[i].entrytime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += result[i].entrytime[j];
                  } else {
                    val2 += result[i].entrytime[j];
                  }
                }
              }
              l1 = Number(val1) + Number(val2 * 60);

              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < result[i].exittime.length; j++) {
                if (result[i].exittime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += result[i].exittime[j];
                  } else {
                    val2 += result[i].exittime[j];
                  }
                }
              }
              r1 = Number(val1) + Number(val2 * 60);
              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < req.body.entrytime.length; j++) {
                if (req.body.entrytime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += req.body.entrytime[j];
                  } else {
                    val2 += req.body.entrytime[j];
                  }
                }
              }

              l2 = Number(val1) + Number(val2 * 60);
              val1 = 0;
              val2 = 0;
              alp = 0;

              for (var j = 0; j < req.body.exittime.length; j++) {
                if (req.body.exittime[j] == ":") {
                  alp = 1;
                } else {
                  if (alp == 1) {
                    val1 += req.body.exittime[j];
                  } else {
                    val2 += req.body.exittime[j];
                  }
                }
              }
              r2 = Number(val1) + Number(val2 * 60);

              if (req.body.entrydate != req.body.exitdate)
                r2 += Number(24 * 60);
              if (result[i].entrydate != result[i].exitdate)
                r1 += Number(24 * 60);

              l1 = Math.max(l1, l2);
              r1 = Math.min(r1, r2);

              if (l1 <= r1) available = 0;
            }
          }

          if (available == 0) {
            sta = 0;
          } else {
            sta = 1;
            db.collection(req.body.entrydate).insertOne(req.body);
            MongoClient.connect(
              connectionUrl,
              { useUnifiedTopology: true },
              { useNewUrlParser: true },
              (error, client) => {
                if (error) {
                  res.status(400).send("Some error occured.");
                }
                const db = client.db(databaseName_1);
                db.collection(req.body.email_1).insertOne(req.body);
              }
            );
          }
        });
    }
  );
});

app.get("/table", (req, res) => {
  res.send(sta.toString());
});

app.post("/logout", (req, res) => {
  ssn.email = 0;
  res.sendfile("home.html");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
