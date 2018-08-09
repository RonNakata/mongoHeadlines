var express = require("express");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// routes
var router = express.Router(); 

require("./controllers/routes.js")(router); 

app.use(router); 

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
