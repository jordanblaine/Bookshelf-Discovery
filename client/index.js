var Book = angular.module("booksApp", ["ngRoute"]);

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
		.when("/:isbn", {
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

Book.controller("bookController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	$scope.book_details = {};
	$scope.isbn = $routeParams.isbn;
	console.log($scope.isbn);
	bookFactory.getByIsbn($scope.isbn,function(book){
		$scope.book_details = book.results[0];
		console.log($scope.book_details);
	});


});

Book.controller("searchController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	$scope.search_by = {title: "Title", author: "Author", list: "Best Sellers List", list_date: "Date", isbn: "Isbn"};
	$scope.search = {};
	if($scope.search.by !== true){$scope.search.by = "Title"};
	$scope.search_results = [];

	$scope.searchBy = function(by){
		$scope.search = {};
		$scope.search.by = by;
	}

	$scope.doSearch = function(){
		$scope.no_results = null;
		$scope.search_results = [];
		console.log($scope.search);
		formatDate($scope.search.date);
		console.log($scope.search);
		if ($scope.search.by === "Title" || $scope.search.by === "Author"){
			bookFactory.search($scope.search,function(results){
				console.log(results);
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
				console.log($scope.search_results);
				if($scope.search_results.length < 1){
					$scope.no_results = {};
					$scope.no_results.by = $scope.search.by;
					$scope.no_results.message = $scope.search.text;
					$scope.search.text = null;
					console.log($scope.no_results);
				}
			});
		} else if($scope.search.by === "Best Sellers List"){
			bookFactory.byList($scope.search,function(results){
				console.log(results);
				for (var i = 0; i < results.results.length; i++) {
					$scope.search_results.push(results.results[i]);
				};
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

	function formatDate(input){

		var year = input.toString().substr(11,4),
		    month = ['Jan','Feb','Mar','Apr','May','Jun',
		             'Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(input.toString().substr(4,3))+1,
		    day = input.toString().substr(8,2);

		$scope.search.date = year + '-' + (month<10?'0':'') + month + '-' + day;
	}
		

});