// 1.125 Term Project IoT Edge Device Simulation - single device.
// The tasks of this simulator: periodically 1) generates random data, and 2) POST to cloud server.   

const http              = require('http'); 
const device_id         = "A1234567890";

console.log(`IoT edge device ${device_id} initiation`);

function variantNumber(bias, variation) {
    return bias + Math.random() * variation*2 - variation;    
}

function generateData() {
    const output_power  = variantNumber(250, 5);     // 250kW
    const power_factor  = variantNumber( 98, 1);     // 98%
    const frequency     = variantNumber( 60, 0.01);  // 60Hz
    return {
        device_id:      device_id,                   // IoT Device ID
        output_power:   output_power.toFixed(3),     // IoT Device output power
        power_factor:   power_factor.toFixed(3),     // IoT Device power quality
        frequency:      frequency.toFixed(3),        // IoT Device power frequency quality
        ts:             new Date().getTime()         // time stamp
    }
}

function generateDataSendToServer() {
    const data          = generateData();
    // console.log(data);

    const postData      = JSON.stringify(data);
      
    const options = {
        hostname: '159.223.186.14',                 // DigitalOcean Virtual Machine IP *MIT1125project matt.mai.1.125.term.project
        port: 3001,
        protocol: 'http:',
        path: '/api/collect',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    let response_buffer = [];

    const req = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            response_buffer.push(chunk);
        });
        res.on('end', () => {
            console.log('Sent data', postData, response_buffer.join());
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    
    // Write data to request body
    req.write(postData);
    req.end();

    setTimeout(generateDataSendToServer, 1000);
}

generateDataSendToServer();