const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const request = require('request');
const { json } = require('express/lib/response');

app.use(cors())

var port = process.env.PORT || 8080 ;
console.log('running the app on port '+ port);
app.set('port', port);
app.set('env',"production");

app.get('/stock', (req, res) => {
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
  
});

app.get('/', (req, res) => {
  
	res.sendFile(path.join(__dirname, '/API.html'));
 });
  
app.listen(port, () => {
  console.log(`api app listening at http://localhost:${port}`)
})

