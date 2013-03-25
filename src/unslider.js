/**
 *   Unslider by @idiot
 */

(function($, f, d, t, tC, h, l) {
	var Unslider = function() {
		//  Current inded
		this.current = 0;

		//  Set some options
		this.o = {
			speed: 500, // transition speed
			delay: 3000, // delay between slides, f for no autoplay
			pause: !f, // pause on hover
			loop: !f, // will it loop?
			keys: f, // keyboard shortcuts - disable if it breaks things
			dots: f, // display ••••o• pagination
			arrows: f, // display prev/next arrows
			prevText: '←',
			nextText: '→',
			fluid: f // is it a percentage width?
		};

		//  Create a deep clone for methods where context changes
		var _ = this;

		//  Detect css3 support
		var css,
			props = {OTransition: 'o' + tC + ' o' + t, msTransition: t, MozTransition: t, WebkitTransition: 'webkit' + tC, transition: t};

		for (prop in props)
			if (typeof d.documentElement.style[prop] == 'string') css = [prop, props[prop]];

		this.init = function(el, o) {
			this.el = el;
			this.ul = el.children('ul');
			this.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			this.li = this.ul.children('li').each(this.calc);
			this.count = this.li.length;

			//  Check whether we're passing any options in to Unslider
			this.o = $.extend(this.o, o);

			//  Set up the Unslider
			this.setup();

			return this;
		};

		//  Get the width for an element
		//  Pass a jQuery element as the context with .call(), and the index as a parameter: Unslider.calc.call($('li:first'), 0)
		this.calc = function(index) {
			var me = $(this),
				width = me.outerWidth(),
				height = me.outerHeight();

			//  Set the max values
			if (width > _.max[0]) _.max[0] = width;
			if (height > _.max[1]) _.max[1] = height;
		};

		//  Work out what methods need calling
		this.setup = function() {
			var o = this.o,
				el = this.el,
				ul = this.ul,
				li = this.li,
				len = li.length;

			//  Set the main element
			el.css({width: _.max[0], height: li.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', width: (len * 100) + '%'});
			li.css({'float': l, width: (100 / len) + '%'});

			//  Slideshow
			setTimeout($.proxy(function() {
				if (o.delay !== f) {
					this.play();

					if (o.pause) {
						this.el.on('mouseover mouseout', $.proxy(function(e) {
							e.type == 'mouseover' ? this.stop() : this.stop().play();
						}, this));
					};
				};
			}, this), o.init | 0);

			//  Keypresses
			if (o.keys) {
				$(d).on('keydown', $.proxy(function(e) {
					var key = e.which;

					if (key == 37)
						this.prev(); // Left
					else if (key == 39)
						this.next(); // Right
					else if (key == 27)
						this.stop(); // Esc
				}, this));
			};

			//  Dot pagination
			o.dots && this.nav('dot');

			//  Arrows support
			o.arrows && this.nav('arrow');

			//  Little patch for fluid-width sliders. Screw those guys.
			if (o.fluid)
				$(window).resize($.proxy(this.resize, this)).resize();

			//  Swipe support
			if ($.event.swipe) {
				this.el.on('swipeleft swiperight', $.proxy(function(e) {
					e.type == 'swipeleft' ? this.prev() : this.next();
				}, this));
			};
		};

		//  Handle resize
		this.resize = function() {
			if (this.throttle) clearTimeout(this.throttle);

			this.throttle = setTimeout($.proxy(function() {
				var styl = {height: this.li.eq(this.current).outerHeight()};

				this.ul.css(styl);
				styl['width'] = Math.min(Math.round((this.el.outerWidth() / this.el.parent().outerWidth()) * 100), 100) + '%';
				this.el.css(styl);
			}, this), 50);
		};

		//  Move Unslider to a slide index
		this.to = function(index) {
			var o = this.o,
				el = this.el,
				ul = this.ul,
				li = this.li,
				target = li.eq(index);

			//  Will it slide?
			if (index == this.current || (!target.length || index < 0) && o.loop == f) return;

			//  If it's out of bounds, go to the first slide
			if (!target.length) index = 0;
			if (index < 0) index = (li.length - 1);

			this.before(o.before, index, 'active');

			var speed = o.speed | 0,
				tail = css ? speed + 'ms ease-in-out' : {duration: speed, queue: f},
				animH = target.outerHeight() + 'px',
				animL = '-' + index + '00%',
				anim = css ? h + ' ' + tail : {height: animH},
				styl = {el: el[0].style, ul: ul[0].style};

			if (css) {
				styl.el[css[0]] = anim;
				styl.el[h] = animH;
				styl.ul[css[0]] = anim + ', left ' + tail;
				styl.ul[h] = animH;
				styl.ul[l] = animL;

				this.ul.on(css[1], $.proxy(function() {
					this.ul.off(css[1]);
					this.after();
				}, this));
			} else {
				el.animate(anim, tail);

				anim[l] = animL;
				tail['complete'] = $.proxy(this.after, this);
				ul.animate(anim, tail);
			};
		};

		//  Before/after callbacks
		this.before = function(before, index, name) {
			$.isFunction(before) && before(this.el);
			this.current = index;
			this.el.find('.dot:eq(' + index + ')').addClass(name).siblings().removeClass(name);
		};

		this.after = function() {
			$.isFunction(this.o.after) && this.o.after(this.el);
		};

		//  Autoplay functionality
		this.play = function() {
			this.timer = setInterval($.proxy(function() {
				this.to(this.current + 1);
			}, this), this.o.delay | 0);
		};

		//  Stop autoplay
		this.stop = function() {
			this.timer = clearInterval(this.timer);
			return this;
		};

		//  Navigation
		this.next = function() {
			return this.stop().to(this.current + 1);
		};

		this.prev = function() {
			return this.stop().to(this.current - 1);
		};

		this.nav = function(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';

				$.each(this.li, function(index) {
					html += '<li class="' + (index < 1 ? name + ' active' : name) + '">' + ++index + '</li>';
				});

				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's">' + html + name + ' prev">' + this.o.prevText + '</div>' + html + name + ' next">' + this.o.nextText + '</div></div>';
			};

			this.el.addClass('has-' + name + 's').append(html).find('.' + name).on('click', $.proxy(function(e) {
				var me = $(e.target);
				me.hasClass('dot') ? this.stop().to(me.index()) : me.hasClass('prev') ? this.prev() : this.next();
			}, this));
		};
	};

	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it
			var me = $(this),
				key = 'unslider' + (len > 1 ? '-' + ++index : ''),
				instance = (new Unslider).init(me, o);

			//  Invoke an Unslider instance
			me.data(key, instance).data('key', key);
		});
	};
})(jQuery, false, document, 'transitionend', 'TransitionEnd', 'height', 'left');