const express = require('express');
const cors = require('cors');
const normalizePort = require('normalize-port');
const app = express();

const request = require('request');

app.use(cors())

var port = normalizePort(process.env.PORT || 3000 );
console.log('running the app on port '+ port);
app.set('port', port);
app.set('env',"production");

app.get('/', (req, res) => {
  
	request('https://docs.google.com/spreadsheets/d/e/2PACX-1vSm3f88Eqr8_9JLPcV3zM4IsNjCWFQLw5aMxJO1nbVUDqI2QNRqt-F1N_T7NdHO-5yixFd98_6olVUp/pub?output=csv',function (err, response, body) {
	res.send(body);
  });
  
});

app.listen(port, () => {
  console.log(`api app listening at http://localhost:${port}`)
})

