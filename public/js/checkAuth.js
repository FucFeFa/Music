function checkAuth() {
    fetch('/account/check-auth')
    .then((response) => response.json())
    .then((response) => {
        if(response.message === 'Success') {
            return true
        } else {
            window.location.href = '/account/signin'
            return false
        }
    })
}

checkAuth()