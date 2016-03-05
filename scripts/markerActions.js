
var markerActions = {
  //Clears markers from the map (this does erase contents from the markers array since we do not need to retain search results)
  clearMarkers: function() {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i]) {
        markers[i].setMap(null);
      }
    }  markers = [];
  },
//When a search is made, these functions hides/show items in itinerary array (does not erase contents of itinerary)
  hideMarkers: function() {
    var itineraryFormatted = itinerary.map( function(activity) { return activity.marker });
    itineraryFormatted.forEach( function(marker) {marker.setVisible(false); });
  },
  unHideMarkers: function() {
    var itineraryFormatted = itinerary.map(function (activity) { return activity.marker });
    itineraryFormatted.forEach( function(marker) {marker.setVisible(true); });
  },
//Drops markers on map for each result
  dropMarker: function(i) {
    return function() {
      markers[i].setMap(map);
    };
  },

  // Function that produces a window containing information about each place
  showInfoWindow: function() {
    var marker = this;
    places.getDetails({ placeId: marker.placeResult.place_id}, function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infowindow.open(map,marker);
      itineraryActions.buildInfoWindowContent(place,marker);
    });
  }
};
