(function(){

L.mapbox.accessToken = 'pk.eyJ1IjoiYWxleG9zZSIsImEiOiJmZy1rQ1VBIn0.gyExB7jljQYa26ERP7ZOIQ';
var map = L.mapbox.map('map', 'examples.map-i86nkdio').setView([19.49590, -154.95256] , 12);

$(document).bind('map:get', function(){
  $(document).trigger('map:instance', map);
});

var idx = {},
    opacity = 1;

$(document).bind('map:show', function(evt, obj){

  var b = JSON.parse(obj.bounds),
      key = obj.date.toString();

  idx[key] = L.imageOverlay(obj.file.path, b).addTo(map).setOpacity(opacity);
});

$(document).bind('map:hide', function(evt, obj){
  var key = obj.date.toString();
  map.removeLayer(idx[key]);
});

$(document).bind('map:opacity', function(evt, value){

  opacity = value;

  for (var key in idx){
    idx[key].setOpacity(value);
  }
})

})();
