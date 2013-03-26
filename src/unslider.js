/**
 *   Unslider v0.2 by @idiot
 */

(function($, f, doc, _transitionend, _TransitionEnd) {
	var Unslider = function() {
		//  Cache strings
		var _special = $.event.special,
			_move = 'move',
			_movestart = _move + 'start',
			_moveend = _move + 'end',
			_swipe = 'swipe',
			_swipeleft = _swipe + 'left',
			_drag = 'drag',
			_mouseout = 'mouseout',
			_dot = 'dot';

		//  Current inded
		this.cur = 0;

		//  Set some options
		this.o = {
			speed: 500,  // animation speed, false for no transition (integer)
			delay: 3000, // delay between slides, false for no autoplay (integer or boolean)
			init: 0,     // init delay, false for no delay (integer or boolean)
			pause: !f,   // pause on hover (boolean)
			loop: !f,    // infinitely looping (boolean)
			keys: f,     // keyboard shortcuts (boolean)
			dots: f,     // display ••••o• pagination (boolean)
			arrows: f,   // display prev/next arrows (boolean)
			prev: '←',   // text or html inside prev button (string)
			next: '→',   // same as for prev option
			fluid: f,    // is it a percentage width? (boolean)
			touch: _drag // or 'swipe', false to disable (string or boolean)
		};

		//  Create a deep clone for methods where context changes
		var _ = this;

		//  Detect css3 support
		var css3,
			props = {OTransition: 'o' + _TransitionEnd + ' o' + _transitionend, msTransition: _transitionend, MozTransition: _transitionend, WebkitTransition: 'webkit' + _TransitionEnd, transition: _transitionend};
		for (prop in props)
			if (typeof doc.documentElement.style[prop] == 'string') css3 = [prop, props[prop]];

		this.init = function(el, o) {
			this.el = el;
			this.ul = el.find('>ul');
			this.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			this.li = this.ul.find('>li').each(function(index) {
				var me = $(this),
					width = me.outerWidth(),
					height = me.outerHeight();

				//  Set the max values
				if (width > _.max[0]) _.max[0] = width;
				if (height > _.max[1]) _.max[1] = height;
			});

			//  Check whether we're passing any options in to Unslider
			this.o = $.extend(this.o, o);

			//  Set up the Unslider
			this.setup();

			return this;
		};

		//  Work out what methods need calling
		this.setup = function() {
			var o = this.o,
				t = o.touch,
				el = this.el,
				ul = this.ul,
				li = this.li,
				len = li.length;

			//  Set the main element
			el.css({width: _.max[0], height: li.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', width: (len * 100) + '%'});
			li.css({'float': 'left', width: (100 / len) + '%'});

			//  Autoslide
			setTimeout($.proxy(this.auto, this), o.init | 0);

			//  Keypresses
			if (o.keys) {
				$(doc).on('keydown', $.proxy(function(e) {
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
			o.dots && this.nav(_dot);

			//  Arrows support
			o.arrows && this.nav('arrow');

			//  Patch for fluid-width sliders. Screw those guys.
			if (o.fluid) {
				$(window).resize($.proxy(function() {
					this.rs && clearTimeout(this.rs);

					this.rs = setTimeout($.proxy(function() {
						var styl = {height: this.li.eq(this.cur).outerHeight()},
							width = this.el.outerWidth();

						this.max[0] = width;
						this.ul.css(styl);
						styl['width'] = Math.min(Math.round((width / this.el.parent().outerWidth()) * 100), 100) + '%';
						this.el.css(styl);
					}, this), 50);
				}, this)).resize();
			}

			//  Touch support
			if (t) {
				this.el.on(_movestart + ' move ' + _moveend + ' ' + _swipeleft + ' swiperight', $.proxy(function(e) {
					var type = e.type,
						x = e.distX,
						y = e.distY,
						index = this.cur,
						width = this.max[0],
						left = -index * 100,
						path = 100 * x / width,
						styl = this.ul[0].style;

					if (t == _drag && _special[_move]) {
						//  Drag support
						if (type == _movestart) {
							if (x > y && x < -y || x < y && x > -y) {
								e.preventDefault();
								return;
							} else {
								if (css3) styl[css3[0]] = 'left 0ms ease';
								this.drag = !f;
							};
						} else if (type == _move) {
							styl['left'] = left + path + '%';
						} else if (type == _moveend) {
							path = path | 0;

							if (path < -10)
								this.to(++index);
							else if (path > 10)
								this.to(--index);
							else
								this.to(index);

							this.stop();
							this.drag = f;
						};
					} else if (t == _swipe && _special[_swipe]) {
						//  Swipe support
						type == _swipeleft ? this.prev() : this.next();
					};
				}, this));
			};
		};

		//  Autoslide it
		this.auto = function() {
			if (this.o.delay | 0) {
				this.play();

				if (this.o.pause) {
					this.el.on('mouseover ' + _mouseout, $.proxy(function(e) {
						this.stop();
						e.type == _mouseout && this.play();
					}, this));
				};
			};
		};

		//  Move Unslider to a slide index
		this.to = function(index) {
			var o = this.o,
				cur = this.cur,
				drag = this.drag,
				el = this.el,
				ul = this.ul,
				li = this.li,
				target = li.eq(index);

			//  Slide?
			if (index == cur && !drag || (!target.length || index < 0) && o.loop == f) return;

			//  Check if it's out of bounds
			if (!target.length) index = drag ? cur : 0;
			if (index < 0) index = drag ? cur : li.length - 1;
			if (index == cur) target = li.eq(cur);

			this.cur = index;
			el.find('.dot:eq(' + index + ')').addClass('active').siblings().removeClass('active');
			this.before(o.before);

			var speed = o.speed | 0,
				tail = css3 ? speed + 'ms ease-in-out' : {duration: speed, queue: f},
				animH = target.outerHeight() + 'px',
				animL = '-' + index + '00%',
				anim = css3 ? 'height ' + tail : {height: animH},
				styl = {el: el[0].style, ul: ul[0].style};

			if (css3) {
				//  CSS3 transition
				styl.el[css3[0]] = anim;
				styl.el['height'] = animH;
				styl.ul[css3[0]] = anim + ', left ' + tail;
				styl.ul['height'] = animH;
				styl.ul['left'] = animL;

				this.ul.on(css3[1], $.proxy(function() {
					this.ul.off(css3[1]);
					this.after();
				}, this));
			} else {
				//  jQuery animation
				el.animate(anim, tail);

				anim['left'] = animL;
				tail['complete'] = $.proxy(this.after, this);
				ul.animate(anim, tail);
			};
		};

		//  Before/after callbacks
		this.before = function(before) {
			$.isFunction(before) && before(this.el);
		};

		this.after = function() {
			$.isFunction(this.o.after) && this.o.after(this.el);
		};

		//  Autoplay functionality
		this.play = function() {
			if (!this.drag) {
				this.timer = setInterval($.proxy(function() {
					this.to(this.cur + 1);
				}, this), this.o.delay | 0);
			}
		};

		//  Stop autoplay
		this.stop = function() {
			this.timer = clearInterval(this.timer);
			return this;
		};

		//  Navigation
		this.next = function() {
			return this.stop().to(this.cur + 1);
		};

		this.prev = function() {
			return this.stop().to(this.cur - 1);
		};

		this.nav = function(name, html) {
			if (name == _dot) {
				html = '<ol class="dots">';
					$.each(this.li, function(index) {
						html += '<li class="' + (index < 1 ? name + ' active' : name) + '">' + ++index + '</li>';
					});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's">' + html + name + ' prev">' + this.o.prev + '</div>' + html + name + ' next">' + this.o.next + '</div></div>';
			};

			this.el.addClass('has-' + name + 's').append(html).find('.' + name).on('click', $.proxy(function(e) {
				var me = $(e.target);
				me.hasClass(_dot) ? this.stop().to(me.index()) : me.hasClass('prev') ? this.prev() : this.next();
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
})(jQuery, false, document, 'transitionend', 'TransitionEnd');