const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
//import db
const connectDatabase = require("./models/connect_db");
connectDatabase.db();
const bcrypt = require("bcrypt");
const usermodel = require("./models/user");
const rateLimit = require("express-rate-limit");
const jwt =require("jsonwebtoken");
// import routes
const loginRoute = require("./routes/login.router");
const signupRoute = require("./routes/signup.router");
const unitRoute = require("./routes/units.router");
const studentRoute = require("./routes/dashboard");

async function addAdmin(name, card, phone) {
  let salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(`admin${card}`, salt);

  const findAdmin = await usermodel.findOne({ phoneNumber: phone });
  if (!findAdmin) {
    const admin = new usermodel({
      fullName: name,
      phoneNumber: phone,
      admin: "true",
      cardNumber: card,
      password: hashpassword,
    });
    await admin.save();
  }
}

addAdmin("admin1", 123456789101122, 123456789101122);
const port = process.env.PORT || 3000;
 
const date = new Date();
app.use(cors({}));
app.use(express.static("public"));
app.use(express.static("documantion"));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("template engine", "ejs");
app.use(
  session({
    secret: "ahmed14252",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());

const isAdmin = require("./util/aurth");
const isLogin = require("./util/auth");
const quiza = require("./routes/quiz.router");
const quizRoute = require("./routes/exam.router");
const showAnswer = require("./routes/showAnswer.router");
const homework = require("./routes/homework.router");
const loginOnline = require("./routes/studentOnline.route");

app.get('/',(req, res) => {
  let deName;
    if (req.cookies.student) {
      deName = jwt.verify(req.cookies.student, process.env.SecretPassword);
      console.log(deName);
    } else {
      deName = "";
    }
    let isAdmin = "";
    if (deName.admin == "true") {
      isAdmin = deName.admin;
    }
  res.render('index.ejs',{name:deName.nameStudent, isAdmin: isAdmin});
})
app.get("/logout", (req, res) => {
  res.clearCookie("student");
  res.redirect("/");
});
 
//use route

app.use("/", loginRoute);
app.use("/", loginOnline);
app.use("/", signupRoute);
app.use("/", isLogin, quiza);
app.use("/", isLogin, quizRoute);
app.use("/", isLogin, showAnswer);
app.use("/", isLogin, homework);
app.use("/", isLogin, unitRoute.router);
app.use("/", studentRoute);

app.get("/student", isAdmin, async (req, res) => {
  try {
    let filter = req.query.group;
    let q = filter == "All" || !filter ? null : { group: filter };
    res.render("admin/users.ejs", {
      student: await usermodel
        .find(q)
        .sort({ admin: -1, educetionlevel: 1, grade: 1, group: -1 })
        .where({ cardNumber: { $ne: 123456789101122 } }),
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

//listen server
app.listen(port, () => {
  console.log("server is connected" + port);
});
  