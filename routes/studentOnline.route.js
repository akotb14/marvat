const route = require("express").Router();

const model = require("../models/stundentOnline");

const isAdmin = require("../util/aurth");

var csrf = require("csurf");

const csrfProtect = csrf({ cookie: true });

// route.get("/login", csrfProtect, (req, res) => {
//   res.render("login.ejs", {
//     csrfToken: req.csrfToken(),

//     err: req.flash("err"),
//   });
// });

// route.post("/login", csrfProtect, async (req, res) => {
//   try {
//     const isChec = await model.findOne({
//         fullName: req.body.fullName,
//         cardNumber: req.body.cardNumber,
//         phoneNumber: req.body.phoneNumber,
//         educetionlevel: req.body.educetionlevel,
//         grade: req.body.grade,
//     });

//     if (!isChec) {
//       const stu = new model({
//         fullName: req.body.fullName,
//         cardNumber: req.body.cardNumber,
//         phoneNumber: req.body.phoneNumber,
//         educetionlevel: req.body.educetionlevel,
//         grade: req.body.grade,
//         group:req.body.group,
//       });

//       await stu.save();
//       res.redirect("/login");
//     } else {
//       res.redirect("/login");
//     }
//   } catch (err) {
//     req.flash("err", "you entered wrong fields");

//     console.log(err);

//     res.redirect("/login");
//   }
// });

route.get("/admin/studentOnline", isAdmin, async (req, res) => {
  try {
    let mo = await model.find({});

    res.render("admin/onlinestudent.ejs", { student: mo });
  } catch (err) {
    console.log(err);

    res.sendStatus(400);
  }
});

route.get("/removeStudentOnline/:id", async (req, res) => {
  try {
    await model.findByIdAndDelete({ _id: req.params.id });

    res.redirect("/admin/studentOnline");
  } catch (err) {
    res.redirect("/admin/studentOnline");
  }
});

module.exports = route;
