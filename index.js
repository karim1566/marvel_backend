const express = require("express");
const axios = require("axios");
const cors = require("cors");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const mongoose = require("mongoose");

require("dotenv").config();

const isAuthenticated = require("./middleware/isAuthenticated");

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

// const isAuthenticated = require("./middleware/isAuthentificated");

const app = express();
app.use(express.json());
app.use(cors());

const User = require("./models/User");
const Favorite = require("./models/Favorite");

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newHash = SHA256(user.salt + password).toString(encBase64);

    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      _id: user._id,
      account: user.account,
      token: user.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username || !email || !password || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "Missing parameter" });
    }

    const emailAlreadyUsed = await User.findOne({ email });

    if (emailAlreadyUsed) {
      return res.status(409).json({ message: "This email is already used" });
    }

    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);

    const newUser = new User({
      email,
      account: {
        username,
      },
      newsletter,
      token,
      hash,
      salt,
    });
    await newUser.save();

    const response = {
      _id: newUser._id,
      account: newUser.account,
      token: newUser.token,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/favoris/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ token: token }).select("account");

    if (user._id) {
      const newFavoris = await Favorite.find({ owner: user.id });

      res.json(newFavoris);
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.post(
  "/favorite/add",
  isAuthenticated,

  async (req, res) => {
    try {
      const { img, description, name } = req.body;

      const newFavorite = new Favorite({
        name: name,
        description: description,
        img: img,
        owner: req.user,
      });

      await newFavorite.save();

      res.json(newFavorite);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

app.get("/comics", async (req, res) => {
  try {
    const { limit, skip, title } = req.query;
    if (req.query) {
      const response = await axios.get(
        `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.marvel_APIKEY}&limit=${limit}&skip=${skip}&title=${title}`
      );
      res.json(response.data);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});
app.get("/comics/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const comics = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${id}?apiKey=${process.env.marvel_APIKEY}`
    );

    res.json(comics.data);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.get("/character/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.marvel_APIKEY}`
    );
    // console.log(response);
    res.json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.get("/character", async (req, res) => {
  try {
    const { limit, skip, name } = req.query;
    if (req.query) {
      const response = await axios.get(
        `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.marvel_APIKEY}&limit=${limit}&skip=${skip}&name=${name}`
      );
      res.json(response.data);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

app.get("/", (req, res) => {
  res.json("Bienvenue sur mon serveur");
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This routes doesn't exist" });
});

app.listen(process.env.PORT, () => {
  console.log("server has started");
});
