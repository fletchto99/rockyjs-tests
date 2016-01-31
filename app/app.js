function app() {
    console.log("hi");
    console.log(document.getElementById("pebble"));
    var rocky = Rocky.bindCanvas(document.getElementById("pebble"));
    rocky.export_global_c_symbols();

    var bmp = gbitmap_create(
        'https://github.com/apple-touch-icon-57x57.png'
    );

    rocky.update_proc = function (ctx, bounds) {

        var arc = function(angle_ratio, inset, color, thickness) {
            var rect = grect_inset(bounds, inset);
            graphics_context_set_fill_color(ctx, color);
            graphics_fill_radial(
                ctx, rect, GOvalScaleModeFitCircle,
                thickness || 12, // thickness of each arc
                DEG_TO_TRIGANGLE(0),
                DEG_TO_TRIGANGLE(360 * angle_ratio)
            );
        };
        graphics_draw_bitmap_in_rect(ctx, bmp, [43, 55, 57, 57]);

        var d = new Date();
        arc((d.getHours() % 12) / 12, 30, GColorJazzberryJam);
        arc(d.getMinutes() / 60, 15, GColorJaegerGreen);
        arc(d.getSeconds() / 60, 0, GColorBlueMoon);
        console.log(bmp);

    };

    setInterval(function () {rocky.mark_dirty();}, 10);
}