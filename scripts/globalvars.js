

//setting map variables outside the initMap function to allow for callback functions to retrieve variables in global scope
  var map;
  var marker;
  var infowindow;
  var places;
  var markers = [];
  var itinerary = [];
  var byMarker;

  //save the Submit button, the city entered, and its coordinates as global variables
  var city;
  var userSelectLat;
  var userSelectLng;

  //setting date variables in global scope to allow callback functions to retrieve variables once called
  var day;
  var formattedDates;
  var formattedDatesObj = {};
  var createButtons = false;

  //Various buttons used for triggering events by section:
  //Section One:
  var button = document.querySelector("input.form");
  //Section Two:
  var searchHotelButton = document.querySelector("input.searchHotel");
  var searchRestaurantButton = document.querySelector("input.searchRestaurants");
  var searchMuseumButton = document.querySelector("input.searchMuseums");
  var search = document.querySelector("input.search");
  //Section Three
  var loadItinerary = document.querySelector("input.load-itinerary");
  var div = document.querySelector("#sort-by-date");
  var activities = document.querySelector("#activities")

  //Event Listeners:
  //Add an event listener which re-centers the map based on the city the user enters and submits, sets location bias for the places search below, and calculates/displays on page length of vacation
  button.addEventListener("click", searchActions.getLocation);
  button.addEventListener("click", itineraryActions.calculateDays.arriveDepartDates)
  //Add event listeners which search for the place/activity the user selects or is pre-selected via the Google Places API and plots these results on the map based on the city name s/he entered at top of page.
  searchHotelButton.addEventListener("click", searchActions.searchHotel)
  searchRestaurantButton.addEventListener("click", searchActions.searchRestaurant)
  searchMuseumButton.addEventListener("click", searchActions.searchMuseum)
  search.addEventListener("click", searchActions.searchOther);
  //Add an event listener which loads itinerary content on the page
  loadItinerary.addEventListener("click", itineraryActions.loadItineraryf)
