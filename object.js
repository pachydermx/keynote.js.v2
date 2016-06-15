// object is basic type of component
function object(id, meta, auto_reset) {
    // properties
    this.id = id;
    // check id
    if (id.indexOf(' ') >= 0){
        console.error("Error: Space in object ID");
    }
    this.states = [];
    this.meta = meta;
    if (typeof auto_reset !== "undefined") {
        this.auto_reset = auto_reset;
    } else {
        this.auto_reset = true;
    }
	this.mod = undefined;
	this.state = 0;
	this.exiting = false;
	this.default_class = undefined;
	
    var dom_obj, width, height, default_exit_location, content,  z_index, image_scale_mode, angle;
    
}

object.prototype.default_easing = "linear";

/* Basic */
object.prototype.parameters = ['x_percent', 'x_delta', 'y_percent', 'y_delta', 'alpha', 'width_percent', 'width_delta', 'height_percent', 'height_delta', 'angle', 'easing'];

// init object
object.prototype.init = function (selector, content, class_name) {
    if (typeof class_name === "undefined") {
        class_name = "object";
    }
    this.content = content;
    $(selector).append(getDiv('obj_' + this.id, class_name, content));
    // get info
    this.dom_obj = $("#obj_" + this.id);
	// save default class
	this.default_class = this.dom_obj.attr("class");
    this.refresh();
    // reset to default position
    if (this.states.length > 0) {
		this.moveToState(0, 0);
    }
};

// init with image
object.prototype.init_with_image = function (selector, image) {
    // init basic structures
    this.init(selector, 'image', "object image_object");
    // set background
    this.dom_obj.css('background-image', 'url(' + image + ')');
	// save default class
	this.default_class = this.dom_obj.attr("class");
    // set size
    this.refresh();
};

// init from DOM object
object.prototype.init_with_selector = function (object_selector, additional_class) {
	if (typeof additional_class !== "undefined") {
		$(object_selector).addClass("object " + additional_class);
	} else {
		$(object_selector).addClass("object");
	}
    this.dom_obj = $(object_selector);
	// save default class
	this.default_class = this.dom_obj.attr("class");
    this.refresh();
    // reset to default position
    if (this.states.length > 0) {
        var pos = this.states[0];
        this.to(pos, 0);
    }
};

// set size
object.prototype.set_size = function (width_percent, width_delta, height_percent, height_delta) {
    // add size
    this.width_percent = width_percent;
    this.width_delta = width_delta;
    this.height_percent = height_percent;
    this.height_delta = height_delta;
};

// set z-index
object.prototype.set_z_index = function (index) {
    this.z_index = index;
	if(typeof this.dom_obj !== "undefined"){
		this.dom_obj.css("z-index", index);
	}
};

// set image scale mode
object.prototype.set_image_scale_mode = function (mode) {
    this.image_scale_mode = mode;
};

// set content
object.prototype.set_content = function (code) {
    // assign code
    this.dom_obj.html(code);
    // release size
    this.dom_obj.css("width", "");
    this.dom_obj.css("height", "");
    // refresh
    this.refresh();
}

// reset size
object.prototype.refresh = function () {
    // reset size
    this.width = this.dom_obj.width();
    this.height = this.dom_obj.height();
	
	this.dom_obj.finish();
	this.moveToState(this.state, 0);
    // set z-index
    if (typeof this.z_index !== "undefined") {
        this.dom_obj.css('z-index', this.z_index);
    }
    // set image scale mode
    if (typeof this.image_scale_mode !== "undefined") {
        this.dom_obj.css('background-size', this.image_scale_mode);
    }
};

/* State Config */

// add position
object.prototype.add_state = function (x_percent, x_delta, y_percent, y_delta, alpha) {
    this.states.push({'x_percent': x_percent,
                         'x_delta': x_delta,
                         'y_percent': y_percent,
                         'y_delta': y_delta,
                         'alpha': alpha,
					 	 'mod': []
					 });
};



