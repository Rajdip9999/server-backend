import express from 'express';
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path';
const app = express();

dotenv.config()

app.use(cors())
//Mongo Db 

const url = process.env.MONGO_URL

const port = process.env.PORT || 3000

const clients = new MongoClient(url)

let db;

const ConnectDB = async () => {

    try {
        await clients.connect()
        db = clients.db('raaz')
        console.log('connect to db')

        const lists = await db.collection('list')

        await lists.createIndex(
            { name: 1 },
            { unique: true, partialFilterExpression: { name: { $exists: true } } }
        );

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)

        })

    }


    catch (err) {
        console.log(err.message)
    }
}

ConnectDB()


// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// POST Route (Moved outside of the GET route)
app.get('/insertOne', async (req, res) => {

    const { name, weplayid } = req.query;
if (
  !name ||
  name.trim() === '' ||
  typeof weplayid !== 'string' ||
  weplayid.toString().length !== 10
) {
  return res.status(400).json({
    success: false,
    message: 'Weplay ID must be exactly 10 digits , name also need'
  });
}

    try {

        const collection = await db.collection('list')

        await collection.insertOne({ name: name , weplayid:weplayid})

        res.status(200).send('thanks for submit');

    }



    catch (err) {
        if (err.code === 11000) {
            res.status(400).send('এই নাম আগের থেকেই আছে দয়া করে নতুন নাম দিন, ধন্যবাদ')
        }
    }
});

// GET Route
app.get('/', async (req, res) => {
    const { name, adress } = req.query; // Note: 'adress' matches your query param


    const list = await db.collection('list')

    const friends = await list.find({ name: `${name}` }).toArray()


    if (friends.length > 0) {

        const friend = friends[0]

        return res.json({
            age: friend.age,
            iselegible: friend.iselegible,
            weplayId: friend.weplayid
        })


    } else if (adress) {
        res.send(`This is adress ${adress}`);
    } else {
        res.status(200).send('Bye');
    }
});