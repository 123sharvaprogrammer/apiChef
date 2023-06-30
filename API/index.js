const mongoose = require("mongoose");
const express = require("express");
const ChannelModel = require("./models/channel");
const ChannelModel1 = require("./models/dishes");

const app = express()
const PORT = 3000
const uri = "mongodb+srv://CompanyDB:dm9s4CMnCxUGtge@cluster0.daj289t.mongodb.net/CompanyDB?retryWrites=true&w=majority";
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(uri, connectionParams).then(() => {
  console.info("Connected to the DB ")
}).catch((e) => {
  console.error("Error: ", e)
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.get("/insert", (req, res) => {
  var channelModel = new ChannelModel()
  channelModel.name = "Sherva",
    channelModel.email = "sharva122@gmail.com"
  channelModel.save()
})

app.get('/read', async (req, res) => {
  const users = await ChannelModel.find({})
  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
})

app.get('/update', async (req, res) => {
  const updater = await ChannelModel.findByIdAndUpdate(req.query.id, { name: req.query.name })
  try {
    res.send(updater);
  } catch (error) {
    res.status(500).send(error);
  }
})