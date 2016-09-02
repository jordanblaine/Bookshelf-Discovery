var Book = angular.module("booksApp", ["ngRoute","ngStorage"]);

Book.config(function($routeProvider){
	$routeProvider
		.when("/", {
			templateUrl: "partials/home.html",
			title: "Home",
			controller: "homeController"
		})
		.when("/login", {
			templateUrl: "partials/login.html",
			title: "User Login",
			controller: "userController"
		})
		.when("/signup", {
			templateUrl: "partials/signup.html",
			title: "User Signup",
			controller: "userController"
		})
		.when("/search", {
			templateUrl: "partials/search.html",
			title: "Search",
			controller: "searchController"
		})
		.when("/book/:isbn", {
			templateUrl: "partials/book.html",
			title: "Book Profile",
			controller: "bookController"
		})
		.when("/bookshelf", {
			templateUrl: "partials/bookshelf.html",
			title: "Your Bookshelf",
			controller: "shelfController"
		})
});

Book.factory("userFactory", function($http, $location, $window){

	var factory = {};

	factory.signup = function(user, callback){
		console.log(user);
		$http.post("/users/signup", user)
			.success(function(user){
				$location.path('/');
				$window.location.reload();
			}).error(function(error){
				var taken = {username: "taken"};
				callback(taken);
			});
	}

	factory.login = function(user, callback){
		console.log(user);
		$http.post("/users/login", user)
			.success(function(user){
				$location.path('/');
				$window.location.reload();
			}).error(function(error){
				var badLogin = {username: "incorrect"};
				callback(badLogin);
			});
	}

	factory.current = function(callback){
		$http.get("/users/current")
			.success(function(user){
				callback(user);
		});
	}

	factory.logout = function(current){
		$http.post("/users/logout", current)
			.success(function(user){
				$window.location.reload();
			}
		);
	}

	factory.getJson = function(){
		$http.get("http://api.nytimes.com/svc/books/v2/lists/best-sellers/history.json?Title=pioneer&api-key=aeb7fb9669e5b5df2fb92418b3ce17e3:5:74666075")
			.success(function(data){
				console.log(data);
			}).error(function(error){

			})
	}

	return factory;
});

