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

  // Opacity slider
  var slider = $(this.templates.vertical)
    .appendTo(controls)
    .slider({
      orientation: 'vertical',
      reversed: true,
      max : 1,
      min : 0,
      step : 0.01
    })
    .on('slide', function(evt){
      $(document).trigger('map:opacity', evt.value);
    }.bind(this));

  // Horizontal slider
  this.element = $(this.templates.horizontal)
    .appendTo(this.target)
    .slider({
      min : dates[0],
      max : dates[dates.length-1],
      step : 1000 * 60,
      value : [
        dates[0],
        dates[1]
      ],
      formatter: function(arr) {
        var start = arr[0],
          end = arr[1],
          format = d3.time.format("%m-%d-%Y"),
          template = 'From {{start}} to {{end}}';

        return template
          .replace('{{start}}', format(new Date(start)))
          .replace('{{end}}', format(new Date(end)));
      }
    });

  this
    .initEvents();
};

Slider.prototype.initEvents = function(){

  var data = this.data,
      pos = 0;

  this.element.on('slide', function(d){

    var start = d.value[0],
      end = d.value[1];

    for (var i in data){
      var post = data[i];
      if (post.date >= start && post.date <= end){
        if (!post.visible){
          this.show(post);
        }
      } else {
        if (post.visible){
          this.hide(post);
        }
      }
    }

  }.bind(this));

  return this;
};

Slider.prototype.show = function(post){
  post.visible = true;
  $(document).trigger('map:show', post)
};

Slider.prototype.hide = function(post){
  post.visible = false;
  $(document).trigger('map:hide', post);
};

Slider.prototype.templates = {
  horizontal : '<input type="text" data-slider-id="slider"/>',
  vertical : '<input type="text" data-slider-id="slider"/>'
};


new Slider($('#controls'))

})(jQuery);
