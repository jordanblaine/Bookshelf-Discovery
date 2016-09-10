var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var librarySchema = new mongoose.Schema({
	book_isbn: Number,
	_user: {type: Schema.ObjectId, ref: 'Users'},
	notes: {
		page: {type: Number},
		summary: {type: String}
	}
});

var Books = mongoose.model("books",librarySchema);