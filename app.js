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
            { weplayid: 1 },
            {
                unique: true,
                partialFilterExpression: {
                    weplayid: { $exists: true }
                }
            }
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
app.post('/insertOne', async (req, res) => {

    const { name, weplayid } = req.body;

    if (
        !name ||
        name.trim() === '' ||
        typeof weplayid !== 'number' ||
        weplayid.toString().length !== 10
    ) {
        return res.status(400).json({
            success: false,
            message: 'Weplay ID must be exactly 10 digits , name also need'
        });
    }

    try {

        const collection = await db.collection('list')

        await collection.insertOne({ name: name, weplayid: weplayid })

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
    const { wpid } = req.query; // Note: 'adress' matches your query param
    const id = Number(wpid)
    const list = await db.collection('list')
    
    const friends = await list.find({ weplayid: id }).toArray()
    if(friends.length ===0){
       return res.json(null)
    }
    if (friends.length > 0) {

        const friend = friends[0]

        return res.json({
            name: friend.name,
            gender: friend.gender,
            weplayid: friend.weplayid,
            country: friend.country,
            level: friend.level,
            charm: friend.charm,
            diamondLevel: friend.diamondLevel,
            isDiamond: friend.isDiamond,
            family: friend.family,
            familyRole: friend.familyRole,
            moments: friend.moments,
            gift: friend.gift,
            star: friend.star,
            bff: friend.bff,
            signature: friend.signature,
            voiceRoom: friend.voiceRoom,
            date: friend.date,
            time: friend.time
        });

    }
});