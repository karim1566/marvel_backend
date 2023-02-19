const mongoose = require("mongoose");

const Favorite = mongoose.model("Favoris", {
  name: String,
  description: String,
  img: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Favorite;
