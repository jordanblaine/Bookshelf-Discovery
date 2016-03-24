const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");

require("./server/config/mongoose.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static(path.join(__dirname, "./client")));

require('./server/config/auth.js')(app, passport);

require("./server/config/routes.js")(app, passport);

const server = app.listen(7000, function() {
	console.log("Now listening on port 7000");
});
