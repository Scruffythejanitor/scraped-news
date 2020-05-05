const db = require("../models")

module.exports = function(app) {

    app.get("/", function(req, res) {

        var dbArticle = {}

        dbArticle["articles"] = []

        db.Article.find({$query: {saved: false} }).sort( { date: -1 })
        .lean()
        .then(function(dbArticle) {
            res.render("index", { dbArticle })

           
        });

    });

    app.get("/saved", function(req, res) {
        var articleSaved = {}

        articleSaved["articles"] = []

        db.Article.find({saved: true}).sort({date: -1})
        .then( function(found) {

            if (found.length > 0) {
                for (let i = 0; i < found.length; i ++ ) {

                    console.log(found[i]);

                    newObject = {
                        id: found[i]._id,
                        title: found[i].title,
                        teaser: found[i].teaser,
                        link: found[i].link,
                        // photo: found[i].photo,
                        saved: found[i].saved,
                        notes: found[i].notes
                    }

                    articleSaved.articles.push(newObject);

                    if (i == (found.length - 1)) {
                        
                        res.render("saved", articleSaved)
                    }
                }
            }

            else {
                res.render("saved")
            }

        });


    });
}