const $ = document.querySelector.bind(document)

const resetPasswordForm = $('#reset-password-form')
const alert = $('#alert')

resetPasswordForm.addEventListener('submit', async function(e){
    e.preventDefault()

    const formData = new FormData(resetPasswordForm)
    const data = Object.fromEntries(formData.entries())

    try {
        const response = await fetch('/account/resetPassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (response.ok) {
            window.location.href = '/account/signin'
        } else {
            const errorText = await response.text()
            alert.innerHTML = JSON.parse(errorText).message
        }
    }
    catch (error) {
        console.error('Error signing in:', error)
    }
})
