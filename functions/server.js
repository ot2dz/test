const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000; // Use the dynamic port provided by Netlify or default to 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/extractData', (req, res) => {
    const trackingId = req.body.trackingId;
    const apiUrl = `https://elmarto.3m.express/v1/orders?id=&trackingId=${trackingId}&target[phoneNumberPrimary]=&skip=0&take=100&placementStatus=VALIDATED`;
    const authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6eyJ0eXBlIjoiT1BTQUdFTlQiLCJmYWNpbGl0eUlkIjo4OCwiZmFjaWxpdHlUeXBlIjoiU1RPUERFU0sifSwidHlwZSI6InNpZ24taW4iLCJ1c2VySWQiOjU4LCJpYXQiOjE3MDQxMDYxMjIsImV4cCI6MTcwNjY5ODEyMn0.sT_yUpFYQ72yGBLNIw1AWOtBQBlhu3IYsp6k-k86-1c";

    const requestOptions = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": authHeader,
        },
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const orders = data.data;
            const extractedData = orders.map(order => ({
                qr: order.id,
                status: order.status,
                date: order.createdAt,
                name : order.target.fullName,
                phone: order.target.phoneNumberPrimary,
                address : order.target.address,
                product : order.parcel.description,
                price : order.cashCollection.totalPostTarget,
                delivery : order.operation.deliveryType,
            }));
            res.json({ extractedData });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
            console.error("Error:", error);
        });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
