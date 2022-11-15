const model = require("../models/quiz");
const user = require("../models/user");
const unit = require("../models/unit");
const jwt = require("jsonwebtoken");
const degreeModel = require("../models/degreeQuiz");
const addQuiz = async (req, res) => {
  try {
    const checkQuiz = await model.findOne({
      educetionlevel: req.body.educetionlevel,
      grade: req.body.grade,
      nameQuiz: req.body.nameQuiz,
      type: req.params.type,
    });
    const checkUnit = await unit.getModel().findOne({
      educetionlevel: req.body.educetionlevel,
      grade: req.body.grade,
      "units.unit": req.body.unit,
      "units.month": req.body.month,
    });

    if (!checkQuiz) {
      console.log("ds");
      let quiz = "";
      if (req.params.type == "exam") {
        quiz = new model({
          educetionlevel: req.body.educetionlevel,
          grade: req.body.grade,
          nameQuiz: req.body.nameQuiz,
          quiz: [
            {
              no: req.body.no,
              question: req.body.question,
              answer: [req.body.answer],
              correctAnswer: req.body.correctAnswer,
            },
          ],
          unit: req.body.unit,
          month: req.body.month,
          type: req.params.type,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          quizTime: req.body.quizTime,
        });
        await quiz.save();
      } else if (
        (req.params.type == "homework" || req.params.type == "quiz") &&
        checkUnit
      ) {
        let val = "";
        val = checkUnit.units.find((val, index) => {
          if (val.unit == req.body.unit) {
            return checkUnit.units[index];
          }
        });
        if (val != "") {
          if (req.params.type == "quiz" && val.quizId == undefined) {
            quiz = new model({
              educetionlevel: req.body.educetionlevel,
              grade: req.body.grade,
              nameQuiz: req.body.nameQuiz,
              quiz: [
                {
                  no: req.body.no,
                  question: req.body.question,
                  answer: [req.body.answer],
                  correctAnswer: req.body.correctAnswer,
                },
              ],
              unit: req.body.unit,
              month: req.body.month,
              type: req.params.type,
              startTime: req.body.startTime,
              endTime: req.body.endTime,
              quizTime: req.body.quizTime,
            });
            await quiz.save();
            console.log(quiz._id);
            let content = await unit.getModel().findOne({
              educetionlevel: req.body.educetionlevel,
              grade: req.body.grade,
              "units.month": req.body.month,
            });
            let c = "";
            if (content) {
              c = content.units.find((val) => {
                return val["unit"] == req.body.unit;
              });
            } else {
              c = "";
            }
            //update units

            let run = await unit.getModel().findOneAndUpdate(
              {
                educetionlevel: req.body.educetionlevel,
                grade: req.body.grade,
                units: { $elemMatch: { unit: req.body.unit , month: req.body.month } },
              },
              { $set: { "units.$.quizId": quiz.id } }
            );
          } else if (req.params.type == "homework" && val.homeId == undefined) {
            quiz = new model({
              educetionlevel: req.body.educetionlevel,
              grade: req.body.grade,
              nameQuiz: req.body.nameQuiz,
              quiz: [
                {
                  no: req.body.no,
                  question: req.body.question,
                  answer: [req.body.answer],
                  correctAnswer: req.body.correctAnswer,
                },
              ],
              unit: req.body.unit,
              month: req.body.month,
              type: req.params.type,
              startTime: req.body.startTime,
              endTime: req.body.endTime,
              quizTime: req.body.quizTime,
            });
            await quiz.save();
            console.log(quiz._id);
            let content = await unit.getModel().findOne({
              educetionlevel: req.body.educetionlevel,
              grade: req.body.grade,
              "units.month": req.body.month,
            });
            let c = "";
            if (content) {
              c = content.units.find((val) => {
                return val["unit"] == req.body.unit;
              });
            } else {
              c = "";
            }
            console.log("ahmed" + c);
            let run = await unit.getModel().findOneAndUpdate(
              {
                educetionlevel: req.body.educetionlevel,
                grade: req.body.grade,
                units: { $elemMatch: { unit: req.body.unit ,month: req.body.month } },
              },
              { $set: { "units.$.homeId": quiz.id } }
            );
          }
        }
      }

      res.redirect(`/admin/${req.params.type}`);
    } else {
      console.log("ddssds");

      res.redirect(`/admin/${req.params.type}`);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

const getQuiz = async (req, res) => {
  if (
    req.params.type == "quiz" ||
    req.params.type == "exam" ||
    req.params.type == "homework"
  ) {
    const data = await model.find({ type: req.params.type });
    const units = await unit.getModel().find();
    res.render(`admin/${req.params.type}.ejs`, { data, units });
  } else {
    res.sendStatus(400);
  }
};
let d = 0;
let index = 0;
let isStart = false;
let countCorrect = 0;
let deName = "";
let arrAns = [];

const g = async (req, res) => {
  try {
    let id = req.params.nameQuiz;
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);

    const data = await model.findOne({
      _id: id,
    });
    let sda = new Date(data.startTime);
    let eda = new Date(data.endTime);
    const checkCount = await degreeModel.findOne({
      quiz: data.id,
      student: student.studentCard,
      isCheck: "1",
      type: "exam",
      totalDegree: {$ne:null},
    });


    if (data && sda.getTime() <= Date.now() && eda.getTime() > Date.now()) {
      res.render("showQuestion.ejs", {
        quiz: data,
        d,
        checkCount,
        index: index,
      });
    } else {
      console.log("s");
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
};

const getOpenQuiz = async (req, res) => {
  try {
    let data = "";
    const dateNow = new Date();
    let degree = "";
    if (req.cookies.student) {
      deName = jwt.verify(req.cookies.student, process.env.SecretPassword);
      degree = await degreeModel.find({
        student: deName.studentCard,
        type: "exam",
      });
      console.log("dddd" + degree);
      data = await model.find({
        educetionlevel: deName.educetionlevel,
        grade: deName.grade,
        type: "exam",
      });
    }
    arrAns = [];
    index = 0;
    d = 1;
    res.render("openExam.ejs", {
      quizzes: data,
      dateNow: dateNow,

      degree: degree,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
};
const postQuizApp = async (req, res) => {
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
      type: "exam",
    });
    if (checkCount && checkCount.totalDegree == null) {
      let up = await degreeModel.findOneAndUpdate(
        {
          quiz: data._id,
          student: student.studentCard,
          isCheck: "1",
          type: "exam",
        },
        { totalDegree: count }
      );
    }
    return res.redirect("/openExam");
  } catch (err) {
    res.redirect("/openExam");
      console.log(err);
  }
};

const startQuiz = async (req, res) => {
  try {
    console.log(req.body.btn);
    if (req.body.btn == "continue") {
      let name = req.params.nameQuiz;
      const qutime = await model.findOne({ _id: name, type: "exam" });
      if (qutime) {
        let student = jwt.verify(
          req.cookies.student,
          process.env.SecretPassword
        );
        const checkDegree = await degreeModel.findOne({
          isCheck: "1",
          quiz: qutime._id,
          student: student.studentCard,
          type: "exam",
        });

        if (qutime && !checkDegree) {
          const deg = new degreeModel({
            isCheck: "1",
            quiz: name,
            student: student.studentCard,
            totalDegree: null,
            type: "exam",
          });

          await deg.save();
          let q = qutime.quizTime;
          const date = new Date();
          const dateQ = new Date();
          dateQ.setHours(
            dateQ.getHours() + parseInt(q.split(":")[0]),
            dateQ.getMinutes() + parseInt(q.split(":")[1])
          );
          d = 0;
          d = (dateQ.getTime() - date.getTime()) / 1000;
          isStart = true;

          let counter = setInterval(() => {
            d--;
            if (d <= 0) {
              console.log("quiz is ended");
              isStart = false;
              index = 0;
              arrAns = [];
              countCorrect = 0;
              clearInterval(counter);
            }
          }, 1000);
          res.redirect("/examApp/" + qutime._id);
        } else {
          d = 1;
          arrAns = [];
          res.status(400).send("<h1>you cant entered Exam agian </h1>");
        }
      } else {
        res.sendStatus(404);
      }
    }
  } catch (err) {
    res.sendStatus(404);
  }
};
module.exports = {
  addQuiz,
  getQuiz,
  postQuizApp,
  g,
  getOpenQuiz,
  startQuiz,
};
