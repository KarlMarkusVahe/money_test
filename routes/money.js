const express = require('express')
const router = express.Router()
const db = require('../utils/db')

router.get('/', (req, res) => {
    res.render('login')
})

router.post('/dashboard', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    // Authenticate the user here using the email and password
    if (username === 'matu' && password === 'parrol') {
        res.redirect('/dashboard')
    } else {
        const message = 'wrong'
        res.redirect('/')
    }
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