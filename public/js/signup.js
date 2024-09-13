const $ = document.querySelector.bind(document)

const signupForm = $('#signup-form')
const alert = $('#alert')
const dateInput = $('#date')

const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');

const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;



signupForm.addEventListener('submit', async function(e){
    e.preventDefault()

    //Update value of input date
    dateInput.value = currentDateTime

    //Get data from form
    const formData = new FormData(signupForm)
    const data = Object.fromEntries(formData.entries())

    try {
        //send request post to server
        const response = await fetch('/account/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if(response.ok) {
            window.location.href = '/account/signin'
        } else {
            dateInput.value = ''
            const errorText = await response.text(); // Đọc phản hồi lỗi từ server
            alert.innerHTML = JSON.parse(errorText).message
        }
    }
    catch(error) {
        dateInput.value = ''
        console.error('Error:', error)
    }
})