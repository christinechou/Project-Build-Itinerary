

//setting map variables outside the initMap function to allow for callback functions to retrieve variables in global scope
  var map;
  var infowindow;
  var places;
  var byMarker;


  //save the Submit button, the city entered, and its coordinates as global variables
  var userSelectLat;
  var userSelectLng;

  //Buttons used for triggering events by section:
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

  //Event Listeners (NOTE: There are event listeners inside tripplanner.js that are dependent on the context in which user calls the function and must be placed within that function's scope):
  //Add an event listener which re-centers the map based on the city the user enters and submits, sets location bias for the places search below, and calculates/displays on page length of vacation
  button.addEventListener("click", app.grabCoordinates);
  button.addEventListener("click", app.getTravelDates)
  //Add event listeners which search for the place/activity the user selects or is pre-selected via the Google Places API and plots these results on the map based on the city name s/he entered at top of page.
  searchHotelButton.addEventListener("click", app.searchHotel)
  searchRestaurantButton.addEventListener("click", app.searchRestaurant)
  searchMuseumButton.addEventListener("click", app.searchMuseum)
  search.addEventListener("click", app.searchOther);
  //Add an event listener which loads itinerary content on the page
  loadItinerary.addEventListener("click", app.loadItineraryf)
