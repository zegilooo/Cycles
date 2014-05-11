window.onload = function() {
var G_MarkerArray = []; 
var createXHR = function(){var e;if(window.ActiveXObject){try{e=new ActiveXObject("Microsoft.XMLHTTP")}catch(t){alert(t.message);e=null}}else{e=new XMLHttpRequest}return e};
var feedBack = function (c, db){
    if(db == 1){
    var myUrl ='http://cycles.lizazil.com/feedback/feedBack?q={geoindex:{$near:['+c.lng+','+c.lat+']}}';
    }
    /*else{
    var myUrl ='http://cycles.lizazil.com/feedback2/feedBack/documents?q={geoindex:{$near:['+c.lng+','+c.lat+']}}';
    console.log('database2 in use');
    }*/
    var myXhr = createXHR();
    try {
        myXhr.open('PUT', myUrl, true);
    }
    catch (err) {
        alert(err.message);
        throw "ImpossibleAjaxRequest";
    } 
 myXhr.setRequestHeader('Content-type', 'application/json');
 myXhr.send(JSON.stringify( { $inc: { count: 1 } }));
 myXhr.onreadystatechange = function()
  {
   if (myXhr.readyState === 4){
                if(myXhr.status==200){
                }
                else
                {
              //  if(db == 1) feedBack(c, 2); // try database2
                }
      }
     };
    };
var callAllStations = function (c, db){
 var handlerKiller = true;
 feedBack(c, 1);
    if(db == 1) {
	var myUrl ='http://cycles.lizazil.com/database/allStations?q={coordinates:{$near:['+c.lng+','+c.lat+']}}&l=10';
    }
    else {
    var myUrl ='http://cycles.lizazil.com/database2/allStations/documents?q={coordinates:{$near:['+c.lng+','+c.lat+']}}&limit=10';
    console.log('database2 in use');
    }
    var myXhr = createXHR();
    try {
        myXhr.open('GET', myUrl, true);
    }
    catch (err) {
        alert(err.message);
        throw "ImpossibleAjaxRequest";
    } 
 myXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
 myXhr.send();
 myXhr.onreadystatechange = function()
  {
   if (myXhr.readyState === 4){
        if(myXhr.status==200){
            if (handlerKiller) {
                handlerKiller = false;
                var listStations = JSON.parse(myXhr.responseText);
                listStations.forEach(function(station) {
                    callJCDecaux(station, false); 
                    });
                }
            }
            else
            {
            if(db == 1) callAllStations(c, 2); // try database2
            }
      }
     };
    };
var callJCDecaux = function (station, replace) {
 var G_handlerKiller = true;
 var jcUrl ='http://cycles.lizazil.com/jcdecaux/stations/'+station.number+'?contract='+station.contract;
 var jcXhr = createXHR();
    try {
     jcXhr.open('GET', jcUrl, true);
    }
    catch (err) {
        alert(err.message);
        throw "ImpossibleAjaxRequest";
    } 
 jcXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
 jcXhr.send();
 jcXhr.onreadystatechange = function()
  {
   if (jcXhr.readyState === 4){
        if(jcXhr.status==200){
            if (G_handlerKiller){        
                G_handlerKiller = false;
                var jcDecauxStation = JSON.parse(jcXhr.responseText);
                if (!jcDecauxStation.contract) jcDecauxStation.contract = station.contract;
                if (!jcDecauxStation.commercial_name) jcDecauxStation.commercial_name = station.commercial_name;
                    createMarker(jcDecauxStation, replace);
                }
            }
            else
            { 
            console.log('jcXhr.status='+jcXhr.status);
            }
   }
  };
 };
var createMarker = function (station, replace) {
   if(replace)
   {  
 spliceMarkerByLocation({lat:station.position.lat,lng:station.position.lng});
   }
   else
   { 
    if(G_MarkerArray.length>9){
  map.removeLayer(G_MarkerArray[0]);
  G_MarkerArray.shift();
    } 
   }
 var domelem = document.createElement('div');
                  domelem.id = station.number;
                  domelem.class = 'pop-detail';
                  var velos ='<img src="velos.png">&nbsp;&nbsp;&nbsp;&nbsp;';
                  var bornes ='<img src="bornes.png">&nbsp;&nbsp;&nbsp;&nbsp;';
                  var InnerText = '<p><b>'+station.name+'</b><br />('+station.commercial_name+')';
                  InnerText += '<table><tr><td>'+velos+station.available_bikes+'</td><td class="right">'+((station.banking===true)?'¥€$':'')+'</td></tr>';
                  InnerText += '<tr><td>'+bornes+station.available_bike_stands+'</td><td class="right">'+station.status+'</td></tr>';
                  InnerText += '<tr><td>'+((station.bonus===true)?'bonus +':'')+'</td><td><td></td></tr></table>';
                  InnerText += '<small>↻ <i>by '+station.commercial_name+' : '+new Date(station.last_update).toLocaleString("fr-FR")+'</i><br/>';
                  InnerText += '↻ <i>by this device : '+new Date().toLocaleString("fr-FR")+'</i></small><div class="reload">↻</div></p>';
                  domelem.innerHTML = InnerText;
                  domelem.onclick = function() {
                    callJCDecaux(station,true);
                  };
                      
 var lMarker = {lat:station.position.lat,lng:station.position.lng};      
 var oMarker = {
  clickable:true,
  commercial_name: station.commercial_name,
  contract: station.contract,
  title:station.name,
        icon: L.divIcon({
   className: 'panneau',
   iconSize: null,
   html : '<div class ="'+((station.available_bikes>3)?'c-vert':'c-rouge')+'">v <b>'+station.available_bikes+'</b></div><div class ="'+((station.available_bike_stands>3)?'c-vert':'c-rouge')+'">p <b>'+station.available_bike_stands+'</b></br>'   
        })
    };
    var nMarker = L.marker(lMarker, oMarker).bindPopup(domelem);
    G_MarkerArray.push(nMarker);
    var i = G_MarkerArray.length - 1;
    if(replace) {
   map.addLayer(G_MarkerArray[i]); 
   G_MarkerArray[i].openPopup();
 } else {
   map.addLayer(G_MarkerArray[i]); 
 }      
};
var spliceMarkerByLocation = function(location){ // l = {lat:position.lat,lng:position.lng}
    for (var i = 0; i < G_MarkerArray.length; i++) {
            if((G_MarkerArray[i].getLatLng().lat == location.lat)&&(G_MarkerArray[i].getLatLng().lng == location.lng)){
             map.removeLayer(G_MarkerArray[i]);    
             G_MarkerArray.splice(i,1);
  }
 }  
};
var latlngObjectToArray = function(latlngObject){
    var a = [];
    a.push(latlngObject.lat);
    a.push(latlngObject.lng);
    return a;
}; 
var latlngArrayToObject = function(latlngArray){
    var o = {};
    o.lat = latlngArray[0];
    o.lng = latlngArray[1];
    return o;
};  
var getUriParamValue = function (param,url) {  
	var u = url === undefined ? document.location.search : url;
	var reg = new RegExp('(\\?|&|^)'+param+'=(.*?)(&|$)');
	matches = u.match(reg);
	if(matches) {return matches[2] !== undefined ? decodeURIComponent(matches[2]).replace(/\+/g,' ') : '';} else {return null;};
};

var startingLocation = [];
if (getUriParamValue('latlng')) {startingLocation = JSON.parse('['+getUriParamValue('latlng')+']');}
else if (localStorage.getItem('lastClicLatLng')) {startingLocation = JSON.parse(localStorage.getItem('lastClicLatLng'));}
else {startingLocation = [48.853343,2.348831];}

var map = L.map('map', {
 center: startingLocation,
 zoom: 15,
 zoomControl : false,
 attributionControl : false
});
//var tileLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/zegilooo.i6doo96f/{z}/{x}/{y}.png', {
//var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
var tileLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {

    attribution: 'refs in mapAttribution div',
    maxZoom: 30
}).addTo(map);
var onLocationFound = function (e) {
    var radius = e.accuracy / 2;
 if (radius < 300) var circle = L.circle(e.latlng, radius, {
                weight: 1,
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.1
            }).addTo(map);
    callAllStations(e.latlng, 1);
    localStorage.setItem('lastClicLatLng',JSON.stringify(latlngObjectToArray(e.latlng)));
};
var onLocationError = function (e) {
    alert(e.message);
};
var onMapClick = function (e) {
        callAllStations(e.latlng, 1);
        localStorage.setItem('lastClicLatLng',JSON.stringify(latlngObjectToArray(e.latlng)));
		var getParameters = "?latlng="+latlngObjectToArray(e.latlng)+"&city="+G_MarkerArray[0].options.contract+"&name="+G_MarkerArray[0].options.commercial_name;
		//history.pushState(null, null, document.location.origin + document.location.pathname + getParameters);
		history.pushState(null, null, getParameters);
};
var mapLocateClic = function () {  
    map.locate({setView: true, maxZoom: 15, watch: false, enableHighAccuracy: true, maximumAge: 15000, timeout: 3000000});    
};
var mapInfoClic = function () {  
    var attribution = document.getElementById("mapAttribution");
    var reg = /nodisplay/i;
    if(attribution.className.match(reg)){
    attribution.className = attribution.className.replace(reg,'');
    } else {
    attribution.className =  'nodisplay';
    }
};
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on('click', onMapClick);
document.getElementById('mapLocate').onclick = mapLocateClic;
document.getElementById('mapInfo').onclick = mapInfoClic;
document.getElementById('mapInfo2').onclick = mapInfoClic;
document.getElementById('waiting').className = 'nodisplay';
callAllStations(latlngArrayToObject(startingLocation), 1);
} //window.onload https://github.com/n-b/Bicyclette/blob/master/Cities.md
