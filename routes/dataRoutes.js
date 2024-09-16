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

//lay thong tin bai hat
router.get('/song/:songId', function(req, res) {
    const songId = req.params.songId;
    db('songs')
       .select('*')
       .where('song_id', songId)
       .join('authors', 'songs.author_id', 'authors.author_id')
       .then(song => {
            res.json(song);
        })
       .catch(err => console.error(err));
})

// lay tat ca thong tin bai hat qua the loai
router.get('/song/:songId/genre/:songGenre', (req, res) => {
    const songGenre = req.params.songGenre;
    const songId = req.params.songId;
    db('songs')
       .select('*')
       .where('song_genre', songGenre)
       .join('authors', 'songs.author_id', 'authors.author_id')
       .then(songs => {
            const clickSongIndex = songs.findIndex(song => song.song_id == songId)

            if(clickSongIndex > -1) {
                const clickSong = songs.splice(clickSongIndex, 1)[0];

                songs.unshift(clickSong)
            }

            res.json(songs);
        })
       .catch(err => console.error(err));
})

// Tao mot playlist moi
router.post('/session/:user_id/playlist', (req, res) => {
    const user_id = req.params.user_id;
    
    db('playlists')
       .where( {user_id} )
       .count('user_id as total')
       .then(result => {
            const playlist_name = `My Playlist #${result[0].total + 1}`
            const playlist_thumb = `./asset/img/default_playlist_thumb.jpg`
            // Tao play list moi
            return db('playlists')
                .insert({ playlist_name, user_id })
                .then(playlist => {
                        res.json({
                            "playlist_name": playlist_name,
                            "playlist_thumb": playlist_thumb
                        });
                    })
                .catch(err => console.error(err));
       })
       .catch(err => console.error(err));

       
});

module.exports = router;
