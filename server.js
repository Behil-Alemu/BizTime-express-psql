/** Server startup for BizTime. */
// RUN THIS FILE TO START THE SERVER, NOT APP.JS!

const app = require("./app");

app.listen(3000, function () {
  console.log("Listening on 3000");
});