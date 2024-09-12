const express = require('express')
const db = require('./db')

const port = 3000

const app = express()

app.use(express.json())

app.use(express.static('public'))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/data/authors', function(req, res){
    db('authors').select('*').limit(6)
    .then(authors => {
        res.json(authors)
    })
    .catch(err => console.error(err))
})

app.get('/data/songs', function(req, res){
    db('songs')
    .select('*')
    .orderBy('song_rate', 'desc')
    .limit(6)
    .then (songs => {
        res.json(songs)
    })
    .catch(err => console.error(err))
})

app.get('/data/playlists', function(req, res){
    db('playlists')
    .join('playlist_songs', 'playlists.playlist_id', 'playlist_songs.playlist_id')
    .join('songs', 'playlist_songs.song_id', 'songs.song_id')
    .select('playlists.playlist_id', 'playlists.playlist_name', 'songs.song_thumb')
    .groupBy('playlists.playlist_id', 'playlists.playlist_name')
    .orderBy('playlist_rate', 'desc')
    .limit(6)
    .then (playlists => {
        res.json(playlists)
    })
    .catch(err => console.error(err))
})

app.listen(port, function(){
    console.log(`Server is running on http://localhost:${port}`);
})