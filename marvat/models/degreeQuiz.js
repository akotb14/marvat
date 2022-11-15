const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "quiz" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "auth" },
  isCheck: { type: String, default: "0" },
  totalDegree: String,
  type: {
    type: String,
    enum: ["quiz", "exam", "homework"],
  },
 
  
});
module.exports = mongoose.model("degreeQuiz", schema);
