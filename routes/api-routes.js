const cheerio = require("cheerio")
const axios = require("axios")
const db = require("../models")

module.exports = function (app) {


    app.get("/api/all", function (req, res) {

        db.Article.find({ $query: { saved: false } }).sort({ date: -1 })
            .then(function (response) {
                res.json(response.length)
            })
    });

    app.get("/api/notes/all", function (req, res) {

        db.Note.find({})
            .then(function (response) {
                res.json(response)
            })
    });

    app.post("/api/scrape", function (req, res) {

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

                res.redirect('/')

                // db.Article.find({})
                //     .lean()
                //     .then(function (dbArticle) {
                //         console.log(dbArticle);


                //         res.render("index", { dbArticle })
                //     })
                //     .catch(function (err) {

                //         console.log(err);
                //     });
            });

    });

    app.delete("/api/reduce", function (req, res) {

        db.Article.find({ $query: { saved: false } }).sort({ date: -1 })
            .then(function (found) {


                let countLength = found.length;
                let overflow = countLength - 25;
                console.log(overflow)
                let overflowArray = [];

                for (var i = 0; i < (overflow); i++) {
                    overflowArray.push(found[25 + i]._id);
                    console.log(overflowArray)
                }

                db.Article.deleteMany({ _id: { $in: overflowArray } }, function (error, result) {

                    db.Article.find({})
                    .lean()
                    .then(function (dbArticle) {
                        console.log(dbArticle);


                        res.redirect('/')
                    })
                    .catch(function (err) {

                        console.log(err);
                    });

                })

            });

    });

    app.put("/api/save/article/:id", function (req, res) {
        let articleId = req.params.id;
        console.log(articleId);
        

        db.Article.findOneAndUpdate(
            { _id: articleId },
            {
                $set: { saved: true }
            }
        ).then(function () {
            // alert("Article Saved");
            res.redirect('/')
        })
    });


    app.put("/api/delete/article/:id", function (req, res) {
        let articleId = req.params.id;

        db.Article.findOneAndUpdate(
            { _id: articleId },
            {
                $set: { saved: false }
            }
        ).then(function (result) {
            res.json(result)
        })
    });

    app.get("/api/notes/:id", function (req, res) {
        let articleId = req.params.id;

        db.Article.findOne(
            { _id: articleId }
        )
            .populate("note")
            .then(function (result) {
                res.json(result)
            })
    });

    app.post("/api/create/notes/:id", function (req, res) {
        console.log(res.body);
        console.log(req.body.note);
        let note = req.body.note
        

        db.Note.create()
            .then(function () {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: [note] }, { new: true });
            })
            .then(function (result) {
                res.json(result);
            })
            .catch(function (err) {
                res.json(err);
            });

    });

    app.get("/api/clear", function (req, res) {

        db.Article.remove()
            .then(function () {
                res.json("documents removed from articles")
            })

    });

    // delete Note
    app.delete("/api/delete/notes/:id", function (req, res) {

        db.Note.remove(
            { _id: req.params.id }
        )
            .then(function (result) {
                res.json(result)
            })

    });


}

// app.get("/", function (req, res) {

//     db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
//           if(data.length === 0) {
//               res.render("index", {message: "Sooory There Is No Strange News Yet! Click Button To Get News!"});
//           }
//           else{
//               res.render("index", {articles: data});
//           }
//       });

//   })

//   app.get("/scrape", function (req, res) {

//     axios
//       .get("https://www.npr.org/sections/strange-news/")
//       .then(function (response) {

//         var $ = cheerio.load(response.data);

//         $("article").each(function (i, element) {

//           var result = {};

//           result.title = $(this)
//           .children(".item-info-wrap")
//           .children(".item-info")
//           .children("h2")
//           .children("a")
//           .text();
//           result.teaser = $(this)
//           .children(".item-info-wrap")
//           .children(".item-info")
//           .children("p")
//           .children("a")
//           .text();
//           result.link = $(this)
//           .children(".item-info-wrap")
//           .children(".item-info")
//           .children("h2")
//           .children("a")
//           .attr("href");

//           db.Article.create(result)
//             .then(function (dbArticle) {

//               console.log(dbArticle);
//             })
//             .catch(function (err) {

//               console.log(err);
//             });
//         });

//         db.Article.find({})
//           .lean()
//           .then(function (dbArticle) {
//             console.log(dbArticle);


//             res.render("index", { dbArticle })
//           })
//           .catch(function (err) {

//             console.log(err);
//           });

//       });
//   });


//   app.get("/articles", function (req, res) {
//     db.Article.find()
//       .then(function (dbArticle) {

//         res.json(dbArticle);
//       })
//       .catch(function (err) {
//         res.json(err);
//       });

//   });


//   app.get("/articles/:id", function (req, res) {
//     db.Article.findById(req.params.id)
//       .populate("note")
//       .then(function (dbArticle) {
//         res.json(dbArticle);
//       })
//       .catch(function (err) {
//         res.json(err);
//       });
//   });


//   app.post("/articles/:id", function (req, res) {
//     db.Note.create(req.body)


//       .then(function (dbArticle) {

//         return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbArticle._id } }, { new: true });
//       })
//       .then(function (dbArticle) {
//         res.json(dbArticle);
//       })
//       .catch(function (err) {
//         res.json(err);
//       });
//   });