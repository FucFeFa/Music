const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');

const path = require('path');
const app = express();
const port = 3000;

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set secure to true for HTTPS only
}))

// Import các router
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

app.use(express.json());
app.use(express.static('public'));

// Sử dụng các router
app.use('/account', authRoutes);
app.use('/data', dataRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/account/signup',(req, res) => {
    res.sendFile(__dirname + '/public/signup.html')
})

app.get('/account/signin',(req, res) => {
    res.sendFile(__dirname + '/public/signin.html')
})

app.listen(port, function() {
    console.log(`Server is running on http://localhost:${port}`);
});
