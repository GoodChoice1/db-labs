import express from 'express';
import redis from 'redis';

const app = express()
const port = 3000;

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.connect();

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

const setRedis = async (key, value) => {
    return client.set(key, value);
}

const getRedis = async (key) => {
    return client.get(key);
}

app.use(express.json());

app.post('/', async (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).send('Both key and value required')

    await setRedis(key, value);
    return res.send('Ok');
});

app.get('/:key', async (req, res) => {
    const { key } = req.params;

    const value = await getRedis(key);
    if (!value) return res.status(404).send('Key not found');

    return res.send(value);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});