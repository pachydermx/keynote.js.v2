// page is a status of an array of objects
function page(name, manager) {
    this.name = name;
    this.manager = manager;
    this.objects = [];
    this.timers = [];
	this.callbacks = {};
	this.counter = 0;
    this.default_duration = 1000;
}
    
// add object to page
page.prototype.add = function (obj, state, interval, duration) {
	this.objects.push({'object': obj,
					   'state': state,
					   'interval': interval,
					  'duration': duration});
};

// reset positions
page.prototype.refresh = function () {
	var i;
	for (i in this.objects) {
		var the_object = this.objects[i].object;
		the_object.refresh();
	}
};

// play page
page.prototype.play = function (last_page_objects, type) {
	// play the page
	switch (type) {
		case "rollin":
			this.rollin(last_page_objects, -100);
			break;
		default:
			this.normal_play();
	}
	// callback
	if (typeof this.callbacks.play !== "undefined")	{
		this.callbacks.play();
	}
}


page.prototype.normal_play = function () {
	var i;
	for (i in this.objects) {
		var the_object = this.objects[i];
		/*
		// reset to original state
		if (the_object.object.auto_reset) {
			the_object.delegate = undefined;
			the_object.object.moveToState(0, 0);
		}
		*/
		// perform
		this.fire(the_object);
	}
};

// create timeout event
page.prototype.fire = function (obj){
	// set delegate
	obj.object.delegate = this;
	// set counter
	this.counter++;
	// set timer 
	var that = this;
	this.timers.push(setTimeout(function(){
		obj.object.moveToState(obj.state, obj.duration, {"delegate": that});
	}, obj.interval));
};

// roll 
page.prototype.rollin = function(last_page_objects, delta){
	// get unique objects
	var object_list = this.getFinalState();
	// remove objects exist in last page
	object_list = this.substractItemsFromStateList(object_list, last_page_objects);
	// play
	for (var i in object_list){
		// get ready
		var obj = {};
		obj.object = object_list[i].object;
		obj.state = object_list[i].state;
		obj.duration = 1000;
		obj.interval = 0;
		obj.object.getReady(obj.object.states[obj.state], delta);
		
		// play
		this.fire(obj);
	}
}

// clear timeout events
page.prototype.clear = function(){
	// reset delegates
	for (i in this.objects) {
		var the_object = this.objects[i];
		// reset its delegate
		the_object.object.delegate = undefined;
	}
	// clear timers
	while(this.timers.length > 0){
		clearTimeout(this.timers.pop());
	}
	// reset counter
	this.counter = 0;
};

// exit page
page.prototype.exit = function (new_page_objects, type){
	switch (type) {
		case "rollout":
			this.rollout(new_page_objects);
			break;
		default:
			this.normal_exit(new_page_objects);
	}
}

page.prototype.normal_exit = function (new_page_objects) {
	if (typeof new_page_objects !== 'undefined') {
		// clear timers
		this.clear();
		// get exit object list
		var exit_objects = this.getAbandonedObjectList(new_page_objects);
		// exit elements
		for (i in exit_objects) {
			the_object = exit_objects[i];
			the_object.exit(this.default_duration);
		}
	}
};

page.prototype.rollout = function (new_page_objects) {
	if (typeof new_page_objects !== 'undefined') {
		// clear timers
		this.clear();
		// get exit object list
		var exit_objects = this.getAbandonedObjectList(new_page_objects);
		// exit elements
		for (i in exit_objects) {
			the_object = exit_objects[i];
			// TODO: set exit time
			the_object.exit(1300, the_object.getRolloutTarget(the_object.states[the_object.state], 100));
		}
	}
};

/* Utility */
page.prototype.getFinalState = function () {
	var visited = [];
	for (var i in this.objects){
		var index = this.objIndexOf(visited, this.objects[i].object);
		// if not exist, push
		if (index < 0){
			visited.push(this.objects[i]);
		// else replace
		} else {
			visited[index] = this.objects[i];
		}
	}
	return visited;
};

page.prototype.objIndexOf = function (list, object) {
	var result = -1;
	for (var i in list){
		if (object == list[i].object){
			result = i;
		}
	}
	return result;
};

page.prototype.getAbandonedObjectList = function (from){
	// substract objects list
	var objects = [], to_remove = [], i;
	for (i in this.objects) {
		objects.push(this.objects[i].object);
	}
	for (i in from) {
		to_remove.push(from[i].object);
	}
	// substract elements in last page from current page
	var exit_objects = [], i, the_object;
	exit_objects = $.grep(objects, function(value) {
		return $.inArray(value, to_remove) < 0;
	});
	return exit_objects;
};

page.prototype.substractItemsFromStateList = function(from, sub_list) {
	// copy from
	var work_list = [];
	for (var i in from) {
		work_list.push(from[i]);
	}
	// substract
	for (var i in sub_list) {
		// get index of item in sub_list of work_list
		var index = this.objIndexOf(work_list, sub_list[i].object);
		// when item in sublist also exists in work_list
		if (index > 0) {
			// remove item when state id not the same
			if (work_list[index].state === sub_list[i].state){
				work_list.splice(index, 1);
			}
		}
	}
	return work_list;
};

/* Callback */

// receive complete call from objects
page.prototype.object_complete = function (obj){
	// set counter
	this.counter--;
	// check if empty
	if (this.counter == 0 && typeof this.callbacks.animation_complete !== "undefined"){
		this.callbacks.animation_complete();
	}
};

// add callback
page.prototype.add_callback = function (function_flag, func){
	switch(function_flag){
		case "animation_complete":
			this.callbacks.animation_complete = func;
			break;
		case "play":
			this.callbacks.play = func;
			break;
		default:
			console.error("ERROR: Unknown function flag");
	}
};
