// https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=nsUSsKwvgiP2Wf1K
// https://lereacteur-marvel-api.herokuapp.com/comics/5fc8ba1fdc33470f788f88b3?apiKey=nsUSsKwvgiP2Wf1K
// https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=nsUSsKwvgiP2Wf1K

// https://lereacteur-marvel-api.herokuapp.com/character/5fcf91f4d8a2480017b91453?apiKey=nsUSsKwvgiP2Wf1K

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// const isAuthenticated = require("./middleware/isAuthentificated");

const app = express();
app.use(express.json());
app.use(cors());

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

app.get("/comics/:characterId", (req, res) => {
  console.log(req.body);
  res.json({ message: "je te recois" });
});

app.get("/characters", async (req, res) => {
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
app.get("/character/", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.marvel_APIKEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log("server has started");
});
