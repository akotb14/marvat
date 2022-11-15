const router = require("express").Router();
const contro = require("../controllers/units.contro");
const Unit = require("../models/unit");
const jwt = require("jsonwebtoken");
const degree = require("../models/degreeQuiz.js");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./documantion/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().getTime() + "_" + file.originalname.replace(/\s+/g, "-")
    );
  },
}); 
const upload = multer({ storage: storage });
const isAdmin = require("../util/aurth");

router.get("/:edu/:grd", contro.getData);

router.post("/lesson", isAdmin, upload.single("pdf"), contro.addlesson);
router.get("/lesson", isAdmin, contro.getlesson);

router.get("/removelesson/:i/:id", isAdmin,async (req, res) => {
  try {
  const up =  await Unit.getModel().updateOne(
      {
        _id: req.params.i,
       },
      {
        $pull: {
          units: 
            {
             _id:req.params.id
            },
          
        },
      }
    );
    console.log(up)
    res.redirect("/lesson");
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
});
router.get('/lessons/:educetionlevel/:grade/:month',async (req,res)=>{
  try{
    let edu = req.params.educetionlevel;
    let student = "";
    let grd = req.params.grade;
      const lesson = await Unit.getModel().find({educetionlevel: req.params.educetionlevel,grade: req.params.grade})
      let d = await Unit.getModel().findOne({ educetionlevel: edu, grade: grd });
      if (req.cookies.student) {
        student = jwt.verify(req.cookies.student, process.env.SecretPassword);
      }
      let degreeHome = "";
      degreeHome = await degree
        .find({
          type: "homework",
          student: student.studentCard,
        })
  
        .populate("quiz");
      if(lesson.length != 0){
        res.render('units.ejs',{data:lesson,edu:req.params.educetionlevel,grade:req.params.grade,month:req.params.month , d , degreeHome})
      }else{
        res.send('lesson is not added');
      }
      }catch (err) {  
    res.sendStatus(403)
    console.log(err);
  } 
})
// lessons in marvat edit when adding homework


// lesson one 
router.get('/content/:educetionlevel/:grade/:month/:id',async (req,res)=>{
  try{
      const lesson = await Unit.getModel().findOne({educetionlevel: req.params.educetionlevel,grade: req.params.grade, month: req.params.month})
      if(lesson){
          let data = lesson['units'].find((val)=>{return req.params.id == val._id});
        res.render('lesson.ejs',{data:data})
      }else{
        res.send('lesson is not added');
      }
      }catch (err) {
    res.sendStatus(403)
    console.log(err);
  } 
})


router.get("/:edu/:grade/:month/:unit", contro.getContent);
module.exports = {router,upload};
