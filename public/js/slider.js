(function($){

var Slider = function(target){
  this.target = target;
  this.sync(this.init);

  return this.element;
}

Slider.prototype.sync = function(cb){

  $.get('/api/', function(response){
    this.data = JSON.parse(response);

    var index = {};
    this.data.forEach(function(d){
      index[d.date] = d;
    });

    this.index = index;

    this.dates = this.data.map(function(d){
      return d.date;
    }).sort();

    cb.call(this);
  }.bind(this));
};


Slider.prototype.init = function(){

  var dates = this.dates;

  this.element = $(this.template)
    .appendTo(this.target)
    .slider({
      min : dates[0],
      max : dates[dates.length-1],
      step : 1000 * 60,
      value : dates[0],
      formatter: function(value) {
        return d3.time.format("%m-%d-%Y")(new Date(value));
      }
    });

  this
    .initEvents();
};

Slider.prototype.initEvents = function(){

  var dates = this.dates,
      pos = 0;

  this.element.on('slide', function(d){
    var value = d.value.toString();

    var idx = 0;
    for (var i in dates){
      var date = dates[i];
      if (value <= date){
        idx = date;
        break;
      }
    }

    // Position changed
    if (idx !== pos){
      this.show(idx);
      pos = idx;
    }

  }.bind(this));

  return this;
};

Slider.prototype.show = function(date){
  $(document).trigger('map:show', this.index[date]);
}

Slider.prototype.template = '<input type="text" data-slider-id="slider"/>';

new Slider($('#controls'))

})(jQuery);
