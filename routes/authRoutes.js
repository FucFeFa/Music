const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Đăng ký người dùng
router.post('/signup', async (req, res) => {
    const { username, password, confirmPassword, email, date } = req.body;

    // Kiểm tra tồn tại tài khoản với tên đăng nhập đã đăng ký
    const user = await db('users')
    .where({ user_username: username })
    .first();
     
    if (user) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Kiểm tra tồn tại tài khoản với email đã đăng ký
    const mail = await db('users')
       .where({ user_email: email })
       .first();
    
    if (mail) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db('users').insert({
            user_fullname: username,
            user_username: username,
            user_password: hashedPassword,
            user_email: email,
            user_date_signup: date
        });

        res.status(200).json({ message: 'Success' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Đăng nhập người dùng
router.post('/signin', async (req, res) => {
    // Xử lý đăng nhập
    const {
        username,
        password
    } = req.body

    try {
        // Kiểm tra tồn tại tài khoản với tên đăng nhập
        const user = await db('users')
        .where({ user_username: username })
        .first();
        
        if (!user) {
            return res.status(401).json({ message: 'Username is not exists' });
        }

        // So sánh mật khẩu đăng nhập với mật khẩu trong cơ sở dữ liệu
        var match = bcrypt.compareSync(password, user.user_password);

        if(!match) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        //Tra ve du lieu cung voi session nguoi dung
        req.session.user = user
        req.session.user_username = username
        if(username === 'admin') {
            res.status(200).json({ message: 'Page for admin' });
        } else {
            res.status(200).json({ message: 'Success' });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Đăng xuất người dùng

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Success' });
    });
});

// Đổi mật khẩu'
router.put('/resetPassword', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body
    
    const checkUsername = await db('users').where( { user_username: username }).first()

    if(!checkUsername) {
        return res.status(400).json({ message: 'Username is not exists' });
    }

    const checkEmail = await db('users').where({ user_email: email, user_username: username }).first()

    if(!checkEmail) {
        return res.status(400).json({ message: 'Wrong email for this account' });
    }

    if(password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await db('users').where({ user_username: username }).update({ user_password: hashedPassword }).then(() => {
        res.status(200).json({ message: 'Success' });
    }).catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    });
})

// Kiểm tra đăng nhập
router.get('/check-auth', (req, res) => {
    if(req.session.user_username === 'admin') {
        res.status(200).json({ message: 'Success' });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
