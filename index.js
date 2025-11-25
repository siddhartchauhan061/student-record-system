
const express = require('express');
const Student = require('./models/students.models');
const Admin = require('./models/Admin.model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/nexcore_students_app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Express App
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'random-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    Admin.create(req.body);
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
        let isPasswordCorrect = await bcrypt.compare(req.body.password, admin.password);
        if (isPasswordCorrect) {
            req.session.admin = admin;
            res.redirect('/');
        }
        else {
            console.log('Invalid password');
            res.redirect('/login');
        }
    } else {
        console.log('No admin found');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.use((req, res, next) => {
    if (req.session.admin) {
        next();
    }
    else {
        console.log('No admin found');
        res.redirect('/login');
    }
})

app.get('/', async (req, res) => {
    let students = await Student.find();
    res.render('index', { students });
});

app.post('/add-student', async (req, res) => {
    try {
        await Student.create(req.body);
        res.redirect('/');
    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).send('Error creating student');
    }
});

app.get('/edit-student/:id', async (req, res) => {
    let student = await Student.findById(req.params.id)
    res.render('edit-student', { student });
})

app.post('/edit-student/:id', async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, req.body)
    res.redirect('/');
})

app.get('/delete-student/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id)
    res.redirect('/');
})

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));