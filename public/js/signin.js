const $ = document.querySelector.bind(document)

const signinForm = $('#signin-form')
const alert = $('#alert')

signinForm.addEventListener('submit', async function(e){
    e.preventDefault()

    const formData = new FormData(signinForm)
    const data = Object.fromEntries(formData.entries())

    try {
        const response = await fetch('/account/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (response.ok) {
            const responseData = await response.text()
            message = JSON.parse(responseData)
            if(message.message === 'Page for admin'){
                window.location.href = '/admin'
            } else {
                window.location.href = '/'
            }
        } else {
            const errorText = await response.text()
            alert.innerHTML = JSON.parse(errorText).message
        }
    }
    catch (error) {
        console.error('Error signing in:', error)
    }
})
