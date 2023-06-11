const express = require('express');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const fileUpload = require('express-fileUpload');
require('dotenv').config();

const {wsServer} = require('./websockets');

const app = express();

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '/public')));

// need urlencoded because of form data
app.use(express.urlencoded({extended: false}));
// handles mulipart-encoding and uploading of files
app.use(fileUpload());

app.use('/', routes);

const PORT = process.env.PORT ?? 5000;

const httpServer = app.listen(PORT);



// start Websockets server based on httpServer
wsServer(httpServer);