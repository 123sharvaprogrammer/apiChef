const mongoose = require("mongoose");
const express = require("express");
const ChannelModel = require("./models/channel");

const app = express()
const PORT = 3000
app.use(express.json())
const uri = "mongodb+srv://CompanyDB:dm9s4CMnCxUGtge@cluster0.daj289t.mongodb.net/Orders?retryWrites=true&w=majority";
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


app.post("/orderer", (req, res)=>{
  const {orders} = req.body
  const {From} = req.body
  const {To} = req.body
  const {Price} = req.body
  const {Timed} = req.body
  const {Dater} = req.body
  const {durationel} = req.body
  var channelModel = new ChannelModel()
  channelModel.order = orders
  channelModel.from =From
  channelModel.to = To
  channelModel.price = Price
  channelModel.time = Timed
  channelModel.date = Dater
  channelModel.duration = durationel
  channelModel.save()
  res.status(200).send({msg:"hello"})
})