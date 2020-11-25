# megekko-get-order-status
Get your queue position for AMD Ryzen 5000 series and Nvidia RTX 30 series products

## Note
I wrote this code in about an hour. I know it's not pretty, but it works, which is all that mattered in this case.

## Setup
### Requirements
- node.js (I use 13.14.0, but any version that has the https package should work)

### Install node dependencies
```bash
npm install
```

### Set up .env
Copy .env.example to .env, and fill it with your details. <br />
You can find your order id on your order invoice. <br />
You can find your Pushbullet access token at [your account settings](https://www.pushbullet.com/#settings/account). <br />
The script expects the Google Sheet to have a layout like [this](https://docs.google.com/spreadsheets/d/12RPSzhVrryx_i7jjPsFN38zJQJ0osduZZUUe-xc65Rs). Once you have created a spreadsheet, copy the id in the URL (the bit after /spreadsheets/d/, but before /edit#gid=0). <br />

### Running the script
You can run the script like any normal node script, using
```bash
node index.js
```
I would recommend setting up a cronjob (if you're on Linux). Here's an example of what this might look like:
```
0 * * * * cd /home/ubuntu/megekko-get-order-status && node index.js
```
This example  will run the script every hour, if it's located in /home/ubuntu/megekko-get-order-status/ of course.
