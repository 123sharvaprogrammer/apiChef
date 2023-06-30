const express  = require ("express");
const dishes = require('./dishes.json')
const app = express();
const port = 8087

app.use(express.json())
app.listen(
  port,
  () => console.log(`http://localhost:${port}`)
)

app.get('/dishes', (req, res) => {
    console.log("hello")
      res.status(200).send(
        dishes
      )
}) 