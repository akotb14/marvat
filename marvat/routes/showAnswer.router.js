const route = require("express").Router();
const quiz = require("../models/quiz");
const checkIsExamed = require("../models/degreeQuiz.js")
const jwt = require('jsonwebtoken')
route.get("/showAnswer/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let student = jwt.verify(req.cookies.student, process.env.SecretPassword);
    const modalQuiz = await quiz.findOne({ _id: id });
   
      if(modalQuiz){
        res.render("showAnswer.ejs", { data: modalQuiz });
      }else{
        res.send('no answer found')
      }
   
    
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
});

module.exports = route;
