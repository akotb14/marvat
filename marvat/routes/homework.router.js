const route = require("express").Router();
const model = require("../models/quiz");
const user = require("../models/user");
const unit = require("../models/unit");
const isAdmin = require("../util/aurth");
const jwt = require("jsonwebtoken");
const degreeModel = require("../models/degreeQuiz");
const { updateOne } = require("../models/user");
route.get("/openHomeWork", async (req, res) => {
  try {
    let data = "";
    let deg = "";
    let dataQuiz = "";
    let f = "";
    let checkah = "";
    if (req.cookies.student) {
      let student = jwt.verify(req.cookies.student, process.env.SecretPassword);
      const stulevel = await user.findOne({ cardNumber: student.studentCard });
      data = await model.find({
        type: "homework",
      });

      deg = await degreeModel.find({
        isCheck: "1",
        type: "homework",
        student: student.studentCard,
      });
      f = await unit.getModel().find({}).populate({ path: "units.homeId" });
      checkah = await degreeModel.find({ student: student.studentCard });

      res.render("openHomework.ejs", { data: f, deg: deg, checkah: checkah });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
route.get("/homework/:name", async (req, res) => {
  res.render("homework/startQuiz.ejs");
});
let d = 0;
let index = 0;
let isStart = false;
let countCorrect = 0;
let deName = "";
let random = 0;
let arrAns = [];
route.post("/homework/:name", async (req, res) => {
  try {
    if(req.body.btn == "continue"){
    let name = req.params.name;
    const qutime = await model.findOne({ _id: name, type: "homework" });
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);

    const checkDegree = await degreeModel.findOne({
      isCheck: "1",
      quiz: qutime._id,
      student: student.studentCard,
      type: "homework",
    });

    if (qutime && !checkDegree) {
      const deg = new degreeModel({
        isCheck: "1",
        quiz: qutime._id,
        student: student.studentCard,
        totalDegree: null,
        type: "homework",
      });
      await deg.save();

      isStart = true;
      res.redirect("/homeworkApp/" + qutime._id);
    } else {
      index = 0;
      d = 1;
      arrAns = [];
      res.status(400).send("<h1>you cant entered homework agian </h1>");
    }
  }
  } catch (err) {
    res.sendStatus(404);
  }
});
let temp = [];
temp.push(random);
route.post("/homeworkApp/:nameQuiz", async (req, res) => {
  try {
    let name = req.params.nameQuiz;
    let count = 0;
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);
    const data = await model.findOne({
      _id: name,
    });
    for (i = 0; i < data["quiz"].length; i++) {
      console.log(data["quiz"][i].correctAnswer + " " + req.body[`answer${i}`]);
      if (req.body[`answer${i}`] == data["quiz"][i].correctAnswer) {
        count++;
      }
    }
    const checkCount = await degreeModel.findOne({
      quiz: data.id,
      student: student.studentCard,
      isCheck: "1",
      type: "homework",
    });
    if (checkCount && checkCount.totalDegree == null) {
      let up = await degreeModel.findOneAndUpdate(
        {
          quiz: data._id,
          student: student.studentCard,
          isCheck: "1",
          type: "homework",
        },
        { totalDegree: count }
      );
    }
    return res.redirect("/openHomeWork");
  } catch (err) {
    res.redirect("/openHomeWork");
      console.log(err);
  }
})

route.get("/homeworkApp/:nameQuiz", async (req, res) => {
  try {
    let id = req.params.nameQuiz;
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);

    const data = await model.findOne({
      _id: id,
    });
    const checkCount = await degreeModel.findOne({
      quiz: data.id,
      student: student.studentCard,
      isCheck: "1",
      type: "homework",
      totalDegree: {$ne:null},
    });
    const f = await unit
      .getModel()
      .findOne({ "units.homeId": id })
      .populate({ path: "units.homeId" });
    const dataQuiz = f.units.find((val) => {
      return val["homeId"]._id == id;
    });
    res.render("homework/showQuestion.ejs", {
      quiz: dataQuiz,
      index: index,
      random: random,
      checkCount,
    });
  } catch (err) {
    res.sendStatus(404);
  }
});
route.get("/editHomework/:id", isAdmin, async (req, res) => {
  try {
    const findHome = await model.findOne({ _id: req.params.id });
    if (findHome) {
      const showQuestion = await model.findOne({ _id: req.params.id });
      res.render("admin/edithomework.ejs", {
        data: findHome,
        question: showQuestion.quiz,
      });
    } else {
      res.redirect("/admin/homework");
    }
  } catch (err) {
    res.sendStatus(404);
  }
});
route.post("/editHomework/:id", isAdmin, async (req, res) => {
  try {
    console.log(req.body);
    let edu = req.body.educetionlevel;
    let grade = req.body.grade;
    let nameQuiz = req.body.nameQuiz;
    let month = req.body.month;
    let unit = req.body.unit;
    const showQuestion = await model.findOne({ _id: req.params.id });
    if (
      edu != showQuestion.educetionlevel ||
      grade != showQuestion.grade ||
      nameQuiz != showQuestion.nameQuiz ||
      unit != showQuestion.unit ||
      month != showQuestion.month
    ) {
      console.log("up");
      await model.findOneAndUpdate(
        { _id: req.params.id },
        {
          educetionlevel: req.body.educetionlevel,
          grade: req.body.grade,
          nameQuiz: req.body.nameQuiz,
          month: req.body.month,
          unit: req.body.unit,
        }
      );
      res.redirect("/editHomework/" + req.params.id);
    } else {
      console.log("add question");
      await model.updateOne(
        {
          _id: req.params.id,
          educetionlevel: req.body.educetionlevel,
          grade: req.body.grade,
          nameQuiz: req.body.nameQuiz,
          month: req.body.month,
          unit: req.body.unit,
        },
        {
          $push: {
            quiz: [
              {
                no: req.body.no,
                question: req.body.question,
                answer: [req.body.answer],
                correctAnswer: req.body.correctAnswer,
              },
            ],
          },
        }
      );
      res.redirect("/editHomework/" + req.params.id);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
route.get("/removeHomework/:id", isAdmin, async (req, res) => {
  try {
    await model.findOneAndDelete({ _id: req.params.id });
    const unid = await unit
      .getModel()
      .findOne({ "units.homeId": req.params.id });
    for (i of unid.units) {
      if (i.homeId == req.params.id) {
        i.homeId = undefined;
      }
    }
    await unid.save();
    res.redirect("/editHomework/" + req.params.id);
  } catch (err) {
    console.log(err);
    res.redirect("/editHomework/" + req.params.id);
  }
});
route.get("/removeQuestionOfHomework/:i/:id", isAdmin, async (req, res) => {
  try {
    await model.updateOne(
      {
        _id: req.params.i,
      },
      {
        $pull: {
          quiz: {
            _id: req.params.id,
          },
        },
      }
    );
    res.redirect("/editHomework/" + req.params.i);
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
});

module.exports = route;
