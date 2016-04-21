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

Book.controller("homeController", function(userFactory, bookFactory, $routeParams, $scope, $location){



});

Book.controller("bookController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage){

	var isbn = $routeParams.isbn;

	$scope.book_details = $localStorage.book;
	console.log($scope.book_details);
	if($scope.book_details.reviews[0].sunday_review_link.length < 1){$scope.no_review = true};
	console.log($scope.book_details.reviews[0].sunday_review_link.length);
	console.log($scope.no_review);

});

Book.controller("searchController", function(userFactory, bookFactory, $routeParams, $scope, $location, $localStorage){

	if ($location.search().i) {
		$scope.no_results = null;
		if ($location.search().date){
			var search = $location.search();
			bookFactory.byList(search,function(results){
				$scope.search.by = "Best Sellers List";
				console.log(results);
				$scope.search_results = [];
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
			});
		} else if($location.search().b){
			var search = {by: $location.search().b, text: $location.search().t}; 
			bookFactory.search(search,function(results){
				$scope.search.by = $location.search().b;
				$scope.search.text = $location.search().t;
				console.log(results);
				$scope.search_results = [];
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
				console.log($scope.search_results);
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
	$scope.search_by = {title: "Title", author: "Author", list: "Best Sellers List", list_date: "Date", isbn: "Isbn"};
	$scope.search = {};
	if($scope.search.by !== true){$scope.search.by = "Title"};

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
				console.log(results);
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
				console.log($scope.search_results);
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
					console.log($scope.no_results);
				}
			});
		} else if($scope.search.by === "Best Sellers List"){
			formatDate($scope.search.date);
			bookFactory.byList($scope.search,function(results){
				$location.search({i: "y", date: $scope.search.date, list: $scope.search.list});
				console.log(results);
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
				console.log($scope.search_results);
				$scope.result_query = {by: $scope.search.by, text: $scope.search.text};
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
					console.log($scope.no_results);
				}
			});
		} else if($scope.search.by === "Isbn"){
			bookFactory.search($scope.search,function(results){
				console.log(results);
				$scope.search_results = results;
				console.log($scope.search_results);
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
		$location.path("/book/"+book.isbns[0].isbn13);
	}

	function formatDate(input){

		var year = input.toString().substr(11,4),
		    month = ['Jan','Feb','Mar','Apr','May','Jun',
		             'Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(input.toString().substr(4,3))+1,
		    day = input.toString().substr(8,2);

		$scope.search.date = year + '-' + (month<10?'0':'') + month + '-' + day;
	}
		

});