Book.factory("bookFactory", function($http){

	var factory = {};

	factory.search = function(search,callback){
		$http.get("http://api.nytimes.com/svc/books/v2/lists/best-sellers/history.json?"+search.by+"="+search.text+"&api-key=aeb7fb9669e5b5df2fb92418b3ce17e3:5:74666075")
			.success(function(data){
				callback(data);
			}).error(function(){
				console.log("error");
			})
	}

	factory.byList = function(list,callback){
		$http.get("http://api.nytimes.com/svc/books/v2/lists/"+list.date+"/"+list.list+".json?api-key=aeb7fb9669e5b5df2fb92418b3ce17e3:5:74666075")
			.success(function(data){
				callback(data);
			}).error(function(){
				console.log("error");
			})
	}

	factory.getByIsbn = function(isbn,callback){
		$http.get("http://api.nytimes.com/svc/books/v2/lists/best-sellers/history.json?isbn="+isbn+"&api-key=aeb7fb9669e5b5df2fb92418b3ce17e3:5:74666075")
			.success(function(data){
				callback(data);
			}).error(function(){
				console.log("error");
			})
	}

	factory.addToShelf = function(user,callback){
		$http.post("/books/addToShelf",user).success(function(data){
			callback(data);
		}).error(function(){
			console.log("error");
		})
	}

	factory.removeFromShelf = function(user,callback){
		$http.post("/books/removeFromShelf",user).success(function(data){
			callback(data);
		}).error(function(){
			console.log("error");
		})
	}

	factory.bookshelfIsbn = function(user_id,callback){
		$http.post("/books/bookshelf/getIsbn",user_id).success(function(data){
			callback(data);
		}).error(function(){
			console.log("error");
		})
	}

	factory.saveNotes = function(notes){
		console.log(notes);
		$http.post("/books/bookshelf/saveNotes",notes).success(function(data){
			callback(data);
		}).error(function(){
			console.log(error);
		})
	}


	return factory;
});
Book.controller("userController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	$scope.currentUser = null;
	$scope.error = {};

	userFactory.current(function(user){
		if(user.name){
			$scope.currentUser = user;
			console.log($scope.currentUser);
		}
	});

	$scope.signup = function(){
		$scope.error = {};
		if ($scope.signupUser) {
			if ($scope.signupUser.name && $scope.signupUser.name.length>0) {
				if ($scope.signupUser.username && $scope.signupUser.username.length>5) {
					if (($scope.signupUser.password && $scope.signupUser.password.length>5 && $scope.signupUser.firm_password && $scope.signupUser.firm_password.length>5) && ($scope.signupUser.password == $scope.signupUser.firm_password)) {
						userFactory.signup($scope.signupUser, function(user){
							if (user.username == "taken") {
								$scope.signupUser.username = null;
								$scope.error.taken = "taken";
							};
						});
					} else {
						console.log(1);
						$scope.signupUser.password = null;
						$scope.signupUser.firm_password = null;
						$scope.error.password = "red";
						$scope.error.firm_password = "red";
					}
				} else if (($scope.signupUser.password && $scope.signupUser.password.length>5 && $scope.signupUser.firm_password && $scope.signupUser.firm_password.length>5) && ($scope.signupUser.password == $scope.signupUser.firm_password)){
					console.log(2);
					$scope.signupUser.username = null;
					$scope.error.username = "red";
				} else {
					console.log(3);
					$scope.signupUser.username = null;
					$scope.signupUser.password = null;
					$scope.signupUser.firm_password = null;
					$scope.error.username = "red";
					$scope.error.password = "red";
					$scope.error.firm_password = "red";
				}
			} else if($scope.signupUser.username && $scope.signupUser.username.length>5){
				console.log(4);
				if (($scope.signupUser.password && $scope.signupUser.password.length>5 && $scope.signupUser.firm_password && $scope.signupUser.firm_password.length>5) && ($scope.signupUser.password == $scope.signupUser.firm_password)) {
					console.log(5);
					$scope.signupUser.name = null;
					$scope.error.name = "red";
				} else {
					console.log(6);
					$scope.signupUser.name = null;
					$scope.signupUser.password = null;
					$scope.signupUser.firm_password = null;
					$scope.error.name = "red";
					$scope.error.password = "red";
					$scope.error.firm_password = "red";
				}
			} else if(($scope.signupUser.password && $scope.signupUser.password.length>5 && $scope.signupUser.firm_password && $scope.signupUser.firm_password.length>5) && ($scope.signupUser.password == $scope.signupUser.firm_password)){
				console.log(7);
				$scope.signupUser.name = null;
				$scope.signupUser.username = null;
				$scope.error.name = "red";
				$scope.error.username = "red";
			} else {
				console.log(8);
				$scope.signupUser = null;
				$scope.error.name = "red";
				$scope.error.username = "red";
				$scope.error.password = "red";
				$scope.error.firm_password = "red";
			}
		} else {
			console.log(9);
			$scope.error.name = "red";
			$scope.error.username = "red";
			$scope.error.password = "red";
			$scope.error.firm_password = "red";
		}
	}

	$scope.login = function(){
		$scope.error = {};
		if ($scope.loginUser) {
			if ($scope.loginUser.username && $scope.loginUser.username.length>5) {
				if ($scope.loginUser.password && $scope.loginUser.password.length>5) {
					userFactory.login($scope.loginUser, function(user){
						if(user.username == "incorrect"){
							$scope.loginUser = null;
							$scope.error.combo = "no good";
						}
					});
				} else{
					$scope.loginUser.password = null;
					$scope.error.password = "red";
				}
			} else if($scope.loginUser.password && $scope.loginUser.password.length>5){
				$scope.loginUser.username = null;
				$scope.error.username = "red";
			} else {
				$scope.loginUser.username = null;
				$scope.loginUser.password = null;
				$scope.error.username = "red";
				$scope.error.password = "red";
			}
		} else {
			$scope.error.username = "red";
			$scope.error.password = "red";
		}
		
	}

	$scope.logout = function(){
		userFactory.logout($scope.currentUser,
			function(error){
				alert(error);
			}
		);
		$location.path("/");
	}


});

