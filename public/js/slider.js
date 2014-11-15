(function($){

var Slider = function(target){
  this.element = $(this.template)
    .appendTo(target);

  console.log(target, this.element);

  this.initEvents();

  return this.element;
}

Slider.prototype.initEvents = function(){
  return this;
};

Slider.prototype.template = '<input type="range">';

new Slider($('body'))


})(jQuery);
