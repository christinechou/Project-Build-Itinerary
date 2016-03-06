

  // adds animation of scroll down to map when the user clicks the Submit button
  $(document).ready(function (){
          $("#form").click(function (){
            if (app.city && app.listOfDays) {
              $('html, body').animate({
                  scrollTop: $("#map").offset().top
              }, 800);
            } else return;
          });
      });


// initiates map and sets location to San Francisco on page load
function initMap () {
  app.myLatLng = {lat: 37.7751, lng: -122.4194};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    scrollwheel: false,
    center: app.myLatLng
  });
  infowindow = new google.maps.InfoWindow({
    content: document.getElementById("windowContent")
  });
};


// ****1. USER ENTERS CITY AND DATES****

var app = {
  // Uses Google Maps Geocode API to request a JSON response for a query on the city entered by the user
  grabCoordinates: function() {
    var city = document.querySelector("input.inputBox").value;
    city = "bergen"
    app.city = city;
    if (city) {
      var cityInQuotes = "\"" + city + "\""
      var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+cityInQuotes+"AIzaSyBMEriLb8zqxFSVBWArM6n3MxonN5d-cLY";
      //Sends request to grab JSON file using above URL
      $.get(geocodeURL,app.setLocationBias);

    } else {
      alert("Oops, did you input your travel city?");
    }
  },
  //API function: saves the new coordinates retrieved from Google Maps Geocode API as global variables and re-centers the map based on the new coordinates submitted by user. This also sets the location bias for searches (e.g., when the user searches for hotels in the second section, the results will be pre-set within a certain radius of the user-entered city)
  setLocationBias: function (results) {
    if (results.status === "ZERO_RESULTS") {
      alert("Hmm, that location couldn't be found. Try searching for a city or more specific location.")
    } else {
      app.myLatLng.lat = results.results[0].geometry.location.lat;
      app.myLatLng.lng = results.results[0].geometry.location.lng;
      console.log(app.myLatlng);
      }
    //Relocates the map based on user input city
    var relocate = new google.maps.LatLng(app.myLatLng);
    map.setCenter(relocate);
  },


  //DOM function which calculates the days in between the user input departure and arrival dates, re-formats from standard time format, displays summary text that shows the length of the vacation, posts all individual travel dates as buttons which allows the user to filter through saved results in his/her itinerary, and finally appends header divs for each day to the page
  getTravelDates: function() {
    app["itinerary"] = [];
    app["markers"] = [];
    arriveDate = document.querySelector("input.form-content.arriving").value;
    departDate = document.querySelector("input.form-content.departing").value;
    var firstDate = new Date(arriveDate);
    var firstDateOffset = new Date(firstDate.getTime() + firstDate.getTimezoneOffset()*60000);
    var secondDate = new Date(departDate);
    var secondDateOffset = new Date(secondDate.getTime() + secondDate.getTimezoneOffset()*60000);
        year = firstDateOffset.getFullYear();
        month = firstDateOffset.getMonth();
        day = firstDateOffset.getDate();
        dates = [firstDateOffset];
    //Pushes travel dates into array to append to page
    if (arriveDate && departDate && firstDateOffset <= secondDateOffset) {
    while (dates[dates.length-1] < secondDate) {
      day++
      dates.push(new Date(year, month, day)) //e.g., dates = [[Tue Feb 02 2016 00:00:00 GMT-0800 (PST), Wed Feb 03 2016 00:00:00 GMT-0800 (PST), Thu Feb 04 2016 00:00:00 GMT-0800 (PST)]
      }
    }
    //Re-format long date to shortened version (to create filter buttons) in dates array for all individual dates between arrival up to and including departure
    var listOfDays = [];  // e.g., listOfDays = [Tue Feb 02, Wed Feb 03, Thu Feb 04];
    listOfDays = mapf(dates, function(date) {
      return date.toString().split(" ").slice(0,3).join(" ");
    });
    var listOfDaysObj = {}; // e.g., listOfDaysObj = {1: Tue Feb 02, 2: Wed Feb 03, 3: Thu Feb 04}
    each(listOfDays, function(date) {
      if (listOfDays.indexOf(date) < 0) {
        listOfDays[1] = date;
      }
      else listOfDaysObj[listOfDays.indexOf(date)+1] = date;
    });
    app["listOfDays"] = listOfDays;
    app["listOfDaysObj"] = listOfDaysObj;

    //Appends dates to document as 1) summary of length of trip in the header,  2) filter buttons, and 3) separaters for all activities in the itinerary by date
    app.printToHeader();
    each(app.listOfDays, app.printToItineraryFilters);
  },

//Client-side DOM. Displays summary to itinerary (document) and adds content and event listeners to make itinerary interactive (so users can view their saved places in their itinerary for each date (or all dates) in one place).  Number of days and nights of travel are calculated based on user input arrival/departure dates.
  printToHeader: function() {
    dateDiffDays = app.listOfDays.length;
    dateDiffNights = dateDiffDays - 1;
    document.getElementById('itinerary-header').style.display = ''
    if (dateDiffNights > 1) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " days </h1><h2>and </h2><h1> " + dateDiffNights + " nights </h1><h2>in " + app.city + "</h2>";
    } else if (dateDiffNights === 1) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " days </h1><h2>and </h2><h1>" + dateDiffNights + " night</h1><h2> in " + app.city + "</h2>";
    } else if (dateDiffNights === 0) {
      document.getElementById('itinerary-header').innerHTML = "<h2>You are spending </h2><h1>" + dateDiffDays + " glorious day </h1><h2> in " + app.city + "... perhaps you can consider taking a real vacation sometime soon!</h2>";
    }
  },
  //If the user has not already submitted the dates, append the appropriate date/buttons to section three
  printToItineraryFilters: function(value, index) {
    var sortByDay = document.createElement("input");
    var dayOfTrip = index+1;
    //Creates an event listener for each date/button, which, when pressed, will execute the Load Itinerary function based on the selected date.  Used an IIFE to store the value of the key at the time of the loop. This would prevent the last value of the key to be executed by the time the user clicks on the button.
      (function(_dayOfTrip){
        sortByDay.addEventListener("click", function() {
          app.loadItineraryf(parseInt(_dayOfTrip));
        })
      })(dayOfTrip);
    //Appends buttons to page
    if (document.getElementById("Day "+dayOfTrip) === null) {
      div.appendChild(sortByDay);
      sortByDay.setAttribute("type", "button");
      sortByDay.classList.add("individual-date")
      // sortByDay.setAttribute("id", "activity-date-sorter-" + key);
      sortByDay.setAttribute("value", value);

    app.printToItineraryBody(value,dayOfTrip);
    }
  },
  //Prints date headers to itinerary body
  printToItineraryBody: function(date, day) {
    console.log(date, day);
      var activityHeader = document.createElement("div");
      activityHeader.setAttribute("id", "Day " + day);
      activities.appendChild(activityHeader);
      activityHeader.setAttribute("id", "Day " + day);
      activityHeader.innerHTML = "<h3> Day " + day + ": " + date + "</h3>";
  },

