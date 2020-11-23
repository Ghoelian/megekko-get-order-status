const fs = require('fs')
const querystring = require('querystring')
const readline = require('readline')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_PATH = 'token.json'

let rows = []

const {
    google
} = require('googleapis')

require('dotenv').config()

const init = () => {
    fs.readFile('credentials.json', (err, content) => {
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
        range: 'A2:C'
    }, (err, res) => {
        if (err) throw err

        const result = res.data.values

        if (result.length) {
            rows = result[rows.length-1]
        }
    })
}

exports.init = init
