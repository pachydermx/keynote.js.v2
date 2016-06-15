function editor_inspector (manager) {
    this.manager = manager;
    this.dom = {};
}
// set editor_inspector as a sub class of inspector
editor_inspector.prototype = new inspector();

/* Part 0 - Initial Function */

// init editor inspector
editor_inspector.prototype.enable_editor = function (objects) {
    // configure
    this.editor = true;
    // assign objects
    this.dom = {
        'object_list': $('#object_list'),
        'object_id': $("#object_id"),
        'object_name': $("#object_name_input"),
        'object_auto_reset': $("#auto_reset_input"),
        'object_z_index': $("#z_index_input"),
        'object_code': $("#object_code_input"),
        'object_create_text': $("#new_text_obj"),
        'object_create_image': $("#new_image_obj"),
        'object_create_code': $("#new_code_obj"),
        'object_confirm': $("#confirm_object_changes"),
        'object_refreh': $("#refresh_object_list"),
        'object_delete': $("#delete_object"),
        'state_list': $("#object_state_list"),
        'state_id': $("#state_id"),
        'state_x_percent': $("#x_percent_input"),
        'state_x_delta': $("#x_delta_input"),
        'state_y_percent': $("#y_percent_input"),
        'state_y_delta': $("#y_delta_input"),
        'state_alpha': $("#alpha_input"),
		'state_size_panel': $("#size_panel"),
        'state_size': $("#size_enabled_input"),
        'state_size_width_percent': $("#width_percent_input"),
        'state_size_width_delta': $("#width_delta_input"),
        'state_size_height_percent': $("#height_percent_input"),
        'state_size_height_delta': $("#height_delta_input"),
		'state_rotate_panel': $("#rotate_panel"),
        'state_rotate': $("#rotate_enabled_input"),
        'state_rotate_angle': $("#angle_input"),
		'state_easing_panel': $("#easing_panel"),
        'state_easing': $("#easing_enabled_input"),
        'state_easing_type': $("#easing_input"),
        'state_create': $("#new_state"),
        'state_confirm': $("#confirm_state_changes"),
        'state_delete': $("#delete_state"),
        'page_list': $("#page_list"),
        'page_id': $("#page_id"),
        'page_name': $("#page_name_input"),
        'page_create': $("#new_page"),
        'page_confirm': $("#confirm_page_changes"),
        'page_delete': $("#delete_page"),
        'page_state_list': $("#page_state_list"),
        'page_state_id': $("#page_state_id"),
        'page_state_object': $("#object_selector"),
        'page_state_state': $("#object_state_select"),
        'page_state_interval': $("#object_interval_input"),
        'page_state_duration': $("#object_duration_input"),
        'page_state_create': $("#confirm_page_state_insert"),
        'page_state_confirm': $("#confirm_page_state_changes"),
        'page_state_delete': $("#delete_page_state")
    }
    // assign $objects
    this.page_list = $("#page_list");
    this.object_viewer_list = $("#object_viewer_list");
    this.object_state_list = $("#object_state_list");
    this.object_info_list = $("#object_info_list");
    this.object_list = $("#object_list");
    this.object_state_select = $("#object_state_select");
    this.objects = objects;
}


/* Part I - General Library */

// clear form
// clear value in all input elements, disable these inputs
editor_inspector.prototype.clear_form = function (selector, disable) {
    $(selector).find("input[type=range]").val(0);
    $(selector).find("input[type=text]").val("");
    $(selector).find("input[type=number]").val("");
    $(selector).find("input[type=checkbox]").prop("checked", false);
    $(selector).find("textarea").text("");
    if (disable) {
        this.set_panel_enable(selector, false);
    }
}

// enable / disable form
// enable or disable a form
editor_inspector.prototype.set_panel_enable = function (selector, enable){
    $(selector).find("input").prop("disabled", !enable);
    $(selector).find("textarea").prop("disabled", !enable);
}

// show message in state panel
editor_inspector.prototype.show_message = function (title, message, icon) {
    var target = $("#dialog_window");
    if (typeof icon !== "undefined") {
        var icon = "<span class='ui-icon ui-icon-" + icon + "'></span>";
    } else {
        var icon = "<span class='ui-icon ui-icon-info'></span>";
    }
    target.html(icon + message);
    target.dialog({
        resizable: false,
        modal: true,
        title: title,
        buttons: {
            "OK": function () {
                $(this).dialog("close");
            }
        }
    });
};