// accepts multi-line expansion at the same time
object.prototype.add_optional_info = function (index, body, mod_id) {
	//find length
	var length = 1;
	for (var i in body){
		if (typeof body[i] == "object") {
			if (body[i].length > length) {
				length = body[i].length;
			}
		}
	}
	// expand
	var results = [];
	for (var i = 0; i < length; i++){
		var result = {};
		for (var j in body) {
			if (typeof body[j] == "object") {
				result[j] = body[j][i];
			} else {
				result[j] = body[j];
			}
		}
		results.push(result);
	}
	// execute
	for (var i in results){
		if (typeof index == "object") {
			for (var j in index) {
				if (index.length == length) {
					this.apply_change(index[j], results[j], mod_id);
				} else {
					this.apply_change(index[j], results[i], mod_id);
				}
			}
		} else {
			this.apply_change(index, results[i], mod_id);
		}
	}
};

// add optional info
object.prototype.apply_change = function (state_id, optional_info, mod_id){
    var i;
    for (i in optional_info) {
		// add mod info
		if (typeof mod_id !== "undefined"){
			// if mod exist then push, else create
			while (typeof this.states[state_id].mod[mod_id] == "undefined"){
				this.states[state_id].mod.push({});
			}
			this.states[state_id].mod[mod_id][i] = optional_info[i];
		// add normal info
		} else {
			this.states[state_id][i] = optional_info[i];
		}
    }
};

// add position
object.prototype.change_position = function (state_id, x_percent, x_delta, y_percent, y_delta, alpha, mod_id) {
	this.add_optional_info(state_id, {'x_percent': x_percent, 
									  'x_delta': x_delta, 
									  'y_percent': y_percent, 
									  'y_delta': y_delta,
									  'alpha': alpha},
						   mod_id);
};

// add size transform
object.prototype.add_size_transform = function (state_id, width_percent, width_delta, height_percent, height_delta, mod_id) {
	this.add_optional_info(state_id, {'width_percent': width_percent, 'width_delta': width_delta, 'height_percent': height_percent, 'height_delta': height_delta}, mod_id);
};

// add rotate transform
object.prototype.add_rotate_transform = function (state_id, angle, mod_id) {
		this.add_optional_info(state_id, {'angle': angle}, mod_id);
};

// add easing
object.prototype.add_easing = function (state_id, easing, mod_id) {
    this.add_optional_info(state_id, {'easing': easing}, mod_id);
};

// add complete callback
object.prototype.add_callback = function (state_id, function_flag, func) {
	if (function_flag === "complete"){
		this.add_optional_info(state_id, {"func_complete" : func});
	} else {
		console.error("ERROR: Unknown Function Slot");
	}
};

// 2.0
// anchor
object.prototype.anchors = {
	"center": [50, 0, 50, 0]
};

object.prototype.sizes = {
	"fullscreen": [100, 0, 100, 0]
}

// state

object.prototype.newState = function(matrix){
	var target = {};
	// get position
	try {
		target.position = this.checkMatrixPosition(matrix);
	} catch(err) {
		console.error(err);
		return undefined;
	}
	// get alpha
	try {
		target.alpha = this.checkMatrixAlpha(matrix);
	} catch (err) {
		console.error(err);
		return undefined;
	}
	// get size
	try {
		target.size = this.checkMatrixSize(matrix);
	} catch(err) {
		console.error(err);
	}
	// get rotate
	try {
		target.rotate = this.checkMatrixRotate(matrix);
	} catch (err){
		console.error(err);
	}
	// get easing
	try {
		target.easing = this.checkMatrixEasing(matrix);
	} catch (err) {
		console.error(err);
	}

	// create state
	var newStateIndex = this.states.push({'x_percent': target.position[0],
		'x_delta': target.position[1],
		'y_percent': target.position[2],
		'y_delta': target.position[3],
		'alpha': target.alpha,
		'mod': {}
	}) - 1;

	// optional
	if (typeof target.size !== "undefined"){
		this.states[newStateIndex].width_percent = target.size[0];
		this.states[newStateIndex].width_delta = target.size[1];
		this.states[newStateIndex].height_percent = target.size[2];
		this.states[newStateIndex].height_delta = target.size[3];
	}

	if (typeof target.rotate !== "undefined"){
		this.states[newStateIndex].angle = target.rotate;
	}

	if (typeof target.easing !== "undefined"){
		this.states[newStateIndex].easing = target.easing;
	}

