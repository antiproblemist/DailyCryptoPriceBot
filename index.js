const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const cheerioTableparser = require("cheerio-tableparser");

const app = express();
const API_KEY = process.env.API_KEY

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.post("/", function(req, res) {
  const { message } = req.body;

  if (message && message.text.toLowerCase().indexOf("start") >= 0) {
    axios
      .post(
        `https://api.telegram.org/bot${API_KEY}/sendMessage`,
        {
          chat_id: message.chat.id,
          text: 'DailyCryptoPrice Bot Welcomes you!\nType /price to recieve the prices of top 15 crypto currencies on coinmarket.com'
        }
      )
      .then(response => {
        return res.end("ok");
      })
      .catch(err => {
        return res.end("Error :" + err);
      });
  } else if (!message || message.text.toLowerCase().indexOf("price") < 0) {
    return res.end();
  }

  url = "https://coinmarketcap.com/";

  let priceTable = "";
  request(url, (error, response, html) => {
    if (!error) {
      const $ = cheerio.load(html);
      cheerioTableparser($);
      const table = $("table#currencies").parsetable(false, false, true);

      for (let i = 1; i < 16; i++) {
        priceTable += `${table[1][i]}\n`;
        priceTable += `Price: ${table[3][i]}\n`;
        priceTable += `Change (24h): ${table[6][i]}\n`;
        priceTable += "--------------------\n";
      }
      priceTable +=
        "\nSimply type /price to get price of cryptocurrencies";

      axios
        .post(
          `https://api.telegram.org/bot${API_KEY}/sendMessage`,
          {
            chat_id: message.chat.id,
            text: priceTable
          }
        )
        .then(response => {
          res.end("ok");
        })
        .catch(err => {
          res.end("Error :" + err);
        });
    } else {
      console.log(error);
    }
  });
});

const port = process.env.PORT || 80;

app.listen(port, () => {
  console.log("Express server listening on port", port);
});