// override 
editor_inspector.prototype.highlight_object = function (object) {
    // highlight the object
    preview.$(".selected_object").removeClass("selected_object");
    if (typeof object !== "undefined") {
        object.dom_obj.addClass("selected_object");
    }
};



/* Part II - Panel Action */

/* Part II.A Objects Panel */

// refresh overall object list
editor_inspector.prototype.refresh_object_list = function () {
    // clear objects form
    this.clear_form("#objects_form", true);
    this.clear_form("#state_panel", true);
    // clear selection
    preview.$(".selected_object").removeClass("selected_object");
    // refresh object list
    this.refresh_list(this.dom.object_list, this.objects, "object_list_item_", "object_list_item", "property", "id", this.start_edit_object);
    // refresh object selector
    this.refresh_list(this.dom.page_state_object, this.objects, "", "", "object_select", "id");
    // clear states list
    this.dom.state_list.html("");
    // reload state list
    this.reload_object_state_selector();
};

// start editing object. 
// this event occurs after clicking items in object list
editor_inspector.prototype.start_edit_object = function (e) {
    // get basic information
    var object_id = $(this).attr("id").split('_')[3];
    var the_object = inspector.objects[object_id];
    var object_name = the_object.id;
    // set style
    inspector.highlight_selection("object_list", this);

    // print values to form
    // print id
    inspector.dom.object_id.val(object_id);
    preview.selected_object_index = object_id;
    // print name into input
    inspector.dom.object_name.val(object_name);
    // set auto reset
    inspector.dom.object_auto_reset.prop("checked", the_object.auto_reset); 
    // set z-index
    if (typeof the_object.z_index !== "undefined"){
        inspector.dom.object_z_index.val(the_object.z_index);
    } else {
		inspector.dom.object_z_index.val("");
	}
    // get code
    inspector.dom.object_code.text(the_object.dom_obj.html());

    // highlight object
    inspector.highlight_object(inspector.objects[object_id]);
    // refresh states list
    inspector.refresh_state_list(object_id);
    // enable edit
    inspector.set_panel_enable("#objects_form", true);
};

// confirm changes on object name
// this event occurs after clicking confirm button in object panel
editor_inspector.prototype.confirm_object_change = function (e) {
    // get object id
    var object_id = inspector.dom.object_id.val();
    // get new object info
    var new_name = inspector.dom.object_name.val();
    var new_auto_reset = inspector.dom.object_auto_reset.prop("checked");
    var new_z_index = inspector.dom.object_z_index.val();
    var new_code = inspector.dom.object_code.text();
    // check if object selected
    if (typeof this.objects[object_id] !== "undefined") {
        // assign object info
        this.objects[object_id].id = new_name;
        this.objects[object_id].auto_reset = new_auto_reset;
        if (!isNaN(parseInt(inspector.dom.object_z_index.val()))){
            this.objects[object_id].set_z_index(parseInt(inspector.dom.object_z_index.val()));
        }
        this.objects[object_id].set_content(inspector.dom.object_code.val());
        // refresh object list
        this.refresh_object_list();
    } else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }
};

// delete a object
editor_inspector.prototype.delete_object = function (e) {
    // get object id
    var object_id = inspector.dom.object_id.val();
    if (typeof this.objects[object_id] !== "undefined") {
        // delete dom obj
        this.objects[object_id].dom_obj.remove();
        // delete item from object list
        this.objects.splice(object_id, 1);
        // refresh object list
        this.refresh_object_list();
    } else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }

};



/* Part II.B States Panel */

// refresh object states list (editor)
editor_inspector.prototype.refresh_state_list = function (object_id) {
    if (typeof object_id === "undefined") {
        object_id = this.dom.object_id.val();
    }
    // reload list
    this.refresh_list(this.dom.state_list, this.objects[object_id].states, "object_state_list_item_", "object_state_list_item", "index", "State", this.start_edit_state);
};