	return target;
};

// check matrix.position
object.prototype.checkMatrixPosition = function(matrix){
	if (typeof matrix.position === "undefined"){
		throw "matrix.position is not exist";
		return undefined;
	} else {
		if (typeof matrix.position.length === "undefined"){
			throw "matrix.position is not an array";
			return undefined;
		} else {
			// matrix is array or string
			if (typeof matrix.position === "string"){
				if (typeof object.prototype.anchors[matrix.position] === "undefined"){
                    throw "the anchor of matrix.position is not exist"
                    return undefined;
                } else {
					return object.prototype.anchors[matrix.position];
				}
			} else if (matrix.position.length == 4){
				return matrix.position;
			} else {
				throw "matrix.position contains elements rather than 4";
				return undefined;
			}
		}
	}
}

// check matrix.size
object.prototype.checkMatrixSize = function(matrix) {
	if (typeof matrix.size !== "undefined"){
		if (typeof matrix.size.length !== "undefined"){
			if (typeof matrix.size === "string"){
				if (typeof object.prototype.sizes[matrix.size] !== "undefined"){
					return object.prototype.sizes[matrix.size];
				} else {
					throw "the size name of matrix.size does not exist";
					return undefined;
				}
			} else {
				if (matrix.size.length == 4) {
					return matrix.size;
				} else {
					throw "matrix.size contains elements rather than 4";
					return undefined;
				}
			}
		} else {
			throw "matrix.size is not an array";
		}
	} else {
		return undefined;
	}
}

// check matrix.alpha
object.prototype.checkMatrixAlpha = function(matrix){
	if (typeof matrix.alpha !== "undefined"){
		if (typeof matrix.alpha === "number"){
			if (matrix.alpha >= 0 && matrix.alpha <= 1){
				return matrix.alpha;
			} else {
				throw "matrix.alpha is not between 0 and 1";
				return undefined;
			}
		} else {
			throw "matrix.alpha is not a number";
			return undefined;
		}
	} else {
		throw "matrix.alpha does not exist";
		return undefined;
	}
}

// check matrix.rotate
object.prototype.checkMatrixRotate = function(matrix){
	if (typeof matrix.rotate !== "undefined"){
		if (typeof matrix.rotate === "number"){
			return matrix.rotate;
		} else {
			throw "matrix.rotate is not a number";
			return undefined;
		}
	} else {
		return undefined;
	}
}

// check matrix.mod
object.prototype.checkMatrixMod = function(matrix){
	if (typeof manager.mods === "undefined"){
		throw "manager does not exist";
		return undefined;
	}
	if (typeof matrix.mod !== "undefined"){
		if (typeof matrix.mod === "number"){
			if (matrix.mod >= 0 && matrix.mod < manager.mods.length){
				return matrix.mod;
			} else {
				throw "matrix.mod is not correct";
			}
		} else if (typeof matrix.mod === "string"){
			var index = manager.mods.indexOf(matrix.mod);
			if (index >= 0){
				return matrix.mod;
			} else {
				throw "matrix.mod does not exist in manager.mods"
				return undefined;
			}
		} else {
			throw "matrix.mod is not number or string";
			return undefined;
		}
	} else {
		return undefined;
	}
}

// check easing
object.prototype.checkMatrixEasing = function(matrix){
	if (typeof matrix.easing !== "undefined"){
		return matrix.easing;
	} else {
		return undefined;
	}
}

/* Performance */

// to state
object.prototype.to = function (target, duration, callback, delegate) {
	
	var target_final;
	if (typeof target.final === "undefined"){
		target_final = this.getFinalState(target);
	} else {
		target_final = target;
	}
	
    // check if optional data exist
    var actual_size = {};
    // check size
    if (typeof target_final.width_percent !== "undefined") {
        actual_size.width = this.meta.width * target_final.width_percent / 100 + target_final.width_delta;
        actual_size.height = this.meta.height * target_final.height_percent / 100 + target_final.height_delta;
    } else {
        actual_size.width = this.width;
        actual_size.height = this.height;
    }
		
