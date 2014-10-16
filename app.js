
var stylesheet_data = [];
var dynamic_elements = [];

/* Everything is in this Extended CSS (XCSS) object */
var XCSS = {
	load: function (path) {

		/* Append the stylesheet into the header so all non-custom CSS is handled */
		$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', path));

		/* Add the handler for catching window resizes */
		$( window ).resize(function() {
			XCSS.resized();
		});

		/* Get the contents of the specified CSS file, and use CSSJSON to change the CSS to JSON */
		/* JSON is then loaded into an array, so we can load in multiple stylesheets if need be */
		/* TODO: Try and get away from the CSSJSON third-party library */
		$.get( path , function( data ) {
			stylesheet_data.push(CSSJSON.toJSON(data, true));
			XCSS.parse();
		});
	},

	/* Re-run the parse again to recalculate changes */
	/* TODO: Try and get away from reading the entire stylesheets again, as this could get slower with larger stylesheets */
	resized: function() {
		XCSS.parse('on_resize');
	},

	/* Read in all the loaded stylesheets and try and find the custom selectors */
	parse: function (task) {

		/* What task is being run? Fallback to init if none chosen */
		var task_str = (task ? task : 'init');

		/* Each stylesheet loaded */
		for (var a in stylesheet_data) {
			var stylesheet = stylesheet_data[a];

			/* Each selector in the stylesheet */
			for(var b in stylesheet.children) {

				var current_selector = b;
				var selectors = stylesheet.children[b];

				/* Each property in the parent selector */
				for(var c in selectors.attributes) {

					var key = c; //The property name
					var args = selectors.attributes[c].trim().split(' '); //Trim and split the values by spaces

					//Check to see if a function exists for this property */
					if (XCSS.properties[key] != null ) {

						/* Load the task function into a variable using the evil eval() */
						var task_function = eval('XCSS.properties["' + key + '"]["' + task_str + '"]'); 
						
						/* Check to see if we have a task function defined for this property */
						/* EG, check if init() or on_resize() exists */
						if($.isFunction(task_function)) {

							/* Function exists, we'll run it on each matching selector */
							$(current_selector).each(function() {

								/* Task function does exist, use the designated variable for dynamic fucntion access */
								var result = task_function($(this), args);

								/* If the task returns true, we need to re-run the init() again */
								if(result) {
									XCSS.properties[key]['init']($(this), args);
								}
							});
							
						}
					} else {
						/* We don't have a handler for this, remove it from the JSON to avoid having to check again */
						delete selectors.attributes[c];
					}
				}

				/* Does this attribute have any properties left in it? Or is it Empty? */
				if(!Object.keys(selectors.attributes).length) {
					console.log('[XCSS] Disposing of "' + current_selector + '" as it has no dynamic properties.');
					/* It is empty, we had better remove it to avoid processing it again */
					delete stylesheet.children[current_selector];
				}

			}

		}

	},


	/* All your new custom CSS properties can go here */
	properties: {

		'font-family': {
			init: function(node, args) {
				$(node).css('color', "green");
			}
		},

		'align-sets': {
			init: function(node, args) {

			}
		},

		'benIsCool': {
			init: function(node, args) {
				$(node).css('color', args[0]);
				$(node).css('padding-left', '40px');
			}
		},

		'max-top' : {
			init: function(node, args) {
				if($(node).offset().top < args[0]) {
					$(node).css('top', args[0]);
				}
			},

			on_resize: function(node, args) {
				return true; //Return true here to run init again
			}
		},

		'alignTest': {
			init: function(node, args) {
				switch(args[0]) {
					case 'top':
						$(node).css('padding-top', 0);
					break;

					case 'middle':
						$(node).css('padding-top', ($(window).height() / 2) - ($(node).height()));
					break;

					case 'bottom': 
						$(node).css('padding-top', $(window).height() - ($(node).height()));
					break;
				}
			},

			on_resize: function(node, args) {
				return true; //Return true here to run init again
			}
		}

	}

		
}

/* Initialise */
$(function() {
	XCSS.load( 'style.css' );
});