Book.controller("homeController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	var date = new Date();
	$scope.date = fixDate(date);


	function fixDate(input){
		var year = input.toString().substr(11,4),
		    month = ['Jan','Feb','Mar','Apr','May','Jun',
		             'Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(input.toString().substr(4,3))+1,
		    day = input.toString().substr(8,2);
		    date = year + '-' + (month<10?'0':'') + month + '-' + day;
		return date;
	}

});

Book.controller("bookController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage){

	$scope.user_isbns = [];
	$scope.book = {};
	userFactory.current(function(user){
		if(user.name){
			$scope.currentUser = user;
			console.log($scope.currentUser);
			bookFactory.bookshelfIsbn({id: $scope.currentUser._id},function(results){
				$scope.user_isbns = results.isbns;
				for (var i = 0; i < $scope.user_isbns.length; i++) {
					if ($scope.user_isbns[i].book_isbn == isbn) {
						$scope.book.is = "yes";
						break;
					} else if($scope.book.is === "no"){
						continue;
					} else {
						$scope.book.is = "no";
					}
				};
				console.log($scope.book);
			});
		}
	});
	var isbn = $routeParams.isbn;

	$scope.book_details = $localStorage.book;
	console.log($scope.book_details);
	console.log($scope.book_details)
	if($scope.book_details.reviews[0].sunday_review_link.length < 1){$scope.no_review = true};

	$scope.addBook = function(isbn){
		var user = $scope.currentUser;
		user.book = isbn;
		console.log(user);
		bookFactory.addToShelf(user,function(result){
			$scope.book.is = "yes";
		});
	}

	$scope.removeBook = function(isbn){
		var user = $scope.currentUser;
		user.book = isbn;
		console.log(user);
		bookFactory.removeFromShelf(user,function(result){
			$scope.book.is = "no";
		});
	}

});

Book.controller("shelfController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage){

	$scope.currentUser = null;
	$scope.user_isbns = [];
	$scope.books = [];
	$scope.are_you_sure = {};
	$scope.book_notes = {};
	userFactory.current(function(user){
		if(user.name){
			$scope.currentUser = user;
			console.log($scope.currentUser);
			bookFactory.bookshelfIsbn({id: $scope.currentUser._id},function(results){
				$scope.user_isbns = results.isbns;
				console.log($scope.user_isbns);
				getBookshelf($scope.user_isbns);
			});
			
		}
	});

	getBookshelf = function(shelf){
		for (var i = shelf.length - 1; i >= 0; i--) {
			bookFactory.getByIsbn(shelf[i].book_isbn,function(book){
				if (book) {
					$scope.books.push(book);
				};
				console.log($scope.books);
			});
			
		};
	};

	$scope.removeBook = function(isbn,index){
		var user = $scope.currentUser;
		user.book = isbn;
		bookFactory.removeFromShelf(user,function(result){
			$scope.books.splice(index,1);
		});
		$scope.are_you_sure.is = null;
	}

	$scope.areYouSure = function(index){
		$scope.book_notes.is = null;
		$scope.are_you_sure.is = index;
	}

	$scope.notSure = function(index){
		$scope.are_you_sure.is = null;
	}

	$scope.openNotes = function(index){
		console.log("dkfnv");
		$scope.book_notes.is = index;
	}

	$scope.closeNotes = function(){
		console.log("nbkdflnlkdnlv");
		$scope.book_notes.is = null;
	}

	$scope.saveNotes = function(){
		bookFactory.saveNotes({_id: $scope.currentUser._id, notes: $scope.notes},function(saved){
			console.log(saved);
		});
	}
		



});

