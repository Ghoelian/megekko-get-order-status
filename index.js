const https = require('https')
const querystring = require('querystring')

const orderId = ''
const postCode = ''

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

