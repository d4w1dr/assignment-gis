var lat, lon;
var markers = [];
var marker = {};
var lines = [];
var linecolor = 0;

L.mapbox.accessToken = 'pk.eyJ1IjoiZGVqd2lkZSIsImEiOiJjam4zaWQxNTQwY2pkM3BtaGRmYnB4dnVlIn0.gdljvGt0NPx4yTMjr4Zprg';
var map = L.mapbox.map('map', 'mapbox.streets')
    .setView([48.1580529, 17.0682957], 15);

marker = L.marker([48.1580529, 17.0682957]).addTo(map);
lat = 48.1580529;
lon = 17.0682957;
marker.bindPopup("<strong>" + "Tvoja pozicia je: " + "</strong>" + "<br>" + lat + " šírky" + "<br>" + lon + " dĺžky");

var addMarkerOnClick = function (e) {

    if (marker != undefined) {
        map.removeLayer(marker);
    }

    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    lat = e.latlng.lat;
    lon = e.latlng.lng;
    marker.bindPopup("<strong>" + "Tvoja pozicia je: " + "</strong>" + "<br>" + e.latlng.lat + " šírky" + "<br>" + e.latlng.lng + " dĺžky");
}

map.on('click', addMarkerOnClick);

function addMarkers(json) {

    clearMarkers();
    json.forEach(function (e) {

        var mark = {};
        if (e.geometry.type == "Point") {

            if (e.properties.description == "swimming_pool") {

                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#04c1f1',
                        'marker-size': 'large',
                        'marker-symbol': 'swimming'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "fast_food" || e.properties.description == "food_court" || e.properties.description == "restaurant") {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#f70017',
                        'marker-size': 'large',
                        'marker-symbol': 'restaurant'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "DPB") {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#ecef09',
                        'marker-size': 'large',
                        'marker-symbol': 'bus'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "parking" || e.properties.description == "parking_entrance") {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#797979',
                        'marker-size': 'large',
                        'marker-symbol': 'parking'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "bicycle_parking") {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#797979',
                        'marker-size': 'large',
                        'marker-symbol': 'bicycle'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "mall") {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#ff8300',
                        'marker-size': 'large',
                        'marker-symbol': 'clothing-store'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else {
                mark = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#0f8fea',
                        'marker-size': 'large',
                        'marker-symbol': 'water'
                    })
                }).addTo(map);
                markers.push(mark);
            }
        }
        else if (e.geometry.type == "Polygon") {

            var center = calculateCenter(e.geometry.coordinates[0]);

            if (e.properties.description == "swimming_pool") {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#04c1f1',
                        'marker-size': 'large',
                        'marker-symbol': 'swimming'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "fast_food" || e.properties.description == "food_court" || e.properties.description == "restaurant") {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#f70017',
                        'marker-size': 'large',
                        'marker-symbol': 'restaurant'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "parking" || e.properties.description == "parking_entrance") {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#797979',
                        'marker-size': 'large',
                        'marker-symbol': 'parking'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "bicycle_parking") {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#797979',
                        'marker-size': 'large',
                        'marker-symbol': 'bicycle'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else if (e.properties.description == "mall") {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#ff8300',
                        'marker-size': 'large',
                        'marker-symbol': 'clothing-store'
                    })
                }).addTo(map);
                markers.push(mark);
            }
            else {
                mark = L.marker([center[1], center[0]], {
                    icon: L.mapbox.marker.icon({
                        'marker-color': '#0f8fea',
                        'marker-size': 'large',
                        'marker-symbol': 'water'
                    })
                }).addTo(map);
                markers.push(mark);
            }
        }
        else if (e.geometry.type == "MultiLineString") {
            
            if (linecolor == 0) {
                color = '#31ff00';
            }
            else if (linecolor == 1) {
                color = '#bf00ff';
            }
            else if (linecolor == 2) {
                color = '#000000';
            }
            else {
                color = '#00fffd';
            }

            var line = L.geoJSON(e, {
                'color': color,
            }).addTo(map);
            lines.push(line);
            linecolor++;

            var part = getPart(e);
            var middle = getMiddle(e, part);

            mark = L.marker([e.geometry.coordinates[part][middle][1], e.geometry.coordinates[part][middle][0]], {
                icon: L.mapbox.marker.icon({
                    'marker-color': '#31ff00',
                    'marker-size': 'large',
                    'marker-symbol': 'bicycle'
                })
            }).addTo(map);
            markers.push(mark);
        }
        else if (e.geometry.type == "LineString") {
            L.geoJSON(e, {
                'color': '#31ff00',
            }).addTo(map);
            var middle;
            if (e.geometry.coordinates.length % 2 == 0) {
                middle = e.geometry.coordinates.length / 2;
            }
            else {
                middle = (e.geometry.coordinates.length + 1) / 2;
            }
            console.log(middle);
            mark = L.marker([e.geometry.coordinates[middle][1], e.geometry.coordinates[middle][0]], {
                icon: L.mapbox.marker.icon({
                    'marker-color': '#31ff00',
                    'marker-size': 'large',
                    'marker-symbol': 'bicycle'
                })
            }).addTo(map);
            markers.push(mark);
        }

        if (e.properties.title != null) {
            if (e.properties.distance != null) {
                mark.bindPopup("Nazov: " + "<strong>" + e.properties.title + "</strong>" + "<br>" + "Typ: " + "<strong>" + e.properties.description + "</strong>" + "<br>" + "Vzdialenost od vody: " + "<strong>" + e.properties.distance + " metrov" + "</strong>");
            }
            else {
                mark.bindPopup("Nazov: " + "<strong>" + e.properties.title + "</strong>" + "<br>" + "Typ: " + "<strong>" + e.properties.description + "</strong>");
            }
        }
        else {
            if (e.properties.distance != null) {
                mark.bindPopup("Typ: " + "<strong>" + e.properties.description + "</strong>" + "<br>" + "Vzdialenost od vody: " + "<strong>" + e.properties.distance + " metrov" + "</strong>");
            }
            else {
                mark.bindPopup("Typ: " + "<strong>" + e.properties.description + "</strong>");
            }
        }
    });
}

