const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const request = require('request');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://yoyo:4EsWdH3wMfsSJ28@brewpi.5agwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var corsOptions = {
	origin: 'https://brewpix.ch',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

var port = process.env.PORT || 8080 ;
console.log('running the app on port '+ port);
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

app.get('/', (req, res) => {

	res.sendFile(path.join(__dirname, '/API.html'));
 });
  
app.listen(port, () => {
  console.log(`api app listening at http://localhost:${port}`)
})