// start editing state
// this event occurs after clicking items in state list
editor_inspector.prototype.start_edit_state = function (e) {
    // get basic information
    var object_id = inspector.dom.object_id.val();
    var the_object = inspector.objects[object_id];
    var state_id = $(this).attr("id").split('_')[4];
    var the_state = the_object.states[state_id];
    // move to current state
    inspector.switch_state(object_id, state_id);
    // set style
    inspector.highlight_selection("object_state_list", this);

    // print value to form
    inspector.dom.state_id.val(state_id);
    // print position
    inspector.dom.state_x_percent.val(the_state.x_percent);
    inspector.dom.state_x_delta.val(the_state.x_delta);
    inspector.dom.state_y_percent.val(the_state.y_percent);
    inspector.dom.state_y_delta.val(the_state.y_delta);
    // print alpha
    inspector.dom.state_alpha.val(the_state.alpha);
    // print size
    if (typeof the_state["width_percent"] !== "undefined") {
        // checkbox
        // open panel
		inspector.dom.state_size_panel.accordion("option", "active", 0);
		// check
        inspector.dom.state_size.prop("checked", true);
        // data
        inspector.dom.state_size_width_percent.val(the_state.width_percent);
        inspector.dom.state_size_width_delta.val(the_state.width_delta);
        inspector.dom.state_size_height_percent.val(the_state.height_percent);
        inspector.dom.state_size_height_delta.val(the_state.height_delta);
    } else {
		// close panel
		inspector.dom.state_size_panel.accordion("option", "active", false);
        inspector.dom.state_size.prop("checked", false);
    }
    // print rotate
    if (typeof the_state.angle !== "undefined") {
		// open panel
		inspector.dom.state_rotate_panel.accordion("option", "active", 0);
        // checkbox
        inspector.dom.state_rotate.prop("checked", true);
        // data
        inspector.dom.state_rotate_angle.val(the_state.angle);
    } else {
		// close panel
		inspector.dom.state_rotate_panel.accordion("option", "active", false);
        inspector.dom.state_rotate.prop("checked", false);
    }
    // print easing
    if (typeof the_state.easing !== "undefined") {
		// open panel
		inspector.dom.state_easing_panel.accordion("option", "active", 0);
        // checkbox
        inspector.dom.state_easing.prop("checked", true);
        $("#easing_input [value=" + the_state.easing +"]").prop("selected", "selected");
    } else {
		// close panel
		inspector.dom.state_easing_panel.accordion("option", "active", false);
        inspector.dom.state_easing.prop("checked", false);
    }
    // enable edit
    inspector.set_panel_enable("#state_panel", true);
};

// confirm changes on state
// this event occurs after clicking confirm button in state panel
editor_inspector.prototype.confirm_state_change = function (e) {
    // get basic info
    var object_id = inspector.dom.object_id.val();
    var state_id = inspector.dom.state_id.val();
    // get new state info
    var new_x_percent = parseInt(inspector.dom.state_x_percent.val());
	new_x_percent = isNaN(new_x_percent) ? 50 : new_x_percent;
    var new_x_delta = parseInt(inspector.dom.state_x_delta.val());
	new_x_delta = isNaN(new_x_delta) ? 0 : new_x_delta;
    var new_y_percent = parseInt(inspector.dom.state_y_percent.val());
	new_y_percent = isNaN(new_y_percent) ? 50 : new_x_percent;
    var new_y_delta = parseInt(inspector.dom.state_y_delta.val());
	new_y_delta = isNaN(new_y_delta) ? 50 : new_y_delta;
    var new_alpha = parseFloat(inspector.dom.state_alpha.val());
	new_alpha = isNaN(new_alpha) ? 1 : new_alpha;
    // error catch
	if (typeof this.objects[object_id] !== "undefined"){
		if (typeof this.objects[object_id].states[state_id] !== "undefined") {
			// assign object info
			// basic info
			var the_state = this.objects[object_id].states[state_id];
			the_state.x_percent = new_x_percent;
			the_state.x_delta = new_x_delta;
			the_state.y_percent = new_y_percent;
			the_state.y_delta = new_y_delta;
			the_state.alpha = new_alpha;
			// size info
			var new_width_percent, new_width_delta, new_height_percent, new_height_delta;
			if (inspector.dom.state_size.prop("checked")){
				// get data
				new_width_percent = parseInt(inspector.dom.state_size_width_percent.val());
				new_width_delta = parseInt(inspector.dom.state_size_width_delta.val());
				new_height_percent = parseInt(inspector.dom.state_size_height_percent.val());
				new_height_delta = parseInt(inspector.dom.state_size_height_delta.val());
				// assign
				the_state.width_percent = isNaN(new_width_percent) ? 10 : new_width_percent;
				the_state.width_delta = isNaN(new_width_delta) ? 0 : new_width_delta;
				the_state.height_percent = isNaN(new_height_percent) ? 10 : new_height_percent;
				the_state.height_delta = isNaN(new_height_delta) ? 0 : new_height_delta;
			} else {
				// Delete Optional Data
				delete the_state.width_percent;
				delete the_state.width_delta;
				delete the_state.height_percent;
				delete the_state.height_delta;
			}
			// rotate info
			var new_angle;
			if (inspector.dom.state_rotate.prop("checked")){
				// get data
				new_angle = parseInt(inspector.dom.state_rotate_angle.val());
				// assign
				the_state.angle = isNaN(new_angle) ? 0 : new_angle;
			} else {
				// delete Optional Data
				delete the_state.angle
			}
			// easing
			var new_easing;
			if (inspector.dom.state_easing.prop("checked")){
				// get data
				new_easing = inspector.dom.state_easing_type.val();
				the_state.easing = new_easing;
			} else {
				// delete data
				delete the_state.easing;
			}
			// refresh object list
			this.refresh_state_list(object_id);
			// refresh state
			inspector.switch_state(object_id, state_id);
		} else {
			// show error
			this.show_message("Error", "Invaild State", "alert");
		}
	} else {
		// show error
		this.show_message("Error", "Invaild Object", "alert");
	}
};

