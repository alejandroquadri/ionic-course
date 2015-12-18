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

.factory('Recommendations', function($http,SERVER,$q){
  var media;
  var o = {
    queue:[]
  }
  o.getNextSongs = function (){
    return $http({
      method:'GET',
      url:SERVER.url+'/recommendations'
    }).success(function(data){
      o.queue = o.queue.concat(data);
    });
  }
  o.nextSong = function (){
    o.queue.shift(); //esto es para sacar la primer cancion del array
    o.haltAudio();
    if(o.queue.lenght < 3) {
      o.getNextSongs();
    }
  }
  o.playCurrentSong = function (){
    var defer = $q.defer();

    media = new Audio(o.queue[0].preview_url);

    //cuando la canción haya sido cargada, resuelve la promesa para avisarle al controlador
    media.addEventListener("loadeddata",function(){
      defer.resolve();
    });
    media.play();
    return defer.promise
  }

  o.haltAudio = function(){
    if (media) media.pause();
  }
  return o;
})
