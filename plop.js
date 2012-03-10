const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;
const Mx = imports.gi.Mx;

Clutter.init(null, null);

stage = new Clutter.Stage({ color: new Clutter.Color({ red: 0,
                                                       green: 0,
                                                       blue: 0 }) });

var plus = new Clutter.Texture({ reactive: true });
plus.set_from_file("./plop.png");
plus.rotation_center_z = new Clutter.Vertex({
    x: plus.get_width() / 2,
    y: plus.get_height() / 2,
    z: 0
});
stage.add_actor(plus);

sub_items = new Array();

for (var i = 0; i < 5; i++) {
    var clone = new Clutter.Clone({ source: plus })
    sub_items.push(clone);
    stage.add_actor(clone);
    clone.lower_bottom();
}

var opened = false;

// Open / Close animations
plus.connect('button-press-event', Lang.bind(this, function(event) {
    var angle = 0;
    if (!opened)
        angle = 300;
    opened = !opened;

    // Animate main button
    plus.animatev(Clutter.AnimationMode.EASE_OUT_QUAD,
                  250,
                  ["rotation-angle-z"],
                  [angle]);

    // Animate childrens
    for (var i = 0; i < sub_items.length; i++) {
        var angle = (-Math.PI / 2) + (i / (sub_items.length - 1)) * (Math.PI / 2);
        var child = sub_items[i];
        var animation = null;

        if (opened) {
            animation = child.animatev(Clutter.AnimationMode.EASE_OUT_BACK,
                                       250,
                                       ["x", "y"],
                                       [10 + Math.cos (angle) * 350,
                                        stage.get_height() - plus.get_height() - 10 + Math.sin (angle) * 350]);
            animation.timeline.delay = i * 25;
        } else {
            animation = child.animatev(Clutter.AnimationMode.EASE_IN_BACK,
                                       250,
                                       ["x", "y"],
                                       [10, stage.get_height() - plus.get_height() - 10]);
            animation.timeline.delay = (sub_items.length - i - 1) * 25;
        }
        animation.timeline.stop();
        animation.timeline.start();
    }
}));

// Reposition stuff according to stage's size
stage.connect('allocation-changed', Lang.bind(this, function(box) {
    plus.set_position(10, stage.get_height() - plus.get_height() - 10);
    if (!opened) {
        for (var i = 0; i < sub_items.length; i++) {
            sub_items[i].set_position(10, stage.get_height() - plus.get_height() - 10);
        }
    }
}));

stage.show();

Clutter.main();
