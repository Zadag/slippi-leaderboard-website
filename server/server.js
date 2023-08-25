const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");
const Users = require("./Models/Users");
const Characters = require("./Models/Characters");
const History = require("./Models/History");
const fetchPlayerData = require("./fetchPlayerData");

const app = express();

const corsOptions = {
  origin: "http://127.0.0.1:5173",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// simple route
app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");

  res.json({ message: "Welcome to KB application." });
});

// another route
app.get("/users", async (req, res) => {
  const users = await Users.findAll();
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");

  res.json({ message: users });
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
