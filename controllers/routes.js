var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
module.exports = function(router) {

    router.get("/", function(req, res) {
        res.render("index");
    });
    // A GET route for scraping the echoJS website
    router.get("/scrape", function(req, res) {
        // First, we grab the body of the html with request
        request("https://www.nytimes.com/", function(error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);

            // Now, we grab every h2 within an article tag, and do the following:
            $('article[class="story theme-summary"]').each(function(i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .find("h2.story-heading")
                    .children()
                    .text();
                result.summary = $(this)
                    .find("p.summary")
                    .text();
                result.link = $(this)
                    .find("a")
                    .attr("href");

                // console.log(result.title, result.summary, result.link);

                // Create a new Article using the `result` object built from scraping
                if (result.title && result.summary && result.link) {
                    // NOTE: In the model I made title unique - to prevent duplicates
                    // Not sure why the .catch is not handling this correctly and we get errors in the server console below
                    // But it does not crash the server, does not add dupes, and the user doesnt see these errors
                    db.Article.create(result)
                        .then(function(dbArticle) {
                            // View the added result in the console
                            console.log(dbArticle);
                        })
                        .catch(function(err) {
                            // If an error occurred, send it to the client
                            // return res.json(err);
                            console.log("dup entry : DENIED");
                        });
                }
            });
            

            // If we were able to successfully scrape and save an Article, send a message to the client
            res.send("Scrape Complete");
        })

    });

    // Route for getting all Articles from the db
    router.get("/articles", function(req, res) {
        // TODO: Finish the route so it grabs all of the articles
        // Find all articles
        db.Article.find({})
            .then(function(data) {
                // If all Articles are successfully found, send them back to the client
                res.json(data);
            })
            .catch(function(err) {
                // If an error occurs, send the error back to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    router.get("/articles/:id", function(req, res) {
        // TODO
        // ====
        // Finish the route so it finds one article using the req.params.id,
        // and run the populate method with "note",
        // then responds with the article with the note included
        // Find all articles
        db.Article.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        })
            .populate("note")
            .then(function(data) {
                // If all Articles are successfully found, send them back to the client
                res.json(data);
            })
            .catch(function(err) {
                // If an error occurs, send the error back to the client
                res.json(err);

            });
    });

    // Route for saving/updating an Article's associated Note
    router.post("/articles/:id", function(req, res) {
        // TODO
        // ====
        // save the new note that gets posted to the Notes collection
        // then find an article from the req.params.id
        // and update it's "note" property with the _id of the new note
        // Create a new note in the database
        db.Note.create(req.body)
            .then(function(dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { note: dbNote._id } }, { new: true });
            })
            .then(function(data) {
                // If the Article was updated successfully, send it back to the client
                res.json(data);
            })
            .catch(function(err) {
                // If an error occurs, send it back to the client
                res.json(err);
            });
    });
}