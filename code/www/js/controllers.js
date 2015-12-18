angular.module('songhop.controllers', ['ionic', 'songhop.services'])

/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, User, Recommendations) {
  // esto trae la lista de canciones recomendadas
  Recommendations.getNextSongs()
    .then(function(){
      $scope.currentSong = Recommendations.queue[0];
      Recommendations.playCurrentSong();
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
    },250);
    Recommendations.playCurrentSong();
    if (bool) User.addSongToFavorites($scope.currentSong);
  };

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
  $scope.favorites = User.favorites;
  console.log($scope.favorites);
  $scope.removeSong = function (song,index){
    console.log(song);
    console.log(index);
    User.removeSongFromFavorites(song,index);
  }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope) {

});