    // calc correct position
    var actual_x = this.meta.width * (target_final.x_percent / 100) - actual_size.width / 2 + target_final.x_delta;
    var actual_y = this.meta.height * (target_final.y_percent / 100) - actual_size.height / 2 + target_final.y_delta;
	
	// perform with animation
    if (duration !== undefined && duration > 0) {
		// assign current object to temp var
		var that = this;
        this.dom_obj.animate({
            'left' : actual_x,
            'top' : actual_y,
            'width' : actual_size.width,
            'height' : actual_size.height,
            'opacity' : target_final.alpha,
            'rotate': target_final.angle
        }, {duration: duration,
            easing: target_final.easing,
            complete: function () {
				
				
				// check if object ready
				if (typeof that.state !== "undefined") {
					// run callback if function exist
					if ("func_complete" in that.states[that.state]){
						that.states[that.state].func_complete();
					}
					// check if delegate func exist
					if (typeof delegate !== "undefined"){
						delegate.object_complete(that);
					}
					// run callback in parameter
					if (typeof callback !== "undefined") {
						callback();
					}
				}
				
				
				
			}
            });
    } else {
        // perform without animation
        this.dom_obj.css("left", actual_x);
        this.dom_obj.css("top", actual_y);
        this.dom_obj.css("opacity", target_final.alpha);
        this.dom_obj.css("width", actual_size.width);
        this.dom_obj.css("height", actual_size.height);
        this.dom_obj.css("rotate", target_final.angle);
		// check if object ready
		if (typeof this.state !== "undefined") {
			// run callback if function exist
			if ("func_complete" in this.states[this.state]){
				this.states[this.state].func_complete();
			}
			// check if delegate func exist
			if (typeof delegate !== "undefined"){
				delegate.object_complete(this);
			}
			// run callback in parameter
			if (typeof callback !== "undefined") {
				callback();
			}
		}
    }
};

// move to a state
object.prototype.moveToState = function (state, duration, option) {
	// set option
	if (typeof option === "undefined"){
		option = {};
	}
	// update state
    this.state = state;
    // update state logger
    var the_state = this.states[state];
    // perform movement
	if (typeof option.additional_target === "undefined"){
		this.to(this.states[state], duration, option.callback, option.delegate);
	} else {
		this.to(option.additional_target, duration, option.callback, option.delegate);
	}
};

// exit
object.prototype.exit = function (duration, additional_target) {
	if (!this.exiting) {
		this.exiting = true;
		// determine destination
		var destination;

		if (typeof this.default_exit_location !== 'undefined') {
			destination = this.default_exit_location;
		} else {
			destination = 0;
		}
		// perform
		var that = this;
		// clear animate queue
		this.dom_obj.clearQueue();
		// play exiting animation
		this.moveToState(destination, duration, {
			"callback": function () {
							if (that.auto_reset) {
								that.moveToState(0, 0);
							}
							that.exiting = false;
						},
			"additional_target": additional_target
		});
	}
};

// get rollout target
object.prototype.getRolloutTarget = function (target, delta) {
	var target_final = this.getFinalState(target);
	target_final.y_percent += delta;
	return target_final;
};

// get ready to rollin
object.prototype.getReady = function (target, delta, callback) {
	var target_final = this.getFinalState(target);
	target_final.y_percent += delta;
	this.to(target_final, 0, callback);
};

/* Utility */
object.prototype.getFinalState = function(target) {
	// check if mod is enabled
	var mod_enabled;
	if (typeof this.mod !== "undefined" && typeof target.mod[this.mod] !== "undefined") {
		mod_enabled = true;
	} else {
		mod_enabled = false;
	}
	
	// build final target
	var target_final = {};
	// for each parameter
	for (var i in this.parameters) {
		var index = this.parameters[i];
		// find correct properties
		// if mod enabled
		if (mod_enabled) {
			// find if current property modded
			if (index in target.mod[this.mod]) {
				target_final[index] = target.mod[this.mod][index];
			} else {
				target_final[index] = target[index];
			}
		} else {
			target_final[index] = target[index];
		}
	}
	// clean
	if (typeof target_final.angle === "undefined") {
		target_final.angle = 0;
	}
	if (typeof target_final.easing === "undefined") {
		target_final.easing = this.default_easing;
	}
	target_final.final = true;
	return target_final;
}