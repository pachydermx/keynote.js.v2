// inspector is debugger of a page
function inspector(manager) {
    this.manager = manager;
    var dom_obj, object_list, page_viewer, page_viewer_list, object_viewer, page_list, object_viewer_list, object_state_list, object_info_list, moving, editor, objects, mod_viewer, mod_viewer_list;
    
    // init inspector window
    this.enable = function (selector) {
        // configure
        this.editor = false;
        // basic frame
        $(selector).append(getDiv('inspector', 'inspector_box inpector_frame', ''));
        this.dom_obj = $("#inspector");
        this.dom_obj.draggable();
        // title
        this.dom_obj.append("<div class='inspector_frame inspector_title'><label>Inspector</label></div>");
        // mod viewer
        this.dom_obj.append(getLabel('', 'section_title', 'Mod'));
        this.dom_obj.append(getDiv('mod_viewer', 'inspector_frame', ''));
        this.mod_viewer = $("#mod_viewer");
        this.mod_viewer.append(getUl('mod_viewer_list', 'inspector_frame', ''));
        this.mod_viewer_list = $("#mod_viewer_list");
        this.refresh_mod_viewer();
        // page viewer
        this.dom_obj.append(getLabel('', 'section_title', 'Pages'));
        this.dom_obj.append(getDiv('page_viewer', 'inspector_frame', ''));
        this.page_viewer = $("#page_viewer");
        this.page_viewer.append(getUl('page_viewer_list', 'inspector_frame', ''));
        this.page_viewer_list = $("#page_viewer_list");
        this.refresh_page_viewer();
        // object viewer
        this.dom_obj.append(getLabel('', 'section_title', 'Objects'));
        this.dom_obj.append(getUl('object_viewer_list', 'inspector_frame', ''));
        this.object_viewer_list = $("#object_viewer_list");
        // object location viewer
        this.dom_obj.append(getLabel('', 'section_title', 'Positions'));
        this.dom_obj.append(getUl('object_state_list', 'inspector_frame', ''));
        this.object_state_list = $("#object_state_list");
        // object info viewer
        this.dom_obj.append(getLabel('', 'section_title', 'Info'));
        this.dom_obj.append(getUl('object_info_list', 'inspector_frame', ''));
        this.object_info_list = $("#object_info_list");
		
		
		// set manager callback
		var that = this;
		manager.add_callback("gotopage", function (id) {
			that.highlight_page_item(id);
		});
		manager.add_callback("modswitch", function (id) {
			that.highlight_mod_item(id);
		});
    };
	
	/* Mod List */
	
    // refresh mod list
    this.refresh_mod_viewer = function () {
        // print mod list
		this.mod_viewer_list.append(getLi("mod_viewer_list_item_x", "mod_viewer_list_item selected", "Normal"));
		$("#mod_viewer_list_item_x").click(this.mod_viewer_list_click_action);
        var i, the_mod;
        for (i in this.manager.mods) {
            // create dom element
            the_mod = this.manager.mods[i];
            this.mod_viewer_list.append(getLi("mod_viewer_list_item_" + i, "mod_viewer_list_item", the_mod));
            // assign action
            $("#mod_viewer_list_item_" + i).click(this.mod_viewer_list_click_action);
        }
    };
	
    // viewer_list_click_action
    // var inspector must exist
    this.mod_viewer_list_click_action = function () {
        var mod_id = $(this).attr("id").split('_')[4];
		if (mod_id == "x") {
			mod_id = undefined;
		}
        // move to page
        manager.mod(mod_id);
    };
	
	this.highlight_mod_item = function (mod_id) {
		if (mod_id == undefined) {
			mod_id = "x";
		}
        // set style
        $("#mod_viewer_list li").removeClass("selected");
        $("#mod_viewer_list_item_" + mod_id).addClass("selected");
	};
	
	
	/* Page List */
	
    // refresh page list
    this.refresh_page_viewer = function () {
        // print page list
        var i, the_page;
        for (i in this.manager.pages) {
            // create dom element
            the_page = this.manager.pages[i];
            this.page_viewer_list.append(getLi("page_viewer_list_item_" + i, "page_viewer_list_item", the_page.name));
            // assign action
            $("#page_viewer_list_item_" + i).click(this.page_viewer_list_click_action);
        }
    };
    
    // refresh object list
    this.refresh_object_viewer_list = function (page) {
        // reset list
        this.object_viewer_list.html("");
        this.object_state_list.html("");
        this.object_info_list.html("");
        $(".object").removeClass("selected_object");
        // print object list
        var i, the_object;
        for (i in this.manager.pages[page].objects) {
            the_object = this.manager.pages[page].objects[i].object;
            this.object_viewer_list.append(getLi("object_viewer_list_item_" + i, "object_viewer_list_item", the_object.id));
            // assign action
            $("#object_viewer_list_item_" + i).click(this.object_viewer_list_click_action);
        }
    };
    
    // refresh object info
    this.refresh_object_info = function (object) {
        // reset list
        this.object_state_list.html("");
        this.object_info_list.html("");
        // print position list
        var i, the_state;
        for (i in object.states) {
            the_state = object.states[i];
            // normal info
            var display = "(" + the_state.x_percent + "%+" + the_state.x_delta + "px, " + the_state.y_percent + "%+" + the_state.y_delta + "px)";
            // additional info
            // size info
            if (typeof the_state.width_percent !== "undefined") {
                display += "\n Size: (" + the_state.width_percent + "%+" + the_state.width_delta + "px, " + the_state.height_percent + "%+" + the_state.height_delta + "px)";
            }
            // rotate info
            if (typeof the_state.angle !== "undefined") {
                display += "\n Angle: " + the_state.angle + "deg";
            }
            // easing info
            if (typeof the_state.easing !== "undefined") {
                display += "\n Easing: " + the_state.easing;
            }
            this.object_state_list.append(getLi("object_state_list_item_" + i, "object_state_list_item", display));
        }
        // highlight current position
        $("#object_state_list_item_" + object.state).addClass("selected");
        
        // highlight object
        this.highlight_object(object);
        
        // auto reset
        this.object_info_list.append(getLi("object_info_list_auto_reset", "object_info_list_item", "Auto Reset: " + object.auto_reset));
        
        // image mode
        if (typeof object.image_scale_mode !== "undefined") {
            this.object_info_list.append(getLi("object_info_list_auto_reset", "object_info_list_item", "Image Mode: " + object.image_scale_mode));
        }
        
        // z-index 
        if (typeof object.z_index !== "undefined") {
            this.object_info_list.append(getLi("object_info_list_auto_reset", "object_info_list_item", "Z-Index: " + object.z_index));
        }
        
        // Size
        if (typeof object.width_percent !== "undefined") {
            var width_display = object.width_percent + "%+" + object.width_delta + "px";
            var height_display = object.height_percent + "%+" + object.height_delta + "px";
            this.object_info_list.append(getLi("object_info_list_auto_reset", "object_info_list_item", "Width: " + width_display));
            this.object_info_list.append(getLi("object_info_list_auto_reset", "object_info_list_item", "Height: " + height_display));
        }
    };
    
    // viewer_list_click_action
    // var inspector must exist
    this.page_viewer_list_click_action = function () {
        var page_id = $(this).attr("id").split('_')[4];
        // move to page
        manager.goto_page(page_id);
    };
	
	this.highlight_page_item = function (page_id) {
        // set style
        $("#page_viewer_list li").removeClass("selected");
        $("#page_viewer_list_item_" + page_id).addClass("selected");

        // refresh object list
        inspector.refresh_object_viewer_list(page_id);
	};
    
    // object viewer click action
    this.object_viewer_list_click_action = function () {
        var object_id = $(this).attr("id").split('_')[4];
        // set style
        $("#object_viewer_list li").removeClass("selected");
        $(this).addClass("selected");
        // show positions
        inspector.refresh_object_info(inspector.manager.pages[inspector.manager.lastPage].objects[object_id].object);
    };
	
    // general functions
    
    // highlight object
    this.highlight_object = function (object) {
        // highlight the object
        $(".selected_object").removeClass("selected_object");
        if (typeof object !== "undefined") {
            object.dom_obj.addClass("selected_object");
        }
    };
    
    // highlight selection
    this.highlight_selection = function (list_id, the_item) {
        $("#" + list_id +" li").removeClass("selected");
        $(the_item).addClass("selected");
    };
        
    // generalized list refresh function
    // object is jquery object of the list
    // list is data source
    // id_prefix, list_class is the id, class of li element to print
    // title is the index of printing
    // click function is the action after clicking the item
    this.refresh_list = function (object, list, id_prefix, list_class, title_type, title, click_function) {
        // reset list
        object.html("");
        // print object list
        var i, the_item, the_title;
        for (i in list) {
            the_item = list[i];
            if (title_type == "property" || title_type == "object_select"){
                the_title = the_item[title];
            } else if (title_type == "index" || title_type == "page_state_select"){
                the_title = title + " " + i;
            } else if (title_type == "state" || title_type == "state_select"){
                the_title = the_item.object[title] + " - " + the_item.state;
            } else {
                the_title = "Unknown " + i;
            }
            if (title_type == "object_select" || title_type == "page_state_select") {
                object.append(getOption(i, the_title));
            } else {
                object.append(getLi(id_prefix + i, list_class, the_title));
                // assign action
                $("#" + id_prefix + i).click(click_function);
            }
        }
    };
    
    // switch object state
    this.switch_state = function (object_id, state_id) {
        if ($("#animation_enabled_input").prop("checked")) {
            this.objects[object_id].moveToState(state_id, 1000);
        } else {
            this.objects[object_id].moveToState(state_id);
        }
    };
    
    // print object list
    this.get_object_list = function (prefix, middle, profix) {
        var i, the_item, output = "";
        for (i in this.objects) {
            the_item = this.objects[i];
            output = prefix + i + middle + the_item.id + profix;
        }
    };
        
}