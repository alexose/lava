(function($){

var Editor = function(target){
  this.target = target;
  this.init();
}

Editor.prototype.init = function(){

  this
    .initMessage()
    .initDrop()
    .initSlider()
    .initButtons();
};

Editor.prototype.initMessage = function(){
  this.message = $(this.templates.message)
    .appendTo(this.target);

  return this;
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
      self.createImage.call(self, file);
      self.message.remove();
    }
  }

  return this;
};

Editor.prototype.initSlider = function(){

  var target = $('#controls');

  this.slider = $(this.templates.slider)
    .appendTo(target)
    .slider({
      orientation: 'vertical',
      reversed: true
    })
    .on('slide', function(evt){
      if (this.canvas){
        $(this.canvas).css('opacity', evt.value / 100);
      }
    }.bind(this));

  return this;
};

Editor.prototype.initButtons = function(){

  var target = $('#controls');

  $(this.templates.set)
    .appendTo(target)
    .click(this.set.bind(this));

  $(this.templates.clear)
    .appendTo(target);

  return this;
}

Editor.prototype.createImage = function(file){

  // Append canvas
  var canvas = this.canvas = $('<canvas />')
    .css({
      position : 'absolute',
      'z-index': 1030
    })
    .appendTo(this.target)[0];

  var ctx = canvas.getContext('2d'),
      img = new Image,
      maxHeight = 300,
      ratio;

  img.src = URL.createObjectURL(file);
  img.onload = function() {

    if(img.height > maxHeight) {
      img.width *= maxHeight / img.height;
      img.height = maxHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    ratio = img.width / img.height;
  }

  // Set up interact
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
        onmove: function (evt) {
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

Editor.prototype.set = function(){
  if (!this.canvas){
    console.log("No image.")
    return;
  }

  // Figure out canvas bounding box, in terms of lat lon
  this.canvas;

  // Get map object
  var map;
  $(document).one('map:instance', function(evt, _map){ map = _map; });
  $(document).trigger('map:get');

  var canvas = $(this.canvas);

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

  this.modal();
};

Editor.prototype.modal = function(){

  var element = $('#upload')

  // Show image preview
  element.find('#image-preview')
    .append(
      $(this.canvas).clone()
    );

  $('#upload').modal();
};

Editor.prototype.submit = function(){
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

// Trigger editor on hashchange
var editor;
window.onhashchange = check;

function check(){
  if (window.location.hash === '#editor'){

    // Initialize
    editor = new Editor($('body'));
  } else if (editor) {

    // Destroy
    editor.destroy();
  }
}

check();

})(jQuery);
