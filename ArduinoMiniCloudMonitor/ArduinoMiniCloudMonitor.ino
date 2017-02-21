/*
 * MiniCloudMonitor
 * 
 * A NodeJS application that opens a USB serial connection to a RGB LED light,
 * displaying AWS CloudWatch events triggered by AWS IoT MQTT events.
 * Based on BlinkM examples.
 * 
 * BlinkM connections to Arduino
 * PWR - -- Gnd
 * PWR + -- 5V
 * I2C d -- A4 / D2 LeoStick (!)
 * I2C c -- A5 / D3 LeoStick (!)
 * 
 * 2017 Marc Plassmeier
 * 
 */

#include "Wire.h"
#include "BlinkM_funcs.h"

const byte blinkm_addr = 0x09;   // i2c address of your BlinkM
String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete


void setup() {
  BlinkM_begin();  // begin i2c communications to BlinkM
  delay(100);      // wait for timing issues

  // write default colour pattern / only needed for the first time
  /*
  blinkm_script_line script1_lines[] = {
    {  1, {'f',  35,  0,  0}},
    {  7, {'c', 255,  0,  0}},
    {  5, {'c',   0,  0,  0}},
  };
  int script1_len = 3;
  BlinkM_writeScript( blinkm_addr, 0, script1_len, 0, script1_lines);
  */

  BlinkM_playScript( blinkm_addr, 0, 0, 0 );

  Serial.begin(9600);  // initialize serial connection
  inputString.reserve(200);
}


void serialEventRun(void) {
  if (Serial.available()) serialEvent();
}


void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}


void loop() {
  if (stringComplete) {
    long number = strtol(inputString.c_str(), NULL, 16);

    byte r = number >> 16;
    byte g = number >> 8 & 0xFF;
    byte b = number & 0xFF;

    BlinkM_stopScript(blinkm_addr);
    BlinkM_fadeToRGB(blinkm_addr, r, g, b);

    inputString = "";
    stringComplete = false;
  }
}


