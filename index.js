import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.post('/post_json_with_recaptcha', async (req, res) => {
    const { phone, recaptchaToken } = req.body;

    // Verify reCAPTCHA token first
    const recaptchaSecretKey = '6Lflk9wnAAAAAMTfz68fAu6mp-wwLqY6lQPOeyCF';
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`;

    try {
        const recaptchaResponse = await fetch(recaptchaVerifyUrl, { method: 'POST' });
        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
            console.log("reCAPTCHA verification failed");
            res.json({ status: 400, message: "reCAPTCHA verification failed" });
            return;
        }

        // Proceed with posting data to Firebase Realtime Database
        const firebaseUrl = 'https://phone-a054b-default-rtdb.asia-southeast1.firebasedatabase.app/phone_numbers.json';
        const firebaseResponse = await fetch(firebaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });

        if (firebaseResponse.ok) {
            console.log("Data saved in Firebase Realtime Database");
            res.json({ status: 200, message: "JSON data received successfully" });
        } else {
            console.log("Failed to save data in Firebase Realtime Database");
            res.json({ status: firebaseResponse.status, message: "Failed to save data in Firebase Realtime Database" });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.json({ status: 500, message: "An error occurred" });
    }
});

app.post('/post_json', async (req, res) => {
    const { phone } = req.body;

    // Do something with the phone number, for example, log it
    console.log("Received phone number:", phone);

    // Prepare the API request
    const url = 'https://apiunclecat-30cd9b3d31a8.herokuapp.com/api/requestsotp';
    const payload = { phone };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            const apiResponse = await response.json();
            console.log("API response:", apiResponse);

            // ส่งข้อมูลลง Firebase Realtime Database ผ่าน REST API
            const firebaseUrl = 'https://phone-a054b-default-rtdb.asia-southeast1.firebasedatabase.app/phone_numbers.json';
            const firebaseResponse = await fetch(firebaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            if (firebaseResponse.ok) {
                console.log("Data saved in Firebase Realtime Database");
                res.json({ status: 200, message: "JSON data received successfully and API response received" });
            } else {
                console.log("Failed to save data in Firebase Realtime Database");
                res.json({ status: firebaseResponse.status, message: "Failed to save data in Firebase Realtime Database" });
            }
        } else {
            console.log("API request failed with status code:", response.status);
            res.json({ status: response.status, message: "API request failed" });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.json({ status: 500, message: "An error occurred" });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
