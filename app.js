var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	pg = require('pg'),
	app = express();

var conString = "postgres://postgres:admin@localhost/project";

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
	res.render("home.ejs");
});

app.get("/radius", function (req, res) {

	var client = new pg.Client(conString);
	client.connect(function (err) {
		if (err) {
			return console.error('could not connect to postgres', err);
		}

		client.query("SELECT name, water, leisure, pl.natural, ST_AsGeoJSON(ST_Transform(way,4326)) AS geo FROM public.planet_osm_polygon pl WHERE ST_DWithin(ST_SetSRID(ST_MakePoint(" + req.query.longitude + "," + req.query.latitude + "),4326)::geography, ST_Transform(way, 4326)::geography," + req.query.distance + ") AND ((pl.natural='water' AND pl.water IS NULL AND pl.amenity IS NULL) OR pl.leisure='swimming_pool' OR pl.water NOT IN ('river','canal','basemap.at', 'oxbow'))" +
			"UNION SELECT name, water, leisure, pt.natural, ST_AsGeoJSON(ST_Transform(way,4326)) AS geo FROM public.planet_osm_point pt WHERE ST_DWithin(ST_SetSRID(ST_MakePoint(" + req.query.longitude + "," + req.query.latitude + "),4326)::geography, ST_Transform(way, 4326)::geography," + req.query.distance + ") AND ((pt.natural='water' AND pt.water IS NULL AND pt.amenity IS NULL) OR pt.leisure='swimming_pool' OR pt.water NOT IN ('river','canal','basemap.at', 'oxbow'))", function (err, result) {

				if (err) {
					return console.error('error running query', err);
				}
				client.end();

				result.rows.forEach(prepareForMap);
				console.log(result.rowCount);
				res.end(JSON.stringify(result.rows));
			});
	});
});

