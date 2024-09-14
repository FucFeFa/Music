const express = require('express');
const db = require('../db');
const router = express.Router();

// Lấy danh sách tác giả
router.get('/authors', (req, res) => {
    db('authors').select('*').limit(6)
    .then(authors => {
        res.json(authors);
    })
    .catch(err => console.error(err));
});

// Lấy danh sách bài hát
router.get('/songs', (req, res) => {
    db('songs')
    .select('*')
    .orderBy('song_rate', 'desc')
    .limit(6)
    .then(songs => {
        res.json(songs);
    })
    .catch(err => console.error(err));
});

// Lấy danh sách danh sách phát
router.get('/playlists', (req, res) => {
    db('playlists')
    .join('playlist_songs', 'playlists.playlist_id', 'playlist_songs.playlist_id')
    .join('songs', 'playlist_songs.song_id', 'songs.song_id')
    .select('playlists.playlist_id', 'playlists.playlist_name', 'playlists.playlist_thumb', 'playlists.user_id')
    .groupBy('playlists.playlist_id', 'playlists.playlist_name')
    .orderBy('playlist_rate', 'desc')
    .limit(6)
    .then(playlists => {
        res.json(playlists);
    })
    .catch(err => console.error(err));
});

router.get('/users', (req, res) => {
    db('users').select('*')
    .then(user => {
        res.json(user);
    })
   .catch(err => console.error(err));
})

//Get data from user
router.get('/session', async (req, res) => {
    if(req.session.user) {
        try{
            const user = req.session.user
            const playlists =  await db('playlists')
            .select('*')
            .where({user_id: user.user_id})
            res.json({
                user, 
                playlists
            });
        }
        catch(error){
            console.error(error)
            res.status(500).send('Internal Server Error')
        }
    } else {
        // Thông báo yêu cầu đăng nhập
        res.send('Please log in');
    }
})

module.exports = router;
