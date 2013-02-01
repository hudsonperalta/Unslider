/**
 *   Unslider by @idiot
 */
 
(function($, f) {
	//  If there's no jQuery, Unslider can't work, so kill the operation.
	if(!$) return f;
	
	var Unslider = {
		//  Set up the elements
		el: f,
		items: f,
		sizes: [],
		
		//  Default options
		opts: ['auto', 'keys', 'arrows', 'thumbs'],
		
		//  Set up Unslider's element
		init: function(el, opts) {
			this.el = el;
			this.items = el.find('li').each(this.calculate);
			
			//  Check whether we're passing any options in to Unslider
			if(opts && $.isArray(opts)) {
				this.opts = opts;
			}
			
			return this;
		},
		
		//  Get the width for an element
		//  Pass a jQuery element as the context with .call(), and the index as a parameter: Unslider.calculate.call($('li:first'), 0)
		calculate: function(index) {
			//  Add it to the sizes list
			Unslider.sizes[index] = [this.outerWidth(), this.outerheight()];
		}
	};
	
	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		//  Enable multiple-slider support
		return this.each(function() {
			//  Cache a copy of $(this), so it 
			var me = $(this);
			
			//  Invoke an Unslider instance
			me.data('unslider', new Unslider(me, o));
		});
	};
})(window.jQuery, false);