app.get("/transport", function (req, res) {

	var client = new pg.Client(conString);
	client.connect(function (err) {
		if (err) {
			return console.error('could not connect to postgres', err);
		}

		if (req.query.transport == "mhd") {

			client.query("SELECT DISTINCT pt.name, pt.water,pt.leisure,pt.natural, ST_AsGeoJSON(ST_Transform(pt.way,4326)) AS geo, mhd.name AS mhd_name, mhd.operator, ST_AsGeoJSON(ST_Transform(mhd.way,4326)) AS geos FROM public.planet_osm_point pt INNER JOIN (SELECT name, way, operator FROM public.planet_osm_point pl WHERE pl.operator='DPB') AS mhd ON ST_DWithin(ST_Transform(mhd.way,4326)::geography, ST_Transform(pt.way, 4326)::geography," + req.query.trans + ") WHERE ((pt.natural='water' AND pt.water IS NULL AND pt.amenity IS NULL) OR pt.leisure='swimming_pool' OR pt.water NOT IN ('river','wastewater','yes','basemap.at', 'oxbow'))"
				+ "UNION SELECT DISTINCT pl.name, pl.water,pl.leisure,pl.natural, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo, mhd.name AS mhd_name, mhd.operator, ST_AsGeoJSON(ST_Transform(mhd.way,4326)) AS geos FROM public.planet_osm_polygon pl INNER JOIN (SELECT name, way, operator FROM public.planet_osm_point pl WHERE pl.operator='DPB') AS mhd ON ST_DWithin(ST_Transform(mhd.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + req.query.trans + ") WHERE ((pl.natural='water' AND pl.water IS NULL AND pl.amenity IS NULL) OR pl.leisure='swimming_pool' OR pl.water NOT IN ('river','wastewater','yes','basemap.at', 'oxbow'))", function (err, result) {

					if (err) {
						return console.error('error running query', err);
					}
					client.end();

					result.rows.forEach(prepareMhdForMap);
					console.log(result.rowCount);
					res.end(JSON.stringify(result.rows));
				});
		}
		else if (req.query.transport == "car") {

			client.query("SELECT DISTINCT pt.name, pt.water,pt.leisure,pt.natural, ST_AsGeoJSON(ST_Transform(pt.way,4326)) AS geo, car.name AS car_name, car.amenity AS car_amenity, ST_AsGeoJSON(ST_Transform(car.way,4326)) AS geo_car, park.name AS park_name, park.amenity AS park_amenity, ST_AsGeoJSON(ST_Transform(park.way,4326)) AS geo_park FROM public.planet_osm_point pt INNER JOIN (SELECT name, way, amenity FROM public.planet_osm_point WHERE amenity IN ('parking', 'parking_space')) AS car ON ST_DWithin(ST_Transform(car.way,4326)::geography, ST_Transform(pt.way, 4326)::geography," + req.query.trans + ") INNER JOIN (SELECT name, way, amenity FROM public.planet_osm_polygon WHERE amenity IN ('parking', 'parking_space')) AS park ON ST_DWithin(ST_Transform(park.way,4326)::geography, ST_Transform(pt.way, 4326)::geography," + req.query.trans + ") WHERE ((pt.natural='water' AND pt.water IS NULL AND pt.amenity IS NULL) OR pt.leisure='swimming_pool' OR pt.water NOT IN ('river','wastewater','yes','basemap.at', 'oxbow'))" +
				"UNION SELECT DISTINCT pl.name, pl.water,pl.leisure,pl.natural, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo, car.name AS car_name, car.amenity AS car_amenity, ST_AsGeoJSON(ST_Transform(car.way,4326)) AS geo_car, park.name AS park_name, park.amenity AS park_amenity, ST_AsGeoJSON(ST_Transform(park.way,4326)) AS geo_park FROM public.planet_osm_polygon pl INNER JOIN (SELECT name, way, amenity FROM public.planet_osm_point WHERE amenity IN ('parking', 'parking_space')) AS car ON ST_DWithin(ST_Transform(car.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + req.query.trans + ") INNER JOIN (SELECT name, way, amenity FROM public.planet_osm_polygon WHERE amenity IN ('parking', 'parking_space')) AS park ON ST_DWithin(ST_Transform(park.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + req.query.trans + ") WHERE ((pl.natural='water' AND pl.water IS NULL AND pl.amenity IS NULL) OR pl.leisure='swimming_pool' OR pl.water NOT IN ('river','wastewater','yes','basemap.at', 'oxbow'))", function (err, result) {

					if (err) {
						return console.error('error running query', err);
					}
					client.end();

					result.rows.forEach(prepareParkForMap);
					console.log(result.rowCount);
					res.end(JSON.stringify(result.rows));
				});
		}
	});
});

