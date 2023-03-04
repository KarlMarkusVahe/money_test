const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const sql = 'INSERT INTO users (username, password) values (?, ?)'
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) throw err
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
        res.redirect('/register')
    }
})

router.post('/dashboard', (req, res) => {
    const { username, password } = req.body

    // Query the database for the user with the given username
    const sql = 'SELECT * FROM users WHERE username = ?'
    db.query(sql, [username], async (err, results) => {
        if (err) throw err

        // If no user was found, redirect to the login page with an error message
        if (results.length === 0) {
            const message = 'Invalid username or password'
            res.redirect(`/?message=${message}`)
        } else {
            // Compare the password with the hashed password stored in the database
            const user = results[0]
            const isPasswordValid = await bcrypt.compare(password, user.password)

            // If the password is valid, redirect to the dashboard
            // Otherwise, redirect to the login page with an error message
            if (isPasswordValid) {
                res.redirect('/dashboard')
            } else {
                const message = 'Invalid username or password'
                res.redirect(`/?message=${message}`)
            }
        }
    })
})

router.post('/income', (req, res) => {
    const { source, amount } = req.body;
    const sql = 'INSERT INTO income (source, amount) VALUES (?, ?)';
    db.query(sql, [source, amount], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

router.post('/expenses', (req, res) => {
    const { source, amount } = req.body;
    const sql = 'INSERT INTO expenses (source, amount) VALUES (?, ?)';
    db.query(sql, [source, amount], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

router.get('/dashboard', (req, res) => {
    db.query('SELECT * FROM income', (err, incomeResults) => {
        if (err) throw err;

        db.query('SELECT * FROM expenses', (err, expenseResults) => {
            if (err) throw err;

        res.render('dashboard', {
                income: incomeResults,
                expenses: expenseResults
            })
        })
    })
})

module.exports = router