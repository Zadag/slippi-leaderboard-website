require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");
const Users = require("./Models/Users");
const Characters = require("./Models/Characters");
const History = require("./Models/History");
const fetchPlayerData = require("./fetchPlayerData");
const axios = require("axios");
const { sign } = require("jsonwebtoken");
const authenticate = require("./middleware/authenticate");
const cookieParser = require("cookie-parser");

const app = express();

const corsOptions = {
  credentials: true,
  origin: [
    process.env.DOMAIN_NAME,
    "https://www.discord.com/api/users/@me, https://discord.com/oauth2/authorize?client_id=1058531248953376838&redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Fhome&response_type=code&scope=identify",
  ],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(authenticate);

// simple route
app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
  res.json({ message: "Pong." });
});

// get users route
app.get("/users", async (req, res) => {
  const users = await Users.findAll();
  res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
  console.log(req.user);
  res.json({ message: users });
});

// provide oauth redirect
app.get("/login", async (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
  const url = process.env.DISCORD_CALLBACK;
  res.json({ url });
});

// test register requiring JWT
app.get("/register", async (req, res) => {
  const user = req.user;
  console.log(user);
  res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
  if (user) res.json({ message: `User ${user} is authorized to register` });
  else res.json({ message: "Unauthorized" });
});

// Route hit by Discord
app.get("/discord/auth", async (req, res) => {
  if (!req.query.code) throw new Error("query code not provided");
  const { code } = req.query;
  const params = new URLSearchParams();
  params.append("client_id", process.env.DISCORD_CLIENT_ID);
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
  params.append("scope", "identify");

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    //"Accept-Encoding": "application/json",
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

  const token = await sign({ sub: id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    //domain: "127.0.0.1:5173",
    //path: "/",
    sameSite: "lax",
    httpOnly: true,
    //sameSite: false,
  }); // trying to use domain and path

  const user = Users.findOne({ where: { userid: id } });
  if (user) {
    res.cookie(
      "user",
      { id, username, avatar, user },
      { httpOnly: true, sameSite: "lax" }
    );
    res.redirect(process.env.DOMAIN_NAME);
  } else {
    res.cookie(
      "user",
      { id, username, avatar },
      { httpOnly: true, sameSite: "lax" }
    );
    res.redirect(process.env.DOMAIN_NAME);
  }

  //res.json({ message: { id, username, avatar } });
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
        res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
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
      res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
      res.json({ message: user });
    }
    if (!user) {
      res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
      res.json({ message: "Could not find user" });
    }
  } catch (error) {
    console.error(error);
    if (error) {
      res.header("Access-Control-Allow-Origin", process.env.DOMAIN_NAME);
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
