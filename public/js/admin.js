const artists = $$('#artists option')

const artist = $('#artist')
const addSongForm = $('#addSongForm')
const dataListOption = []


artists.forEach(option => {
    dataListOption.push(option.value)
})

// Submit form
addSongForm.addEventListener('submit', (e) => {
    const selectedArtist = artist.value
    if(!dataListOption.includes(selectedArtist)) {
        alert('Artist is not valid!')
        e.preventDefault()
    }
})