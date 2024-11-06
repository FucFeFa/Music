const express = require('express');
const db = require('../db');
const router = express.Router();

// Add song to favorites list
router.post('/addToPlaylist/:songId', (req, res) => {
    const userId = req.session.user.user_id;
    const songId = req.params.songId;
    db('favorites')
    .insert({ user_id: userId, song_id: songId })
    .then(() => {
        res.json({ message: 'Song added to your favorite list' });
    })
    .catch(err => console.error(err));
})

// Remove song from favorites list
router.delete('/removeFromPlaylist/:songId', (req, res) => {
    const userId = req.session.user.user_id;
    const songId = req.params.songId;
    db('favorites')
    .where({ user_id: userId, song_id: songId })
    .delete()
    .then(() => {
        res.json({ message: 'Song remove from your favorite list' });
    })
    .catch(err => console.error(err));
})

// Update song rate
router.put('/updateRating/:songId', async (req, res) => {
    const songId = req.params.songId

    // Counting the rating of Song
    const userFavoriteSong = await db('favorites').where('song_id', songId).count('user_id as favorite_count').first()
    const allUsers = await db('users').select('*').count('user_id as user_count').first()

    // Calculate the average rating and update the song rate in the songs table
    const favoriteCount = userFavoriteSong.favorite_count;
    const userCount = allUsers.user_count;
    const rating = Math.round( ((favoriteCount/userCount) * 10) * 100 ) / 100

    await db('songs')
    .where('song_id', songId)
    .update({ song_rate: rating })

    res.status(200).json({ rate: rating })
})

// Check if song is in favorites list
router.get('/check/:songId', (req, res) => {
    const userId = req.session.user.user_id;
    const songId = req.params.songId;
    db('favorites')
   .where({ user_id: userId, song_id: songId })
   .then((data) => {
        if(data.length > 0){
            res.status(200).json({ message: 'favorite' })
        } else {
            res.status(200).json({ message: 'not favorite' })
        }
   })
})

// Return all songs in favorites list
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const favoriteSong = await db('favorites')
    .where({ user_id: userId })
    .orderBy('created_at', 'asc')
   .innerJoin('songs', 'favorites.song_id','songs.song_id')
   .innerJoin('authors','songs.author_id', 'authors.author_id')
   
   res.json({ playlistSong: favoriteSong });
})

module.exports = router