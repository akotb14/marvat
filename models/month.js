const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  month: String,
  grade: String,
  educetionlevel: String,
});

module.exports  = mongoose.model("month", schema);