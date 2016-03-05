

  // adds animation of scroll down to map when the user clicks the Submit button
  $(document).ready(function (){
          $("#form").click(function (){
            if (city) {
              $('html, body').animate({
                  scrollTop: $("#map").offset().top
              }, 800);
            } else return;
          });
      });


// initiates map and sets location to San Francisco on page load
function initMap () {
  var myLatlng = {lat: 37.7751, lng: -122.4194};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    scrollwheel: false,
    center: myLatlng
  });
  infowindow = new google.maps.InfoWindow({
    content: document.getElementById("windowContent")
  });
};


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
    if (itinerary.length !== 0) {
    var itineraryFormatted = mapf(intinerary,function(activity) {
      return activity.marker
    });
    each( itineraryFormatted, function(marker) {
      marker.setVisible(false);
    });
  }
  },
  unHideMarkers: function() {
    var itineraryFormatted = mapf(intinerary, function (activity) {
      return activity.marker
    });
    each(itineraryFormatted,function(marker) {
      marker.setVisible(true);
    });
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
    //Uses place_id to access Google Search Details API and retrieve additional information about place
    places.getDetails({ placeId: marker.placeResult.place_id}, function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infowindow.open(map,marker);
      itineraryActions.buildInfoWindowContent(place,marker);

    });
  }
};

var searchActions = {
// Uses Google Maps Geocode API to request a JSON response for a query on the city entered by the user
  getLocation: function() {
    city = document.querySelector("input.inputBox").value;
    if (city) {
      var cityInQuotes = "\"" + city + "\""
      var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+cityInQuotes+"AIzaSyBMEriLb8zqxFSVBWArM6n3MxonN5d-cLY";
      //return JSON and get re-center map based on location input by user
      $.get(geocodeURL,setLocationBias);

      // Saves the new coordinates retrieved from Google Maps Geocode API as global variables and re-centers the map based on the new coordinates submitted by user. This also sets the location bias for searches (e.g., when the user searches for hotels in the second section, the results will be pre-set within a certain radius of the user-entered city)
      function setLocationBias (results) {
        if (results.status === "ZERO_RESULTS") {
          alert("Hmm, that location couldn't be found. Try searching for a city or more specific location.")
        } else {
          userSelectLat = results.results[0].geometry.location.lat;
          userSelectLng = results.results[0].geometry.location.lng;
          console.log(userSelectLat + ", " + userSelectLng);
          }
        var relocate = new google.maps.LatLng(userSelectLat, userSelectLng);
        map.setCenter(relocate);
      };
    } else {
      alert("Oops, did you input your travel city?");
    }
  },


// Searches for places by keyword using Google Places library (Google Maps Javascript API) and plots results on the map
  searchPlace: function(place) {
    if (city == undefined) {
      alert("Enter the name of the city to which you're traveling above")
    } else {
      places = new google.maps.places.PlacesService(map);
      //Accessing Google Maps Places API using required parameters (user selected coordinates, radius, and keyword) to produce the results via Nearby Search, then clears markers from map before dropping new markers for each result
    places.nearbySearch({
      location: {lat: userSelectLat, lng: userSelectLng},
      radius: 2500,
      keyword: [place],
      types: [place],
      rankby: google.maps.places.RankBy.PROMINENCE
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          markerActions.clearMarkers();
          markerActions.hideMarkers();
      //For each result, create a marker with relevant information
        for (var i = 0; i < results.length; i++) {
          var placeLoc = results[i].geometry.location
          markers[i] = new google.maps.Marker({
            position: placeLoc,
            animation: google.maps.Animation.DROP,
            placeResult: results[i]
         });
        //When user clicks on a marker, it fires a function that displays a window containing information about the place
          google.maps.event.addListener(markers[i],'click', markerActions.showInfoWindow);
          setTimeout(markerActions.dropMarker(i), i*20);
        }
        }
      });
    }
  },
  //Callback functions that passing either a pre-specified term or by user input term as a parameter of another function
  searchHotel: function() {
    searchActions.searchPlace("hotel");
  },
  searchRestaurant: function() {
    searchActions.searchPlace("restaurant");
  },
  searchMuseum: function() {
    searchActions.searchPlace("museum");
  },
  searchOther: function() {
    userSearch = document.querySelector("#placessearch").value;
    searchActions.searchPlace(userSearch);
  }
};

