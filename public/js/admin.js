// const artists = $$('#artists option')

const artist = $('#artist')
const addSongForm = $('#addSongForm')
const thumb = $('#thumb')
const audio = $('#audio')
const dataListOption = []


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

    // Gui form
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