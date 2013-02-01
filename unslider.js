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
		
		//  Set up Unslider's element
		init: function(el) {
			this.el = el;
			this.items = el.find('li');
		}
	};
})(window.jQuery, false);