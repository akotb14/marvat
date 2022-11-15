const mongoose = require('mongoose')
const schema =new mongoose.Schema ({
    fullName: {
        type: String,
        required: true,
      },
      cardNumber: {
        type: String,
        unique: true,
      },
      phoneNumber: {
        type: String,
      },
      grade: {
        type: String,
        enum: ["1st", "2nd", "3rd"],
      },
      group: String,
      educetionlevel: {
        type: String,
      },
})
module.exports=  mongoose.model('studentOnline' ,schema);