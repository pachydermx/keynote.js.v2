// meta is the basic information of a page
function meta() {
    this.width = $(window).width();
    this.height = $(window).height();
   
    this.update = function () {
        this.width = $(window).width();
        this.height = $(window).height();
    };
        
}