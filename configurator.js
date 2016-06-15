// configurator creates objects, pages automaticly according to given data

var last_created_page_index, last_created_object_index, selected_page_index, selected_object_index;

function configurator(objects, pages) {
    this.objects = objects;
    this.pages = pages;
}

function create_page() {
    pages.push(new page("Untitled", manager));
    manager.add(pages[pages.length - 1]);
    last_created_page_index = pages.length - 1;
}

function create_obj() {
    var new_object = new object("Untitled"+objects.length, meta);
    objects.push(new_object);
    manager.objects.push(new_object);
    objects[objects.length - 1].add_state(50, 0, 50, 0, 1);
    objects[objects.length-1].init("body", "<div>Text</div>");
    last_created_object_index = objects.length - 1;
}

function create_img_obj() {
    var new_object = new object("Untitled"+objects.length, meta);
    objects.push(new_object);
    manager.objects.push(new_object);
    objects[objects.length - 1].add_state(50, 0, 50, 0, 1);
    objects[objects.length-1].init_with_image("body", "placeholder.png");
    last_created_object_index = objects.length - 1;
}

function create_state() {
    var object_index;
    if (typeof selected_object_index !== "undefined"){
        // object selected
        object_index = selected_object_index;
    } else {
        object_index = last_created_object_index;
    }
    objects[object_index].add_state(50, 0, 50, 0, 1);
}
    
function code_export() {
	var objects = manager.objects;
	var pages = manager.pages;
	console.log(JSON.stringify(objects), JSON.stringify(pages));
}