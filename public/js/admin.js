// const artists = $$('#artists option')

const artist = $('#artist')
const addSongForm = $('#addSongForm')
const addArtistForm = $('#addArtistForm')
const thumb = $('#thumb')
const audio = $('#audio')

const logout = $('#logout')
const dataListOption = []

// Log out
logout.addEventListener('click', () =>{
    fetch('account/logout',{
        method: 'POST'
    })
    .then(response => response.json())
    .then(response => {
        if(response.message === 'Success') {
            window.location.href = '/account/signin'
        } else {
            console.error('Error logout:', response.message)
        }
    })
    .catch(err => console.log(err))
})


// Lay du lieu tat ca artist
fetch('/data/artist')
   .then(response => response.json())
   .then(data => {
       console.log(data)
       const htmlArtist = data.map(artist => `<option value="${artist.author_id}">${artist.author_name}</option>`)
       $('#artists').innerHTML = htmlArtist.join('')

       $$('#artists option').forEach(option => {
            dataListOption.push(option.value)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });


// Submit form
addSongForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const selectedArtist = artist.value
    
    // Neu nhu khong co Artist ton tai
    if(!dataListOption.includes(selectedArtist)) {
        alert('Artist is not valid!')
        e.preventDefault()
    }

    // Tao mot doi tuong form
    const formData = new FormData(addSongForm)
    
    // Gui yeu cau toi server
    try {
        const response = await fetch('/data/addSong', {
            method: 'POST',
            body: formData
        })

        if(response.ok) {
            alert('Song added successfully!')
            addSongForm.reset()
        } else {
            const errorText = await response.text()
            alert(JSON.parse(errorText).message)
            e.preventDefault()
        }
    }
    catch (err) {
        console.error('Error adding song:', err)
        alert(err)
        e.preventDefault()
    }
})

// Them artist 
addArtistForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Gui form
    const formData = new FormData(addArtistForm)
    
    // Gui yeu cau toi server
    try {
        const response = await fetch('/data/addArtist', {
            method: 'POST',
            body: formData
        })

        if(response.ok) {
            alert('Artist added successfully!')
            addArtistForm.reset()
        } else {
            const errorText = await response.text()
            alert(JSON.parse(errorText).message)
            e.preventDefault()
        }
    }
    catch (err) {
        console.error('Error adding artist:', err)
        alert(err)
        e.preventDefault()
    }
})