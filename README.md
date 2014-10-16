XCSS - Extended CSS
====

This is a little class to help create custom CSS properties and allow jQuery to control their behaviour.

----------

	properties: {

		//Create a custom 'align-sets' property
		'align-sets': {
			init: function(node, args) {
				//init runs on page load
			},
			
			on_resize: function(node, args) {
				//on_resize runs on page resize
				//Return true to run init() again
				return true;
			}
		},

		//extend the existing 'font-family' property
    	'font-family': {
			init: function(node, args) {
				$(node).css('color', args[0]); //Set a font's color too
			}
		}
		
	}