function getPart(e) {
    var part = 0;

    if (e.geometry.coordinates.length % 2 == 0) {
        return part = e.geometry.coordinates.length / 2;
    }
    else {
        return part = (e.geometry.coordinates.length + 1) / 2;
    }
}

function getMiddle(e, part) {
    var mid = 0;
    if (e.geometry.coordinates[part].length % 2 == 0) {
        return mid = e.geometry.coordinates[part].length / 2;
    }
    else {
        return mid = (e.geometry.coordinates[part].length + 1) / 2;
    }
}

function calculateCenter(coords) {

    var center = coords.reduce(function (x, y) {
        return [x[0] + y[0] / coords.length, x[1] + y[1] / coords.length]
    }, [0, 0])
    return center;
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i]);
    }
    markers.length = 0;

    for (var i = 0; i < lines.length; i++) {
        map.removeLayer(lines[i]);
    }
    lines.length = 0;
}

document.getElementById("submitButton1").onclick = function () {

    var dist = document.getElementById("dist").value;

    if (dist != "") {

        const Http = new XMLHttpRequest();
        const url = 'http://localhost:3000/radius/';
        var params = 'distance=' + dist + '&longitude=' + lon + '&latitude=' + lat;

        Http.onreadystatechange = function () {
            console.log(this);
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(Http.responseText);
                var results = uniqueValues(json);
                console.log(results);

                if (typeof layer !== 'undefined') {
                    map.removeLayer(layer);
                }
                layer = L.mapbox.featureLayer().setGeoJSON(results).addTo(map);
                addMarkers(results);
            }
        };
        Http.open("GET", url + "?" + params, true);
        Http.send();
    }
    else {
        alert("Zadajte vzdialenost!");
    }
}

document.getElementById("submitButton2").onclick = function () {
    var checkedValue = "";
    var trans = document.getElementById("trans").value;

    if (document.getElementById("mhd").checked) {
        checkedValue = "mhd";
    }
    else if (document.getElementById("car").checked) {
        checkedValue = "car";
    }

    if (trans != "" && (checkedValue == "mhd" || checkedValue == "car")) {
        const Http = new XMLHttpRequest();
        const url = 'http://localhost:3000/transport/';
        var params = 'transport=' + checkedValue + '&trans=' + trans;

        Http.onreadystatechange = function () {
            console.log(this);
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(Http.responseText);
                var results = uniqueValues(json);
                console.log(results);

                if (typeof layer !== 'undefined') {
                    map.removeLayer(layer);
                }
                layer = L.mapbox.featureLayer().setGeoJSON(results).addTo(map);
                addMarkers(results);
            }
        };
        Http.open("GET", url + "?" + params, true);
        Http.send();
    }
    else {
        alert("Zadajte vzdialenost a vyberte sposob dopravy!");
    }
}

