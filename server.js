const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars")
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");
const PORT = 3000;
const app = express();
const router = express.Router()

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("views"));

app.engine("handlebars", handlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/scraped-news", { useNewUrlParser: true });



app.get("/", function (req, res) {
  console.log("++++++++++++++++++++++++++++");
  
  // console.log(articles);/
  
  res.render("index")

})

app.get("/scrape", function (req, res) {

  axios
    .get("https://www.npr.org/sections/strange-news/")
    .then(function (response) {

      var $ = cheerio.load(response.data);




      $("h2.title").each(function (i, element) {

        var result = {};


        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");


        db.Article.create(result)
          .then(function (dbArticle) {

            // console.log(dbArticle);
          })
          .catch(function (err) {

            console.log(err);
          });
        // console.log(result)
      });

      db.Article.find({})
      .then(function(dbArticle){
        console.log(dbArticle);
        
        res.render("index", {dbArticle})
        // res.json(dbArticle)
      })
      // console.log({articles: db.Article});
      
      // res.send("Scrape Complete");
      // res.render("index")
    });
});


app.get("/articles", function (req, res) {

});


app.get("/articles/:id", function (req, res) {

});


app.post("/articles/:id", function (req, res) {

});


app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
