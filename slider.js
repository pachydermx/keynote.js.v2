// slider
function slider(manager){
	this.manager = manager;
	this.pages_id = [];
	this.current_page_id = undefined;
	this.playing = false;
	this.intro_page = undefined;
	this.callback = undefined;
}

// add slider page
slider.prototype.add = function (page){
	// get page id from manager
	var page_id = this.manager.pages.indexOf(page);
	// reserve the page id
	this.pages_id.push(page_id);
	// add tab before name of the page
	page.name = " ⇢ "+page.name;
};

// set intro page
slider.prototype.set_intro = function (page){
	this.intro_page = this.manager.pages.indexOf(page);
	page.name = " ► " + page.name;
};

// init slider
slider.prototype.init = function () {
	// assign manager callback
	var that = this;
	this.manager.add_callback("gotopage", function(id) {
		that.filter(id);
	});
	// reset start point
	this.current_page_id = this.pages_id.length - 1;
	// assign intro
	if (typeof this.intro_page !== "undefined") {
		var that = this;
		// add callback function to intro page to make it runs
		this.manager.pages[this.intro_page].add_callback("animation_complete", function () {
			that.manager.goto_page(that.pages_id[0]);
		});
	}
}

// start filter
slider.prototype.filter = function (page_id) {
	// jump to slider page
	if (this.pages_id.indexOf(Number(page_id)) != -1) {
		this.start();
	// things else
	} else {
		this.stop();
	}
}

// start slider
slider.prototype.start = function () {
	if (this.pages_id.length <= 0){
		console.log("ERROR: No page in slider");
		return false;
	} else if (this.playing) {
		return true;
	} else {
		// init properties
		this.playing = true;
		// set callbacks
		for (var i in this.pages_id){
			var the_page = this.manager.pages[this.pages_id[i]];
			// assign callbacks
			var that = this;
			the_page.add_callback("animation_complete", function(){
				that.next();
			});
		}
		this.next();
		return true;
	}
};

// next slider
slider.prototype.next = function () {
	if (this.playing) {
		// set next id
		if (this.current_page_id < this.pages_id.length - 1) {
			this.current_page_id++;
		} else {
			this.current_page_id = 0;
		}
		// perform	
		this.manager.goto_page(this.pages_id[this.current_page_id]);
		// callback
		if (typeof this.callback !== "undefined") {
			this.callback(this.current_page_id);
		}
		return true;
	} else {
		console.log("Warning: Slider is not playing");
		return false;
	}
};

// stop slider
slider.prototype.stop = function () {
	// reset properties
	this.playing = false;
	this.current_page_id = 0;
	// clear callbacks
	for (var i in this.pages_id){
		var the_page = this.manager.pages[this.pages_id[i]];
		// delete callbacks
		delete the_page.callbacks.animation_complete;
	}
	return true;
};