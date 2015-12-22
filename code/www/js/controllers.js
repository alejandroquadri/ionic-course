angular.module('songhop.controllers', ['ionic', 'songhop.services'])

/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope,$ionicLoading, $timeout, User, Recommendations) {

  var showLoading = function (){
    $ionicLoading.show ({
      template:'<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  }

  var hideLoading = function (){
    $ionicLoading.hide();
  }
  showLoading();

  // esto trae la lista de canciones recomendadas
  Recommendations.init()
    .then(function(){
      $scope.currentSong = Recommendations.queue[0];
      Recommendations.playCurrentSong();
    })
    .then(function(){
      hideLoading();
      $scope.currentSong.loaded = true;
    })

  // esto para pre-cargar la imagen del album proximo y que no tarde en cargar

  $scope.nextAlbumImg = function (){
    if (Recommendations.queue.length>1){
      return Recommendations.queue[1].image_large;
    } else {
      return ''} //si no hay una imagen del proximo album devolver un string vacio
  }

  /*  fired when we click on favorite / skip song*/
  $scope.sendFeedback = function (bool){

    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;
    Recommendations.nextSong();

    $timeout(function(){
      //actualiza la currentSong
      $scope.currentSong = Recommendations.queue[0];
      $scope.currentSong.loaded = false;
    },250);
    Recommendations.playCurrentSong().then(function(){
      $scope.currentSong.loaded = true;
    })
    if (bool) User.addSongToFavorites($scope.currentSong);
  };

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window) {
  $scope.favorites = User.favorites;
  console.log($scope.favorites);
  $scope.removeSong = function (song,index){
    console.log(song);
    console.log(index);
    User.removeSongFromFavorites(song,index);
  }
  $scope.openSong = function (song){
    $window.open(song.open_url,"_system");
  }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, Recommendations) {
  $scope.favCount = User.favoriteCount;
  $scope.enteringFavorites = function (){
    User.newFavorites = 0
    Recommendations.haltAudio();
  }
  $scope.leavingFavorites = function (){
    Recommendations.init();
  }
})

.controller('SplashCtrl', function($scope, $state, User){
  $scope.submitForm = function (username, signingUp){
    User.auth(username, signingUp)
      .then(function(){
        $state.go('tab.discover');
      }, function(){
        alert('Trata con otro nombre');
      });
  }
});
