const express  = require ("express");
const chefs = require('./chef.json')
const app = express();
const port = 8087

app.use(express.json())
app.listen(
  port,
  () => console.log(`http://localhost:${port}`)
)

app.get('/chefList', (req, res) => {
    console.log("hello")
      res.status(200).send(
        chefs
      )
}) 