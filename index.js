const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

const users = require("./routes/users");

const DB_USER = "dbUser";
const DB_PASSWORD = "dbUserPassword";
const JWT_PRIVATE_KEY = "jwtPrivateKey";

if (!config.get(DB_USER) || !config.get(DB_PASSWORD)) {
  console.log("FATAL ERROR: atlas credentials is not defined.");
  process.exit(1);
}

if (!config.get(JWT_PRIVATE_KEY)) {
  console.log("FATAL ERROR: jwt key is not defined.");
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const connectToAtlas = async () => {
  await mongoose.connect(
    `mongodb+srv://${config.get(DB_USER)}:${config.get(
      DB_PASSWORD
    )}@cluster0.liccp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  );
  console.log("Connected to atlas ...");
};

connectToAtlas();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "origin, x-requested-with, content-type"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE"
  );
  next();
});

app.use(express.json());
app.use("/api/users", users);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