// delete state
editor_inspector.prototype.delete_state = function (e) {
    // get basic info
    var object_id = inspector.dom.object_id.val();
    var state_id = inspector.dom.state_id.val();
    // error catch
    if (typeof this.objects[object_id].states[state_id] !== "undefined") {
        this.objects[object_id].states.splice(state_id, 1);
        // refresh object list
        this.refresh_state_list(object_id);
        // refresh state
        inspector.switch_state(object_id, state_id);
    } else {
        // show error
        this.show_message("Error", "Invaild State", "alert");
    }
};




/* Part II.C Page Panel (Page List) */

// refresh page list 
editor_inspector.prototype.refresh_page_list = function () {
    // refresh list
    this.refresh_list(this.dom.page_list, this.manager.pages, "page_list_item_", "page_list_item", "property", "name", this.start_edit_page);
    // reset form
    this.clear_form("#pages_form", true);
};

// start editing page
// this event occurs after clicking items in page list
editor_inspector.prototype.start_edit_page = function (e) {
    // gather basic information
    var page_id = $(this).attr("id").split('_')[3];
    var the_page = inspector.manager.pages[page_id];
    // move to selected page
    inspector.manager.goto_page(page_id);
    // set style
    inspector.highlight_selection("page_list", this);
    // print values to form
    inspector.dom.page_id.val(page_id);
    // print page name
    inspector.dom.page_name.val(the_page.name);
    // print states
    inspector.refresh_page_states_list(page_id);
    // enable editing
    inspector.set_panel_enable("#pages_form", true);
};

// confirm changes on page
// this event occurs after clicking confirm button in page panel
editor_inspector.prototype.confirm_page_change = function (e) {
    // get new info from inputs
    var page_id = parseInt(inspector.dom.page_id.val());
    var new_name = inspector.dom.page_name.val();
    if (typeof inspector.manager.pages[page_id] !== "undefined") {
        // assign new info
        inspector.manager.pages[page_id].name = new_name;
        // refresh list
        inspector.refresh_page_list();
    } else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }
};

editor_inspector.prototype.delete_page = function (e) {
	// get basic info
    var page_id = parseInt(inspector.dom.page_id.val());
	// delete page
	if (typeof inspector.manager.pages[page_id] !== "undefined"){
		inspector.manager.pages.splice(page_id, 1);
		// reload list
		inspector.refresh_page_list();
	} else {
		// show error 
		this.show_message("Error", "Invaild Page", "alert");
	}
}

/* Part II.D Page Panel (Object List) */

// refresh list
editor_inspector.prototype.refresh_page_states_list = function (page_id) {
    // refresh list
    this.refresh_list(inspector.dom.page_state_list, this.manager.pages[page_id].objects, "page_state_item_", "page_state_item", "state", "id", this.start_edit_page_state);
    // clear form
    this.clear_form("#pages_states_form", false);
};

