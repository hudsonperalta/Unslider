/**
 *   Unslider by @idiot
 */

(function($, f) {
	var Unslider = function() {
		//  Set up our elements
		this.el = f;
		this.items = f;

		//  Dimensions
		this.sizes = [];
		this.max = [0,0];

		//  Current inded
		this.current = 0;

		//  Start/stop timer
		this.interval = f;

		//  Set some options
		this.opts = {
			speed: 500, // transition speed
			delay: 3000, // f for no autoplay
			pause: !f, // pause on hover
			keys: !f, // keyboard shortcuts - disable if it breaks things
			dots: f, // display ••••o• pagination
			arrows: f, // display arrows ← →
			fluid: f // is it a percentage width?
		};

		//  Create a deep clone for methods where context changes
		var _ = this;

		//  Detect CSS3 support
		var doc = document,
			transit = 'transitionend',
			transitC = 'TransitionEnd',
			props = {
				OTransition: 'o' + transitC + ' o' + transit,
				msTransition: transit,
				MozTransition: transit,
				WebkitTransition: 'webkit' + transitC,
				transition: transit
			},
			css3;

		for (prop in props)
			if (typeof doc.documentElement.style[prop] == 'string') css3 = [prop, props[prop]];

		this.init = function(el, opts) {
			this.el = el;
			this.ul = el.children('ul');
			this.max = [el.outerWidth(), el.outerHeight()];
			this.items = this.ul.children('li').each(this.calc);

			//  Check whether we're passing any options in to Unslider
			this.opts = $.extend(this.opts, opts);

			//  Set up the Unslider
			this.setup();

			return this;
		};

		//  Get the width for an element
		//  Pass a jQuery element as the context with .call(), and the index as a parameter: Unslider.calc.call($('li:first'), 0)
		this.calc = function(index) {
			var me = $(this),
				width = me.outerWidth(), height = me.outerHeight();

			//  Add it to the sizes list
			_.sizes[index] = [width, height];

			//  Set the max values
			if (width > _.max[0]) _.max[0] = width;
			if (height > _.max[1]) _.max[1] = height;
		};

		//  Work out what methods need calling
		this.setup = function() {
			var opt = _.opts,
				items = _.items,
				itemsL = items.length,
				el = _.el,
				ul = _.ul;

			//  Set the main element
			el.css({width: _.max[0], height: items.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', left: 0, width: (itemsL * 100) + '%'});
			items.css('width', (100 / itemsL) + '%');

			if (opt.delay !== f) {
				_.start(f);
				opt.pause && el.hover(_.stop, _.start);
			};

			//  Custom keyboard support
			opt.keys && $(doc).keydown(_.keys);

			//  Dot pagination
			opt.dots && _.nav('dot');

			//  Arrows support
			opt.arrows && _.nav('arrow');

			//  Little patch for fluid-width sliders. Screw those guys.
			if (opt.fluid) {
				var timer, resize, styl;

				//  Throttle, IE patch
				(resize = function() {
					if (timer) clearTimeout(timer);

					timer = setTimeout(function() {
						styl = {height: items.eq(_.current).outerHeight()};

						ul.css(styl);
						styl['width'] = Math.min(Math.round((el.outerWidth() / el.parent().outerWidth()) * 100), 100) + '%';
						el.css(styl);
					}, 50);
				})();

				$(window).resize(resize);
			};

			//  Swipe support
			if ($.event.swipe) el.on('swipeleft', _.prev).on('swiperight', _.next);
		};

		//  Move Unslider to a slide index
		this.move = function(index) {
			var opt = _.opts,
				items = _.items,
				target = items.eq(index),
				el = _.el,
				ul = _.ul;

			//  If it's out of bounds, go to the first slide
			if (!target.length) index = 0;
			if (index < 0) index = (items.length - 1);
			_.before(opt.before, index, 'active');

			var speed = opt.speed | 0,
				tail = css3 ? speed + 'ms ease-in-out' : {duration: speed, queue: f},
				animH = target.outerHeight() + 'px',
				animL = '-' + index + '00%',
				anim = css3 ? 'height ' + tail : {height: animH},
				styl = {el: el[0].style, ul: ul[0].style};

			if (css3) {
				styl.el[css3[0]] = anim;
				styl.el['height'] = animH;
				styl.ul[css3[0]] = anim + ', left ' + tail;
				styl.ul['height'] = animH;
				styl.ul['left'] = animL;

				ul.bind(css3[1], function() {
					$(this).unbind(css3[1]);
					_.after();
				});
			} else {
				el.animate(anim, tail);

				anim['left'] = animL;
				tail['complete'] = _.after;
				ul.animate(anim, tail);
			};
		};

		//  Before/after callbacks
		this.before = function(before, index, name) {
			$.isFunction(before) && before(_.el);
			_.current = index;
			_.el.find('.dot:eq(' + index + ')').addClass(name).siblings().removeClass(name);
		};
		this.after = function() {
			var after = _.opts.after;
			$.isFunction(after) && after(_.el);
		};

		//  Autoplay functionality
		this.start = function(hover) {
			hover !== f && _.stop();
			_.interval = setInterval(function() {
				_.move(_.current + 1);
			}, _.opts.delay | 0);
		};

		//  Stop autoplay
		this.stop = function() {
			_.interval = clearInterval(_.interval);
			return _;
		};

		//  Keypresses
		this.keys = function(e) {
			var key = e.which;

			if (key == 37)
				_.prev(); // Left
			else if (key == 39)
				_.next(); // Right
			else if (key == 27)
				_.stop(); // Esc
		};

		//  Navigation
		this.next = function() {
			return _.stop().move(_.current + 1)
		};
		this.prev = function() {
			return _.stop().move(_.current - 1)
		};
		this.nav = function(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';
				$.each(this.items, function(index) {
					html += '<li class="' + (index < 1 ? name + ' active' : name) + '">' + (index + 1) + '</li>';
				});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's">' + html + name + ' prev">←</div>' + html + name + ' next">→</div></div>';
			};

			this.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function() {
				var me = $(this);
				me.hasClass('dot') ? _.stop().move(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
			});
		};
	};

	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it
			var me = $(this),
				instance = (new Unslider).init(me, o);

			//  Invoke an Unslider instance
			me.data('unslider' + (len > 1 ? '-' + (index + 1) : ''), instance);
		});
	};
})(window.jQuery, false);