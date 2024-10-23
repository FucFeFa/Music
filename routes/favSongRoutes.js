const express = require('express');
const db = require('../db');
const router = express.Router();

// Add song to favorites list
router.post('/addToPlaylist/:userId/:songId', (req, res) => {
    const userId = req.params.userId;
    const songId = req.params.songId;
    db('favorites')
    .insert({ user_id: userId, song_id: songId })
    .then(() => {
        res.json({ message: 'Song added to your favorite list' });
    })
    .catch(err => console.error(err));
})

// Remove song from favorites list
router.delete('/removeFromPlaylist/:userId/:songId', (req, res) => {
    const userId = req.params.userId;
    const songId = req.params.songId;
    db('favorites')
    .where({ user_id: userId, song_id: songId })
    .delete()
    .then(() => {
        res.json({ message: 'Song remove from your favorite list' });
    })
    .catch(err => console.error(err));
})

// Check if song is in favorites list
router.get('/check/:userId/:songId', (req, res) => {
    const userId = req.params.userId;
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