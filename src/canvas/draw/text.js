/**
 * @author Mofei Zhu<mapv@zhuwenlong.com>
 * This file is to draw text
 */

import pathSimple from "../path/simple";

export default {
    draw: function (context, dataSet, options) {
        var data = dataSet.get();
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // set from options
        for (var key in options) {
            context[key] = options[key];
        }

        var offset = options.offset || {
            x: 0,
            y: 0
        };

        for (var i = 0, len = data.length; i < len; i++) {
            var coordinates = data[i].geometry._coordinates || data[i].geometry.coordinates;
            context.fillText(data[i].text, coordinates[0] + offset.x, coordinates[1] + offset.y)
        };
    }
}
