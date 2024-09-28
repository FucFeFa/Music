const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const iconv = require('iconv-lite');

// Hàm để tạo chuỗi ngẫu nhiên
function generateRandomString(length) {
    return Math.random().toString(36).substring(2, length + 2);
}

// Cau hinh multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.mimetype.startsWith('image/'))
            cb(null, path.join(__dirname, '../public/asset/img'))
        else if(file.mimetype.startsWith('audio/')) {
            cb(null, path.join(__dirname, '../public/asset/music'))
        } else {
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
            // .innerJoin('playlist_songs', 'playlists.playlist_id', 'playlist_songs.playlist_id')
            // .innerJoin('songs', 'playlist_songs.song_id', 'songs.song_id')
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
                .returning('id')
                .then(id => {
                        res.json({
                            "playlist_id": id[0],
                            "playlist_name": playlist_name,
                            "playlist_thumb": playlist_thumb
                        });
                    })
                .catch(err => console.error(err));
       })
       .catch(err => console.error(err));

       
});

// Xoa playlist
router.delete('/playlist/delete/:playlistDeleteId', (req, res) => {
    const playlistDeletedId = req.params.playlistDeleteId

    db('playlist_songs')
        .where('playlist_id', playlistDeletedId)
        .del()
        .then(() => {
            db('playlists')
                .where('playlist_id', playlistDeletedId)
                .del()
                .then(() => {
                    res.json({ 
                        message: `Playlist deleted successfully`,
                        playlistDeletedId: playlistDeletedId,
                    });
                })
                .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
})


// Tra ve thong tin ve playlist chi dinh

router.get('/playlist/getPlaylist/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;

    db('playlists')
       .select('*')
       .where('playlists.playlist_id', playlistId)
       .innerJoin('playlist_songs', 'playlists.playlist_id', 'playlist_songs.playlist_id')
       .innerJoin('songs', 'playlist_songs.song_id','songs.song_id')
       .innerJoin('authors','songs.author_id', 'authors.author_id')
       .innerJoin('users', 'playlists.user_id', 'users.user_id')
    //    .groupBy('songs.song_id')
       .then(playlistData => {
            if(playlistData.length > 0){
                const playlist = playlistData[0];
                const songs = playlistData.map(song => ({
                    song_id: song.song_id,
                    song_title: song.song_title,
                    song_thumb: song.song_thumb,
                    author_name: song.author_name,
                    song_sound: song.song_sound
                }))

                res.json({
                    playlist_id: playlist.playlist_id,
                    playlist_name: playlist.playlist_name,
                    playlist_thumb: playlist.playlist_thumb,
                    playlist_thumb_custom: playlist.playlist_thumb_custom,
                    user_fullname: playlist.user_fullname,
                    is_empty: false,
                    playlistSong: songs
                });
            } else {
                db('playlists')
                .select('*')
                .where('playlists.playlist_id', playlistId)
                .innerJoin('users', 'playlists.user_id', 'users.user_id')
                .then(playlist => {
                    res.json({
                        playlist_id: playlist[0].playlist_id,
                        playlist_name: playlist[0].playlist_name,
                        playlist_thumb: playlist[0].playlist_thumb,
                        user_fullname: playlist[0].user_fullname,
                        is_empty: true
                    })
                })
            }

        })
       .catch(err => console.error(err));
});


// Lay tat ca thong tin bai hat nam cung mot playlist
router.get('/playlist/getSong/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;
    db('playlist_songs')
    .select('songs.*', 'authors.author_name')
    .innerJoin('songs', 'playlist_songs.song_id', 'songs.song_id')
    .innerJoin('authors','songs.author_id', 'authors.author_id')
    .where('playlist_songs.playlist_id', playlistId)
    .then((data) => {
        res.json(data)
    })
})


// Tra ve ket qua da tim kiem
router.get('/search/:searchText', (req, res) => {
    const searchText = req.params.searchText
    db('songs')
    .select('*', 'authors.author_name')
    .innerJoin('authors','songs.author_id', 'authors.author_id')
    .where('songs.song_title', 'like', `%${searchText}%`)
    .orWhere('authors.author_name', 'like', `%${searchText}%`)
    .orderBy('songs.song_rate', 'desc')
    .limit(4)
    .then((data) => {
        res.json(data)
    })
})

//Them nhac vao playlist co san
router.post('/song/:getSongId/addToPlaylist/:playlistId', (req, res) => {
    const getSongId = req.params.getSongId
    const playlistId = req.params.playlistId
    db('playlist_songs')
    .insert({ song_id: getSongId, playlist_id: playlistId })
    .then(() => {
        res.json({ message: `Song added to playlist ${playlistId}` })
    })
    .catch(err => console.error(err));
})

// Tra ve tat ca artist
router.get('/artist', (req, res) => {
    db('authors')
    .select('*')
    .then((data) => {
        res.json(data)
    })
})

// Dinh nghia middleware multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn kích thước file là 50MB
});

// Them nhac vao csdl (admin)
router.post('/addSong', upload.fields([{ name: 'thumb-file' }, { name: 'audio-file' }]), (req, res) => {
    const { title, artist, genre } = req.body;

    // Kiểm tra nếu không có file nào được tải lên
    if (!req.files || !req.files['thumb-file'] || !req.files['audio-file']) {
        return res.status(400).json({ message: 'Thiếu file tải lên' });
    }

    // Lưu đường dẫn tương đối
    const thumb = `./asset/img/${req.files['thumb-file'][0].filename}`;
    const audio = `./asset/music/${req.files['audio-file'][0].filename}`;

    console.log(title, artist, genre, thumb, audio); // Debugging output

    db('songs')
        .insert({ song_title: title, author_id: artist, song_genre: genre, song_thumb: thumb, song_sound: audio })
        .then(() => {
            res.status(200).json({ message: 'Song added successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error adding song', error: err.message });
        });
});



module.exports = router;
