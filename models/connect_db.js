const mongoose = require("mongoose");

module.exports = class ConnectDB {
  static db() {
    mongoose
      .connect(
        "mongodb+srv://ahmed17:medocool14@thelegend.c2hvkt8.mongodb.net/marvat1",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => {
        console.log("db is connected");
      })
      .catch((e) => {
        console.log(e);
      });
  }
}; 
  