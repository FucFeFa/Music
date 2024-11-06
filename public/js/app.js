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
const input = $('.nav-search input');
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
const volumeControl = $('.volume-control')
const volumeIcon = $('.volume-icon')

var getSongId = ''
var currentVolume = 0



const yourPlaylist = $$('.your-playlists')

var app = {
    authors: [],
    songs: [],
    currentIndex: 0,
    currentPlaylist: [],
    searchSuggestions: [],
    userInformation: {},
    currentPlaylistId: null,
    songActive: false,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,

    async getUserInformation() {
        try {
            const response = await fetch('/data/session')
            const data = await response.json()
            app.userInformation = data
        }
        catch (error) {
            console.error('Error fetching userId:', error)
        }
    },

    async fetchAuthors() {
        try {
            const response = await fetch('/data/authors')
            const authors = await response.json()
            this.renderAuthors(authors)
        }
        catch (error) {
            console.error('Error fetching authors:', error)
        }
    },

    async fetchSongs() {
        try {
            const response = await fetch('/data/songs')
            const songs = await response.json()
            this.renderSongs(songs)
        }
        catch (error) {
            console.error('Error fetching songs:', error)
        }
    },

    async fetchcurrentPlaylist() {
        try {
            const response = await fetch('/data/playlists')
            const playlists = await response.json()
            console.log(playlists)
            this.rendercurrentPlaylist(playlists)
        }
        catch (error) {
            console.error('Error fetching playlists:', error)
        }
    },

    renderAuthors(authors) {
        const htmls = authors.map(author => `
                <div class="artists">
                    <img class="artist-avt" src="${author.author_avatar}" alt="${author.author_name}">
                    <h3 class="name">${author.author_name}</h3>
                </div>
            `)
            $('.artist-container').innerHTML = htmls.join('')

        // Luu trang thai ban dau
        if(!$('.recommend').hasAttribute('data-initial-html') && $('.artists') && $('.songs') && $('.playlists'))
        this.saveInitialState()

        this.interfaceHandler()
    },

    renderSongs(songs) {
        const htmls = songs.map(song => `
                <div class="songs" song-id=${song.song_id} song-genre=${song.song_genre}>
                    <img class="song-thumb" src="${song.song_thumb}" alt="${song.song_title}">
                    <h3 class="name">${song.song_title}</h3>
                </div>
            `)
            $('.song-container').innerHTML = htmls.join('')

        this.songClickEvent($$('.songs'))

        // Luu trang thai ban dau
        if(!$('.recommend').hasAttribute('data-initial-html') && $('.artists') && $('.songs') && $('.playlists'))
        this.saveInitialState()

        this.interfaceHandler()
    },

    rendercurrentPlaylist(playlists){
        const htmls = playlists.map(playlist => `
                <div class="playlists">
                    <img class="playlist-thumb-recommend" src="${playlist.playlist_thumb}" alt="playlist 1">
                    <h3 class="name">${playlist.playlist_name}</h3>
                </div>
            `)
            $('.playlist-container').innerHTML = htmls.join('')
        
        // Luu trang thai ban dau
        if(!$('.recommend').hasAttribute('data-initial-html') && $('.artists') && $('.songs') && $('.playlists'))
        this.saveInitialState()

        this.interfaceHandler()
    },

    homeBtnClick() {
        homeBtn.addEventListener('click', () =>{
            this.resetToInitialState()

            this.fetchAuthors()
            this.fetchSongs()
            this.fetchcurrentPlaylist()

            this.songClickEvent($$('.songs'))
            this.interfaceHandler()
        })
    },

    songClickEvent(songElement) {
        //Xu ly khi nguoi dung click vao bai hat
        const songs = songElement
        // console.log(songs)
        songs.forEach(song => {
            song.addEventListener('click', (e) => {

                this.currentPlaylist = []
                // Hien thi bai hat khi click
                const songId = song.getAttribute('song-id')
                const songGenre = song.getAttribute('song-genre')

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
                        this.currentPlaylist.push(song)
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
                    userAvt.style.display = 'block'
                    userAvt.src = user.user_avatar
                    
                    //Hien thi danh sach playlist
                    if (playlists.length > 0) {
                        playlistContent.style.display = 'none';
                    
                        const htmls = await Promise.all(playlists.map(async (playlist) => {
                            let playlistThumb = playlist.playlist_thumb;
                    
                            // Nếu playlist không có ảnh tùy chỉnh, lấy từ bài hát đầu tiên
                            if (!playlist.playlist_thumb_custom) {
                                try {
                                    const response = await fetch(`data/playlist/getPlaylist/${playlist.playlist_id}`);
                    
                                    const data = await response.json();
                    
                                    // Kiểm tra nếu playlistSong tồn tại và có ít nhất 1 bài hát
                                    if (data.playlistSong && data.playlistSong.length > 0) {
                                        playlistThumb = data.playlistSong[0].song_thumb;
                                    } else {
                                        playlistThumb = playlist.playlist_thumb;
                                    }
                    
                                } catch (error) {
                                    console.error('Lỗi khi lấy dữ liệu từ API:', error);
                                }
                            }
                    
                            return `
                                <div class="your-playlists" playlist-id="${playlist.playlist_id}">
                                    <div class="playlist-img">
                                        <img class="playlist-thumb" src="${playlistThumb}" alt="">
                                        <i class="fa-solid fa-play playlist-play-btn"></i>
                                    </div>
                                    <div class="playlist-info">
                                        <p class="playlist-title">${playlist.playlist_name}</p>
                                        <p class="playlist-about">Playlist - ${user.user_fullname}</p>
                                    </div>
                                </div>
                            `;
                        }));
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
            // e.preventDefault();
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

    getColorThumb(thumb) {
        //Lay mau chu dao cua anh 
        const colorThief = new ColorThief();
        const img = thumb;
        img.onload = function() {
            const color = colorThief.getColor(img);
            if($('.recommend').classList.contains('active-profile')){
                $('#profile-detail').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.8), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.6))`;
                $('#edit-profile').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.5), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0))`;
            } else {
                $('#playlist-playing-info').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.8), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.6))`;
                $('.playlist-playing-content').style.background = `linear-gradient(to bottom, rgb(${color[0]}, ${color[1]}, ${color[2]}, 0.5), rgb(${color[0]}, ${color[1]}, ${color[2]}, 0))`;
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

                if(text.length > length) {
                    element.textContent = text.slice(0, length) + '...'
                } else {
                }
            })
        }

        truncateText(playlistTitle, 21)
        truncateText(playlistAbout, 21)

        truncateText($$('.name'), 12)
        truncateText($$('.insert-to-playlist'), 20)


        this.changeHeightContent()


        // Xu ly khi nguoi dung click vao playlists
        function loadYourPlaylist() {
            
            $$('.your-playlists').forEach((playlist) => {
            playlist.addEventListener('click', () => {
                // Hien thi thong tin playlist khi nguoi dung click vao
                const playlistId = playlist.getAttribute('playlist-id')
                // console.log(playlistId)
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
                        $('.recommend').classList.add('active-playlist-playing')
                        $('.recommend').classList.remove('active-favorite-playlist')
                        $('.recommend').classList.remove('active-profile')
                        

                        //hien thi bai hat
                        const playlistSongHTML = playlistSong.map((song, index) => {
                            return `
                                <tr class="songs-playlist" song-id=${song.song_id}>
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

                        app.getColorThumb($('#thumb_song'))

                        //Khi click vao bai hat trong your playlist
                        const songs = $$('.songs-playlist')
                        
                        songs.forEach((song, index) => {
                            song.addEventListener('click', function() {
                                app.currentPlaylist=[]
                                // const songId = song.getAttribute('song-id')
                                // app.currentPlaylist.push(song)
                                fetch(`/data/playlist/getSong/${playlistId}`)
                                    .then((response) => {
                                        return response.json()
                                    })
                                    .then((data) => {

                                        data.forEach((item) => {
                                            // them bai hat vao play list hien tai
                                            app.currentPlaylist.push(item)
                                        })

                                        console.log(app.currentPlaylist)


                                        //hien thi dashboard va chinh lai chieu cao trang web
                                        footer.style.display = 'block';
                                        app.songActive = true;
                                        app.changeHeightContent();

                                        //load bai hat
                                        app.currentIndex = index
                                        console.log(app.currentIndex)
                                        app.loadCurrentSong()
                                        app.isPlaying = true
                                        iconPause.style.display = 'block'
                                        iconPlay.style.display = 'none'
                                        audio.play()
                                    })
                                    .catch((error) => {
                                        console.error('Error fetching song:', error);
                                    })
                            })
                        })
            
                        
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
        input.addEventListener('focus', () => {
            navSearch.classList.add('nav-search-active')
        })

        input.addEventListener('blur', () => {
            navSearch.classList.remove('nav-search-active')
        })

    },

    changeHeightContent() {
        if(this.songActive) {
            //Chinh sua chieu cao content
            const windowHeight = window.innerHeight;
            fitHeight = windowHeight - (76 + 74)
            playlistContainer.style.height = `${fitHeight}px`
            recommendContainer.style.height = `${fitHeight}px`
            // console.log(windowHeight);
            
            window.addEventListener('resize', () => {
                // console.log('Kích thước cửa sổ đã thay đổi!');
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
            // console.log(windowHeight);
            
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
        audio.volume = 0.5
        // Xu ly khi bam vao nut play
        playBtn.addEventListener('click', () => {
            if(_this.isPlaying) {
                audio.pause()
                _this.isPlaying = false
                iconPause.style.display = 'none'
                iconPlay.style.display = 'block'
                console.log('is paused')
            } else {
                audio.play()
                _this.isPlaying = true
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
            if (_this.isRepeat) {
                audio.play()
            } else if(_this.isRandom){
                const randomIndex = Math.floor(Math.random() * _this.currentPlaylist.length)
                _this.currentIndex = randomIndex;
            } else {
                if (_this.currentIndex >= _this.currentPlaylist.length - 1) {
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
            // console.log(_this.currentPlaylist.length)
            console.log(_this.currentIndex)
            if (_this.currentIndex >= _this.currentPlaylist.length - 1) {
                _this.currentIndex = 0; // Quay lại bài hát đầu tiên
            } else {
                _this.currentIndex++; // Tiến đến bài hát tiếp theo
            }
        
            _this.loadCurrentSong(); // Tải bài hát hiện tại
            audio.play(); 
        }

        //khi bam vao nut backward
        prevBtn.onclick = function() {
            // console.log(_this.currentPlaylist.length)
            console.log(_this.currentIndex)
            if (_this.currentIndex == 0) {
                _this.currentIndex = 0; // Quay lại bài hát đầu tiên
            } else {
                _this.currentIndex--; // Tiến đến bài hát tiếp theo
            }
            _this.loadCurrentSong(); // Tải bài hát hiện tại
            audio.play(); 
        }


        // Chinh volume
        volumeControl.oninput = function(e) {
            audio.volume = e.target.value
            currentVolume = e.target.value
            if(e.target.value > 0.5) {
                volumeIcon.classList.remove('fa-volume-xmark')
                volumeIcon.classList.remove('fa-volume-low')
                volumeIcon.classList.remove('fa-volume-high')
                volumeIcon.classList.add('fa-volume-high')
            } else if (e.target.value <= 0.5 && e.target.value > 0) {
                volumeIcon.classList.remove('fa-volume-high')
                volumeIcon.classList.remove('fa-volume-xmark')
                volumeIcon.classList.remove('fa-volume-low')
                volumeIcon.classList.add('fa-volume-low')
            } else {
                volumeIcon.classList.remove('fa-volume-low')
                volumeIcon.classList.remove('fa-volume-high')
                volumeIcon.classList.remove('fa-volume-xmark')
                volumeIcon.classList.add('fa-volume-xmark')
            }
        }

        // Khi bam vao icon volumn
        volumeIcon.onclick = function () {
            if(!volumeIcon.classList.contains('fa-volume-xmark')){
                currentVolume = volumeControl.value
                audio.volume = 0
                volumeControl.value = 0
                volumeIcon.classList.add('fa-volume-xmark')
            } else {
                audio.volume = currentVolume
                volumeIcon.classList.remove('fa-volume-xmark')
                volumeControl.value = currentVolume
                if(currentVolume > 0.5) {
                    volumeIcon.classList.add('fa-volume-high')
                } else if(currentVolume == 0){
                    volumeIcon.classList.add('fa-volume-xmark')
                }else {
                    volumeIcon.classList.add('fa-volume-low')
                }
            }

            console.log(currentVolume)
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
        $('#footer-container').setAttribute('song-id', app.currentPlaylist[app.currentIndex].song_id)
        app.checkSongFavorite(app.currentPlaylist[app.currentIndex].song_id)
        songPlayingThumb.src = app.currentPlaylist[app.currentIndex].song_thumb
        songPlayingName.textContent = app.currentPlaylist[app.currentIndex].song_title
        songPlayingArtist.textContent = app.currentPlaylist[app.currentIndex].author_name
        audio.src = app.currentPlaylist[app.currentIndex].song_sound
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
        $('.recommend').classList.remove('active-playlist-playing')
        $('.recommend').classList.remove('active-profile')
        $('.recommend').classList.remove('active-favorite-playlist')
        elements.forEach(element => {
            const initialHTML = element.getAttribute('data-initial-html')
            if(initialHTML !== null){
                element.innerHTML = initialHTML
            }
        })
        $('input[type="text"]').value = ''
    },

    searchSong() {
        const searchInput = $('input[type="text"]')
        // console.log(searchInput)
        searchInput.addEventListener('keyup', () => {

            

            const searchText = searchInput.value.toLowerCase()
            //Kiem tra neu nguoi dung nhap dung dinh dang
            if(searchText.trim() !== ''){
                // console.log(searchText)
                fetch(`/data/search/${searchText}`)
                .then((response) => response.json())
                .then((data) => {
                    if(data.length > 0){

                        const topResultHtml = `
                            <div class="filter">
                                <span class="all filter-active">All</span>
                            </div>
    
                            <div class="result">
                                <div class="top-result">
                                    <h2>Top result</h2>
                                    <div class="top-result-detail" song-id = "${data[0].song_id}" song-genre="${data[0].song_genre}">
                                        <img src="${data[0].song_thumb}" alt="">
                                        <h1>${data[0].song_title}</h1>
                                        <p>Artist - ${data[0].author_name}</p>
                                    </div>
                                    
                                </div>
    
                                <div class="songs-result">
                                    <h2>Songs</h2>
                        `
                        let songResultHtml=''
                        const endResultHtml = `
                            </div>
                        </div>
                        `
                        data.map((song) => {
                            return songResultHtml += `
                                <div class="song-item" song-id = "${song.song_id}" song-genre="${song.song_genre}">
                                    <img class="song-item-thumb" src="${song.song_thumb}" alt="">
                                    <div class="song-item-detail">
                                        <h3 class="song-item-title">${song.song_title}</h3>
                                        <p class="song-item-artist">${song.author_name}</p>
                                    </div>
                                    <i class="fa-solid fa-ellipsis ellipsis"></i>
                                </div>
                            `
                        })
    
                        const finalHtml = topResultHtml.concat(songResultHtml.concat(endResultHtml))
                        $('.recommend').innerHTML =  finalHtml

                        // Xoa class active-playlist-playing neu tim kiem bai hat
                        if($('.recommend').classList.contains('active-playlist-playing') || $('.recommend').classList.contains('active-profile') || $('.recommend').classList.contains('active-favorite-playlist')) {
                            $('.recommend').classList.remove('active-playlist-playing')
                            $('.recommend').classList.remove('active-profile')
                            $('.recommend').classList.remove('active-favorite-playlist')
                        }
                        
                        this.addSongToPlaylist()
                        this.songClickEvent($$('.top-result-detail'))
                        this.songClickEvent($$('.song-item'))
                    } else {
                        $('.recommend').innerHTML = `<div class="text-not-found">No result for "${searchText}"</div>`
                    }
                })

            } else {
                this.resetToInitialState()
                this.songClickEvent($$('.songs'))
                this.interfaceHandler()
            }
        })
    },

    // Them bai hat vao playlist
    addSongToPlaylist() {
        $('.ellipsis-menu-container').style.display = 'none';

        //Khi click vao nut 3 cham ben ket qua nhac da tim kiem
        $$('.ellipsis').forEach((ellipsis) => {
            //Xu ly khi nguoi dung click chuot vao dau ba cham
            ellipsis.addEventListener('click', (e) => {

                e.stopPropagation() // Khi click vao phan tu con se khong kich hoat phan tu cha

                const parentElement = e.target.parentElement;
                getSongId = parentElement.getAttribute('song-id')
                
                $('.ellipsis-menu-container').classList.add('active-ellipsis-menu');
                $('.ellipsis-menu-container').style.left = `${e.clientX - 190}px`;
                $('.ellipsis-menu-container').style.top = `${e.clientY}px`;
                $('.ellipsis-menu-container').style.display = 'block';
            })

            
        })
        //Khi nguoi dung click ra ben ngoai
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ellipsis-menu') && !e.target.closest('.ellipsis') && !e.target.closest('.add-to-playlist-menu')) {
                $('.ellipsis-menu-container').style.display = 'none';
                $('.ellipsis-menu-container').classList.remove('active-ellipsis-menu');
            }
        })

        $('.add-to-playlist').addEventListener('mouseenter', async (e) => {
            try {
                const response = await fetch('/data/session')
                if(response.ok) {
                    const results = await response.json();
                    const playlists = results.playlists
     

                    //Tao mot list playlist khi di chuot vao add to playlist

                    const menuHTML = playlists.map((playlist) => {
                        return `<li class="playlist insert-to-playlist" playlist-id="${playlist.playlist_id}">${playlist.playlist_name}</li>`;

                    })
                    $('.playlist-exist').innerHTML = menuHTML.join('');

                    // Hien thi dau 3 cham khi ki tu qua dai
                    this.interfaceHandler()

                    //tinh toan vi tri phan tu 
                    const rect = $('.add-to-playlist').getBoundingClientRect()

                    $('.add-to-playlist-menu').style.display = ('block');
                    $('.add-to-playlist-menu').style.left = (`${rect.left - $('.add-to-playlist-menu').offsetWidth + 12}px`);
                    $('.add-to-playlist-menu').style.top = (`${rect.top}px`);



                    // Sự kiện để giữ menu mở khi di chuột vào menu hoặc phần tử kích hoạt
                    document.addEventListener('mousemove', (event) => {
                        if (!$('.add-to-playlist-menu').contains(event.target) && !$('.add-to-playlist').contains(event.target)) {
                            $('.add-to-playlist-menu').style.display = 'none';
                        }
                    });
                }
                
                // Them nhac vao playlist
                $$('.insert-to-playlist').forEach((playlist) => {
                    playlist.addEventListener('click', (e) => {
                        const playlistId = playlist.getAttribute('playlist-id');
                        fetch(`/data/song/${getSongId}/addToPlaylist/${playlistId}`, {
                            method: 'POST',
                        })
                        .then((response) => response.json())
                        .then(() => {
                            $('.add-to-playlist-menu').style.display = 'none';
                            
                            return fetch(`/data/playlist/getPlaylist/${playlistId}`)
                        })
                        .then((dataPlaylist) => dataPlaylist.json())
                        .then((data) => {
                            console.log(data);
                            // Cap nhat lai giao dien playlist
                            if(!data.playlist_thumb_custom && data.playlistSong.length > 0) {
                                const thumbPlaylist = data.playlistSong[0].song_thumb
                                console.log(thumbPlaylist)
                                $(`.your-playlists[playlist-id="${data.playlist_id}"] img`).src = thumbPlaylist
                                console.log($(`.your-playlists[playlist-id="${data.playlist_id}"]`).src)
                            }
                        })
                        .catch((error) => console.error('Error:', error));
                    })
                })

                
            }
            catch (error) {
                console.error('Error:', error);
            }
        })

    },

    // Them bai hat vao playlist yeu thich
    addSongFavorite() {
        $('.bi-plus-circle').onclick = async () => {
            try {
                const songId = $('#footer-container').getAttribute('song-id')
                await fetch(`/favorites/addToPlaylist/${songId}`, {
                    method: 'POST',
                })
                .then((response) => response.json())
                .then((data) => {
                    // In ra message thanh cong----------------------------------------------------------------------------
                    console.log(data.message)

                    // thay doi icon
                    $('.bi-plus-circle').style.display = 'none'
                    $('.bi-check-circle-fill').style.display = 'block'
                    this.displayFavoritePlaylist()
                    app.updateInterfacePlaylist()

                    // Cap nhat rating song
                    this.updateRateSong(songId)
                })
                .catch((error) => {
                    console.log('Error: ' + error)
                })
            } catch (err) {
                console.error('Error:', err);
            }
        }
    },

    // Xoa bai hat khoi playlist yeu thich
    removeSongFavorite() {
        $('.bi-check-circle-fill').onclick = async () => {
            try {
                const songId = $('#footer-container').getAttribute('song-id')
                await fetch(`/favorites/removeFromPlaylist/${songId}`, {
                    method: 'DELETE',
                })
                .then((response) => response.json())
                .then((data) => {
                    // In ra message thanh cong----------------------------------------------------------------------------
                    console.log(data.message)

                    // thay doi icon
                    $('.bi-plus-circle').style.display = 'block'
                    $('.bi-check-circle-fill').style.display = 'none'
                    this.displayFavoritePlaylist()
                    app.updateInterfacePlaylist()

                    // Cap nhat rating song
                    this.updateRateSong(songId)
                })
            }
            catch (error) {
                console.error('Error: ', error)
            }
        }
    },

    // Ham kiem tra xem bai hat dang duoc choi co phai la bai hat yeu thich khong
    async checkSongFavorite(songId) {
        try {
            await fetch(`/favorites/check/${songId}`)
            .then((response) => response.json())
            .then((response) => {
                console.log(response)
                if(response.message === 'favorite'){
                    // thay doi icon
                    $('.bi-plus-circle').style.display = 'none'
                    $('.bi-check-circle-fill').style.display = 'block'
                } else {
                    // thay doi icon
                    $('.bi-plus-circle').style.display = 'block'
                    $('.bi-check-circle-fill').style.display = 'none'
                }
            })
        } catch (error) {
            console.error('Cannot check song favorite:', error);
        }
    },

    // Ham hien thi playlist yeu thich neu co
    async displayFavoritePlaylist() {
        await fetch('/data/session')
        .then((response) => response.json())
        .then(async (data) => {
            const response = await fetch(`/favorites/${data.user.user_id}`)
            const favoriteSong = await response.json()
            console.log(favoriteSong)
            if(data.favorites.length > 0) {
                $('.favorite-playlist .playlist-thumb').src = favoriteSong.playlistSong[0].song_thumb
                $('.favorite-playlist .playlist-about').innerHTML = `Favorite - ${data.user.user_fullname}`
                $('.favorite-playlist').style.display = 'block'
            } else {
                $('.favorite-playlist').style.display = 'none'
            }
            
            
        })
        
    },

    // Ham hien thi chi tiet playlist yeu thich
    async displayPlaylist() {
        await fetch(`/data/session`)
            .then((response) => response.json())
            .then((data) => { return data.user.user_id })
            .then(async (userId) => { 
                const response = await fetch(`/favorites/${userId}`) 
                return response.json()
                
            })
            .then((data) => {
                if(data.playlistSong.length > 0) {
                    const playlistSong = data.playlistSong

                    const htmls = `
                <div id="playlist-playing">
                    <div id="playlist-playing-info">
                        <img id="thumb_song"  class="playlist-thumb-recommend" src="${playlistSong[0].song_thumb}" alt="">
                        <div class="playlist-playing-text">
                            <h1>My Favorite</h1>
                            <p>${app.userInformation.user.user_fullname} - ${playlistSong.length} songs</p>
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
                    $('.recommend').classList.add('active-favorite-playlist')
                    $('.recommend').classList.remove('active-playlist-playing')
                    $('.recommend').classList.remove('active-profile')

                    //hien thi bai hat
                    const playlistSongHTML = playlistSong.map((song, index) => {
                        return `
                            <tr class="songs-playlist" song-id=${song.song_id}>
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

                    // Lay mau chu dao
                    app.getColorThumb($('#thumb_song'))

                    //Khi click vao bai hat trong favorite playlist
                    const songs = $$('.songs-playlist')
                    
                    songs.forEach((song, index) => {
                        song.addEventListener('click', function() {
                            app.currentPlaylist=[]

                            data.playlistSong.forEach((item) => {
                                app.currentPlaylist.push(item)
                            })
                            //hien thi dashboard va chinh lai chieu cao trang web
                            footer.style.display = 'block';
                            app.songActive = true;
                            app.changeHeightContent();

                            //load bai hat
                            app.currentIndex = index
                            console.log(app.currentIndex)
                            app.loadCurrentSong()
                            app.isPlaying = true
                            iconPause.style.display = 'block'
                            iconPlay.style.display = 'none'
                            audio.play()
                            
                        })
                    })    
                } else {
                    $('.recommend').classList.remove('active-favorite-playlist')
                    app.resetToInitialState()
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    },

    // Ham cap nhat interface playlist
    async updateInterfacePlaylist() {
        if($('.recommend').classList.contains('active-favorite-playlist')) {
            app.displayPlaylist()
        }
    },

    // Ham xu ly khi nguoi dung click vao playlist yeu thich
    favoriteClickHandler() {
        $('.favorite-playlist').addEventListener('click', async () => {
            app.displayPlaylist()
        })
    },

    // Ham cap nhat rate song
    async updateRateSong(songId) {
        try {
            const response = await fetch(`/favorites/updateRating/${songId}`, {
                method: 'PUT'
            })

            if(!response.ok) {
                throw new Error('Failed to update rating')
            }
        } catch (error) {
            console.error('Error updating rating:', error)
        }
    },

    start() {
        this.getUserInformation()

        // Fetch main page
        this.fetchAuthors(),
        this.fetchSongs(),
        this.fetchcurrentPlaylist()

        //Home button
        this.homeBtnClick()

        this.interfaceHandler()
        this.eventHandler()

        // Play music
        this.playMusic()

        // Favorites
        this.addSongFavorite()
        this.removeSongFavorite()
        this.displayFavoritePlaylist()
        this.favoriteClickHandler()
        
        // Search
        this.searchSong()

    }
}

app.start()