// ****2. USER SEARCHES FOR PLACES/ACTIVITIES USING GOOGLE MAPS****

// Uses Google Maps Places API to search for places by keyword and plots results on the map
  searchPlace: function(place) {
    if (app.city == undefined) {
      alert("Enter the name of the city to which you're traveling above")
    } else {
      places = new google.maps.places.PlacesService(map);
      //Accessing Google Maps Places API using required parameters (user selected coordinates, radius, and keyword) to produce the results via Nearby Search, then clears markers from map before dropping new markers for each result
    places.nearbySearch({
      location: app.myLatLng,
      radius: 2500,
      keyword: [place],
      types: [place],
      rankby: google.maps.places.RankBy.PROMINENCE
    }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          app.clearMarkers();
      //For each result, create a marker with relevant information
        for (var i = 0; i < results.length; i++) {

          var placeLoc = results[i].geometry.location
          app.markers[i] = new google.maps.Marker({
            position: placeLoc,
            animation: google.maps.Animation.DROP,
            placeResult: results[i]
          });
      //When user clicks on a marker, it fires a function that displays a window containing information about the place
          google.maps.event.addListener(app.markers[i],'click', app.addInfoWindow);
          setTimeout(app.dropMarker(i), i*20);
        }
        }
      });
    }
  },

    //Callback functions that pass either a pre-specified term or by user input term as a parameter of another function
    searchHotel: function() {
      app.searchPlace("hotel");
    },
    searchRestaurant: function() {
      app.searchPlace("restaurant");
    },
    searchMuseum: function() {
      app.searchPlace("museum");
    },
    searchOther: function() {
      userSearch = document.querySelector("#placessearch").value;
      app.searchPlace(userSearch);
    },

  //DOM function which clears markers from the map (does erase contents from the markers array since we do not need to retain search results)
  clearMarkers: function() {
    if (!app.markers) return;
    for (var i = 0; i < app.markers.length; i++) {
      if (app.markers[i]) {
        app.markers[i].setMap(null);
      }
    }  app.markers = [];
  },
//When a search is made, these functions hide/show items in itinerary and does not erase contents of itinerary
  hideMarkers: function() {
    if (!app.markers) return;
    if (app.itinerary.length !== 0) {
    var itineraryFormatted = mapf(app.intinerary,function(activity) {
      return activity.marker
    });
    each( itineraryFormatted, function(marker) {
      marker.setVisible(false);
    });
    }
  },
  unHideMarkers: function() {
    var itineraryFormatted = mapf(app.intinerary, function (activity) {
      return activity.marker
    });
    each(itineraryFormatted,function(marker) {
      marker.setVisible(true);
    });
  },
