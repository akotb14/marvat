const bcrypt = require("bcrypt");
const modelsign = require("../models/user");
const model = require("../models/stundentOnline");

const jwt = require("jsonwebtoken");

const postInfo = async (req, res) => {
  try {

    const check = await modelsign.findOne({ cardNumber: req.body.cardNumber });
    if (!check) {
      let salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(req.body.password, salt);
      let createperson = new modelsign({
        fullName: req.body.fullName,
        cardNumber: req.body.cardNumber,
        phoneNumber: req.body.phoneNumber,
        educetionlevel: req.body.educetionlevel,
        grade: req.body.grade,
        password: hashpassword,
        group:req.body.group,
        admin:req.body.admin
      });

      await createperson.save();
      res.redirect("/sign");
    } else {
      req.flash("errorCard", check);
      res.redirect("/sign");
    }
  } catch (err) {
    console.log(err)
    res.redirect("/sign");
  }
};
const login = async (req, res) => {
  try {
    console.log(req.body)
    if(req.body.loginOnline != "ارسال البيانات"){

      const student = await modelsign.findOne({
        phoneNumber: req.body.phoneNumber,
    });
    if (student) {
      const hash = await bcrypt.compare(req.body.password, student.password);
      if (hash) {
        const token = jwt.sign(
          {
            studentCard: student._id,
            nameStudent: student.fullName,
            educetionlevel: student.educetionlevel,
            grade: student.grade,
            admin:student.admin
          },
          process.env.SecretPassword
        ); 
        res.cookie("student", token ,{ httpOnly: true });
        res.redirect("/");
      } else {
        req.flash("loginError", "cardNumber or phoneNumber is not correct");
        res.redirect("/login");
        console.log("err1");

      }
    } else {
      req.flash("loginError", "cardNumber or phoneNumber is not correct");
      res.redirect("/login");
      console.log("err2");
      
    }
  }else{
    const isChec = await model.findOne({
      fullName: req.body.fullName,
      cardNumber: req.body.cardNumber,
      phoneNumber: req.body.phoneNumber,
      educetionlevel: req.body.educetionlevel,
      grade: req.body.grade,
  });

  if (!isChec) {
    const stu = new model({
      fullName: req.body.fullName,
      cardNumber: req.body.cardNumber,
      phoneNumber: req.body.phoneNumber,
      educetionlevel: req.body.educetionlevel,
      grade: req.body.grade,
      group:req.body.group,
    });

    await stu.save();
    res.redirect("/login");
  } else {
    res.redirect("/login");
  }
}   
  } catch (err) {
    console.log("err"+err);
    res.send(err);
  }
};
const getstudent = async (req, res) => {
  try {
    let isNotAdmin = [undefined,"false"] ;
    return await modelsign.find({admin:{$in:isNotAdmin} });
  } catch (err) {
    return res.sendStatus(400);
  }
};
const removeStudnet = async (req, res) => {
  try {
    await modelsign.findOneAndRemove({ _id: req.params.cardNumber });
    res.redirect("/student");
  } catch (err) {
    console.log(err)
    return res.sendStatus(400);
  }
};
module.exports = { postInfo, login, getstudent, removeStudnet };
