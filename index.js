const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require("firebase-admin");


const port = 5000

const app = express();
app.use(cors())
app.use(bodyParser.json());

var serviceAccount = require("./burj-al-arab-18486-firebase-adminsdk-saqz0-da06af6ecb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-18486-default-rtdb.firebaseio.com"
});



const password = "8KfdD5J5HCkUM4D";


const {
  MongoClient
} = require('mongodb');
const uri = "mongodb+srv://arabin:8KfdD5J5HCkUM4D@cluster0.4xoys.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  console.log("db connected sucessfully");
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        // console.log(result);
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    // console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({
        idToken
      });
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail=req.query.email;
          console.log(tokenEmail,queryEmail);
          if (tokenEmail == req.query.email) {
            bookings.find({email: req.query.email})
              .toArray((err, documents) => {
                res.send(documents)
              })
          }
          // ...
        })
        .catch((error) => {
          // Handle error
        });
    }
  })

});




app.get('/', (req, res) => {
  res.send('Hello World! from 5000')
})

app.listen(port)