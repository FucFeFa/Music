const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const iconv = require('iconv-lite');
const fs = require('fs');

// Doi mat khau
router.put('/changePassword/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { current_password, new_password, confirm_password } = req.body;

    try {
        const user = await db('users')
        .where({ user_id: userId })
        .first();

        const match = bcrypt.compareSync(current_password, user.user_password)

        // Neu password hien tai khong dung
        if(!match) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Neu password moi khong trung
        if(new_password !== confirm_password) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        const hashedPassword = bcrypt.hashSync(new_password, 10);

        // Cap nhat password
        await db('users')
        .update({ user_password: hashedPassword})
        .where({ user_id: userId })

        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error changing password' });
    }
})

// Cap nhat thong tin ca nhan
router.put('/updateInformation/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { fullname, email, phone } = req.body;

    try {
        await db('users')
        .update({ user_fullname: fullname, user_email: email, user_phone: phone })
        .where({ user_id: userId })


        req.session.user.user_fullname = fullname;
        req.session.user.user_email = email;
        req.session.user.user_phone = phone;
        res.status(200).json({ message: 'Information updated successfully' });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// Thay doi avatar
// Ham tao chuoi ngau nhien
function generateRandomString(length) {
    return Math.random().toString(36).substring(2, length + 2);
}

// Cau hinh multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.mimetype.startsWith('image/'))
            cb(null, path.join(__dirname, '../public/asset/img/user'))
        else {
            cb(new Error('Invalid file'), false)
        }
    },
    filename: function (req, file, cb) {
        const randomString = generateRandomString(8); // Tạo chuỗi ngẫu nhiên dài 8 ký tự
        const ext = path.extname(file.originalname); // Lấy phần mở rộng của tệp
        const withoutExt = path.basename(file.originalname, ext); // Lấy tên gốc mà không có phần mở rộng
        const originalName = iconv.decode(Buffer.from(withoutExt, 'binary'), 'utf-8'); // Chuyển đổi thành UTF-8
        cb(null, `${originalName}-${randomString}${ext}`); // Kết hợp tên gốc với chuỗi ngẫu nhiên và phần mở rộng
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn kích thước file là 50MB
});

// Thay doi avatar trong csdl
router.put('/:userId/uploadAvatar/:oldAvatar', upload.fields([{ name: 'change_avatar' }]), async (req, res) => {
    const userId = req.params.userId;
    const oldAvatar = req.params.oldAvatar;
    const filePath = path.join(__dirname, '../public/asset/img/user', oldAvatar);

    if (!req.files || !req.files['change_avatar']) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatar = `./asset/img/user/${req.files['change_avatar'][0].filename}`;

    await db('users')
        .update({ user_avatar: avatar })
        .where({ user_id: userId });

    // Kiem tra xem co file khong
    fs.stat(filePath, (err) => {
        if (err && err.code === 'ENOENT') {
            console.log('Old avatar not found, skipping deletion.');
            return;
        } else if (err) {
            return res.status(500).json({ error: 'Error checking old file' });
        }

        // Xoa file cu
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete old avatar' });
            }
            console.log('Old avatar deleted successfully.');
        });
    });

    req.session.user.user_avatar = avatar;
    res.status(200).json({ message: 'Avatar updated successfully', avatar: avatar });
});


module.exports = router