app.get("/meals", function (req, res) {

	var distance = 300;
	var limit = 10;
	var client = new pg.Client(conString);
	client.connect(function (err) {
		if (err) {
			return console.error('could not connect to postgres', err);
		}
		client.query("SELECT DISTINCT ON (dist_water, meal.name) meal.name, meal.amenity, ST_AsGeoJSON(ST_Transform(meal.way,4326)) AS geo, mhd.name AS mhd_name, mhd.amenity AS mhd_amenity, mhd.operator AS mhd_operator, ST_AsGeoJSON(ST_Transform(mhd.way,4326)) AS geo_mhd, pl.name AS swim_name, pl.water,pl.leisure,pl.natural, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo_swim, ROUND(ST_Distance(ST_Transform(meal.way,4326)::geography,ST_Transform(pl.way,4326)::geography)::numeric,0) AS dist_water FROM (SELECT pl.name, pl.water,pl.leisure,pl.natural, pl.way FROM planet_osm_polygon pl WHERE (pl.name LIKE '" + req.query.place + "')) pl INNER JOIN (SELECT name, way, amenity, operator FROM public.planet_osm_point WHERE (operator='DPB' OR amenity IN ('parking', 'parking_space'))) AS mhd ON ST_DWithin(ST_Transform(mhd.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + distance + ") INNER JOIN (SELECT meal.name, meal.way, meal.amenity FROM planet_osm_point meal WHERE meal.amenity IN ('fast_food', 'restaurant', 'food_court')) AS meal ON (ST_DWithin(ST_Transform(meal.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + distance + ") OR ST_DWithin(ST_Transform(meal.way,4326)::geography, ST_Transform(mhd.way, 4326)::geography," + distance + "))"
			+ "UNION SELECT DISTINCT ON (dist_water, meal.name) meal.name, meal.amenity, ST_AsGeoJSON(ST_Transform(meal.way,4326)) AS geo, mhd.name AS mhd_name, mhd.amenity AS mhd_amenity, mhd.operator AS mhd_operator, ST_AsGeoJSON(ST_Transform(mhd.way,4326)) AS geo_mhd, pl.name AS swim_name, pl.water,pl.leisure,pl.natural, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo_swim, ROUND(ST_Distance(ST_Transform(meal.way,4326)::geography,ST_Transform(pl.way,4326)::geography)::numeric,0) AS dist_water FROM (SELECT pl.name, pl.water,pl.leisure,pl.natural, pl.way FROM planet_osm_point pl WHERE (pl.name LIKE '" + req.query.place + "')) pl INNER JOIN (SELECT name, way, amenity, operator FROM public.planet_osm_point WHERE (operator='DPB' OR amenity IN ('parking', 'parking_space'))) AS mhd ON ST_DWithin(ST_Transform(mhd.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + distance + ") INNER JOIN (SELECT meal.name, meal.way, meal.amenity FROM planet_osm_point meal WHERE meal.amenity IN ('fast_food', 'restaurant', 'food_court')) AS meal ON (ST_DWithin(ST_Transform(meal.way,4326)::geography, ST_Transform(pl.way, 4326)::geography," + distance + ") OR ST_DWithin(ST_Transform(meal.way,4326)::geography, ST_Transform(mhd.way, 4326)::geography," + distance + ")) ORDER BY dist_water LIMIT " + limit, function (err, result) {

				if (err) {
					return console.error('error running query', err);
				}
				client.end();

				result.rows.forEach(prepareRestForMap);
				console.log(result.rowCount);
				res.end(JSON.stringify(result.rows));
			});
	});
});

app.get("/mall_parking", function (req, res) {

	var client = new pg.Client(conString);
	client.connect(function (err) {
		if (err) {
			return console.error('could not connect to postgres', err);
		}

		if (req.query.parking == "car_park") {

			client.query("SELECT DISTINCT pl.name, pl.shop, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo FROM planet_osm_polygon pl INNER JOIN (SELECT par.name, par.way, par.amenity FROM planet_osm_point par WHERE par.amenity LIKE 'parking%') par ON ST_Contains(pl.way,par.way) WHERE pl.shop LIKE 'mall'", function (err, result) {

				if (err) {
					return console.error('error running query', err);
				}
				client.end();

				result.rows.forEach(prepareForMap);
				console.log(result.rowCount);
				res.end(JSON.stringify(result.rows));
			});
		}
		else if (req.query.parking == "bike_park") {

			client.query("SELECT DISTINCT pl.name, pl.shop, bic.name AS bic_name, bic.route AS bic_route, pl.route, pl.operator, ST_AsGeoJSON(ST_Transform(pl.way,4326)) AS geo, bicyc.bicyc_geo FROM (SELECT name, shop, route, operator, way FROM planet_osm_polygon WHERE shop LIKE 'mall') pl INNER JOIN (SELECT par.name, par.way, par.amenity FROM planet_osm_point par WHERE par.amenity LIKE 'bicycle%') par ON ST_Contains(pl.way,par.way) INNER JOIN (SELECT name, highway, way FROM planet_osm_line WHERE name IS NOT NULL AND highway IS NOT NULL) lin ON ST_DWithin(ST_Transform(lin.way,4326)::geography, ST_Transform(pl.way, 4326)::geography, 50) INNER JOIN (SELECT name, route, way FROM planet_osm_line WHERE route LIKE 'bicycle') bic ON ST_Intersects(bic.way, lin.way )INNER JOIN (SELECT pl.name, ST_AsGeoJSON(ST_Transform(ST_LineMerge(ST_Collect(pl.way)),4326)) as bicyc_geo FROM planet_osm_line pl WHERE pl.route LIKE 'bicycle' GROUP BY pl.name) bicyc ON bicyc.name = bic.name", function (err, result) {

				if (err) {
					return console.error('error running query', err);
				}
				client.end();

				result.rows.forEach(prepareForBikeMap);
				console.log(result.rowCount);
				res.end(JSON.stringify(result.rows));
			});
		}
	});
});

