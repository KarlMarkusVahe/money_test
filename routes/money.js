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
        const { username, password, confirm_password } = req.body

        if (password !== confirm_password) {
            return res.status(400).send("Passwords don't match");
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const sql = 'INSERT INTO users (username, password) values (?, ?)'
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
                res.render('register', { errorMessage: 'Username already exists'})
            } else if (err) {
                console.error(err)
                res.render('register', {errorMessage: 'an error occured'})
            } else {
                res.redirect('/')
            }
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
                req.session.userId = user.id
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
    const userId = req.session.userId // Retrieve user ID from session object

    const sql = 'INSERT INTO income (source, amount, user_id) VALUES (?, ?, ?)';
    db.query(sql, [source, amount, userId], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

router.post('/expenses', (req, res) => {
    const { source, amount } = req.body;
    const userId = req.session.userId // Retrieve user ID from session object

    const sql = 'INSERT INTO expenses (source, amount, user_id) VALUES (?, ?, ?)';
    db.query(sql, [source, amount, userId], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

router.get('/dashboard', (req, res) => {
    const userId = req.session.userId // Retrieve user ID from session object

    // Check if user is authenticated
    if (!req.session.userId) {
        return res.redirect('/')
    }

    db.query('SELECT * FROM income', [userId], (err, incomeResults) => {
        if (err) throw err;

        db.query('SELECT * FROM expenses', [userId], (err, expenseResults) => {
            if (err) throw err;

            res.render('dashboard', {
                income: incomeResults,
                expenses: expenseResults
            })
        })
    })
})

module.exports = router