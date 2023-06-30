const express  = require ("express");
const app = express();
const port = 8087

app.use(express.json())
app.listen(
  port,
  () => console.log(`http://localhost:${port}`)
)

app.post('/chefs/:id', (req, res) => {
   const {id} =  req.params
   mt = id-1
   res.send({
    tshirt :` id of ${id} and ${JSON.parse(chef[mt].name)}`
   })
})