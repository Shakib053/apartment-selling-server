const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e9ghj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);




async function run() {
    try {
        await client.connect();
        const database = client.db('apartments_portal');
        const apartmentCollections = database.collection('apartments');
        const reviewCollections = database.collection('reviews');
        const orderCollections = database.collection('orders');
        const userCollections = database.collection('users');


        //add an apartment to the database
        app.post('/apartments', async (req, res) => {
            const apartment = req.body;
            const result = await apartmentCollections.insertOne(apartment);
            res.json(result);
        })
        //add a user to the database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollections.insertOne(user);
            console.log(result);
            res.json(result);
        })

        //finding the apartments from the database
        app.get('/apartments', async (req, res) => {
            const cursor = apartmentCollections.find({});
            const apartments = await cursor.toArray();
            res.send(apartments);
        })


        //finding the orders from the database
        app.get('/orders', async (req, res) => {
            const cursor = orderCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.get('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const apartment = await apartmentCollections.findOne(query);
            res.send(apartment);

        })

        //finding the reviews from the database
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollections.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //post a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollections.insertOne(review);
            res.json(result);
        })

        //purchase order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollections.insertOne(order);
            res.json(result);
        })


        //DELETE API

        app.delete('/orders/:_id', async (req, res) => {
            const id = req.params._id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollections.deleteOne(query);
            res.json(result);
        })

        //make admin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollections.updateOne(filter, updateDoc);
            res.json(result);
        })



        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollections.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    } finally {

        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})