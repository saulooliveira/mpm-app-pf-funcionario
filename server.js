import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
await client.connect();
const db = client.db('escalas');
const collection = db.collection('data');

const defaultData = {
  employees: ["Ana","Bruno","Carla","Diego"],
  schedules: {},
  swapRequests: [],
  holidaySyncedYears: [],
  prefs: { uf:'SP', ibgeCity:'3550308', calendarificKey:'', invertextoToken:'', syncedUF:{}, syncedCity:{} },
};

app.get('/api/data', async (req, res) => {
  let doc = await collection.findOne({ _id: 'main' });
  if (!doc) {
    await collection.insertOne({ _id: 'main', data: defaultData });
    doc = { data: defaultData };
  }
  res.json(doc.data);
});

app.post('/api/data', async (req, res) => {
  const data = req.body;
  await collection.updateOne({ _id: 'main' }, { $set: { data } }, { upsert: true });
  res.json({ status: 'ok' });
});

app.use(express.static('src'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
