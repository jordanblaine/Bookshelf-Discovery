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
				callback(error);
			});
	}

	factory.login = function(user, callback){
		console.log(user);
		$http.post("/users/login", user)
			.success(function(user){
				$location.path('/');
				$window.location.reload();
			}).error(function(error){
				callback(error);
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

	return factory;
});

Book.controller("userController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	$scope.currentUser = null;

	userFactory.current(function(user){
		if(user.name){
			$scope.currentUser = user;
			console.log($scope.currentUser);
		}
	});

	$scope.signup = function(){
		console.log($scope.signupUser);
		userFactory.signup($scope.signupUser, function(user,error){
			if(error){
				console.log("no");
			} else{
				console.log(user);
			}
		})
	}

	$scope.login = function(){
		userFactory.login($scope.loginUser, function(user,error){
			if(error){
				console.log("no");
			} else{
				console.log(user);
			}
		})
	}

	$scope.logout = function(){
		userFactory.logout($scope.currentUser,
			function(error){
				alert(error);
			}
		);
	}


});

Book.controller("homeController", function(userFactory, bookFactory, $routeParams, $scope, $location, userController){



});

Book.controller("bookController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage, userController){

	var isbn = $routeParams.isbn;

	$scope.book_details = $localStorage.book;
	console.log($scope.book_details);
	if($scope.book_details.reviews[0].sunday_review_link.length < 1){$scope.no_review = true};

});

Book.controller("shelfController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage, userController){

	

});

Book.controller("searchController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage, userController){

	$scope.currentUser = null;
	$scope.user_isbns = [];
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
				$scope.search_results = [];
				$scope.desc = [];
				if ($scope.user_isbns.length > 0) {
					results: for (var i=0;i<results.results.length;i++) {
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
				var dat = new Date($scope.search_results[0].bestsellers_date);
				dat = dat.toString().substr(4,11);
				console.log(dat);
				$scope.result_query = {by: "Best Sellers List", list: $scope.search_results[0].list_name, date: dat};
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
				if ($scope.user_isbns.length > 0) {
					results: for (var i=0;i<results.results.length;i++) {
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
						};
					};
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
				if ($scope.user_isbns.length > 0) {
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
			console.log("yes");
			$scope.search_results[index].shelf = "off";
			$scope.currentUser.bookshelf = result.bookshelf;
		});
	}
		
});