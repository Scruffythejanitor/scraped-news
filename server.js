const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars")
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");
const PORT = process.env.PORT || 3000;
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

// mongoose.connect("mongodb://localhost/scraped-news", { useUnifiedTopology: true, useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraped-news";

mongoose.connect(MONGODB_URI);


app.get("/", function (req, res) {
  
  db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("index", {message: "Sooory There Is No Strange News Yet! Click Button To Get News!"});
		}
		else{
			res.render("index", {articles: data});
		}
	});

})

app.get("/scrape", function (req, res) {

  axios
    .get("https://www.npr.org/sections/strange-news/")
    .then(function (response) {

      var $ = cheerio.load(response.data);

      $("article").each(function (i, element) {

        var result = {};

        result.title = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children("h2")
        .children("a")
        .text();
        result.teaser = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children("p")
        .children("a")
        .text();
        result.link = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children("h2")
        .children("a")
        .attr("href");

        db.Article.create(result)
          .then(function (dbArticle) {

            console.log(dbArticle);
          })
          .catch(function (err) {

            console.log(err);
          });
      });

      db.Article.find({})
        .lean()
        .then(function (dbArticle) {
          console.log(dbArticle);

          res.render("index", { dbArticle })
        })
        .catch(function (err) {

          console.log(err);
        });

    });
});


app.get("/articles", function (req, res) {
  db.Article.find()
    .then(function (dbArticle) {

      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });

});


app.get("/articles/:id", function (req, res) {
  db.Article.findById(req.params.id)
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
  
  
    .then(function (dbArticle) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbArticle._id } }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
