const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser");
const methodOverride = require('method-override')

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("views"));

app.engine("handlebars", handlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

app.use(methodOverride('_method'));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraped-news";

mongoose.connect(MONGODB_URI);

require("./routes/index.js")(app)

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
