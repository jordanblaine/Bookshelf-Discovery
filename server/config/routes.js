var authenticate = require("./auth.js");
var Books = require("../controllers/books.js");

module.exports = function(app, passport){

	app.post("/users/signup", passport.authenticate('signup'),
		function(req,res){
			if(req.user){
				console.log("success");
				res.json(200);
			} else {
				res.redirect("/users/bad");
			}
		}
	);

	app.post("/users/login", passport.authenticate('login'),
		function(req,res){
			if(req.user){
				console.log("success");
				res.json(200);
			} else {
				res.redirect("/users/bad");
			}
		}	
	);

	app.get("/users/bad", function(req,res){
		res.json(401);
	});

	app.get("/users/current", isLoggedIn, function(req,res){
		res.json(req.user);
	});

	app.post("/users/logout", function(req,res){
		req.session.destroy();
		res.json(200);
	});

	app.post("/books/addToShelf", function(req,res){
		Books.addBook(req,res);
	});	

	app.post("/books/removeFromShelf", function(req,res){
		Books.removeBook(req,res);
	});	

	app.post("/books/bookshelf/getIsbn", function(req,res){
		Books.bookshelfIsbn(req,res);
	});

}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
    	res.redirect('/');
    }
}