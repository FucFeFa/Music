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
const homeBtn = $('.nav-home')

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
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')



const yourPlaylist = $$('.your-playlists')

var app = {
    authors: [],
    songs: [],
    currentIndex: 0,
    playlistsRecommend: [],
    currentPlaylistId: null,
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
        //Xu ly khi nguoi dung click vao nut home
        window.onload = this.saveInitialState()
        homeBtn.addEventListener('click', () =>{
            this.resetToInitialState()
            this.songClickEvent()
        })
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

        //Xu ly khi nguoi dung click vao nut home
        window.onload = this.saveInitialState()
        homeBtn.addEventListener('click', () =>{
            this.resetToInitialState()
            this.songClickEvent()
        })
    },

    renderPlaylistsRecommend(){
        const htmls = this.playlists.map(playlist => `
                <div class="playlists">
                    <img class="playlist-thumb-recommend" src="${playlist.playlist_thumb}" alt="playlist 1">
                    <h3 class="name">${playlist.playlist_name}</h3>
                </div>
            `)
        playlistContainerRecommend.innerHTML = htmls.join('')
        
        
        //Xu ly khi nguoi dung click vao nut home
        window.onload = this.saveInitialState()
        homeBtn.addEventListener('click', () =>{
            this.resetToInitialState()
            this.songClickEvent()
        })
    },

    songClickEvent() {
        // window.onload = this.saveInitialState()
        // homeBtn.addEventListener('click', () =>{
        //     this.resetToInitialState()
        //     this.songClickEvent()
        // })
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

                // Xu ly khi nguoi dung click vao nut home
                // window.onload = this.saveInitialState()
                // homeBtn.addEventListener('click', () =>{
                //     this.resetToInitialState()
                // })

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
                                <div class="your-playlists" playlist-id="${playlist.playlist_id}">
                                    <div class="playlist-img">
                                        <img class="playlist-thumb" src="${playlist.playlist_thumb}" alt="">
                                        <i class="fa-solid fa-play playlist-play-btn"></i>
                                    </div>
                                    <div class="playlist-info">
                                        <p class="playlist-title">${playlist.playlist_name}</p>
                                        <p class="playlist-about">Playlist - ${user.user_fullname}</p>
                                    </div>
                                </div>
                            `
    
                        )
                        // console.log(htmls.join(''))
                        playlistContentContainer.innerHTML = htmls.join('')
                        this.interfaceHandler()
                        
                        
                    }
                    this.createPlaylist(user)

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

        // Tạo menu chuột phải khi click ben ngoai o playlist
        const createPlaylistMenu = document.createElement('div');
        createPlaylistMenu.style.display = 'none';
        createPlaylistMenu.innerHTML = `
        <ul class="create-playlist-list">
            <li>Create playlist <i class="bi bi-plus-lg tag-list-icon"></i></li>
        </ul>`;
        document.body.appendChild(createPlaylistMenu);

        //Xu ly khi nguoi dung click chuot phai vao playlists
        playlistContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            editPlaylistMenu.classList.remove('active-playlist-menu')
            editPlaylistMenu.style.display = 'none';
            createPlaylistMenu.classList.add('active-playlist-menu');
            createPlaylistMenu.style.left = `${e.clientX}px`;
            createPlaylistMenu.style.top = `${e.clientY}px`;
            createPlaylistMenu.style.display = 'block';
        })

        ////////////////////////////////////////////////////////////////////////////////////////////////

        // Tao menu chinh sua playlist khi click chuot phai vao playlist
        const editPlaylistMenu = document.createElement('div');
        editPlaylistMenu.style.display = 'none';
        editPlaylistMenu.innerHTML = `
        <ul class="edit-playlist-list">
            <li class="edit-playlist">Edit detail <i class="bi bi-pencil tag-list-icon"></i></li>
            <li class="delete-playlist">Delete <i class="bi bi-trash tag-list-icon"></i></li>
        </ul>`;
        document.body.appendChild(editPlaylistMenu);

        //Xu ly khi nguoi dung click chuot phai vao playlists
        document.addEventListener('contextmenu', (e) => {
            if(e.target.closest('.your-playlists')) {
                e.preventDefault();
            
                app.currentPlaylistId = e.target.closest('.your-playlists').getAttribute('playlist-id');

                createPlaylistMenu.classList.remove('active-playlist-menu');
                createPlaylistMenu.style.display = 'none';
                editPlaylistMenu.classList.add('active-playlist-menu');
                editPlaylistMenu.style.left = `${e.clientX}px`;
                editPlaylistMenu.style.top = `${e.clientY}px`;
                editPlaylistMenu.style.display = 'block';
            }
        })

        // Xu ly khi nguoi dung click vào menu chuột phải
        document.addEventListener('click', (e) => {
            e.preventDefault();
            createPlaylistMenu.style.display = 'none';
            editPlaylistMenu.style.display = 'none';
            // if (!createPlaylistMenu.contains(e.target) && !editPlaylistMenu.contains(e.target)) {
            // }
        })

        $('.delete-playlist').addEventListener('click', (e) => {
            // const playlistDeleteId = this.closest('.your-playlist')
            const playlistDeleteId = app.currentPlaylistId

            fetch(`/data/playlist/delete/${playlistDeleteId}`,{
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                removePlaylistFromUI(data.playlistDeletedId)

            })
            .catch(error => {
                console.error('Error:', error);
            });
        })

        function removePlaylistFromUI(playlistId) {
            const playlistElement = $(`[playlist-id="${playlistId}"]`)
            if(playlistElement) {
                playlistElement.remove()
            }
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

        this.changeHeightContent()


        // Xu ly khi nguoi dung click vao playlists
        function loadYourPlaylist() {
            function getColorThumb() {
                //Lay mau chu dao cua anh 
                const colorThief = new ColorThief();
                const img = $('#thumb_song');
                img.onload = function() {
                    const color = colorThief.getColor(img);
                    $('#playlist-playing-info').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.8), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.6))`;
                    $('.playlist-playing-content').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.5), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0))`;
                }
            }

            $$('.your-playlists').forEach((playlist) => {
            playlist.addEventListener('click', () => {
                // Hien thi thong tin playlist khi nguoi dung click vao
                const playlistId = playlist.getAttribute('playlist-id')
                console.log(playlistId)
                // Hien thi playlist khi nguoi dung click vao
                fetch(`/data/playlist/getPlaylist/${playlistId}`)
                .then((response) => response.json())
                .then((data) => {
                    if(!data.is_empty){
                        const playlistSong = data.playlistSong

                        const htmls = `
                            <div id="playlist-playing">
                        <div id="playlist-playing-info">
                            <img id="thumb_song"  class="playlist-thumb-recommend" src="${playlistSong[0].song_thumb}" alt="">
                            <div class="playlist-playing-text">
                                <h1>${data.playlist_name}</h1>
                                <p>${data.user_fullname} - ${playlistSong.length} songs</p>
                            </div>
                        </div>
                    </div>
    
                    <div class="playlist-playing-content">
                        <div class="playlist-playing-content-heading">
                            <i class="fa-solid fa-play icon"></i>
                        </div>
    
                        <div class="playlist-playing-detail">
                            <table>
                                <thead class="table-title">
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Date added</th>
                                        <th><i class="fa-regular fa-clock"></i></th>
                                    </tr>
                                </thead>
    
                                <tbody class="playlist-playing-song">
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                        `
                        //Hien thi playlist
                        $('.recommend').innerHTML = htmls

                        //hien thi bai hat
                        const playlistSongHTML = playlistSong.map((song, index) => {
                            return `
                                <tr>
                                    <th>${index+1}</th>
                                    <th>
                                        <div class="playlist-playing-detail-title">
                                            <img src="${song.song_thumb}" alt="">
                                            <div>
                                                <h4>${song.song_title}</h4>
                                                <p>${song.author_name}</p>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        4 hours ago
                                    </th>
                                    <th class="song-duration">
                                        
                                    </th>

                                    <audio class="audio-player" src="${song.song_sound}"></audio>
                                </tr>
                            `
                        })


                        $('.playlist-playing-song').innerHTML = playlistSongHTML.join('')

                        //Lay thoi luong cua moi bai hat
                        const audios = $$('.audio-player')
                        audios.forEach((audio, index) => {
                            audio.addEventListener('loadedmetadata', function() {
                                const duration = audio.duration;
                                //Thoi luong bai hat
                                var minutes = Math.floor(duration/60)
                                var seconds = Math.floor((duration / 60 - minutes)*60)
                                $$('.song-duration')[index].innerHTML = minutes.toString().padStart(2, '0')+':'+ seconds.toString().padStart(2, '0')
                            });
                        })

                        getColorThumb()
            
                        
                    } else {

                        const htmls = `
                            <div id="playlist-playing">
                        <div id="playlist-playing-info">
                            <img id="thumb_song"  class="playlist-thumb-recommend" src="${data.playlist_thumb}" alt="">
                            <div class="playlist-playing-text">
                                <h1>${data.playlist_name}</h1>
                                <p>${data.user_fullname} - 0 song</p>
                            </div>
                        </div>
                    </div>
    
                    <div class="playlist-playing-content">
                        <div class="playlist-playing-content-heading">
                            <i class="fa-solid fa-play icon"></i>
                        </div>
    
                        <div class="playlist-playing-detail">
                            <table>
                                <thead class="table-title">
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Date added</th>
                                        <th><i class="fa-regular fa-clock"></i></th>
                                    </tr>
                                </thead>
    
                                <tbody class="playlist-playing-song">
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                        `
                        //Hien thi playlist
                        $('.recommend').innerHTML = htmls

                        //hien thi bai hat
                            playlistSongHTML =  `
                                <tr>
                                    <th></th>
                                    <th>
                                        <div class="playlist-playing-detail-title">
                                            
                                            <div>
                                                <h4></h4>
                                                <p></p>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        
                                    </th>
                                    <th class="song-duration">
                                        
                                    </th>

                                    <audio class="audio-player" src=""></audio>
                                </tr>
                            `
                            $('.playlist-playing-song').innerHTML = playlistSongHTML

                        getColorThumb()
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            })
        })
        }
        
        loadYourPlaylist()
        
        

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
                _this.isRandom = false
                randomBtn.classList.remove('btn-active')
                _this.isRepeat = true
                repeatBtn.classList.add('btn-active')
                
            }
        }

        // Khi bam vao nut random
        randomBtn.onclick = function() {
            if(_this.isRandom) {
                _this.isRandom = false
                randomBtn.classList.remove('btn-active')
                
            } else {
                _this.isRepeat = false
                repeatBtn.classList.remove('btn-active')
                _this.isRandom = true
                randomBtn.classList.add('btn-active')
                
            }
        }

        
        // Khi het thoi luong tu dong chuyen bai hat
        audio.onended = function() {
            // console.log(_this.isRepeat)
            // console.log(_this.currentIndex)
            if (_this.isRepeat) {
                audio.play()
            } else if(_this.isRandom){
                const randomIndex = Math.floor(Math.random() * _this.playlistsRecommend.length)
                _this.currentIndex = randomIndex;
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

        //khi bam vao nut backward
        prevBtn.onclick = function() {
            // console.log(_this.playlistsRecommend.length)
            console.log(_this.currentIndex)
            if (_this.currentIndex == 0) {
                _this.currentIndex = 0; // Quay lại bài hát đầu tiên
            } else {
                _this.currentIndex--; // Tiến đến bài hát tiếp theo
            }
        
            _this.loadCurrentSong(); // Tải bài hát hiện tại
            audio.play(); 
        }
    },

    createPlaylist(user) {
        // Xu ly khi click vao nut create playlist
        const createPlaylistBtn = $('.create-playlist-list')
        createPlaylistBtn.addEventListener('click', (e) => {
            fetch(`/data/session/${user.user_id}/playlist`,{
                method: 'POST',
            })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                playlistContent.style.display = 'none'
                const newPlaylist = `
                    <div class="your-playlists" playlist-id="${data.playlist_id}">
                        <div class="playlist-img">
                            <img class="playlist-thumb" src="${data.playlist_thumb}" alt="">
                            <i class="fa-solid fa-play playlist-play-btn"></i>
                        </div>
                        <div class="playlist-info">
                            <p class="playlist-title">${data.playlist_name}</p>
                            <p class="playlist-about">Playlist - ${user.user_fullname}</p>
                        </div>
                    </div>`;
                
                playlistContentContainer.innerHTML += newPlaylist;
                this.interfaceHandler()

             })
             .catch((error) => console.error('Error:', error));
        })
    },

    loadCurrentSong() {
        songPlayingThumb.src = this.playlistsRecommend[this.currentIndex].song_thumb
        songPlayingName.textContent = this.playlistsRecommend[this.currentIndex].song_title
        songPlayingArtist.textContent = this.playlistsRecommend[this.currentIndex].author_name
        audio.src = this.playlistsRecommend[this.currentIndex].song_sound
    },

    // Khi bam vao nut home thi trang recommend reset lai ve ban dau
    saveInitialState() {
        const elements = $$('.recommend')
        elements.forEach(element => {
            element.setAttribute('data-initial-html', element.innerHTML)
        })
    },

    resetToInitialState() {
        const elements = $$('.recommend')
        elements.forEach(element => {
            const initialHTML = element.getAttribute('data-initial-html')
            if(initialHTML !== null){
                element.innerHTML = initialHTML
            }
        })
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
