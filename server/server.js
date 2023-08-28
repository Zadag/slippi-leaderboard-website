require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");
const Users = require("./Models/Users");
const Characters = require("./Models/Characters");
const History = require("./Models/History");
const fetchPlayerData = require("./fetchPlayerData");
const axios = require("axios");

const app = express();

const corsOptions = {
  origin: [
    "http://127.0.0.1:5173",
    "https://www.discord.com/api/users/@me, https://discord.com/oauth2/authorize?client_id=1058531248953376838&redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Fhome&response_type=code&scope=identify",
  ],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// simple route
app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");

  res.json({ message: "Pong." });
});

// get users route
app.get("/users", async (req, res) => {
  const users = await Users.findAll();
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");

  res.json({ message: users });
});

// provide oauth redirect
app.get("/login", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  const url =
    "https://discord.com/api/oauth2/authorize?client_id=1058531248953376838&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fdiscord%2Fauth&response_type=code&scope=identify";
  res.json({ url });
});

// Route hit by Discord
app.get("/discord/auth", async (req, res) => {
  if (!req.query.code) throw new Error("query code not provided");
  const { code } = req.query;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const headers = {
    "Content-Type": "application-x-www-form-urlencoded",
    "Accept-Encoding": "application-x-www-form-urlencoded",
  };

  const response = await axios.post(
    "https://discord.com/api/oauth2/token",
    params,
    {
      headers,
    }
  );

  const userResponse = await axios.get("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${response.data.access_token}`,
    },
  });

  const { id, username, avatar } = userResponse.data;

  res.json({ message: { id, username, avatar } });
});

app.post("/update-user", async (req, res) => {
  const { userId } = req.body;
  console.dir(req);
  console.log(`handling update of ${userId}`);
  try {
    const user = await Users.findOne({ where: { username: userId } });

    if (user) {
      const slippiname = user.get("slippiname");
      const data = await fetchPlayerData(slippiname);
      if (data === "invalid connect code") {
        res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
        res.json(`${slippiname} is not a valid slippi name.`);
      }
      const { points, dailyGlobalPlacement, characters } = data;

      await Users.update(
        { slippielo: points },
        { where: { username: userId } }
      );
      await Users.update(
        { slippiglobalplacement: dailyGlobalPlacement },
        { where: { username: userId } }
      );
      res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
      res.json({ message: user });
    }
    if (!user) {
      res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
      res.json({ message: "Could not find user" });
    }
  } catch (error) {
    console.error(error);
    if (error) {
      res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
      res.json({ message: "Something went wrong :(" });
    }
  }
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

Users.sync();
Characters.sync();
History.sync();
