# Unslider
### A jQuery slider that just slides.

If you want to have a quick, lightweight slider, with just the arrows and no fancy effects, then you'll love Unslider. Weighing in at 3kb uncompressed, and 1.6kb compressed, it's an incredibly lightweight solution.

## Features
* Slides a list
* Supports any HTML content (within a list item)
* Keyboard support

That's it!

## Quickstart
To begin using Unslider, just include the files, and create a `div` with an unordered list (`ul`) inside.

Pretty straightforward, and nice and semantic. Lovely. Now, we need a touch of CSS as well:
```css
.unslider { overflow: hidden; }
	.unslider li { float: left; }
```

_This is the same as the contents for unslider.css, so if you're including that file, don't add this CSS._

Now that it's all set up, you just need to call the `unslider` method, with any options. They're optional, though, so you don't need to 

```javascript
//  Vanilla install
$('#slider').unslider();

//  And any options
$('#slider').unslider({
    //  Options go here.
});
```

## Options
It's also got a few options:

```javascript
{
	activeClass: 'active',
	arrows: true, //  If false, just autoplay
	
	//  Speeds + timing
	speed: 250,
	delay: 2000,
	
	//  Callbacks
	afterSlide: function() {} //  Called after a slide has occured.
}
```