var itineraryActions = {
    //Function that builds content about place inside of info window by appending elements to the page (if available)
    buildInfoWindowContent: function(place,marker) {
    //adds place name
      document.getElementById('iw-placeName-content').innerHTML = '<b><h3><a href="' + place.website + '">' + place.name + '</a></h3></b>';
      //adds place photo
      if (place.photos !== undefined && place.photos[0].getUrl({maxWidth:285})) {
        document.getElementById('iw-picture').style.display = '';
        document.getElementById('iw-picture-content').innerHTML = '<img src="' + place.photos[0].getUrl({ maxWidth:285, maxHeight: 150}) + '"/>';
      } else {
        document.getElementById('iw-picture').style.display = 'none';
        }
      //adds place address
      document.getElementById('iw-address-content').textContent = place.vicinity;
      //adds place phone number
      if (place.formatted_phone_number) {
        document.getElementById('iw-phone').style.display = '';
        document.getElementById('iw-phone-content').textContent = place.formatted_phone_number;
      } else {
        document.getElementById('iw-phone').style.display = 'none';
      }
      //adds place rating
      if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
          if (place.rating > (i+0.5)) {
            ratingHtml += '&#10003;';
          }
        document.getElementById('iw-rating').style.display = '';
        document.getElementById('iw-rating-content').innerHTML = ratingHtml + " (" + place.rating + "/5)";
        }
          } else {
              document.getElementById('iw-rating').style.display = 'none';
            }
      document.getElementById('iw-placeId-content').innerHTML = place.place_id
      document.getElementById('iw-placeId').style.display = 'none';
      var placeid = place.place_id;
      //adds "Add to Itinerary" option which feeds into the list of saved items in itinerary
      document.getElementById('iw-itinerary-content').innerHTML = '<input type="button" id="iw-itinerary-button" value="Add to Itinerary" > ' ;

      //Add event listener which adds place to global itinerary array and appends relevant info about place to the page
      var addButton = document.querySelector("#iw-itinerary-button");
      addButton.addEventListener("click", addToItinerary);

      //Add function ***WITHIN THE SCOPE OF the buildInfoWindowContent function*** so it has access to all corresponding marker contents/place details for the specific place and time for and upon which the user clicks and function is invoked (when user clicks on the "Add to Itinerary" button)
      //Stores relevant place information in the global itinerary array and then creates and appends elements to the page on which to display the saved results
      function addToItinerary() {
        day = parseInt(prompt("Which day of your vacation to you plan on going? (Enter a number, e.g., 1 which represents the first day you arrive)"));
        if (day > dateDiffDays || day < 1 || !day) {
          day = parseInt(prompt("You entered an invalid day. It must be a number from 1 to " + dateDiffDays));
        };
        day = day.toString();
        var objDate = {};
        objDate[day] = formattedDates[day-1];
        itinerary[itinerary.length] = {
          "name": place.name,
          "day": day,
          "dayObj": objDate,
          "placeid": place.place_id,
          "address": place.vicinity,
          "photo": place.photos,
          "phone": place.formatted_phone_number,
          "marker": marker
        };
        itinerary[itinerary.length-1].marker.animation = google.maps.Animation.DROP;

        console.log(itinerary);

        var activityContainer = document.createElement("div");
        var activityName = document.createElement("div");
        var activityAddr = document.createElement("div");
        var activityImage = document.createElement("img");

        activityContainer.appendChild(activityImage);
        document.getElementById('Day ' + day).appendChild(activityContainer)
        activityContainer.appendChild(activityName);
        activityContainer.appendChild(activityAddr);

        activityContainer.setAttribute("id", "activity-container")
        activityName.classList.add("activity-name");
        activityAddr.classList.add("activity-address");

        activityName.innerHTML = "<h4>" + place.name + "</h4>";
        activityAddr.innerHTML = "<h5><b> Address: </b>" + place.vicinity + "</h5>";
        if (place.photos !== undefined && place.photos[0].getUrl({maxWidth:285})) {
          activityImage.textContent = place.photos[0];
          activityImage.setAttribute("src", place.photos[0].getUrl({ maxWidth:200, maxHeight: 100}));
        } else {
          activityImage.style.display = 'none';
          }
      }
    },

  //Function which calculates the days in between the user input departure and arrival dates, displays summary text that shows the length of the vacation, posts all individual travel dates as buttons which allows the user to filter through saved results in his/her itinerary, and finally appends header divs for each day to the page
  calculateDays: {
    arriveDepartDates: function() {
      arriveDate = document.querySelector("input.form-content.arriving").value;
      departDate = document.querySelector("input.form-content.departing").value;
      console.log("arrivedepartworking")
      var firstDate = new Date(arriveDate);
      var firstDateOffset = new Date(firstDate.getTime() + firstDate.getTimezoneOffset()*60000);
      var secondDate = new Date(departDate);
      var secondDateOffset = new Date(secondDate.getTime() + secondDate.getTimezoneOffset()*60000);
          year = firstDateOffset.getFullYear();
          month = firstDateOffset.getMonth();
          day = firstDateOffset.getDate();
          dates = [firstDateOffset];
      //Pushes travel dates into array in global scope for other functions to reference
      if (arriveDate && departDate && firstDateOffset <= secondDateOffset) {
      while (dates[dates.length-1] < secondDate) {
        day++
        dates.push(new Date(year, month, day))
        }
      }
   //Adjusts long date format to shortened version (to create filter buttons) in dates array for all individual dates between arrival up to and including departure to an array
    formattedDates = mapf(dates, function(date) {
      return date.toString().split(" ").slice(0,3).join(" ");
    });

    each(formattedDates, function(date) {
      if (formattedDates.indexOf(date) < 0) {
        formattedDatesObj[1] = date;
      }
      else formattedDatesObj[formattedDates.indexOf(date)+1] = date;
    });


  //Client-side DOM INSIDE arriveDepartDates for easy access to scope.  Displays summary to itinerary (document) and adds content and event listeners to make itinerary interactive (so users can view their saved places in their itinerary for each date (or all dates) in one place).  Number of days and nights of travel are calculated based on user input arrival/departure dates.
  printDaysItinerary();
    function printDaysItinerary() {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    dateDiffDays = Math.round((Math.abs(firstDate.getTime() - secondDate.getTime())/oneDay))+1
    dateDiffNights = dateDiffDays - 1;
    document.getElementById('itinerary-header').style.display = ''
    if (dateDiffNights > 1) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " days </h1><h2>and </h2><h1> " + dateDiffNights + " nights </h1><h2>in " + city + "</h2>";
    } else if (dateDiffNights === 1) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " days </h1><h2>and </h2><h1>" + dateDiffNights + " night</h1><h2> in " + city + "</h2>";
    } else if (dateDiffNights === 0) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " glorious day </h1><h2> in " + city + "... perhaps you can consider taking a real vacation sometime soon!</h2>";
    }
  //If the user has not already submitted the dates, append the appropriate date/buttons to section three
    if (!createButtons) {
      for (var key in formattedDatesObj) {
        createButtons = true;
        var sortByDay = document.createElement("input");
      //Creates an event listener for each date/button, which, when pressed, will execute the Load Itinerary function based on the selected date.  Used an IIFE to store the value of the key at the time of the loop. This would prevent the last value of the key to be executed by the time the user clicks on the button.
        (function(_key){
          sortByDay.addEventListener("click", function() {
            itineraryActions.loadItineraryf(parseInt(_key));
          })
        })(key);
      //Appends buttons to page
        div.appendChild(sortByDay);
        sortByDay.setAttribute("type", "button");
        sortByDay.classList.add("individual-date")
        // sortByDay.setAttribute("id", "activity-date-sorter-" + key);
        sortByDay.setAttribute("value", formattedDatesObj[key]);

      //Prints actual itinerary headers to page if they do not already exist.
        if (document.getElementById("Day " + key) === null) {
          var activityHeader = document.createElement("div");
          activityHeader.setAttribute("id", "Day " + day);

          activities.appendChild(activityHeader);
          activityHeader.setAttribute("id", "Day " + key);
          activityHeader.innerHTML = "<h3> Day " + key + ": " + formattedDatesObj[key] + "</h3>";
        }
      }
    } else {
        alert("Dates aren't valid.  Try again!");
      }
    }
  },

