var mongoose = require("mongoose");
var Users = mongoose.model("users");
var Books = mongoose.model("books");

module.exports = {

	addBook: function(req,res){
		console.log(req.body);
		var book = {book_isbn: req.body.book};
		Users.findOne({_id: req.body._id}, function(err,user){
			var addBook = new Books(book);
			addBook._user = user._id;
			user.bookshelf.push(addBook._id);
			addBook.save(function(err){
				user.save(function(err){
					if(err){
						console.log("error");
					}
				});
			});
		});
		res.json();
	},

	removeBook: function(req,res){
		console.log(req.body,1);

		Users.findOne({_id: req.body._id}, function(err,user){
			Books.findOne({_user: user._id}).where("book_isbn").equals(req.body.book).exec(function(err,book){
				if(err || !book){res.send(400)};
				console.log(book,2);
				var index = user.bookshelf.indexOf(book._id);
				user.bookshelf.splice(index,1);				
				user.save();
				book.remove();
				res.json(user);
			});
		});

	},

	bookshelfIsbn: function(req,res){
		console.log(req.body);
		Books.find({_user: req.body.id},function(err,result){
			res.json({isbns: result});
		});
	}

}