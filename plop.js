// -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*-
//
// Copyright (C) 2012 Intel Corporation
//
// Authors: Lionel Landwerlin <llandwerlin@gmail.com>
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA
// 02111-1307, USA.

const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;
const Mx = imports.gi.Mx;

const ANIMATION_TIME = 200;
const CHILDREN_NUMBER = 5;
const CHILDREN_DELAY = 20;

Clutter.init(null, null);

var stage = new Clutter.Stage({ color: new Clutter.Color({ red: 0,
                                                           green: 0,
                                                           blue: 0 }) });
stage.set_user_resizable(true);

var plus = new Clutter.Texture({ reactive: true });
plus.set_from_file("./plop.png");
plus.rotation_center_z = new Clutter.Vertex({
    x: plus.get_width() / 2,
    y: plus.get_height() / 2,
    z: 0
});
stage.add_actor(plus);

var sub_items = new Array();

for (var i = 0; i < CHILDREN_NUMBER; i++) {
    var clone = new Clutter.Clone({ source: plus })
    sub_items.push(clone);
    stage.add_actor(clone);
    clone.lower_bottom();
}

var opened = false;

// Open / Close animations
function _get_angle(child, children)
{
    return (-Math.PI / 2) + (child / (children - 1)) * (Math.PI / 2);
}

function _get_child_final_pos_x(child, children)
{
    return 10 + Math.cos(_get_angle(child, children)) * 350;
}

function _get_child_final_pos_y(child, children)
{
    return stage.get_height() - plus.get_height() - 10 + Math.sin(_get_angle(child, children)) * 350;
}

plus.connect('button-press-event', Lang.bind(this, function(event) {
    var angle = 0;
    if (!opened)
        angle = 300;
    opened = !opened;

    // Animate main button
    plus.animatev(Clutter.AnimationMode.EASE_OUT_QUAD,
                  ANIMATION_TIME,
                  ["rotation-angle-z"],
                  [angle]);

    // Animate childrens
    for (var i = 0; i < sub_items.length; i++) {
        var child = sub_items[i];
        var animation = null;

        if (opened) {
            animation = child.animatev(Clutter.AnimationMode.EASE_OUT_BACK,
                                       ANIMATION_TIME,
                                       ["x", "y"],
                                       [_get_child_final_pos_x(i, sub_items.length),
                                        _get_child_final_pos_y(i, sub_items.length)]);
            animation.timeline.delay = i * CHILDREN_DELAY;
        } else {
            animation = child.animatev(Clutter.AnimationMode.EASE_IN_BACK,
                                       ANIMATION_TIME,
                                       ["x", "y"],
                                       [10, stage.get_height() - plus.get_height() - 10]);
            animation.timeline.delay = (sub_items.length - i - 1) * CHILDREN_DELAY;
        }
        animation.timeline.stop();
        animation.timeline.start();
    }
}));

// Reposition stuff according to stage's size
stage.connect('allocation-changed', Lang.bind(this, function(box) {
    plus.set_position(10, stage.get_height() - plus.get_height() - 10);
    for (var i = 0; i < sub_items.length; i++) {
        if (opened)
            sub_items[i].set_position(_get_child_final_pos_x(i, sub_items.length),
                                      _get_child_final_pos_y(i, sub_items.length));
        else
            sub_items[i].set_position(10, stage.get_height() - plus.get_height() - 10);
    }
}));

stage.show();

Clutter.main();
