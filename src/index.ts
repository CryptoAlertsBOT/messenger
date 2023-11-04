import "dotenv/config";
import "./Events/Process";
import "./bots";
import "./config";
import express from 'express';
import routes from "./api/routes/v1";
import bodyParser from "body-parser";


// Create an express server that listens on localhost
// Create webhook listeners to get the payload from the api-layer
// use the payload to fire off notification events
const app = express();
const PORT: number = 3001;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api/v1', routes);



app.listen(PORT, () => {
    console.log('Listening for webhook payloads..'.yellow);
});


