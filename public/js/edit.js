(function($){

var Editor = function(target){
  this.target = target;
  this.init();
}

Editor.prototype.init = function(){

  // Get map object
  var self = this;
  $(document).one('map:instance', function(evt, _map){ self.map = _map; });
  $(document).trigger('map:get');

  this
    .initDrop();
};

Editor.prototype.initDrop = function(){

  var target = this.target;

  target
    .bind('dragenter', ignoreDrag)
    .bind('dragover', ignoreDrag)
    .bind('drop', drop.bind(this));

  var ll;

  // Listen for latlng
  this.map
    .on('mousemove', function(evt){
      ll = evt.latlng;
    });

  function ignoreDrag(e) {
    e.originalEvent.stopPropagation();
    e.originalEvent.preventDefault();
  }

  function drop(e) {
    ignoreDrag(e);

    var dt = e.originalEvent.dataTransfer;
    var files = dt.files;

    if(dt.files.length > 0){

      var file = dt.files[0];

      this.createImage(file, function(img){

        var aspect = img.width / img.height;

        this.upload(file, function(obj){

          var url = obj.url;

          this.set(url, ll, aspect);
        }.bind(this));
      }.bind(this));
    }
  }

  return this;
};

Editor.prototype.upload = function(file, cb){

    var data = new FormData();
    data.append('file', file);

    $.ajax({
      type:        'POST',
      url:         '/api',
      data:        data,
      cache:       false,
      processData: false,
      contentType: false,
      success:     success,
      error:       failure
    });

    function success(response){
      console.log('File uploaded successfully');
      var obj = JSON.parse(response);
      cb(obj);
    }

    function failure(response){
      var obj = JSON.parse(response.responseText);
      console.log(obj);
    }
};

Editor.prototype.set = function(url, ll, aspect){

  // Show message
  var message = $(this.templates.message)
    .appendTo(this.target);

  // Show buttons
  var controls = $('#controls');

  $(document).bind('map:opacity', function(evt, value){
    $(canvas).css('opacity', value);
  });

  $(this.templates.set)
    .appendTo(controls)
    .click(function(){
      this.finalize(canvas);
    }.bind(this));

  // Calculate bounds based on image aspect and current viewport
  var map = this.map,
    height = 200,
    width = height * aspect;

  var pixels = map.project(ll);

  var pt1 = L.point(
    pixels.x - ( width / 2 ),
    pixels.y - ( height / 2 )
  );

  var pt2 = L.point(
    pixels.x + ( width / 2 ),
     pixels.y + ( height / 2 )
  );

  var bounds = [
    map.unproject(pt1),
    map.unproject(pt2)
  ];

  L.imageOverlay(url, bounds).addTo(this.map);

  var layer = map.getPanes().overlayPane,
    img = $(layer).find('img');

  $(layer).bind('mousedown', function(evt){
    return false;
  });

  interact(img)
    .resizable(true)
    .squareResize(true)
    .on('resizemove', function(evt){

      var target = evt.target,
          width = parseFloat(target.width),
          height = parseFloat(target.height);

      // add the change in coords to the previous width of the target element
      var newWidth = width + evt.dx,
          newHeight = newWidth / ratio;

      // update the element's style
      target.width = newWidth;
      target.height = newHeight;

      ctx.drawImage(img,0,0,newWidth,newHeight);
    });

    // Set up dragging
    interact(layer)
    .draggable({
        max: Infinity,
        onmove: function(evt){

            var target = evt.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0) + evt.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + evt.dy;

            target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            evt.stopImmediatePropagation();
            return false;
        }
    })
    .inertia(true);
};

Editor.prototype.createImage = function(file, cb){

  var img = new Image;

  img.src = URL.createObjectURL(file);
  img.onload = function() {
    if (cb){
      cb(img);
    }
  }
};


Editor.prototype.modal = function(){

  var element = $('#upload'),
      file = this.file,
      self = this;

  // Show image preview
  element.find('#image-preview')
    .append(
      this.createImage(file).canvas
    );

  // Button behavior
  element.find('#set-bounds')
    .click(function(evt){
      evt.preventDefault();

      self.createImage.call(self, file, function(image){
        self.set.call(self, image);
      });

    });

  var form = element.find('#submit-form');

  element.find('#submit-button').click(function(evt){
    evt.preventDefault();

    var data = new FormData(form[0]);

    data.append('file', self.file);

    $('.post-error').remove();

    $.ajax({
      type:        'POST',
      url:         form.attr('action'),
      data:        data,
      cache:       false,
      processData: false,
      contentType: false,
      success:     success,
      error:       failure
    });
  });

};

Editor.prototype.finalize = function(canvas){

  map = this.map;

  canvas = $(canvas);

  var origin = map.getPixelBounds(),
      offset = canvas.offset(),
      width = canvas.width(),
      height = canvas.height();

  var pt1 = L.point(origin.min.x + offset.left, origin.min.y + offset.top),
      pt2 = L.point(origin.min.x + offset.left + width, origin.min.y + offset.top + height);

  var ll1 = map.unproject(pt1),
      ll2 = map.unproject(pt2);

  var bounds = [
      [ ll1.lat, ll1.lng ],
      [ ll2.lat, ll2.lng ]
  ];

  // TODO: handle real images
  var url = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg';

  L.imageOverlay(url, bounds).addTo(map);

  // Add to form
  $('#bounds').val(JSON.stringify(bounds));

};

Editor.prototype.templates = {
  message : '<div class="alert alert-warning" role="alert">  <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>Edit mode</strong>: Drag an image onto the map in order to place it.</div>',
  set : '<button class="btn btn-primary" type="button">Set</button>'
};

Editor.prototype.destroy = function(){
  this.element.remove();
  return;
};

new Editor($('body'));

})(jQuery);