function prepareRestForMap(item, index, arr) {
	arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.amenity, "distance": item.dist_water }, geometry: JSON.parse(item.geo) };

	if (item.leisure != null) {
		arr.push({ type: "Feature", properties: { "title": item.swim_name, "description": item.leisure }, geometry: JSON.parse(item.geo_swim) });
	}
	else if (item.water != null) {
		arr.push({ type: "Feature", properties: { "title": item.swim_name, "description": item.water }, geometry: JSON.parse(item.geo_swim) });
	}
	else if (item.natural != null) {
		arr.push({ type: "Feature", properties: { "title": item.swim_name, "description": item.natural }, geometry: JSON.parse(item.geo_swim) });
	}
	if (item.mhd_operator != null) {
		arr.push({ type: "Feature", properties: { "title": item.mhd_name, "description": item.mhd_operator }, geometry: JSON.parse(item.geo_mhd) });
	}
	else if (item.mhd_amenity != null) {
		arr.push({ type: "Feature", properties: { "title": item.mhd_name, "description": item.mhd_amenity }, geometry: JSON.parse(item.geo_mhd) });
	}
}

function prepareMhdForMap(item, index, arr) {
	if (item.leisure != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.leisure }, geometry: JSON.parse(item.geo) };
	}
	else if (item.water != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.water }, geometry: JSON.parse(item.geo) };
	}
	else if (item.natural != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.natural }, geometry: JSON.parse(item.geo) };
	}
	arr.push({ type: "Feature", properties: { "title": item.mhd_name, "description": item.operator }, geometry: JSON.parse(item.geos) });
}

function prepareParkForMap(item, index, arr) {
	if (item.leisure != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.leisure }, geometry: JSON.parse(item.geo) };
	}
	else if (item.water != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.water }, geometry: JSON.parse(item.geo) };
	}
	else if (item.natural != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.natural }, geometry: JSON.parse(item.geo) };
	}

	arr.push({ type: "Feature", properties: { "title": item.car_name, "description": item.car_amenity }, geometry: JSON.parse(item.geo_car) });
	arr.push({ type: "Feature", properties: { "title": item.park_name, "description": item.park_amenity }, geometry: JSON.parse(item.geo_park) });
}

function prepareForMap(item, index, arr) {

	if (item.leisure != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.leisure }, geometry: JSON.parse(item.geo) };
	}
	else if (item.water != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.water }, geometry: JSON.parse(item.geo) };
	}
	else if (item.natural != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.natural }, geometry: JSON.parse(item.geo) };
	}
	else if (item.shop != null) {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.shop }, geometry: JSON.parse(item.geo) };
	}
	else {
		arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.amenity }, geometry: JSON.parse(item.geo) };
	}
}

function prepareForBikeMap(item, index, arr) {

	arr[index] = { type: "Feature", properties: { "title": item.name, "description": item.shop }, geometry: JSON.parse(item.geo) };
	arr.push({ type: "Feature", properties: { "title": item.bic_name, "description": item.bic_route }, geometry: JSON.parse(item.bicyc_geo) });
}

//port 5432
app.listen(3000, function () {
	console.log('Server started on port 3000');
});

