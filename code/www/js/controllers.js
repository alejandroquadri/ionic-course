angular.module('songhop.controllers', ['ionic', 'songhop.services'])

.controller('SplashCtrl', function($scope, $state, User){
  $scope.submitForm = function (username, signingUp){
    User.auth(username, signingUp)
      .then(function(){
        $state.go('tab.discover');
      }, function(){
        alert('Trata con otro nombre');
      });
  }
})

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
  // esto pone loading en verdadero por primera vez
  // mientras trae la lista de canciones.
  showLoading();

  // esto trae la lista de canciones recomendadas
  Recommendations.init()
    .then(function(){
      $scope.currentSong = Recommendations.queue[0];
      return Recommendations.playCurrentSong();
    })
    .then(function(){
      hideLoading();
      $scope.currentSong.loaded = true;
    })

  /*  fired when we click on favorite / skip song*/
  $scope.sendFeedback = function (bool){
    //primero agrego a favoritos si fueron agregados
    if (bool) User.addSongToFavorites($scope.currentSong);

    //prepara las variables para la correcta secuencia
    //de animacion
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;

    //prepara la proxima cancion
    Recommendations.nextSong();

    $timeout(function(){
      //actualiza la currentSong
      $scope.currentSong = Recommendations.queue[0];
      $scope.currentSong.loaded = false;
    },250);
    Recommendations.playCurrentSong().then(function(){
      $scope.currentSong.loaded = true;
    });
  };

  // esto para pre-cargar la imagen
  //del album proximo y que no tarde en cargar
  $scope.nextAlbumImg = function (){
    if (Recommendations.queue.length>1){
      return Recommendations.queue[1].image_large;
    } else {
      return ''} //si no hay una imagen del proximo album devolver un string vacio
  }
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window) {
  //agarro lo favoritos y el usuario
  $scope.favorites = User.favorites;
  $scope.username = User.username;

  $scope.removeSong = function (song,index){
    User.removeSongFromFavorites(song, index);
  };
  $scope.openSong = function (song){
    $window.open(song.open_url,"_system");
  };
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, Recommendations, $window) {
  //le doy al scope la cantidad de favoritos.
  $scope.favCount = User.favoriteCount;

  //pausa el audio cuando entra a favoritos.
  //renueva el conteo a 0 para la tab
  $scope.enteringFavorites = function (){
    User.newFavorites = 0
    Recommendations.haltAudio();
  }
  $scope.leavingFavorites = function (){
    Recommendations.init();
  }
  $scope.logout = function (){
    User.destroySession();
    // instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached.
    $window.location.href = 'index.html'
  }
});
