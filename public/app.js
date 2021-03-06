
// Grab the articles as a json if there are already some stored in the mongodb
function renderArt() {
  $.getJSON("/articles", function(data) {
    $("#articles").empty();
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + data[i].link + "</p>");
      var $art = $('<div>').attr({
        "data-id": data[i]._id,
        "id": "art",
      });
      var $title = $('<span>').attr("class", "title").html(data[i].title + "<br />");
      var $summary = $('<span>').html(data[i].summary + "<br />");
      var $link = $('<a>').attr({
        "href": data[i].link,
        "target": "_blank"
      }).text("link");
      $art.append($title, $summary, $link);
      $("#articles").append($art);
    }
  });
}

renderArt();

// Whenever someone clicks the scrape button
$(document).on("click", "#scrapebutton", function() {

  $.get("/scrape")
    .then(function(data) {
      renderArt();
    });
});

// Whenever someone clicks a p tag
$(document).on("click", "#art", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      // $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Confirm Add/Delete/Change</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        // $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      // title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  $("#bodyinput").val("");
});
