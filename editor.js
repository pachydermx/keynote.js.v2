var preview, preview_body, inspector;

$(document).ready(function () {
    // prepare env
    preview = document.getElementById("preview").contentWindow;
    preview_body = $("#preview").contents().find("body");
    
    // set ui
    // tool bar
    $(".uibutton").button();
    //$(".uiselect").selectmenu({width: 100});
    
    // control panel
    // panels
    $(".optional.panel").accordion({
        collapsible: true,
        active: false,
        activate: function (e, ui) {
            if (ui.newHeader.length > 0) {
                // opening
                $(this).find(".enabler").prop("checked", true);
            } else {
                // collapsing
                $(this).find(".enabler").prop("checked", false);
            }
        }
    });
    // overall (END)
    $("#inspector_frame").tabs();
    
    // assign actions
    $("#new_page").click(function () {
        preview.create_page();
        inspector.refresh_page_list();
    });
    
    $("#new_text_obj").click(function () {
        preview.create_obj();
        inspector.refresh_object_list();
    });
    $("#new_image_obj").click(function () {
        preview.create_img_obj();
        inspector.refresh_object_list();
    });
    
    
    // inspector panel
    // object panel
    $("#confirm_object_changes").click(function () {
        inspector.confirm_object_change();
    });
    
    $("#refresh_object_list").click(function () {
        inspector.refresh_object_list();
    });
    
    $("#delete_object").click(function () {
        inspector.delete_object();
    });
    
    $("#alpha_input").change(function () {
        $("#alpha_input_display").val($(this).val());
    });
    
    $("#alpha_input_display").change(function () {
        $("#alpha_input").val($(this).val());
    });
    
    // state panel
    $("#new_state").click(function () {
		try {
			preview.create_state();
			inspector.refresh_state_list();
			inspector.reload_object_state_selector();
		} catch (error) {}
    });
    
    $("#confirm_state_changes").click(function () {
        inspector.confirm_state_change();
    });
    
    $("#delete_state").click(function () {
        inspector.delete_state();
    });
    
    // page panel
    $("#confirm_page_changes").click(function () {
        inspector.confirm_page_change();
    });
    
    $("#confirm_page_state_changes").click(function () {
        inspector.confirm_page_state_change();
    });
    
    $("#confirm_page_state_insert").click(function () {
        inspector.insert_page_state();
    });
    
	$("#delete_page").click(function () {
		inspector.delete_page();
	});
	
	$("#delete_page_state").click(function () {
		inspector.delete_page_state();
	});
	
    // auto load state list
    $("#object_selector").change(function () {
        inspector.reload_object_state_selector();
    });
    
});

// init inspector
function preview_loaded() {
    inspector = new editor_inspector(preview.manager);
    inspector.enable_editor(preview.objects);
    
    // prepare preview env
    preview.create_page();
    inspector.refresh_page_list();
}

