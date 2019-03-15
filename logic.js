// Store our API endpoint inside queryUrl
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

// Set Color
// var setcolor = "";
function setcolor(magcolor) {
  if (magcolor > 8) {
    magcolor = '#FF0000';
  } else if (magcolor > 6) {
    magcolor = '#FFA500';
  } else if (magcolor > 3) {
    magcolor = '#FFFF00';
  } else {
    magcolor = '#FFFFFF';
  } return magcolor;
}

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup('<h3>' + feature.properties.place +'</h3><hr><p>' +
    new Date(feature.properties.time) + '</p>Magnitude: '+feature.properties.mag);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);

  function pointToLayer(feature, latlng) {
    return new L.circle(latlng, {
      fillOpacity: 0.50,
      color: setcolor(feature.properties.mag),
      fillColor: setcolor(feature.properties.mag),

      // Adjust radius
      radius: feature.properties.mag * 50000,
    });
  }
}

function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY,
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY,
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [21.311993, -13.0],
    zoom: 2.5,
    layers: [streetmap, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({
    position: 'bottomright',
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var limits = [0, 3, 6, 8  ];
    var colors = ['#FFFFFF', '#FFFF00', '#FFA500', '#FF0000'];
    var labels = [];

    div.innerHTML += "<h3>Magnitude</h3>";

    for (var i = 0; i < limits.length; i++) {
      div.innerHTML += '<i style ="background:' + colors[i] + '"></i>' +
      limits[i] + (limits [i + 1] ? '&ndash;' + limits [i + 1] + '<br>' : '+');
    }

    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

}
