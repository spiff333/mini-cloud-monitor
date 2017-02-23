[![Logo][minicloudmonitor-image]][minicloudmonitor-url]

# Mini Cloud Monitor with AWS and Arduino

The Mini Cloud Monitor is a proof of concept tying IoT hardware and AWS
services together in a fun little project. The idea was to create a physical
status indicator (my daughters hacked night light) that displays AWS events
in real time. Even though the choices of hardware components and software
frameworks were opportunistic - think KISS, an important requirement was to
have the monitor run behind a firewall. This made web hooks for event
changes impractical and a polling mechanism missed the 'real time' brief. A
solution was found in Amazons IoT message broker which supports MQTT over
web sockets.

This repository holds the source code for a NodeJS application that
interfaces between AWS and the USB connected monitor. As Well as Arduino
sketches and a template for AWS CloudFormation.

Further information including pictures and schematics can be found at hackster.io

[minicloudmonitor-image]: minicloudmonitor.png
[minicloudmonitor-url]: https://github.com/spiff333/mini-cloud-monitor
[hackster-url]: http://hackster.io
