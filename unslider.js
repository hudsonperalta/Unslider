/**
 *  Unslider 0.1
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
	$.fn.moveUnslider = function(pos, speed, callback) {
		return this.stop().animate({marginLeft: parseFloat(pos)}, speed, callback);
	};

	$.fn.unslider = function(options) {
	
		//  Set the options
		var o = $.extend({
					activeClass: 'active',
					arrows: true, //  If false, just autoplay
					
					//  Speeds + timing
					speed: 250,
					delay: 2000,
					
					//  Callbacks
					afterSlide: function() {}
				}, options);
	
		//  And loop every instance of the Unslider
		return this.each(function() {
			var me = $(this).addClass('unslider'),
				list = me.children('ul'),
				items = list.children('li'),
				first = items.filter(':first'),
				
				itemCount = items.length + 2, //  Don't forget our clones!
				
				width = me.width(),
				height = first.height(),
				
				go = function() {
					
					var me = $(this),
						dir = me.attr('class').split(' ')[1],
						
						current = items.filter('.' + o.activeClass),
						margin = parseFloat(list.css('margin-left')),
						
						actions = {
							previous: function() {
							
								var first = current.prev().hasClass('cloned'),
									prev = first ? items.eq(-1) : current.prev();
									
								prev.addClass(o.activeClass).siblings().removeClass(o.activeClass);
								
								if(!first) {
									list.moveUnslider(margin + width, o.speed, o.afterSlide);
								} else {
									list.moveUnslider(-(width * (itemCount - 3)), o.speed, o.afterSlide);
								}
							},
							next: function() {
							
								var last = current.next().hasClass('cloned'),
									next = last ? items.eq(0) : current.next();
							
								next.addClass(o.activeClass).siblings().removeClass(o.activeClass);
							
								if(last) {
									setTimeout(function() {
										list.moveUnslider(-width, 0);
									}, o.speed);
								}
							
								return list.moveUnslider(margin - width, o.speed, o.afterSlide);
							}
						};
						
					//  Run the action, based on the class of the link. Genius.
					if(actions[dir]) {
						actions[dir]();
					}
				};
				
			//  Check we have two or more items (the itemCount adds two)
			if(itemCount > 4) {
	
				//  Append the first and last items
				first.addClass(o.activeClass).clone().attr('class', 'cloned').appendTo(list);	
				items.filter(':last').clone().addClass('cloned').prependTo(list);	
				
				//  Set the width to stop wrapping, and since we have a clone, position it offscreen
				list.css({width: width * itemCount, marginLeft: -width});
				
				//  Get the arrows, if they want 'em.
				if(o.arrows) {
					$('<p class="unslider-arrows"><span class="arrow previous" /><span class="arrow next" /></p>').appendTo(me.parent()).find('.arrow').each(function() {
						
						var me = $(this), dir = me.attr('class').split(' ')[1],
							msg = 'Click to show the ? slide'.replace('?', dir),
							arrows = {previous: '&laquo;', next: '&raquo;'};
						
						me.attr('title', msg).html(arrows[dir]);
						
					}).click(go);
					
					$(d).keyup(function(e) {
						var key = e.which,
							keys = {37: 'previous', 39: 'next'};
						
						if(keys[key]) {
							$('.unslider-arrows .' + keys[key]).click();
						}
					});
				}
				
			}
		});
	};

})(jQuery, document);