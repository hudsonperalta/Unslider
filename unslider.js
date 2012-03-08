/**
 *  Unslider 0.3
 *  by @visualidiot
 *
 *  Licensed under the WTFPL, as always.
 *
 **
 *	The quickest way to set it up is like this.
 **
 *
 *  HTML:	<div id="slider">
 *				<ul>
 *					<li></li>
 *					<li></li>
 *					<li></li> <!-- you get the idea. -->
 *				</ul>
 *			</div>
 *
 *  CSS:	Provided in unslider.css
 *
 *	JS:     $('#slider').unslider();
 */
 
(function($, d) {

	/**
	 *	 Move the Unslider
	 */
	$.fn.moveUnslider = function(pos, speed, easing, callback) {
		return this.is(':animated') || this.stop().animate({left: parseFloat(pos)}, speed, easing, callback);
	};

	$.fn.unslider = function(options) {
	
		//  Set the options
		var o = $.extend({
					activeClass: 'active',
					arrows: true,
					autoplay: false,
					
					//  Speeds + timing
					speed: 500,
					delay: 3000,
					
					easing: 'swing',
					
					//  Callbacks
					afterSlide: function() {}
				}, options),
			c = 'cloned',
			a = 'unslider-arrows',
			s = this;
	
		//  And loop every instance of the Unslider
		return s.each(function() {
			var me = $(this).addClass('unslider'),
				list = me.children('ul'),
				items = list.children('li'),
				first = items.first(),
				
				itemCount = items.length + 2, //  Don't forget our clones!
				
				width = me.width(),
				height = first.height(),
				
				setActive = function(el) { el.addClass(o.activeClass).siblings().removeClass(o.activeClass); };
				
			//  Check we have two or more items (the itemCount adds two)
			if(itemCount >= 4) {
	
				//  Append the first and last items
				first.addClass(o.activeClass).clone().attr('class', c).appendTo(list);	
				items.last().clone().addClass(c).prependTo(list);	
				
				//  Set the width to stop wrapping, and since we have a clone, position it offscreen
				list.css({width: width * itemCount, left: -width});
				
				//  Get the arrows, if they want 'em.
				if(o.arrows) {
					$('<p class="' + a + '"><span class="arrow previous" /><span class="arrow next" /></p>').appendTo(me.parent()).find('.arrow').each(function() {
						
						var me = $(this), dir = me.attr('class').split(' ')[1],
							arrows = {previous: '&larr;', next: '&rarr;'};
						
						me.attr('title', 'Click to show the ' + dir + ' slide').html(arrows[dir]);
						
					}).click(function() {
						
						var me = $(this),
							dir = me.attr('class').split(' ')[1],
							
							current = items.filter('.' + o.activeClass),
							margin = parseFloat(list.css('left')),
							
							actions = {
								previous: function() {
								
									var first = current.prev().hasClass(c),
										prev = first ? items.eq(-1) : current.prev();
										
									setActive(prev);
									
									return list.moveUnslider(margin + width, o.speed, o.easing, function() {
									
										if(parseFloat(list.css('left')) >= 0) {
											list.css('left', -(width * (itemCount - 2)));
										
											//  Reset the margin so we can recalculate properly
											margin = parseFloat(list.css('left'));
										}
									
										if($.isFunction(o.afterSlide)) {
											o.afterSlide.call(this);
										}
									});
								},
								next: function() {
								
									var last = current.next().hasClass(c),
										next = last ? items.eq(0) : current.next();
								
									setActive(next);
								
									return list.moveUnslider(margin - width, o.speed, o.easing, function() {
										
										last && list.css('left', -width);

										if($.isFunction(o.afterSlide)) {
											o.afterSlide.call(this);
										}
									});
								}
							};
							
						//  Run the action, based on the class of the link. Genius.
						if(actions[dir]) {
							actions[dir]();
						}
					});
					
					$(d).keyup(function(e) {
						var keys = {37: 'previous', 39: 'next'};
						
						if(keys[e.which]) {
							$('.' + a + ' .' + keys[e.which]).click();
						}
					});
				}
				
				//  Add touch support
				if($.jQswipe) {
					s.bind('swipe', function() { $('.' + a + ' .next').click(); });
				}
				
				//  Autoplay
				if(o.autoplay) {
					var cont = function() { $('.' + a + ' .next').click(); },
						auto = setInterval(cont, o.delay);
				
					//  Turn off (and back on) on hover.
					me.hover(function() {
						clearInterval(auto);
					}, function() {
						auto = setInterval(cont, o.delay);
					});
				}
			}
		});
	};

})(jQuery, document);