// server.mjs
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const secretKey = '6Lflk9wnAAAAAMTfz68fAu6mp-wwLqY6lQPOeyCF';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'capcha.html'));
});

app.post('/submit', (req, res) => {
    // Your reCAPTCHA verification code here

    // Assuming the verification passes
    res.send('Form submitted successfully.');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
