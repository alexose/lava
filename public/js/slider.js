(function($){

var Slider = function(target){
  this.target = target;
  this.sync(this.init);

  return this.element;
}

Slider.prototype.sync = function(cb){

  $.get('/api/', function(response){
    this.data = JSON.parse(response);
    cb.call(this);
  }.bind(this));
};


Slider.prototype.init = function(){

  this.element = $(this.template)
    .appendTo(this.target)
    .slider({
      formatter: function(value) {
        return 'Current value: ' + value;
      }
    });

  this
    .initEvents();
};

Slider.prototype.initEvents = function(){
  return this;
};

Slider.prototype.template = '<input type="text" data-slider-id="slider" data-slider-min="0" data-slider-max="20" data-slider-step="1" data-slider-value="14"/>';

new Slider($('#controls'))

})(jQuery);
