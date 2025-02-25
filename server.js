const path = require("path");
const express = require("express");
const session = require("express-session");
const routes = require("./controllers");
const helpers = require("./utils/helpers");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cron = require("node-cron");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const router = require("express").Router();
const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const app = express();
const PORT = process.env.PORT || 3001;

const sess = {
  secret: "Super secret secret",
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

//node-cron section
cron.schedule("* 12 * * Sunday", function () {
  weeklyMail();
});

const oauth2Client = new OAuth2(
  process.env.client_ID,
  process.env.client_S, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.refresh_token,
});

const accessToken = oauth2Client.getAccessToken();

//Weekly mail function using Nodemailer
function weeklyMail() {
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.email,
      pass: process.env.mail_pass,
      clientId: process.env.client_ID,
      clientSecret: process.env.client_S,
      refreshToken: process.env.refresh_token,
      accessToken: accessToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Setting credentials
  const mailOptions = {
    from: process.env.email,
    to: userData.email,
    subject: "Weekly Report from Healthy Habits!",
    generateTextFromHTML: true,
    html: `<b>Hey there ${userData.name}! </b><br> This is your weekly report! Below you will find information regarding habits you've logged this week and any goals you've set for yourself!<br>`,
  };

  // Sending Email
  smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
}

//Active API key
const A_Key = process.env.Active_API_Key;

//Active search section
app.get("/active/:search", (req, res) => {
  console.log("hit active");

  let search = req.params.search;

  var sortedSearch = search.split(",");
  const info = {
    city: sortedSearch[0],
    state: sortedSearch[1].trim(),
  };

  console.log(info.city + info.state);

  axios
    .get(
      `https://api.amp.active.com/v2/search/?city=${info.city}&state=${info.state}&radius=50*current_page=1&per_page=50&sort=distance&registerable_only=true&query=running&exclude_children=false&api_key=${A_Key}`
    )
    .then((body) => {
      // console.log(body.data);
      return res.json({ data: body.data });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ type: "error", message: error.message });
    });
});

// end active search section

app.use(session(sess));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
// Serve up static assets for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  // The "catchall" handler:  for any request that doesn't
  // match one above, send back React's index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`listening on ${PORT}`));
});