document.getElementById("submitButton3").onclick = function () {

    var e = document.getElementById("places");
    var place = e.options[e.selectedIndex].value;

    const Http = new XMLHttpRequest();
    const url = 'http://localhost:3000/meals/';
    var params = 'place=' + place;

    Http.onreadystatechange = function () {
        console.log(this);
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(Http.responseText);
            var results = uniqueValues(json);
            console.log(results);

            if (typeof layer !== 'undefined') {
                map.removeLayer(layer);
            }
            layer = L.mapbox.featureLayer().setGeoJSON(results).addTo(map);
            addMarkers(results);
        }
    };
    Http.open("GET", url + "?" + params, true);
    Http.send();
}

document.getElementById("submitButton4").onclick = function () {
    var checkedValue = "";
    linecolor = 0;

    if (document.getElementById("car_park").checked) {
        checkedValue = "car_park";
    }
    else if (document.getElementById("bike_park").checked) {
        checkedValue = "bike_park";
    }
    console.log(checkedValue);

    if (checkedValue == "car_park" || checkedValue == "bike_park") {
        const Http = new XMLHttpRequest();
        const url = 'http://localhost:3000/mall_parking/';
        var params = 'parking=' + checkedValue;

        Http.onreadystatechange = function () {
            console.log(this);
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(Http.responseText);
                var results = uniqueValues(json);
                console.log(results);

                if (typeof layer !== 'undefined') {
                    map.removeLayer(layer);
                }
                layer = L.mapbox.featureLayer().setGeoJSON(results).addTo(map);
                addMarkers(results);
            }
        };
        Http.open("GET", url + "?" + params, true);
        Http.send();
    }
    else {
        alert("Zadajte typ parkovania!");
    }
}

function uniqueValues(result) {
    unique = [];
    help = 0;
    result.filter(function (elem) {
        if (unique.length == 0) {
            unique.push(elem);
        }
        else {
            help = 0;
            unique.forEach(function (element) {
                if (elem.properties.title == element.properties.title && elem.properties.description == element.properties.description && elem.geometry.type == element.geometry.type) {
                    if (elem.geometry.type == "Point" && elem.geometry.coordinates[0] == element.geometry.coordinates[0] && elem.geometry.coordinates[1] == element.geometry.coordinates[1]) {
                        help++;
                    }
                    else if (elem.geometry.type == "Polygon" && elem.geometry.coordinates[0].length == element.geometry.coordinates[0].length && elem.geometry.coordinates[0][0][0] == element.geometry.coordinates[0][0][0] && elem.geometry.coordinates[0][0][1] == element.geometry.coordinates[0][0][1]) {
                        help++;
                    }
                    else if (elem.geometry.type == "LineString" && element.properties.title == elem.properties.title && elem.geometry.coordinates.length == element.geometry.coordinates.length && elem.geometry.coordinates[0][0] == element.geometry.coordinates[0][0] && elem.geometry.coordinates[0][1] == element.geometry.coordinates[0][1]) {
                        help++;
                    }
                }
            });
            if (help == 0) {
                unique.push(elem);
            }
        }
    });
    return unique
}

$('#car_park').on('change', function () {
    if (document.getElementById("car_park").checked) {
        $('#bike_park').prop('disabled', true);
    }
    else {
        $('#bike_park').prop('disabled', false);
    }
});

$('#bike_park').on('change', function () {
    if (document.getElementById("bike_park").checked) {
        $('#car_park').prop('disabled', true);
    }
    else {
        $('#car_park').prop('disabled', false);
    }
});

$('#mhd').on('change', function () {
    if (document.getElementById("mhd").checked) {
        $('#car').prop('disabled', true);
    }
    else {
        $('#car').prop('disabled', false);
    }
});

$('#car').on('change', function () {
    if (document.getElementById("car").checked) {
        $('#mhd').prop('disabled', true);
    }
    else {
        $('#mhd').prop('disabled', false);
    }
});

