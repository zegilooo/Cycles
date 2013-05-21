      
	  db.citiesByContracts.ensureIndex( { "coordinates.geometry.location": "2d" } )
	  
	  db.allStations.find().forEach(function(c){
            var liste = {
				"Creteil" : "Cristolib",
				"Namur" : "Li bia velo",
				"Rouen" : "cy'clic",
				"Nancy" : "vélOstan'lib",
				"Seville" : "SEVICI",
				"Bruxelles-Capitale" : "villo",
				"Cergy-Pontoise" : "Velo2",
				"Lyon" : "Vélo'V",
				"Paris" : "Velib",
				"Marseille" : "Le vélo",
				"Amiens" : "Velam",
				"Mulhouse" : "VéloCité",
				"Luxembourg" : "Veloh",
				"Toulouse" : "Vélô",
				"Besancon" : "VéloCité",
				"Toyama" : "cyclocity",
				"Santander" : "Tusbic",
				"Goteborg" : "Göteborg",
				"Nantes" : "Bicloo",
				"Ljubljana" : "Bicikelj ",
				"Valence" : "Valenbisi",
				"Stockholm" : "Cyclocity"
            }
            c.commercial_name = liste[c.contract];
            db.allStations.save(c);
    });
    
    db.citiesByContracts.distinct('name').forEach(function(c){
    var mydoc = db.citiesByContracts.findOne({name : c });
     print('"'+c+'" : "'+mydoc.commercial_name+'",');
    });
    
    db.allStations.distinct('contract').forEach(function(c){
     print(c+' '+db.allStations.find({contract : c }).toArray().length);
     });
   
    //var myUrl ='https://api.mongolab.com/api/1/databases/mytest/collections/velib?q={coordinates:{$near:['+c.lng+','+c.lat+']}}&l=10&apiKey=50a422dfe4b078a2ff1339bf';
    
    //var myUrl ='https://api.mongohq.com/databases/mytest/collections/velib/documents?q={coordinates:{$near:['+c.lng+','+c.lat+']}}&limit=10&_apikey=cegsrjr5xp4aggd2bi80';
    
    //var jcUrl ='http://test.wakawakasoft.com/jcdecaux/vls/v1/stations/'+station.number+'?contract=Paris&apiKey=d4399f4695ceeb0f3c4dc9abcd5ec2540dd5c84f';

db.velib.find().forEach(
    function(myDoc) { 
        var tableau = myDoc.address.split(" - ");
        myDoc.adr = tableau[0];
        myDoc.ville = tableau[1];
        db.velib.save(myDoc);
    }
);

db.velib.find().forEach(
    function(myDoc) { 
        var tab = [];
        tab.push(myDoc.longitude,myDoc.latitude);
        myDoc.coordinates = tab;
        db.velib.save(myDoc);
    }
);

db.velib.update({},{$rename:{"adr":"address"}},{multi:true})


db.velib.find().forEach(
    function(myDoc) { 
        if(myDoc.ville) {
        var chaine = myDoc.ville.toString();
        var pos = chaine.indexOf(" ");
        myDoc.cp = chaine.substr(0,pos);
        myDoc.city = chaine.substr(pos+1,(chaine.length)-pos);
        //db.velib.save(myDoc);
        print(myDoc.cp + ' / '+ myDoc.city);
        }
    }
);

db.velib.find().forEach(
    function(myDoc) { 
        if(myDoc.name) {
            var tampon = '';    
            var chaine = myDoc.name.toString();
            var pos1 = chaine.indexOf(" (");
            var pos2 = chaine.indexOf(")");
            if (pos1>0){    
            myDoc.name = chaine.substr(0,pos1);
            tampon = chaine.substr(pos1+2,pos2);
            myDoc.complement = chaine.substr(0,tampon.length);    
           // db.velib.save(myDoc);
            print(myDoc.name + '|'+ myDoc.complement+'->'+chaine+' '+'pos1='+pos1+' '+'pos2='+pos2);
            }
        }
    }
);

//-> chaine = 31001 - LAGNY (MONTREUIL) pos1=13 pos2=24

db.velib.find({city:{$not:/paris/i}}).toArray()

https://api.mongolab.com/api/1/databases/mytest/collections/velib?q={%22city%22%20:%20{%22$regex%22:%22paris%22,%22$options%22:%22i%22}}&apiKey=50a422dfe4b078a2ff1339bf

db.velib.find( { coordinates : { $near :
                           { $geometry :
                               { type : "Point" ,
                                 coordinates: [ 2.344329 , 48.82413 ] } },
                             $maxDistance : 1000
                } } )

db.velib.find( { coordinates : { $near :[ 2.344539 , 48.824038 ] } } )
db.velib.update({"coordinates":[0,0]},{$set:{'coordinates.0':2.365426,'coordinates.1':48.867001}})

//https://groups.google.com/forum/#!msg/angular/r4X0K--nU2g/T1_3dhPyix0J 
//    .leaflet-popup-close-button, .leaflet-popup-content-wrapper, .leaflet-popup-content {
    