//Drops markers on map for each result
  dropMarker: function(i) {
    return function() {
      app.markers[i].setMap(map);
    };
  },

  // Function that uses Google Place Details API to produce a window containing information about each place
  addInfoWindow: function() {
    var marker = this;
    //Uses place_id to access Google Search Details API and retrieve additional information about place
    places.getDetails({ placeId: marker.placeResult.place_id}, function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
        infowindow.open(map,marker);
        app.buildInfoWindowContent(place,marker);
    });
  },

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
    //adds "Add to Itinerary" option which feeds into the list of saved items in itinerary
    document.getElementById('iw-itinerary-content').innerHTML = '<input type="button" id="iw-itinerary-button" value="Add to Itinerary" > ' ;

    var addButton = document.querySelector("#iw-itinerary-button");

  //storing relevant place details to array
    app.iw = [];
    app.iw[app.iw.length] = {
      "name": place.name,
      "placeid": place.place_id,
      "address": place.vicinity,
      "photo": place.photos,
      "phone": place.formatted_phone_number,
      "marker": marker
    };

    //Add method which takes itinerary items and uses DOM to create and append elements on page
    app.iw.methodCreateItineraryDOM = app.method;

    //Add event listener which adds place to global itinerary array and appends relevant info about place to the page
    addButton.addEventListener("click", function() {
      app.iw.methodCreateItineraryDOM();
    });

  },

  // ****3. USER INTERACTS WITH ITINERARY (FILTER ACTIVITIES BY DATE)****

  //Takes itinerary items and uses DOM to create and append elements on page
  method: function() {
    //prompts for day user wants to visit place
    var day = parseInt(prompt("Which day of your vacation to you plan on going? (Enter a number, e.g., 1 which represents the first day you arrive)"));
    if (day > dateDiffDays || day < 1 || !day) {
      day = parseInt(prompt("You entered an invalid day. It must be a number from 1 to " + dateDiffDays));
    };
    day = day.toString();

    var marker = this[0];
    //As user adds one by one, function stores relevant place information in the itinerary array and then creates and appends elements to the page on which to display the saved results
    app.itinerary[app.itinerary.length] = {
      "name": marker.name,
      "placeid": this.placeid,
      "address": this.address,
      "photo": this.photo,
      "phone": this.phone,
      "day": parseInt(day),
      "marker": marker.marker
    }
    app.itinerary[app.itinerary.length-1].marker.animation = google.maps.Animation.DROP;

    // HTML DOM to create and append place info to itinerary
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

    activityName.innerHTML = "<h4>" + marker.name + "</h4>";
    activityAddr.innerHTML = "<h5><b> Address: </b>" + marker.address + "</h5>";
    if (marker.photo !== undefined && marker.photo[0].getUrl({maxWidth:285})) {
      activityImage.textContent = marker.photo[0];
      activityImage.setAttribute("src", marker.photo[0].getUrl({ maxWidth:200, maxHeight: 100}));
    } else {
      activityImage.style.display = 'none';
      }
  },

//Function that is called when either the "Load full itinerary" button or any of the individual date buttons are clicked.  Shows full itinerary and/or filters by select dates in itinerary both via MARKERS on map (to show location) and ACTUAL TEXT/IMAGE CONTENT appended to page
  loadItineraryf: function(day) {
  //if a day is provided as argument, filter activities by the specified day in itinerary, show the specified markers on a map, and hide activities for all other days in itinerary.
    if (typeof day == "number") {
      var daysFiltered = filterf(app.itinerary,function(activity) {
        console.log(activity.day);
        return activity.day === parseInt(day);
      });
    // Filter and hide activities outside of the specified date MARKER
      var hideDays = filterf(app.itinerary, function(activity) {
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
      for (var i = 1; i <= app.listOfDays.length; i++) {
        if (i === day) {
        document.getElementById("Day " + i).style.display = '';
        } else {
        document.getElementById("Day " + i).style.display = 'none';
        }
      };
    } else {
    //Show all activities in itinerary
      var daysFiltered = app.itinerary;
      for (var i = 1; i <= app.listOfDays.length; i++) {
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
    app.clearMarkers();

    for (var i = 0; i < daysFiltered.length; i++) {
      app.itinerary[i].marker.animation = google.maps.Animation.DROP;
      setTimeout(dropItineraryMarker(i), i*80);
      function dropItineraryMarker(i) {
        return function() {
            byMarker[i].setMap(map)
          }
        };
      }
  }
};
