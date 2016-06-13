var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var librarySchema = new mongoose.Schema({
	book_isbn: Number,
	_user: {type: Schema.ObjectId, ref: 'Users'}
});

var Books = mongoose.model("books",librarySchema);