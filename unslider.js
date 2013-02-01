/**
 *   Unslider by @idiot
 */
 
(function($, f) {
	//  If there's no jQuery, Unslider can't work, so kill the operation.
	if(!$) return f;
	
	var Unslider = function() {
		//  Set up our elements
		this.el = f;
		this.items = f;
		
		this.sizes = [];
		this.max = [0,0];
		
		this.current = 0;
		
		this.interval = false;
				
		//  Set some options
		this.opts = {
			speed: 500,
			delay: 3000, // false for no autoplay
			complete: false, // when a slide's finished
			keys: true
		};
		
		//  Create a deep clone for methods where context changes
		var _ = this;

		this.init = function(el, opts) {
			this.el = el;
			this.ul = el.children('ul');
			this.max = [el.outerWidth(), el.outerHeight()];			
			this.items = el.find('li').each(this.calculate);
			
			//  Check whether we're passing any options in to Unslider
			if(opts) {
				this.opts = $.extend(opts);
			}
			
			//  Set up the Unslider
			this.setup();
			
			return this;
		};
		
		//  Get the width for an element
		//  Pass a jQuery element as the context with .call(), and the index as a parameter: Unslider.calculate.call($('li:first'), 0)
		this.calculate = function(index) {
			var me = $(this),
				width = me.outerWidth(), height = me.outerHeight();
			
			//  Add it to the sizes list
			_.sizes[index] = [width, height];
			
			//  Set the max values
			if(width > _.max[0]) _.max[0] = width;
			if(height > _.max[1]) _.max[1] = height;
		};
		
		//  Work out what methods need calling
		this.setup = function() {
			//  Set the main element
			this.el.css({
				overflow: 'hidden',
				width: _.max[0],
				height: 'auto'
			});
			
			//  Set the relative widths
			this.ul.css({width: (this.items.length * 100) + '%', position: 'relative'});
			this.items.css('width', (100 / this.items.length) + '%');
			
			this.move(this.current, true);
			
			if(this.opts.delay !== false) {
				this.start();
				this.el.hover(this.stop, this.start);
			}
			
			if(this.opts.keys) {
				$(document).keydown(this.keys);
			}
		};
		
		//  Move Unslider to a slide index
		this.move = function(index, cb) {
			//  If it's out of bounds, go to the first slide
			if(!this.items.eq(index).length || index < 0) {
				index = 0;
			}
			
			var target = this.items.eq(index);
			var obj = {height: target.outerHeight()};
			
			if(!this.ul.is(':animated')) {
				this.el.animate(obj) && this.ul.animate($.extend({left: '-' + index + '00%'}, obj), function(data) {
					_.current = index;
					$.isFunction(_.opts.complete) && !cb && _.opts.complete(_.el);
				});
			}
		};
		
		//  Autoplay functionality
		this.start = function() {
			_.interval = setInterval(function() {
				_.move(_.current + 1);
			}, _.opts.delay);
		};
		
		//  Stop autoplay
		this.stop = function() {
			_.interval = clearInterval(_.interval);
			return _;
		};
		
		//  Keypresses
		this.keys = function(e) {
			var key = e.which;
			var map = {
				//  Prev/next
				37: function() { _.stop().move(_.current - 1) },
				39: function() { _.stop().move(_.current + 1) },
				
				//  Esc
				27: _.stop
			};
			
			console.log(map[key]);
			
			if($.isFunction(map[key])) {
				map[key]();
			}
		};
	};
	
	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;
		
		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it 
			var me = $(this);
			var instance = (new Unslider).init(me, o);
			
			//  Invoke an Unslider instance
			me.data('unslider' + (len > 1 ? '-' + (index + 1) : ''), instance);
		});
	};
})(window.jQuery, false);