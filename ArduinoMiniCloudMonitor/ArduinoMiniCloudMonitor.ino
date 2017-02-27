/*
 * MiniCloudMonitor
 * 
 * Opens a serial connection to receive colour values to be displayed by the BlinkM RGB LED.
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

const byte blinkm_addr = 0x09;   // BlinkM i2c address
String inputString = "";         // a string to hold incoming data


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


void loop() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();

    if (inChar == '\n') {
      long number = strtol(inputString.c_str(), NULL, 16);

      byte r = number >> 16;
      byte g = number >> 8 & 0xFF;
      byte b = number & 0xFF;

      BlinkM_fadeToRGB(blinkm_addr, r, g, b);
      inputString = "";

    } else {
      inputString += inChar;
    }
  }
}


