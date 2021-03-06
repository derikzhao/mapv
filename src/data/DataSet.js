/**
 * @author kyle / http://nikai.us/
 */

import Event from "../utils/Event";

/**
 * DataSet
 *
 * A data set can:
 * - add/remove/update data
 * - gives triggers upon changes in the data
 * - can  import/export data in various data formats
 * @param {Array} [data]    Optional array with initial data
 * the field geometry is like geojson, it can be:
 * {
 *     "type": "Point",
 *     "coordinates": [125.6, 10.1]
 * }
 * {
 *     "type": "LineString",
 *     "coordinates": [
 *         [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
 *     ]
 * }
 * {
 *     "type": "Polygon",
 *     "coordinates": [
 *         [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
 *           [100.0, 1.0], [100.0, 0.0] ]
 *     ]
 * }
 * @param {Object} [options]   Available options:
 * 
 */
function DataSet(data, options) {

    this._options = options || {};
    this._data = []; // map with data indexed by id

    // add initial data when provided
    if (data) {
        this.add(data);
    }

}

DataSet.prototype = new Event();

/**
 * Add data.
 */
DataSet.prototype.add = function(data, senderId) {
    if (Array.isArray(data)) {
        // Array
        for (var i = 0, len = data.length; i < len; i++) {
            this._data.push(data[i]);
        }
    } else if (data instanceof Object) {
        // Single item
        this._data.push(data);
    } else {
        throw new Error('Unknown dataType');
    }
};

/**
 * get data.
 */
DataSet.prototype.get = function(args) {
    args = args || {};

    //console.time('copy data time')
    var start = new Date();
    // TODO: 不修改原始数据，在数据上挂载新的名称，每次修改数据直接修改新名称下的数据，可以省去deepCopy
    // var data = deepCopy(this._data);
    var data = this._data;

    //console.timeEnd('copy data time')

    //console.time('transferCoordinate time')

    var start = new Date();

    if (args.filter) {
        var newData = [];
        for (var i = 0; i < data.length; i++) {
            if (args.filter(data[i])) {
                newData.push(data[i]);
            }
        }
        data = newData;
    }

    if (args.transferCoordinate) {
        data = this.transferCoordinate(data, args.transferCoordinate);
    }

    //console.timeEnd('transferCoordinate time')

    return data;

};

/**
 * set data.
 */
DataSet.prototype.set = function(data) {
    this.clear();
    this.add(data);
    this._trigger('change');
}

/**
 * clear data.
 */
DataSet.prototype.clear = function(args) {
    this._data = []; // map with data indexed by id
}

/**
 * remove data.
 */
DataSet.prototype.remove = function(args) {};

/**
 * update data.
 */
DataSet.prototype.update = function(args) {};

/**
 * transfer coordinate.
 */
DataSet.prototype.transferCoordinate = function(data, transferFn) {

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        if (data[i].geometry) {

            if (data[i].geometry.type === 'Point') {
                var coordinates = data[i].geometry.coordinates;
                data[i].geometry._coordinates = transferFn(coordinates);
            }

            if (data[i].geometry.type === 'Polygon' || data[i].geometry.type === 'MultiPolygon') {

                var coordinates = data[i].geometry.coordinates;

                if (data[i].geometry.type === 'Polygon') {

                    var newCoordinates = getPolygon(coordinates);
                    data[i].geometry._coordinates = newCoordinates;

                } else if (data[i].geometry.type === 'MultiPolygon') {
                    var newCoordinates = [];
                    for (var c = 0; c < coordinates.length; c++) {
                        var polygon = coordinates[c];
                        var polygon = getPolygon(polygon);
                        newCoordinates.push(polygon);
                    }

                    data[i].geometry._coordinates = newCoordinates;
                }

            }

            if (data[i].geometry.type === 'LineString') {
                var coordinates = data[i].geometry.coordinates;
                var newCoordinates = [];
                for (var j = 0; j < coordinates.length; j++) {
                    newCoordinates.push(transferFn(coordinates[j]));
                }
                data[i].geometry._coordinates = newCoordinates;
            }
        }
    }

    function getPolygon(coordinates) {
        var newCoordinates = [];
        for (var c = 0; c < coordinates.length; c++) {
            var coordinate = coordinates[c];
            var newcoordinate = [];
            for (var j = 0; j < coordinate.length; j++) {
                newcoordinate.push(transferFn(coordinate[j]));
            }
            newCoordinates.push(newcoordinate);
        }
        return newCoordinates;
    }

    return data;
};

DataSet.prototype.initGeometry = function(transferFn) {
    if (transferFn) {
        this._data.forEach(function (item) {
            item.geometry = transferFn(item);
        });
    } else {
        this._data.forEach(function (item) {
            if (!item.geometry && item.lng && item.lat) {
                item.geometry = {
                    type: 'Point',
                    coordinates: [item.lng, item.lat]
                }
            }
        });
    }
}

function deepCopy(obj) {
    var newObj;
    if (typeof obj == 'object') {
        newObj = obj instanceof Array ? [] : {};
        for (var i in obj) {
            newObj[i] = obj[i] instanceof HTMLElement ? obj[i] : deepCopy(obj[i]);
        }
    } else {
        newObj = obj
    }
    return newObj;
}

export default DataSet;
