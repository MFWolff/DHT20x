//Blocks Test
basic.forever(function () {
    DHT20x.readMeasurement()
	serial.writeLine("" + (DHT20x.readTemperature()))
    serial.writeLine("" + (DHT20x.readHumidity()))
    basic.pause(2000)
})
