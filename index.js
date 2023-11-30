const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY)
const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://polling-and-survey-auth.web.app'
    ],
    credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uk63wkj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const surveyorCollection = client.db('surveyDB').collection('surveyor')
        const surveyCollection = client.db('surveyDB').collection('survey')
        const userCollection = client.db('surveyDB').collection('user')
        const adminCollection = client.db('surveyDB').collection('admin')
        const proUserCollection = client.db('surveyDB').collection('proUser')
        const surveySubmitCollection = client.db('surveyDB').collection('submit')

        //Survey Submit
        app.get('/submit', async (req, res) => {
            const cursor = surveySubmitCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/submit', async (req, res) => {
            const submit = req.body;
            const result = await surveySubmitCollection.insertOne(submit)
            res.send(result);
        })
        //Admin
        app.get('/admin', async (req, res) => {
            const cursor = adminCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/admin', async (req, res) => {
            const admin = req.body;
            const result = await adminCollection.insertOne(admin)
            res.send(result);
        })

        //surveyor users
        app.get('/surveyor', async (req, res) => {
            const cursor = surveyorCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/surveyor', async (req, res) => {
            const surveyor = req.body;
            const query = { email: surveyor.email }
            const existingUser = await surveyorCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query1 = { email: surveyor.email }
            const existingUser1 = await userCollection.findOne(query1)
            if (existingUser1) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query2 = { email: surveyor.email }
            const existingUser2 = await adminCollection.findOne(query2)
            if (existingUser2) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query3 = { email: surveyor.email }
            const existingUser3 = await proUserCollection.findOne(query3)
            if (existingUser3) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await surveyorCollection.insertOne(surveyor)
            res.send(result);
        })
        //surveyor delete

        app.delete('/surveyor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await surveyorCollection.deleteOne(query);
            res.send(result);
        })

        //users
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query2 = { email: user.email }
            const existingUser2 = await surveyorCollection.findOne(query2)
            if (existingUser2) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query3 = { email: user.email }
            const existingUser3 = await adminCollection.findOne(query3)
            if (existingUser3) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const query4 = { email: user.email }
            const existingUser4 = await proUserCollection.findOne(query4)
            if (existingUser4) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user)
            res.send(result);
        })

        //user delete

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // pro user

        app.get('/proUser', async (req, res) => {
            const cursor = proUserCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/proUser', async (req, res) => {
            const proUser = req.body;
            const query = { email: proUser.email }
            const existingUser = await proUserCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await proUserCollection.insertOne(proUser)
            res.send(result);
        })

        app.delete('/proUser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await proUserCollection.deleteOne(query);
            res.send(result);
        })

        //Survey creation
        app.get('/survey', async (req, res) => {
            const cursor = surveyCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/survey', async (req, res) => {
            const NewSurvey = req.body;
            const result = await surveyCollection.insertOne(NewSurvey)
            res.send(result);
        })
        // payment 
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('polling-and-survey-app-server')
})

app.listen(port, () => {
    console.log(`polling-and-survey-app-server is running on port ${port}`);
})  