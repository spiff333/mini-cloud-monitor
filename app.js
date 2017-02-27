/*
 * MiniCloudMonitor - app.js:
 * A NodeJS application that opens a USB serial connection to a RGB LED light,
 * displaying AWS CloudWatch events triggered by AWS IoT MQTT events.
 * (C) 2017 Marc Plassmeier
 * MIT LICENCE
 */

'use strict';

var winston = require('winston');
var inquirer = require('inquirer');
var serialport = require('serialport');
var awsiot = require('aws-iot-device-sdk');


const SERIAL_BAUD_RATE = 9600;

const MQTT_TOPIC = 'miniCloudMonitorTopic';
const MQTT_JSON_KEY = 'colour';

const AWS_REGION = 'ap-southeast-2';

const ALL_OK_STATUS_COLOUR = 'ffffff';
//const ERROR_STATUS_COLOUR = 'ff0000';
//const TEST_STATUS_COLOUR = '0000ff';


//
// configure the logger
//
winston.configure({
  transports: [
    new (winston.transports.File)({ level: 'info', filename: 'app.log', json: false, colorize: true})
  ]
});


//
// Connect to AWS IoT and subscribe to MQTT topic
//
var device;
var connectedToAws = false;
function openMqttConnection() {
  device = awsiot.device({
    clientId: 'MiniCloudMonitor-' + (Math.floor((Math.random() * 100000) + 1)),
    region: AWS_REGION,
    protocol: 'wss',
    port: 443,
    debug: false
  });

  device.on('connect', function() {
    connectedToAws = true;
    winston.log('info', 'Connected to AWS IoT MQTT Topic: ' + MQTT_TOPIC);
    device.subscribe(MQTT_TOPIC);
  });

  device.on('message', function(topic, payload) {
    if (port && topic == MQTT_TOPIC && payload) {
      winston.log('info', 'AWS IoT MQTT message received: ' + payload.toString().replace(/\s/g,''));

      var message = JSON.parse(payload);
      if (message.hasOwnProperty(MQTT_JSON_KEY)) {
        setMiniCloudMonitorColour(message[MQTT_JSON_KEY]);
        return;
      }
    }
  });

  device.on('close', function () {
    winston.log('info', 'AWS IoT MQTT connection closed.');
    connectedToAws = false;
  });

  device.on('error', function (err) {
    winston.log('error', 'Error connecting to AWS IoT MQTT: ' + err);
    device.end();
  })
}


//
// create a list of USB connected devices
//
var ports = [];
var scanSerialPorts = new Promise(function(fulfill, reject) {
  serialport.list(function (err, myports) {
    if (err) {
      winston.log('info', 'Serial Connection Error scanning Ports: ' + err.message);
      return;
  }
    myports.forEach(function(port) {
      ports.push(port.comName + '::' + port.manufacturer);
    });
  });
});


//
// questions for inquirer
//
var questions = [{
    name: 'usb',
    type: 'confirm',
    message: 'Please connect the Mini Cloud Monitor to any USB port.',
    validate: function(value) {
      if (value) return true;
      return 'Do it.';
    }
  }, {
    name: 'port',
    type: 'list',
    message: 'Serial port:',
    choices: function() {
      return ports;
    },
    filter: function(value) {
      return value.substr(0, value.indexOf('::'));
    }
  }
];


//
// @answers {Object} answers from inquirer
// open a serial connection for communication with Arduino
//
var port;
var connectedToSerialPort = false;
function openSerialConnection(answers) {
  port = new serialport(answers['port'], { baudRate: SERIAL_BAUD_RATE });

  port.on('open', function() {
    connectedToSerialPort = true;
    setMiniCloudMonitorColour(ALL_OK_STATUS_COLOUR);
  });

  port.on('error', function(err) {
    connectedToSerialPort = false;
    winston.log('error', 'Serial Connection Error: ' + err.message);
  });
}


//
// @colour {String} colour in hex RGB
// convenience function to set the colour of the light
//
function setMiniCloudMonitorColour(colour) {
  port.write(colour + '\n', function(err) {
    if (err) {
      winston.log('error', 'Serial Connection Error on write: ' + err.message);
      return;
    }
    winston.log('info', 'Serial Connection changed colour: ' + colour);
  });
}

//
// main
//
winston.log('info', 'MiniCloudMonitor app started...');
scanSerialPorts.then(
  inquirer.prompt(questions).then(
    function (answers) {
    openSerialConnection(answers);
    openMqttConnection();
    }
  )
);