//Function that is called when either the "Load full itinerary" button or any of the individual date buttons are clicked.  Shows full or filters by select dates in itinerary both via MARKERS on map (to show location) and ACTUAL TEXT/IMAGE CONTENT appended to page
  loadItineraryf: function(day) {
  //if a day is provided as argument, filter activities by the specified day in itinerary, show the specified markers on a map, and hide activities for all other days in itinerary.
    if (typeof day == "number") {
      var daysFiltered = filterf(itinerary,function(activity) {
        return activity.day == parseInt(day);
      });
    // Filter and hide activities outside of the specified date MARKER
      var hideDays = filterf(intinerary, function(activity) {
        return activity.day !== parseInt(day);
      });
      var hideDaysByMarker = mapf(hideDays,function(activity) {
        return activity.marker
      });
      each(hideDaysByMarker,function(marker) {
        marker.setVisible(false);
      });
    //Filter and hide activities outside of the specified date SCREEN CONTENT
      // document.getElementById("Day " + day).style.display = '';
      for (var i = 1; i <= formattedDates.length; i++) {
        if (i === day) {
        document.getElementById("Day " + i).style.display = '';
        } else {
        document.getElementById("Day " + i).style.display = 'none';
        }
      };
    } else {
    //Show all activities in itinerary
      var daysFiltered = itinerary;
      for (var i = 1; i <= formattedDates.length; i++) {
        document.getElementById("Day " + i).style.display = '';
      };
    }
    //Create a variable that accesses the filtered itinerary and creates a new array which organizes the data by marker (for dropping markers)
    var byMarker = mapf(daysFiltered,function(activity) {
      return activity.marker
    })
    each( byMarker, function(marker) {
      marker.setVisible(true);
    });
    markerActions.clearMarkers();
    for (var i = 0; i < daysFiltered.length; i++) {
      itinerary[i].marker.animation = google.maps.Animation.DROP;
      setTimeout(dropItineraryMarker(i), i*80);
      function dropItineraryMarker(i) {
        return function() {
            byMarker[i].setMap(map)
          }
        };
      }
  }
}
};

// Helper functions
  var each = function(array, iteration) {
    if (!array) {alert("array reference missing")}
    for (var i = 0; i < array.length; i++) {
      iteration(array[i], i, array)
    }
  };
  var mapf = function(array, iteration) {
    var map = [];
    each(array, function(value,index) {
        map.push(iteration(value, index))
      });
    return map;
  };
  var filterf = function(array, test) {
    var passed = [];
    each(array, function(value,index) {
      if (test) {
        passed.filterf(value)
      }
    }); return passed;
  };
