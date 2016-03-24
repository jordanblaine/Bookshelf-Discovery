var Book = angular.module("booksApp", ["ngRoute"]);

Book.config(function($routeProvider){
	$routeProvider
		.when("/", {
			templateUrl: "partials/home.html",
			title: "Home"
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
		$http.get("http://api.nytimes.com/svc/books/v2/lists/best-sellers/history.json?title=pioneer&api-key=aeb7fb9669e5b5df2fb92418b3ce17e3:5:74666075")
			.success(function(data){
				console.log(data);
			}).error(function(error){

			})
	}

	return factory;
});

Book.factory("bookFactory", function($http){

	var factory = {};

	factory.all_authors = function(callback){
		$http.get("/books/authors")
			.success(function(authors){
				callback(authors);
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

	userFactory.getJson(function(data){

	});


});

Book.controller("authorController", function(userFactory, bookFactory, $routeParams, $scope, $location){

	bookFactory.all_authors(function(authors,error){
		$scope.authors = authors;
	});


});