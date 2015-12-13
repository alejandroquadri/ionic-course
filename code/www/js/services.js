angular.module('songhop.services', [])
.factory('User',function(){
  var o = {
    favorites: []
  }
  o.addSongToFavorites = function (song){
    if (!song) return false; //para asegurarse que hayan pasado una cancion
    o.favorites.unshift(song); //suma las canciones nuevas al array. unshift a dif de push las suma al principio
  }

  o.removeSongFromFavorites = function (index, song){
    if (!song) return false;
    o.favorites.splice(index,1);
  }

  return o;
})