// start edit
editor_inspector.prototype.start_edit_page_state = function (e) {
    // gather basic information
    var page_id = inspector.dom.page_id.val();
    var the_page = inspector.manager.pages[page_id];
    var state_id = $(this).attr("id").split('_')[3];
    inspector.dom.page_state_id.val(state_id);
    var the_state = the_page.objects[state_id];
    // set style
    inspector.highlight_selection("page_state_list", this);
    // set object 
    var object_index = inspector.objects.indexOf(the_state.object);
    inspector.select_page_object_item(object_index);
    // set state
    var object_state_index = the_state.state;
    $("#object_state_select [value=" + object_state_index + "]").prop("selected", "selected");
    // set interval
    var object_interval = the_state.interval;
    inspector.dom.page_state_interval.val(object_interval);
    // set duration
    var object_duration = the_state.duration;
    inspector.dom.page_state_duration.val(object_duration);
    // enable edit
    inspector.set_panel_enable("#pages_states_form", true);

};

// confirm changes
editor_inspector.prototype.confirm_page_state_change = function (e) {
    // get basic index
    var page_id = parseInt(inspector.dom.page_id.val());
    var page_state_id = parseInt(inspector.dom.page_state_id.val());
    // get new data
    var new_object_index = parseInt(inspector.dom.page_state_object.val());
    var new_object = inspector.objects[new_object_index];
    var new_state = parseInt(inspector.dom.page_state_state.val());
    var new_interval = parseInt(inspector.dom.page_state_interval.val());
    var new_duration = parseInt(inspector.dom.page_state_duration.val());
    if (typeof inspector.manager.pages[page_id] !== "undefined") {
        if (typeof inspector.manager.pages[page_id].objects[page_state_id] !== "undefined") {
            // assign data
            var the_state = inspector.manager.pages[page_id].objects[page_state_id];
            the_state.object = new_object;
            the_state.state = new_state
            the_state.interval = new_interval;
            the_state.duration = new_duration;
            // refresh
            inspector.refresh_page_states_list(page_id);
            // reset form
            inspector.clear_form("#pages_states_form", true);
        } else {
            // show error
            this.show_message("Error", "Invaild State", "alert");
        }
    } else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }

}

// insert object
editor_inspector.prototype.insert_page_state = function () {
    // get basic index
    var page_id = parseInt(inspector.dom.page_id.val());
    if (typeof inspector.manager.pages[page_id] !== "undefined") {
		// get new data
		var new_object_index = parseInt(inspector.dom.page_state_object.val());
		var new_object = inspector.objects[new_object_index];
		var new_state = parseInt(inspector.dom.page_state_state.val());
		var new_interval = parseInt(inspector.dom.page_state_interval.val());
		// check interval
		new_interval = isNaN(new_interval) ? 0 : new_interval;
		var new_duration = parseInt(inspector.dom.page_state_duration.val());
		// check duration
		new_duration = isNaN(new_duration) ? 1000 : new_duration;
		// assign data
		inspector.manager.pages[page_id].add(new_object, new_state, new_interval, new_duration);
		// refresh
		inspector.refresh_page_states_list(page_id);
		// reset form
		inspector.clear_form("#pages_states_form", true);
	} else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }
}

// page state delete
editor_inspector.prototype.delete_page_state = function () {
	// get basic info
    var page_id = parseInt(inspector.dom.page_id.val());
    var page_state_id = parseInt(inspector.dom.page_state_id.val());
	// check available
    if (typeof inspector.manager.pages[page_id] !== "undefined") {
        if (typeof inspector.manager.pages[page_id].objects[page_state_id] !== "undefined") {
			// delete page state
			inspector.manager.pages[page_id].objects.splice(page_state_id, 1);
			// reload list
            inspector.refresh_page_states_list(page_id);
			// reset form
            inspector.clear_form("#pages_states_form", true);
        } else {
            // show error
            this.show_message("Error", "Invaild State", "alert");
        }
    } else {
        // show error
        this.show_message("Error", "Invaild Page", "alert");
    }
}

// select item in object selector
editor_inspector.prototype.select_page_object_item = function (index) {
    // activate the item
    $("#object_selector [value=" + index + "]").prop("selected", "selected");
    // refresh its state list
    try {
        this.refresh_list(this.dom.page_state_state, this.objects[index].states, "", "", "page_state_select", "State");
    } catch (e) {}
}

// reload selector
editor_inspector.prototype.reload_object_state_selector = function () {
    var index = this.dom.page_state_object.val();
    this.select_page_object_item(index);
}


