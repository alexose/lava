(function($){

var Editor = function(target){
  this.target = target;
  this.init();
}

Editor.prototype.init = function(){

  this
    .initDrop();
};

Editor.prototype.initDrop = function(){

  var target = this.target,
      self = this;

  target
    .bind('dragenter', ignoreDrag)
    .bind('dragover', ignoreDrag)
    .bind('drop', drop);

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
      self.modal(file);
    }
  }

  return this;
};

Editor.prototype.createImage = function(file, cb){

  var canvas = $('<canvas />')[0];

  var ctx = canvas.getContext('2d'),
      img = new Image,
      maxWidth = 300;

  var obj = {
    canvas : canvas,
    img : img
  }

  img.src = URL.createObjectURL(file);
  img.onload = function() {

    if(img.width > maxWidth) {
      img.height *= maxWidth / img.width;
      img.width = maxWidth;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    if (cb){
      cb(obj);
    }
  }

  return obj;
};


Editor.prototype.modal = function(file){

  var element = $('#upload'),
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

    $.ajax({
      type:        'POST',
      url:         form.attr('action'),
      data:        data,
      cache:       false,
      processData: false,
      success:     success,
      error:       failure
    });
  });

  function success(response){
     console.log('File uploaded successfully');
  }

  function failure(response){
    // TODO: show errors?
     console.log('File upload failed');
  }

  this.modal = $('#upload').modal();
};

Editor.prototype.set = function(obj){

  var self = this;

  this.modal.modal('hide');

  // Create canvas
  var canvas = obj.canvas,
      img = obj.img;

  // Show message
  var message = $(this.templates.message)
    .appendTo(this.target);

  // Show buttons
  var controls = $('#controls');

  $(this.templates.set)
    .appendTo(controls)
    .click(function(){
      self.finalize.call(self, canvas);
    });

  // Show slider
  var slider = $(this.templates.slider)
    .appendTo(controls)
    .slider({
      orientation: 'vertical',
      reversed: true
    })
    .on('slide', function(evt){
      $(canvas).css('opacity', evt.value / 100);
    }.bind(this));

  $(this.templates.clear)
    .appendTo(controls);

  $(canvas)
    .css({
      position : 'absolute',
      top : 70,
      left: 100,
      'z-index': 1030
    })
    .appendTo(this.target);

  // Set up interact
  var ratio = img.width / img.height,
      ctx = canvas.getContext('2d');

  interact(canvas)
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
    interact(canvas)
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
        }
    })
    .inertia(true)
    .restrict({
        drag: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    });
};

Editor.prototype.finalize = function(canvas){

  canvas = $(canvas);

  // Get map object
  var map;
  $(document).one('map:instance', function(evt, _map){ map = _map; });
  $(document).trigger('map:get');

  var origin = map.getPixelOrigin(),
      offset = canvas.offset(),
      width = canvas.width(),
      height = canvas.height();

  var pt1 = L.point(origin.x + offset.left, origin.y + offset.top),
      pt2 = L.point(origin.x + offset.left + width, origin.y + offset.top + height);

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

  this.modal.modal('show');
};

Editor.prototype.templates = {
  message : '<div class="alert alert-warning" role="alert">  <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>Edit mode</strong>: Drag an image onto the map in order to place it.</div>',
  slider : '<input type="text" data-slider-id="slider" data-slider-min="1" data-slider-max="100" data-slider-step="1" data-slider-value="100"/>',
  clear : '<button class="btn btn-secondary" type="button">Close</button>',
  set : '<button class="btn btn-primary" type="button">Set</button>'
};

Editor.prototype.destroy = function(){
  this.element.remove();
  return;
};

new Editor($('body'));

})(jQuery);
