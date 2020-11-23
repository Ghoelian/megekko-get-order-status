const https = require('https')
const querystring = require('querystring')

require('dotenv').config()

const orderId = process.env.ORDERID
const postCode = process.env.POSTCODE

const postData = querystring.stringify({
    'ajax': 'lookup',
    'orderid': orderId,
    'postcode': postCode
})

const postHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
    'Referer': 'https://www.megekko.nl/info/RTX-3080'
}

const postOptions = {
    hostname: 'www.megekko.nl',
    port: 443,
    path: '/scripts/wachtrij/wachtrij.php',
    method: 'POST',
    headers: postHeaders
}

const data = '<div style=\'display:inline-block; width:100px\'><b>Order:</b></div>        <div style=\'display:inline-block;\'>ME211120000721</div><br><div style=\'display:inline-block; width:100px\'><b>Artikelnr</b>:</div>    <div style=\'display:inline-block;\'>294824</div><br><div style=\'display:inline-block; width:100px\'><b>Artikel</b>:</div>      <div style=\'display:inline-block;\'>Processor AMD Ryzen 5 5600X</div><br><div style=\'display:inline-block; width:100px\'><b>Jouw positie:</b></div> <div style=\'display:inline-block;\'>443 van de 493</div><br><br>'

const req = https.request(postOptions, (res) => {
    console.log(res.statusCode, '\n')

    res.on('data', (data) => {
        console.log(JSON.parse(data.toString()).data)
    })
})

req.on('error', (err) => {
    console.error(err)
})

req.write(postData)
req.end()

