/**
 *   Unslider by @idiot
 */

(function($, f) {
	var Unslider = function() {
		//  Create a deep clone for methods where context changes
		var _ = this;

		//  Dimensions
		_.sizes = [];

		//  Current inded
		_.active = 0;

		//  Start/stop timer
		_.timer = f;

		//  Detect CSS3 support
		var doc = document,
			end = 'transitionend',
			endC = 'TransitionEnd',
			props = {OTransition: 'o' + endC + ' o' + end, msTransition: end, MozTransition: end, WebkitTransition: 'webkit' + endC, transition: end},
			css3;

		for (prop in props)
			if (typeof doc.documentElement.style[prop] == 'string') css3 = [prop, props[prop]];

		_.init = function(el, o) {
			_.el = el;
			_.ul = el.children('ul');
			_.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			_.li = _.ul.children('li').each(_.calc);

			//  Check whether we're passing any options in to Unslider
			_.o = $.extend({
				speed: 500, // transition speed
				delay: 3000, // f for no autoplay
				pause: !f, // pause on hover
				keys: !f, // keyboard shortcuts - disable if it breaks things
				dots: f, // display ••••o• pagination
				arrows: f, // display arrows ← →
				fluid: f // is it a percentage width?
			}, o);

			//  Set up the Unslider
			_.setup(_.o);

			return _;
		};

		//  Get the width for an element
		//  Pass a jQuery element as the context with .call(), and the index as a parameter: Unslider.calc.call($('li:first'), 0)
		_.calc = function(i) {
			var me = $(this),
				width = me.outerWidth(),
				height = me.outerHeight();

			//  Add it to the sizes list
			_.sizes[i] = [width, height];

			//  Set the max values
			if (width > _.max[0]) _.max[0] = width;
			if (height > _.max[1]) _.max[1] = height;
		};

		//  Work out what methods need calling
		_.setup = function(o) {
			var el = _.el,
				ul = _.ul,
				li = _.li,
				len = li.length,
				resize,
				throttle,
				styl;

			//  Set the main element
			el.css({width: _.max[0], height: li.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', left: 0, width: (len * 100) + '%'});
			li.css('width', (100 / len) + '%');

			if (o.delay !== f) {
				_.start(f);
				o.pause && el.hover(_.stop, _.start);
			};

			//  Keyboard support
			if (o.keys) {
				$(doc).keydown(function(e) {
					var key = e.which;

					if (key == 37)
						_.prev(); // Left
					else if (key == 39)
						_.next(); // Right
					else if (key == 27)
						_.stop(); // Esc
				});
			};

			//  Dot pagination
			o.dots && _.nav('dot');

			//  Arrows support
			o.arrows && _.nav('arrow');

			//  Little patch for fluid-width sliders. Screw those guys.
			if (o.fluid) {
				//  Throttle, IE patch
				(resize = function() {
					if (throttle) clearTimeout(throttle);

					throttle = setTimeout(function() {
						styl = {height: li.eq(_.active).outerHeight()};

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
		_.to = function(i) {
			var el = _.el,
				ul = _.ul,
				li = _.li,
				target = li.eq(i);

			//  If it's out of bounds, go to the first slide
			if (!target.length) i = 0;
			if (i < 0) i = (li.length - 1);
			_.before(_.o.before, i, 'active');

			//  Set some variables
			var speed = _.o.speed | 0,
				tail = css3 ? speed + 'ms ease-in-out' : {duration: speed, queue: f},
				animH = target.outerHeight() + 'px',
				animL = '-' + i + '00%',
				anim = css3 ? 'height ' + tail : {height: animH},
				styl = {el: el[0].style, ul: ul[0].style};

			//  It's time to animate
			if (css3) {
				//  CSS3 transition
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
				//  jQuery animation
				el.animate(anim, tail);

				anim['left'] = animL;
				tail['complete'] = _.after;
				ul.animate(anim, tail);
			};
		};

		//  Before/after callbacks
		_.before = function(before, i, name) {
			$.isFunction(before) && before(_.el);
			_.active = i;
			_.el.find('.dot:eq(' + i + ')').addClass(name).siblings().removeClass(name);
		};
		_.after = function() {
			$.isFunction(_.o.after) && _.o.after(_.el);
		};

		//  Autoplay functionality
		_.start = function(hover) {
			hover !== f && _.stop();
			_.timer = setInterval(function() {
				_.to(_.active + 1);
			}, _.o.delay | 0);
		};

		//  Stop autoplay
		_.stop = function() {
			_.timer = clearInterval(_.timer);
			return _;
		};

		//  Navigation
		_.next = function() {
			return _.stop().to(_.active + 1)
		};
		_.prev = function() {
			return _.stop().to(_.active - 1)
		};
		_.nav = function(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';
				$.each(_.li, function(i) {
					html += '<li class="' + (i < 1 ? name + ' active' : name) + '">' + ++i + '</li>';
				});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's">' + html + name + ' prev">←</div>' + html + name + ' next">→</div></div>';
			};

			_.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function() {
				var me = $(this);
				me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
			});
		};
	};

	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(i) {
			//  Cache a copy of $(this), so it
			var me = $(this),
				instance = (new Unslider).init(me, o);

			//  Invoke an Unslider instance
			me.data('unslider' + (len > 1 ? '-' + ++i : ''), instance);
		});
	};
})(window.jQuery, false);