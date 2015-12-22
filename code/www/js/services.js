angular.module('songhop.services', ['ionic.utils'])
.factory('User',function($http, $q, $localstorage, SERVER){
  var o = {
    username:false,
    session_id:false,
    favorites: [],
    newFavorites: 0
  }

  o.auth = function (username, signingUp){
    var authRoute;

    if (signingUp){
      authRoute = 'singup';
    } else {
      authRoute = 'login';
    }
    return $http.post(SERVER.url + '/'+ authRoute, {username:username})
      .success(function(data){
        o.setSession(data.username, data.session_id, data.favorites);
      });
  }

  o.setSession = function(username, session_id, favorites){
    if (username) o.username = username;
    if (session_id) o.session_id = session_id;
    if (favorites) o.favorites = favorites;

    $localstorage.setObject('user',{username:username, session_id:session_id});
  }

  o.checkSession = function () {
      var defer = $q.defer();

      if (o.session_id){
        //si esta secion ya esta incializada
        defer.resolve (true);
      } else {
        // detect if there's a session in localstorage from previous use.
        // if it is, pull into our service
        var user = $localstorage.getObject('user');
        if (user.username){
          // if there's a user, lets grab their favorites from the server
          o.setSession (user.username, user.session_id);
          o.populateFavorites().then (function (){
            defer.resolve(true);
          });
        } else {
          // no user info in localstorage, reject
          defer.resolve(false);
        }
      }
      return defer.promise;
  }

  o.addSongToFavorites = function (song){
    if (!song) return false; //para asegurarse que hayan pasado una cancion
    o.favorites.unshift(song); //suma las canciones nuevas al array. unshift a dif de push las suma al principio
    o.newFavorites++;

    //esto es para que se grabe en el server
    return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id: song.song_id})
  }

  o.removeSongFromFavorites = function (index, song){
    if (!song) return false;
    o.favorites.splice(index,1);

    return $http ({
      method: 'DELETE',
      url: SERVER.url + '/favorites',
      params: {session_id:o.session_id, song_id: song.song_id}
    });
  }
  o.favoriteCount = function (){
    return o.newFavorites;
  }

  o.populateFavorites = function (){
    return $http ({
      method:'GET',
      url: SERVER.url + 'favorites',
      params: {session_id: o.session_id}
    }).success (function (data){
      o.favorites = data;
    });
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
    if(o.queue.length < 3) {
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

  o.init = function (){
    if (o.queue.length === 0){
      return o.getNextSongs();
    } else {
      return o.playCurrentSong();
    }
  }
  return o;
})
