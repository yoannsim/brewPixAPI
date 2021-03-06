const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://test:nXWK2StVLa34NBQ@brewpi.5agwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var whitelist = ['https://brewpix-static-h3vzo.ondigitalocean.app', 'https://brewpix.ch','https://www.brewpix.ch']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


var port = process.env.PORT || 8080 ;
console.log('running the app on port '+ port);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', port);
app.set('env',"production");



app.get('/stock',cors(corsOptions), (req, res) => {
	var resp = "{";
	request('https://docs.google.com/spreadsheets/d/e/2PACX-1vSm3f88Eqr8_9JLPcV3zM4IsNjCWFQLw5aMxJO1nbVUDqI2QNRqt-F1N_T7NdHO-5yixFd98_6olVUp/pub?output=csv', function (err, response, body) {
		col = body.split('\r\n');
		L1  = col[0].split(',');
		L2  = col[1].split(',');
		console.log(col);
		for (let i = 0; i < L1.length; i++) {

			resp += "\""+L1[i] +"\":\""+ L2[i]+"\",";
		} 
		resp = resp.slice(0,-1) + "}";
	
		res.send(JSON.parse(resp));
  	});

	var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 

	var Visitor = {
		ip : ip, 
		navigator : req.headers['user-agent']
	};
	
	client.connect(function(err, db) {
		if (err) throw err;
		dbo = db.db("brewAPI");
		const timeElapsed = Date.now();
		const today = new Date(timeElapsed);
		Visitor.timestamp = today.toTimeString().substring(0, 9) + today.toLocaleDateString();
		console.log(Visitor);
		dbo.collection("visitor").insertOne(Visitor, 
		function(err, result) {
			if (err) throw err;
			console.log(result);
			db.close();
		});
	});
  
});

app.get('/price',cors(corsOptions), (req, res) => {
	var price = "4";

	res.send(JSON.parse(JSON.stringify(price)))
  
});
app.get('/visitor',cors(corsOptions), (req, res) => {

	client.connect(function(err, db) {
		if (err) throw err;
		dbo = db.db("brewAPI");
		dbo.collection("visitor").count({}, function(error, numOfDocs) {
			console.log('nb visitor = '+numOfDocs+' ');
			res.send(JSON.stringify(numOfDocs));
		});
	});
});

app.post('/cmd',cors(corsOptions), (req, res) =>{
	client.connect(function(err, db) {
		if (err) throw err;
		dbo = db.db("brewAPI");
		var commande = JSON.parse(Object.keys(req.body)[0]);
		const timeElapsed = Date.now();
		const today = new Date(timeElapsed);
		commande.timestamp = today.toTimeString().substring(0, 9) + today.toLocaleDateString();
		console.log(commande);
		dbo.collection("contact").insertOne(commande, 
		function(err, result) {
			if (err) throw err;
			console.log(result);
			res.sendStatus(200);
			db.close();
		});	
	});
});

app.get('/', (req, res) => {

	res.sendFile(path.join(__dirname, '/API.html'));
 });
  
app.listen(port, () => {
  console.log(`api app listening at http://localhost:${port}`)
})

