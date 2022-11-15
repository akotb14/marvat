const route = require("express").Router();
const model = require("../models/quiz");
const user = require("../models/user");
const unit = require("../models/unit");
const isAdmin = require("../util/aurth");

const jwt = require("jsonwebtoken");
const degreeModel = require("../models/degreeQuiz");
const router = require("./login.router");
route.get("/quiz/:name", (req, res) => {
  res.render("quiz/startQuiz.ejs");
});

route.get('/quiz',(req,res)=>{
  res.status(404).send("no quiz is added now")
})
let d = 0;
let index = 0;
let isStart = false;
let countCorrect = 0;
let deName = "";
route.post("/quiz/:name", async (req, res) => {
  try {
    if(req.body.btn == "continue"){
    let name = req.params.name;
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);
    const qutime = await model.findOne({ _id: name, type: "quiz" });
    const checkDegree = await degreeModel.findOne({
      isCheck: "1",
      quiz: qutime._id,
      student: student.studentCard,
      type: "quiz",
    });
    if (qutime && !checkDegree) {
      const deg = new degreeModel({
        isCheck: "1",
        quiz: qutime._id,
        student: student.studentCard,
        totalDegree: null,
        type: "quiz",
      });
      await deg.save();
      let q = qutime.quizTime;
      const date = new Date();
      const dateQ = new Date();
      dateQ.setHours(
        dateQ.getHours() + parseInt(q.split(":")[0]),
        dateQ.getMinutes() + parseInt(q.split(":")[1])
      );
      d = (dateQ.getTime() - date.getTime()) / 1000;
      isStart = true;

      let counter = setInterval(() => {
        d--;
        console.log(d)
        if (d <= 0) {
          console.log("quiz is ended");
          console.log(d)
          isStart = false; 
          index = 0;
          countCorrect = 0;
          clearInterval(counter);
        }
      }, 1000);
      res.redirect("/quizApp/" + qutime._id);
    } else {
      res.status(400).send("<h1>you cant entered quiz agian </h1>");
    }
  }
  } catch (err) {
    res.sendStatus(404);
  }
});
route.post("/quizApp/:nameQuiz", async (req, res) => {
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
      type: "quiz",
    });
    if (checkCount && checkCount.totalDegree == null) {
      let up = await degreeModel.findOneAndUpdate(
        {
          quiz: data._id,
          student: student.studentCard,
          isCheck: "1",
          type: "quiz",
        },
        { totalDegree: count }
      );
    }
    const unitFetch = await unit.getModel().findOne({month:data.month,educetionlevel:data.educetionlevel,grade:data.grade,'units.quizId':data._id})
    console.log(unitFetch)
    return  res.redirect( 
      "/lessons/" +
       data.educetionlevel +
       "/" +
       data.grade +
       "/" +
       data.month 
       
  );
  } catch (err) {    
    res.redirect(
              "/" +
               data.educetionlevel +
               "/" +
               data.grade +
               "/" +
               data.month +
               "/" +
              data.unit
          );
      console.log(err);
  }
});


route.get("/quizApp/:nameQuiz", async (req, res) => {
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
      type: "quiz",
      totalDegree: {$ne:null},
    });
    const f = await unit
      .getModel()
      .findOne({ "units.quizId": id })
      .populate({ path: "units.quizId" });
    const dataQuiz = f.units.find((val) => {
      return val.quizId['_id'] == id;
    });
    res.render("quiz/showQuestion.ejs", {
      quiz: dataQuiz,
      d,
      index: index,
      checkCount
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
});

route.get("/editQuiz/:id", isAdmin,async (req, res) => {
  try {
    const findHome = await model.findOne({ _id: req.params.id });
    if (findHome) {
      const showQuestion = await model.findOne({ _id: req.params.id });
      res.render("admin/editquiz.ejs", {
        data: findHome,
        question: showQuestion.quiz,
      });
    } else {
      res.redirect("/admin/quiz");
    }
  } catch (err) {
    res.sendStatus(404);
  }
});
route.post("/editQuiz/:id", isAdmin,async (req, res) => {
  try {
    console.log(req.body);
    let edu = req.body.educetionlevel;
    let grade = req.body.grade;
    let nameQuiz = req.body.nameQuiz;
    let month = req.body.month;
    let unit = req.body.unit;
    let quizTime = req.body.quizTime
    const showQuestion = await model.findOne({ _id: req.params.id });
    if (
      edu != showQuestion.educetionlevel ||
      grade != showQuestion.grade ||
      nameQuiz != showQuestion.nameQuiz ||
      unit != showQuestion.unit ||
      month != showQuestion.month
      || quizTime !=showQuestion.quizTime
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
          quizTime : req.body.quizTime
        }
      );
      res.redirect("/editQuiz/" + req.params.id);
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
          quizTime:req.body.quizTime
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
      res.redirect("/editQuiz/" + req.params.id);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
route.get("/removeQuiz/:id", isAdmin,async (req, res) => {
  try {
    await model.findOneAndDelete({ _id: req.params.id });
    const unid= await unit
      .getModel()
      .findOne({"units.quizId":req.params.id })
      for(i of unid.units){
         if(i.quizId == req.params.id ){
           i.quizId = undefined;
         }
      }
      await unid.save()
    res.redirect("/editQuiz/" + req.params.id);
  } catch (err) {
    console.log(err);
    res.redirect("/editQuiz/" + req.params.id);
  }
});
route.get("/removeQuestionOfQuiz/:i/:id",isAdmin, async (req, res) => {
  try {
    await model.updateOne(
      {
        _id: req.params.i,
       },
      {
        $pull: {
          quiz: 
            {
             _id:req.params.id
            },
          
        },
      }
    );
    res.redirect("/editQuiz/" + req.params.i);
  } catch (err) {
    console.log(err); 
    res.sendStatus(404);
  }
});




// show quizzies anwser
route.get('/showQuiz',async(req,res)=>{
  try {
    let data = "";
    let degree = "";
    if (req.cookies.student) {
      deName = jwt.verify(req.cookies.student, process.env.SecretPassword);
      degree = await degreeModel.find({
        student: deName.studentCard,
        type: "quiz",
      }).populate({path:'quiz'});
     
      data = await model.find({
        educetionlevel: deName.educetionlevel,
        grade: deName.grade,
        type: "quiz",
      });
    }
   
    res.render("showQuizEg.ejs", {
      quizzes: data,
      degree: degree,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
}) 
module.exports = route;
