const signupBtn = $('.nav-signup')
const signinBtn = $('.nav-signin')

signupBtn.onclick = function() {
    console.log('success')
    window.location.href = './account/signup'
}

signinBtn.onclick = function() {
    console.log('success')
    window.location.href = './account/signin'
}