Book.controller("searchController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage){

	$scope.currentUser = {name: ''};
	$scope.user_isbns = [];
	var bsdate = {date: ''};
	var list = {};
	userFactory.current(function(user){
		if(user.name){
			$scope.currentUser = user;
			console.log($scope.currentUser);
			bookFactory.bookshelfIsbn({id: $scope.currentUser._id},function(results){
				$scope.user_isbns = results.isbns;
				console.log($scope.user_isbns);
			});
		}
	});

	if ($location.search().i) {
		$scope.is_by = "best_sellers";
		$scope.no_results = null;
		if ($location.search().date){
			var search = {date: $location.search().date, list: $location.search().list}; 
			bookFactory.byList(search,function(results){
				console.log(results);
				$scope.search_results = [];
				$scope.desc = [];
				if ($scope.currentUser.name) {
					results: for (var i=0;i<results.results.length;i++) {
						isbns: for (var j=$scope.user_isbns.length-1;j>=0;j--){
							if (i === 0) {
								bsdate.date = results.results[0].bestsellers_date;
								list.name = results.results[0].display_name;
							};
							if (results.results[i].book_details[0].primary_isbn13 == $scope.user_isbns[j].book_isbn){
								results.results[i].shelf = "on";
								$scope.search_results.push(results.results[i]);
								console.log($scope.search_results);
								$scope.desc.push({is: "hide"});
								continue results;
							}
							else if (j === 0 && results.results[i].shelf !== "on") {
								results.results[i].shelf = "off";
								$scope.desc.push({is: "hide"});
								$scope.search_results.push(results.results[i]);
							}
						};
					};
				} else {
					for (var i=0;i<results.results.length;i++){
							if (i === 0) {
								bsdate.date = results.results[0].bestsellers_date;
								list.name = results.results[0].display_name;
							};
							results.results[i].shelf = "none";
							$scope.search_results.push(results.results[i]);
					};
				};
				console.log($scope.search_results);
				bsdate = new Date(bsdate.date);			
				bsdate = formalDate(bsdate);
				console.log(bsdate);
				$scope.result_query = {by: "Best Sellers List", list: list.name, date: bsdate};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = search.by;
					$scope.no_results.message = search.text;
					search = null;
					console.log($scope.no_results);
				}
			});
		} else if($location.search().b){
			$scope.is_by = "search";
			var search = {by: $location.search().b, text: $location.search().t}; 
			bookFactory.search(search,function(results){
				$scope.search.by = $location.search().b;
				$scope.search.text = $location.search().t;
				$scope.search_results = [];
				$scope.desc = [];
				if ($scope.currentUser.name) {
					results: for (var i=0;i<results.results.length;i++) {
						if ($scope.user_isbns.length < 1) {
							results.results[i].shelf = "off";
						};
						isbns: for (var j=$scope.user_isbns.length-1;j>=0;j--){
							if (results.results[i].isbns.length > 0){
								if (results.results[i].isbns[0].isbn13 == $scope.user_isbns[j].book_isbn){
									results.results[i].shelf = "on";
									$scope.search_results.push(results.results[i]);
									$scope.desc.push({is: "hide"});
									continue results;
								}
								else if (j === 0 && results.results[i].shelf !== "on") {
									results.results[i].shelf = "off";
								}				
							} else {
								results.results[i].shelf = "no";
							}
						};
						if (results.results[i].shelf !== "no") {
							$scope.search_results.push(results.results[i]);
							$scope.desc.push({is: "hide"});
						}					};
				} else {
					for (var i = results.results.length - 1; i >= 0; i--) {
							results.results[i].shelf = "none";
							$scope.search_results.push(results.results[i]);
							$scope.desc.push({is: "hide"});
					};
				};
				console.log($scope.search_results);
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
				}
			});
		}
	}

	$scope.search_by = {title: "Title", author: "Author", list: "Best Sellers List", list_date: "Date", isbn: "Isbn"};
	$scope.search = {};
	$scope.on_shelf = [];
	if($scope.search.by !== true){$scope.search.by = "Best Sellers List"};

	$scope.openDescription = function(ind){
		$scope.desc[ind].is = "show";
	}

	$scope.closeDescription = function(ind){
		$scope.desc[ind].is = "hide";
	}

	$scope.searchBy = function(by){
		$scope.search = {};
		$scope.search.by = by;
		console.log($scope.search);
	}

	$scope.doSearch = function(){
		$scope.no_results = null;
		$scope.search_results = [];
		if ($scope.search.by === "Title" || $scope.search.by === "Author"){
			bookFactory.search($scope.search,function(results){
				$location.search({i: "y", b: $scope.search.by, t: $scope.search.text});
				$scope.search_results = [];
				$scope.desc = [];
				results: for (var i=0;i<results.results.length;i++) {
					isbns: for (var j=$scope.user_isbns.length-1;j>=0;j--){
						console.log(results.results[i]);
						if (results.results[i].isbns.length > 0){
							if (results.results[i].isbns[0].isbn13 == $scope.user_isbns[j].book_isbn){
								results.results[i].shelf = "on";
								$scope.search_results.push(results.results[i]);
								$scope.desc.push({is: "hide"});
								$scope.on_shelf.push({id: $scope.user_isbns[j]._id, isbn: $scope.user_isbns[j].book_isbn});
								continue results;
							}
							else if (j === 0 && results.results[i].shelf !== "on") {
								results.results[i].shelf = "off";
							}				
						} else {
							results.results[i].shelf = "no";
						}
					};
					if (results.results[i].shelf !== "no") {
						$scope.search_results.push(results.results[i]);
						$scope.desc.push({is: "hide"});
					};
				};
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
				}
			});
		} else if($scope.search.by === "Best Sellers List"){
			
			fixDate($scope.search.date);
			$location.search({i: "y", date: $scope.search.date, list: $scope.search.list});
			var search = {date: $location.search().date, list: $location.search().list}; 
			bookFactory.byList(search,function(results){
				$scope.search.date = $location.search().date;
				$scope.search.list = $location.search().list;
				$scope.search_results = [];
				$scope.desc = [];
				if ($scope.currentUser.name) {
					results: for (var i=results.results.length-1;i=0;i++) {
						isbns: for (var j=$scope.user_isbns.length-1;j>=0;j--){
							if (results.results[i].book_details[0].primary_isbn13 == $scope.user_isbns[j].book_isbn){
								results.results[i].shelf = "on";
								$scope.search_results.push(results.results[i]);
								$scope.desc.push({is: "hide"});
								continue results;
							}
							else if (j === 0 && results.results[i].shelf !== "on") {
								results.results[i].shelf = "off";
							}
						};
					};
				} else {
					for (var i = results.results.length - 1; i >= 0; i--) {
							results.results[i].shelf = "none";
							$scope.search_results.push(results.results[i]);
							$scope.desc.push({is: "hide"});
					};
				};
				var len = $scope.search_results.length;
				for (var i=$scope.search_results.length-1;i>=0;i--){
					$scope.search_results.push($scope.search_results[i]);
				};
				$scope.search_results.splice(0,len);
				console.log($scope.search_results);
			});
			$scope.result_query = {by: $scope.search.date, text: $scope.search.list};
			if($scope.search_results.length < 1){
				$scope.no_results = {};
				$scope.no_results.by = $scope.search.by;
				$scope.no_results.message = $scope.search.text;
				$scope.search.text = null;
				console.log($scope.no_results);
			}
		} else if($scope.search.by === "Isbn"){
			bookFactory.search($scope.search,function(results){
				$location.search({i: "y", b: $scope.search.by, t: $scope.search.text});
				console.log(results);
				$scope.search_results = results;
				$scope.result_query = {by: $scope.search.by, text:  $scope.search.text};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
					console.log($scope.no_results);
				}
			});
		}
	}

	$scope.toBook = function(book){
		$localStorage.book = book;
		$location.search('');
		$location.path("/book/"+book.book_details[0].primary_isbn13);
	}

	function fixDate(input){
		var year = input.toString().substr(11,4),
		    month = ['Jan','Feb','Mar','Apr','May','Jun',
		             'Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(input.toString().substr(4,3))+1,
		    day = input.toString().substr(8,2);
		$scope.search.date = year + '-' + (month<10?'0':'') + month + '-' + day;
	}

	function formalDate(input){
		var date = input.toString().substr(4,11);return date;
	}

	$scope.addBook = function(isbn,index){
		var user = $scope.currentUser;
		user.book = isbn;
		bookFactory.addToShelf(user,function(result){
			$scope.search_results[index].shelf = "on";
		});
		console.log($scope.currentUser.bookshelf);
	}

	$scope.removeBook = function(isbn,index){
		var user = $scope.currentUser;
		user.book = isbn;
		bookFactory.removeFromShelf(user,function(result){
			$scope.search_results[index].shelf = "off";
			$scope.currentUser.bookshelf = result.bookshelf;
		});
	}
		
});