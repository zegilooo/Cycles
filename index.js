window.onload = function() {
var G_MarkerArray = []; 
var createXHR = function(){var e;if(window.ActiveXObject){try{e=new ActiveXObject("Microsoft.XMLHTTP")}catch(t){alert(t.message);e=null}}else{e=new XMLHttpRequest}return e};
var callAllStations = function (c, db){
	var handlerKiller = true;
    if(db == 1){
    var myUrl ='http://cycles.lizazil.com/database/allStations?q={coordinates:{$near:['+c.lng+','+c.lat+']}}&l=10';
    }
    else{
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
                //debugger;
                if(db ==1) callAllStations(c, 2); // try database2
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
                    if (G_handlerKiller) 
                    {        
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
                //debugger;    
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
                  var InnerText = '<p>Réseau : '+station.commercial_name+'<br /><b>'+station.name+'</b><br />Vélos : '+station.available_bikes+'<br />Places : '+station.available_bike_stands;
                  InnerText += '<br /><small><i>mise à jour par JCDecaux: '+new Date(station.last_update).toLocaleString("fr-FR")+'<br/>';
                  InnerText += 'mise à jour locale: '+new Date().toLocaleString("fr-FR")+'</i></small><div class="reload">↻</div></p>';
                  domelem.innerHTML = InnerText;
                  domelem.onclick = function() {
                    callJCDecaux(station,true);
                  };
                      
	var lMarker = {lat:station.position.lat,lng:station.position.lng};				  
	var oMarker	= {
		clickable:true,
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
var map = L.map('map', {
	center: JSON.parse(localStorage.getItem('lastClicLatLng')) ||[48.853343,2.348831],
	zoom: 15,
	zoomControl : false,
	attributionControl : false
});
var tileLayer = L.tileLayer('http://{s}.tile.cloudmade.com/235e7469b9a34aa790ff9e3d189cd5af/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>, a <a href="http://www.wakawakasoft.com">WakaWakaSoft &copy;</a> App',
    maxZoom: 30
}).addTo(map);
var onLocationFound = function (e) {
    var radius = e.accuracy / 2;
	if (radius < 80) var circle = L.circle(e.latlng, radius).addTo(map);
    callAllStations(e.latlng, 1);
    localStorage.setItem('lastClicLatLng',JSON.stringify(latlngObjectToArray(e.latlng)));
}
var onLocationError = function (e) {
    alert(e.message);
}
var onMapClick = function (e) {
        callAllStations(e.latlng, 1);
        localStorage.setItem('lastClicLatLng',JSON.stringify(latlngObjectToArray(e.latlng)));
}
var mapLocateClic = function () {  
map.locate({setView: true, maxZoom: 15});    
}
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on('click', onMapClick);
document.getElementById('mapLocate').onclick = mapLocateClic;
callAllStations(latlngArrayToObject(JSON.parse(localStorage.getItem('lastClicLatLng')) ||[48.853343,2.348831]), 1);
} //window.onload 


