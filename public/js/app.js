const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const artistContainer = $('.artist-container')
const songContainer = $('.song-container')
const playlistContainerRecommend = $('.playlist-container')
const signUp = $('.nav-signup')
const signIn = $('.nav-signin')
const navUser = $('.nav-user')
const userAvt = $('#user-avt')
const userListInfo = $('.user-list-information')
const logOut = $('#log-out')
const playlistContent = $('.playlist-content')
const playlistContentContainer = $('.playlist-content-container')
const playlistContainer = $('#playlist-container')
const recommendContainer = $('#recommend-container')
const footer = $('#footer')
const footerContainer = $('#footer-container')
const navSearch = $('.nav-search');
const input = $('input');

const songPlayingThumb = $('.song-playing-thumb')
const songPlayingName = $('.song-playing-name')
const songPlayingArtist = $('.song-playing-artist')
const playBtn = $('.btn-toggle-play')
const audio = $('audio')
const iconPlay = $('.icon-play')
const iconPause = $('.icon-pause')
const currentTime = $('.current-time')
const totalTime = $('.total-time')
const repeatBtn = $('.btn-repeat')
const nextBtn = $('.btn-next')

const yourPlaylist = $$('.your-playlist')

var app = {
    authors: [],
    songs: [],
    currentIndex: 0,
    playlistsRecommend: [],
    songActive: false,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,

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
                <div class="songs" song-id=${song.song_id} song-genre=${song.song_genre}>
                    <img class="song-thumb" src="${song.song_thumb}" alt="${song.song_title}">
                    <h3 class="name">${song.song_title}</h3>
                </div>
            `)
        songContainer.innerHTML = htmls.join('')

        this.songClickEvent()
    },

    renderPlaylistsRecommend(){
        const htmls = this.playlists.map(playlist => `
                <div class="playlists">
                    <img class="playlist-thumb" src="${playlist.playlist_thumb}" alt="playlist 1">
                    <h3 class="name">${playlist.playlist_name}</h3>
                </div>
            `)
        playlistContainerRecommend.innerHTML = htmls.join('')
    },

    songClickEvent() {
        //Xu ly khi nguoi dung click vao bai hat
        const songs = $$('.songs')
        console.log(songs)
        songs.forEach(song => {
            song.addEventListener('click', (e) => {
                this.playlistsRecommend = []
                // Hien thi bai hat khi click
                const songId = song.getAttribute('song-id')
                const songGenre = song.getAttribute('song-genre')
                console.log(songGenre)
                
                fetch(`/data/song/${songId}`)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    console.log(data[0].song_thumb)


                    // songPlayingThumb.src = data[0].song_thumb
                    // songPlayingName.textContent = data[0].song_title
                    // songPlayingArtist.textContent = data[0].author_name
                    // audio.src = data[0].song_sound


                    // this.isPlaying = true
                    // iconPause.style.display = 'block'
                    // iconPlay.style.display = 'none'
                    // audio.play() 
                    // this.playMusic()
                    
                })
                .catch((error) => {
                    console.error('Error fetching song:', error);
                })

                //hien thi dashboard va chinh lai chieu cao trang web
                footer.style.display = 'block';
                this.songActive = true;
                this.changeHeightContent();

                // them bai hat vao play list hien tai
                fetch(`/data/song/${songId}/genre/${songGenre}`)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    data.forEach(song => {
                        this.playlistsRecommend.push(song)
                    })

                    this.currentIndex = 0
                    this.loadCurrentSong()
                    this.isPlaying = true
                    iconPause.style.display = 'block'
                    iconPlay.style.display = 'none'
                    audio.play() 
                })

                

            })
        })   
        
        
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
                                    <img class="playlist-thumb" src="${playlist.playlist_thumb}" alt="">
                                    <i class="fa-solid fa-play playlist-play-btn"></i>
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

        // Tạo menu chuột phải tùy chỉnh
        const customMenu = document.createElement('div');
        customMenu.style.display = 'none';
        customMenu.innerHTML = `
        <ul class="create-playlist-list">
            <li>Create playlist <i class="bi bi-plus-lg tag-list-icon"></i></li>
        </ul>`;
        document.body.appendChild(customMenu);

        //Xu ly khi nguoi dung click chuot phai vao playlists
        playlistContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            customMenu.classList.add('active-playlist-menu');
            customMenu.style.left = `${e.clientX}px`;
            customMenu.style.top = `${e.clientY}px`;
            customMenu.style.display = 'block';
        })

        // Xu ly khi nguoi dung click vào menu chuột phải
        document.addEventListener('click', (e) => {
            e.preventDefault();
            customMenu.style.display = 'none';
        })

        

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

        this.changeHeightContent()
        
        

        // Khi bam vao thanh search
        // input.addEventListener('focus', () => {
        //     navSearch.classList.add('nav-search-active')
        // })

        // input.addEventListener('blur', () => {
        //     navSearch.classList.remove('nav-search-active')
        // })
    },

    changeHeightContent() {
        if(this.songActive) {
            //Chinh sua chieu cao content
            const windowHeight = window.innerHeight;
            fitHeight = windowHeight - (76 + 74)
            playlistContainer.style.height = `${fitHeight}px`
            recommendContainer.style.height = `${fitHeight}px`
            console.log(windowHeight);
            
            window.addEventListener('resize', () => {
                console.log('Kích thước cửa sổ đã thay đổi!');
                const newHeight = window.innerHeight - (76 + 74);
                playlistContainer.style.height = `${newHeight}px`
                recommendContainer.style.height = `${newHeight}px`
        });
        } else {
            //Chinh sua chieu cao content
            const windowHeight = window.innerHeight;
            fitHeight = windowHeight - 76
            playlistContainer.style.height = `${fitHeight}px`
            recommendContainer.style.height = `${fitHeight}px`
            console.log(windowHeight);
            
            window.addEventListener('resize', () => {
                console.log('Kích thước cửa sổ đã thay đổi!');
                const newHeight = window.innerHeight - 76;
                playlistContainer.style.height = `${newHeight}px`
                recommendContainer.style.height = `${newHeight}px`
        });
        }
    },

    playMusic() {
        const _this = this;
        // Xu ly khi bam vao nut play
        playBtn.addEventListener('click', () => {
            if(this.isPlaying) {
                audio.pause()
                this.isPlaying = false
                iconPause.style.display = 'none'
                iconPlay.style.display = 'block'
                console.log('is paused')
            } else {
                audio.play()
                this.isPlaying = true
                iconPause.style.display = 'block'
                iconPlay.style.display = 'none'
                console.log('is playing')
            }
        })

        //Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration*100)
                progress.value = progressPercent
                
                //Thoi luong bai hat
                var minutes = Math.floor(audio.duration/60)
                var seconds = Math.floor((audio.duration / 60 - minutes)*60)
                var currentMinutes = Math.floor(audio.currentTime/60)
                var currentSeconds = Math.floor((audio.currentTime / 60 - currentMinutes)*60)
                // console.log(minutes, seconds)
                currentTime.textContent = currentMinutes+':'+currentSeconds.toString().padStart(2, '0')
                totalTime.textContent = minutes + ':' + seconds.toString().padStart(2, '0')
            }
            
        }

        //Tua thoi luong bai hat
        progress.oninput = function(e) {
            const seekTime = e.target.value
            audio.currentTime = seekTime / 100 * audio.duration
        }


        //Khi bam vao nut repeat
        repeatBtn.onclick = function() {
            if(_this.isRepeat) {
                _this.isRepeat = false
                repeatBtn.classList.remove('btn-active')
                
            } else {
                // this.isRandom = false
                // randomBtn.classList.remove('btn-active')
                _this.isRepeat = true
                repeatBtn.classList.add('btn-active')
                
            }
        }

        
        // Khi het thoi luong tu dong chuyen bai hat
        audio.onended = function() {
            // console.log(_this.isRepeat)
            // console.log(_this.currentIndex)
            if (_this.isRepeat) {
                audio.play()
            } else {
                if (_this.currentIndex >= _this.playlistsRecommend.length - 1) {
                    _this.currentIndex = 0; // Quay lại bài hát đầu tiên
                }else {
                    _this.currentIndex++; // Tiến đến bài hát tiếp theo
                }
            }
        
            _this.loadCurrentSong(); // Tải bài hát hiện tại
            audio.play(); 
        }

        //khi bam vao nut next
        nextBtn.onclick = function() {
            // console.log(_this.playlistsRecommend.length)
            console.log(_this.currentIndex)
            if (_this.currentIndex >= _this.playlistsRecommend.length - 1) {
                _this.currentIndex = 0; // Quay lại bài hát đầu tiên
            } else {
                _this.currentIndex++; // Tiến đến bài hát tiếp theo
            }
        
            _this.loadCurrentSong(); // Tải bài hát hiện tại
            audio.play(); 
        }
    },

    loadCurrentSong() {
        songPlayingThumb.src = this.playlistsRecommend[this.currentIndex].song_thumb
        songPlayingName.textContent = this.playlistsRecommend[this.currentIndex].song_title
        songPlayingArtist.textContent = this.playlistsRecommend[this.currentIndex].author_name
        audio.src = this.playlistsRecommend[this.currentIndex].song_sound
    },

    start() {
        this.fetchAuthors(),
        this.fetchSongs(),
        this.fetchPlaylistsRecommend()
        this.interfaceHandler()
        this.eventHandler()

        this.playMusic()

        

    }
}

app.start()
