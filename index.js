const https = require('https')
const parser = require('node-html-parser')
const querystring = require('querystring')
const readline = require('readline')
const fs = require('fs')

require('dotenv').config()

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_PATH = 'token.json'

let rows = []

const {
    google
} = require('googleapis')

require('dotenv').config()

const init = async () => {
    fs.readFile('credentials.json', async (err, content) => {
        if (err) throw err

        authorize(JSON.parse(content), getData)
    })
}

const authorize = (credentials, callback) => {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed

    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
    )

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))

        return callback(oAuth2Client)
    })
}

const getNewToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })

    console.log('Visit url to authorise: ', authUrl)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question('Enter code from the page: ', (code) => {
        rl.close()

        oAuth2Client.getToken(code, (err, token) => {
            if (err) throw err

            oAuth2Client.setCredentials(token)

            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
            })

            callback(oAuth2Client)
        })
    })
}

const getData = (auth) => {
    const sheets = google.sheets({
        version: 'v4',
        auth
    })

    sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'CPU!A2:C'
    }, (err, res) => {
        if (err) throw err

        const result = res.data.values

        if (result.length) {
            const latest = result[result.length - 1]

            const orderId = process.env.ORDER_ID
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

            const regex = /\d+/g

            const req = https.request(postOptions, (res) => {
                res.on('data', (data) => {
                    data = (JSON.parse(data.toString()).data)

                    const root = parser.parse(data).childNodes
                    const positions = root[root.length - 3].rawText.match(regex)

                    fs.writeFile('status', 'Last updated: ' + new Date(), (err) => {
                        if (err) throw err
                    })

                    if (positions[0] !== latest[1] || positions[1] !== latest[2]) {
                        const postData = querystring.stringify({
                            'type': 'note',
                            'title': 'Megekko wachtrij positie: ' + positions[0],
                            'body': 'Nieuwe positie: ' + positions[0]
                        })

                        const postOptions = {
                            hostname: 'api.pushbullet.com',
                            port: 443,
                            path: '/v2/pushes',
                            method: 'POST',
                            headers: {
                                'Access-Token': process.env.PUSHBULLET_ACCESS_TOKEN,
                                'Content-Type': 'application/json'
                            }
                        }

                        const req = https.request(postOptions, (res) => {
                            res.on('data', (data) => {
                                process.stdout = data
                            })
                        })

                        req.on('error', (err) => {
                            console.error(err)
                        })

                        req.write(`{"type":"note","title":"Megekko wachtrij update","body":"Nieuwe positie: ${positions[0]}/${positions[1]}, voorheen ${latest[1]}/${latest[2]}"}`)
                        req.end()

                        sheets.spreadsheets.values.append({
                            spreadsheetId: process.env.SPREADSHEET_ID,
                            range: process.env.SPREADSHEET_SHEET + '!A2:C',
                            valueInputOption: 'USER_ENTERED',
                            requestBody: {
                                values: [
                                    [parseInt(latest[0]) + 1, positions[0], positions[1]]
                                ]
                            }
                        }, (err, res) => {
                            if (err) throw err
                        })
                    }
                })
            })

            req.on('error', (err) => {
                console.error(err)
            })

            req.write(postData)
            req.end()
        }
    })
}

init()
