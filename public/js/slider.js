(function($){

var Slider = function(target){
  this.element = $(this.template)
    .appendTo(target)
    .slider({
      formatter: function(value) {
        return 'Current value: ' + value;
      },
    });

  this.initEvents();

  return this.element;
}

Slider.prototype.initEvents = function(){
  return this;
};

Slider.prototype.template = '<input type="text" data-slider-id="slider" data-slider-min="0" data-slider-max="20" data-slider-step="1" data-slider-value="14"/>';

new Slider($('#controls'))

})(jQuery);
