(function($){

var Editor = function(target){
  this.target = target;
  this.init();
}

Editor.prototype.init = function(){

  this
    .initMessage()
    .initDrop()
    .initSlider();
};

Editor.prototype.initMessage = function(){
  var message = $(this.templates.message)
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

Editor.prototype.templates = {
  message : '<div class="alert alert-warning" role="alert">  <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>Edit mode</strong>: Drag an image onto the map in order to place it.</div>',
  slider : '<input type="text" data-slider-id="slider" data-slider-min="1" data-slider-max="100" data-slider-step="1" data-slider-value="100"/>'
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
