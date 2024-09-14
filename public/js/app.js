const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const artistContainer = $('.artist-container')
const songContainer = $('.song-container')
const playlistContainer = $('.playlist-container')
const signUp = $('.nav-signup')
const signIn = $('.nav-signin')
const navUser = $('.nav-user')
const userAvt = $('#user-avt')
const userListInfo = $('.user-list-information')
const logOut = $('#log-out')
const playlistContent = $('.playlist-content')
const playlistContentContainer = $('.playlist-content-container')

const yourPlaylist = $$('.your-playlist')


var app = {
    authors: [],
    songs: [],
    playlistsRecommend: [],
    async fetchAuthors() {
        try {
            const response = await fetch('/data/authors')
            const authors = await response.json()
            this.authors = authors
            this.renderAuthors()
        }
        catch (error) {
            console.error('Error fetching authors:', error)
        }
    },

    async fetchSongs() {
        try {
            const response = await fetch('/data/songs')
            const songs = await response.json()
            this.songs = songs
            this.renderSongs()
        }
        catch (error) {
            console.error('Error fetching songs:', error)
        }
    },

    async fetchPlaylistsRecommend() {
        try {
            const response = await fetch('/data/playlists')
            const playlists = await response.json()
            this.playlists = playlists
            this.renderPlaylistsRecommend()
        }
        catch (error) {
            console.error('Error fetching playlists:', error)
        }
    },

    renderAuthors() {
        const htmls = this.authors.map(author => `
                <div class="artists">
                    <img class="artist-avt" src="${author.author_avatar}" alt="${author.author_name}">
                    <h3 class="name">${author.author_name}</h3>
                </div>
            `)
        artistContainer.innerHTML = htmls.join('')
    },

    renderSongs() {
        const htmls = this.songs.map(song => `
                <div class="songs">
                    <img class="song-thumb" src="${song.song_thumb}" alt="${song.song_title}">
                    <h3 class="name">${song.song_title}</h3>
                </div>
            `)
        songContainer.innerHTML = htmls.join('')
    },

    renderPlaylistsRecommend(){
        const htmls = this.playlists.map(playlist => `
                <div class="playlists">
                    <img class="playlist-thumb" src="${playlist.playlist_thumb}" alt="playlist 1">
                    <h3 class="name">${playlist.playlist_name}</h3>
                </div>
            `)
        playlistContainer.innerHTML = htmls.join('')
    },

    eventHandler() {
        //Giao dien cua nguoi da dang nhap
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const response = await fetch('/data/session');
                if (response.ok) {
                    const results = await response.json();
                    const user = results.user
                    const playlists = results.playlists
                    //Chinh lai thanh navigation
                    signIn.style.display = 'none'
                    signUp.style.display = 'none'

                    navUser.style.display = 'inline-block'
                    navUser.style.float = 'right'
                    userAvt.src = user.user_avatar
                    
                    // Hien thi play list cua nguoi dung neu co
                    if(playlists.length > 0) {
                        playlistContent.style.display = 'none'
                        htmls = playlists.map((playlist) => `
                                <div class="your-playlists">
                                    <img src="${playlist.playlist_thumb}" alt="">
                                    <div class="playlist-info">
                                        <p class="playlist-title">${playlist.playlist_name}</p>
                                        <p class="playlist-about">Playlist - ${user.user_fullname}</p>
                                    </div>
                                </div>
                            `
    
                        )
                        console.log(htmls.join(''))
                        playlistContentContainer.innerHTML = htmls.join('')
                        this.interfaceHandler()
                    }

                } else {
                    // Xử lý khi người dùng không đăng nhập
                    alert('Please log in');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
        
        // Xử lý khi người dùng click vào avatar
        userAvt.onclick = function () {
            if (userListInfo.classList.contains('active')) {
                userListInfo.classList.remove('active');
            } else {
                userListInfo.classList.add('active');
            }
        }
        
        document.addEventListener('click', function (event) {
            // Kiểm tra nếu nhấn bên ngoài userAvt và userListInfo
            if (!userListInfo.contains(event.target) && !userAvt.contains(event.target)) {
                userListInfo.classList.remove('active');
            }
        })

        // Xu ly khi nguoi dung click vao log out
        logOut.onclick = function () {
            fetch('/account/logout', {
                method: 'POST',
            })
           .then(response => response.json())
           .then(data => {
                if (data.message === 'Success') {
                    window.location.reload();
                } else {
                    alert('Error logging out');
                }
            })
           .catch(error => {
                console.error('Error:', error);
            });
        }
    },

    interfaceHandler() {
        const playlistTitle = $$('.playlist-title')
        const playlistAbout = $$('.playlist-about')

        function truncateText(selector, length) {
            const elements = selector
            elements.forEach(element => {
                const text = element.textContent
                console.log(text)

                if(text.length > length) {
                    element.textContent = text.slice(0, length) + '...'
                    console.log('truncated text content')
                } else {
                    console.log('not truncated text content')
                }
            })
        }

        truncateText(playlistTitle, 21)
        truncateText(playlistAbout, 21)
    },

    start() {
        this.fetchAuthors(),
        this.fetchSongs(),
        this.fetchPlaylistsRecommend()
        this.interfaceHandler()
        this.eventHandler()

        const windowHeight = window.innerHeight;
        console.log(windowHeight); // Xuất chiều cao của thiết bị ra console

    }
}

app.start()
