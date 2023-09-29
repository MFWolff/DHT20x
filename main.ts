/**
 * DHT20x block
 */
//%color=#444444 icon="\uf185" block="DHT20x"
namespace DHT20x {

    // Protokollbeschreibung des Sensors DHT20
    // https://dfimg.dfrobot.com/nobody/wiki/fee98e59eaf69be9fe079daaf8da3ebb.pdf


    let temperature: number = 0
    let humidity: number = 0
    

    // Trigger measurement data
    /**
     *  Trigger measurement data
     */
    //% weight=87 blockGap=8
    //% block="Mesurement" 
    //% blockId=readMeasurement

	export function readMeasurement(): void{
        let dbuf = pins.createBuffer(7)  // DataBuffer, zum Empfang der Daten
        let cbuf = pins.createBuffer(3) // CommandBuffer, zum Senden des Befehls zum Auslesen
        let cbuf[0] = 0xAC
		let cbuf[1] = 0x33
		let cbuf[2] = 0x00
		pins.i2cWriteBuffer(0x38, commandBuffer, false) // Die Adresse des Sensors ist 38h
		pins.i2cWriteNumber(0x61, 0x0300, NumberFormat.UInt16BE, false)
        basic.pause(100) // mehr als 80 ms sind gefordert zum Daten einsammeln
        dbuf = pins.i2cReadBuffer(0x38, 7, false)
        

        //temperature
		// das 4., 5. und 6. Byte enthalten die Temperatur, das 6. Byte enthält den CRC-Wert
		// vom 4. Byte sind nur die unteren 4 Bits Bestandteil der Temperatur, also muss getrixt werden.
		// 4 Bits vorne abschneiden, 8 Bits hinten abschneiden, die verbleibenden Bits geben einen positiven Wert,
		// negative Temperaturen ergeben sich am Ende durch das "-50" am Ende der Formel!
		
		// dann die Formel anwenden: {S_T ist der gelieferte Temperaturwert }
		//
		// T[°C] = (S_T/2^^20)*200-50
		//
		//ersatzweise
		
		// T[°C] = S_T*25/131072 -50
		
		// oder 
		
		// T[°C] = S_T / 5243 - 50
		
		
		//
		// let num = dbuf.getNumber(NumberFormat.Int32LE, 3)
		
		let raw_temp = dbuf[3] & 0x0f
		raw_temp <<= 8
		raw_temp += dbuf[4]
		raw_temp <<= 8
		raw_temp += dbuf[5]

		temperature = raw_temp/5243 -50
		temperature = Math.round(temperature*10)/10

		

        //humidity
        // Die rel. Feuchte ist in dem 2., 3. und 4. Bit enthalten, wobei vom 4. Bit
		// nur die oberen 4 Bits dazuzählen, die anderen gehören zur Temperatur.
		// Darum muss ein bischen getrixt werden, bevor die Formel angewendet wird. 
		// die 3 Bytes werden aneinandergefügt. Das Ergebnis wird um 4 bits nach rechts
		// verschoben,dann verschwindet der T.-Anteil.
		//
		
		// die Formel ist { S_rH ist der gelieferte Wert }
		
		// rH[%] = S_rH/2^^20)*100
		
		// ersatzweise 
		
		// rH[%] = S_rH * 25/262144 
		
		// oder 
		
		// rH[%] = S_rH / 10486
		
		let raw_hum = dbuf[1]
		raw_hum <<= 8
		raw_hum += dbuf[2]
		raw_hum <<= 8
		raw_hum += dbuf[3]
		raw_hum >>= 4
		
		humidity = raw_hum / 10486

        humidity = Math.round(humidity*10)/10
		
    } // function readMeasurement()

    /**
     * Reads Temperature
     */
    //% weight=87 blockGap=8
    //% block="Read Temperature" 
    //% blockId=read_Temperature
    export function readTemperature(): number{
        return temperature
    }

    /**
     * Reads Humidity
     */
    //% weight=87 blockGap=8
    //% block="Read Humidity" 
    //% blockId=read_Humidity
    export function readHumidity(): number{
        return humidity
    }
} 
