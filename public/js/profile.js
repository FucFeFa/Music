const profile = $('#profile')
const avatarProfile = $('#avatar')

// Ham doi mat khau
const changePassword = async () => {
    // Khi submit form doi mat khau
    $('#change-password-form .save-btn').addEventListener('click', async (e) => {
        e.preventDefault()
        const formData = new FormData($('#change-password-form'))
        const data = Object.fromEntries(formData.entries())
        const userId = app.userInformation.user.user_id
        try {
            const response = await fetch(`/profile/changePassword/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                const responseData = await response.text()
                const text = JSON.parse(responseData)
                $('#change-password-form .error-message').style.display = 'none';
                $('#change-password-form .ok-message').style.display = 'block';
                $('#change-password-form .ok-message').innerHTML = text.message;

                // reset lai form
                $('#change-password-form').reset();
            } else {
                const responseData = await response.text()
                const text = JSON.parse(responseData)
                $('#change-password-form .error-message').style.display = 'block';
                $('#change-password-form .error-message').innerHTML = text.message;
            }

        } catch (error) {
            console.log(error)
        }
    })

    // Khi cancel form doi mat khau
    $('#change-password-form .cancel-btn').addEventListener('click', (e) => {
        e.preventDefault();
        $('#change-password-form').reset();
    })
}

// Ham chinh sua thong tin ca nhan
const updateInformation = () => {
    // Khi submit form thay doi thong tin ca nhan
    $('#information .save-btn').addEventListener('click', async (e) => {
        e.preventDefault()
        const formData = new FormData($('#information'))
        const data = Object.fromEntries(formData.entries())
        const userId = app.userInformation.user.user_id
        try {
            const response = await fetch(`/profile/updateInformation/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                const responseData = await response.text()
                const text = JSON.parse(responseData)
                $('#information .error-message').style.display = 'none';
                $('#information .ok-message').style.display = 'block';
                $('#information .ok-message').innerHTML = text.message;

                // Gan lai gia tri mac dinh cho cac o input
                $('input[name="fullname"]').value = $('input[name="fullname"]').value
                $('input[name="email"]').value = $('input[name="email"]').value
                $('input[name="phone"]').value = $('input[name="phone"]').value

                // Cap nhat lai giao dien
                app.getUserInformation()
                app.displayFavoritePlaylist()
                $('.username').innerHTML = $('input[name="fullname"]').value
                $$('.your-playlists').forEach((playlist) => {
                    console.log(playlist)
                    playlist.querySelector('.playlist-about').innerHTML = `Playlist - ${$('input[name="fullname"]').value}`
                })
            } else {
                const responseData = await response.text()
                const text = JSON.parse(responseData)
                $('#information .error-message').style.display = 'block';
                $('#information .error-message').innerHTML = text.message;
            }
        } catch (error) {
            console.log(error)
        }
    })

    // Khi cancel form thay doi thong tin ca nhan
    $('#information .cancel-btn').addEventListener('click', (e) => {
        e.preventDefault();
        $('#information').reset();
    });

}

// Ham thay doi avatar
const changeAvatar = () => {  
    $('#profile-image').addEventListener('click', () => {
        $('#file-upload').click()
    })

    $('#profile-image').addEventListener('change', async (e) => {
        try {
            const file = e.target.files[0]
            const oldAvatarPath = $('#avatar').src
            const oldAvatar = oldAvatarPath.split('/').pop();

            if(file) {
                const userId = app.userInformation.user.user_id
                const formData = new FormData($('#upload-avatar-form'))
                const response = await fetch(`/profile/${userId}/uploadAvatar/${oldAvatar}`, {
                    method: 'PUT',
                    body: formData
                })

                if (response.ok) {
                    return response.json()
                    .then((data) => {
                        // Cap nhat giao dien
                        $('#avatar').src = data.avatar
                        $('#user-avt').src = data.avatar
                    })
                }
            }

            
        } catch (error) {
            console.error(error)
        }
    })
}

// Ham hien thi profile
const displayProfile = async () => {
    await fetch(`/data/session`)
        .then((response) => response.json())
        .then((data) => { return data.user })
        .then((user) => {
            const htmls = `
            <div id="profile-container">
                    <div id="profile-detail">
                        <div id="profile-image">
                            <img id="avatar"src="${user.user_avatar}" alt="">
                            <div class="choose-avatar">
                                <i class="bi bi-pencil"></i>
                                <br>
                                <span>Choose photo</span>
                            </div>
                            <form action="" id="upload-avatar-form">
                                <input id="file-upload" name="change_avatar" type="file" accept="image/*">
                            </form>
                        </div>
                        <div class="profile-overview">
                            <span>Profile</span>
                            <h1 class="username">${user.user_fullname}</h1>
                        </div>
                    </div>
                </div>
    
                <div id="edit-profile">
                    <div class="personal-information">
                        <div class="personal-information-title">
                            <h1>Personal Information</h1>
                        </div>
    
                        <div class="personal-information-body">
                            <form action="" id="information">
                                <div class="field-input">
                                    <span>Display Name</span>
                                    <input type="text" name="fullname" minlength="2" maxlength="16" value="${user.user_fullname}" required>
                                </div>
    
                                <div class="field-input">
                                    <span>User ID</span>
                                    <input type="text" name="user_id" value="${user.user_id}" readonly>
                                </div>
    
                                <div class="field-input">
                                    <span>Email</span>
                                    <input type="email" name="email" autocomplete="off" value="${user.user_email}" required>
                                </div>
    
                                <div class="field-input">
                                    <span>Phone Number</span>
                                    <input type="text" name="phone" autocomplete="off" value="${user.user_phone}" pattern="^\\d{10}$" required>
                                </div>

                                <div class="field-input">
                                    <span>Date Signup</span>
                                    <input type="text" autocomplete="off" value="${user.user_date_signup}" readonly>
                                </div>

                                <span class="ok-message"></span>
                                <span class="error-message"></span>
    
                                <span class="profile-btn">
                                    <button class="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" class="save-btn">
                                        Save
                                    </button>
                                </span>
                            </form>
                        </div>
                    </div>

                    <hr>

                    <div class="change-password">
                        <div class="change-password-title">
                            <h1>Change Password</h1>
                        </div>
    
                        <div class="change-password-body">
                            <form action="" id="change-password-form">
                                <div class="field-input">
                                    <span>Current Password</span>
                                    <input type="password" name="current_password" minlength="1" maxlength="20" required>
                                </div>
    
                                <div class="field-input">
                                    <span>New Password</span>
                                    <input type="password" name="new_password" minlength="1" maxlength="20" required>
                                </div>
    
                                <div class="field-input">
                                    <span>Confirm Password</span>
                                    <input type="password" name="confirm_password" minlength="1" maxlength="20" required>
                                </div>

                                <span class="ok-message"></span>
                                <span class="error-message"></span>
    
                                <span class="profile-btn">
                                    <button class="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" class="save-btn">
                                        Save
                                    </button>
                                </span>
                            </form>
                        </div>
                    </div>
                </div>

                
            `

            // HIen thi profile
            $('.recommend').innerHTML = htmls

            app.getColorThumb($('#avatar'))
        })

    
    updateInformation()
    changePassword()
    changeAvatar()
}

// Khi click vao profile
profile.addEventListener('click', async () => {
    if(!$('.recommend').classList.contains('active-profile')){
        $('.recommend').classList.remove('active-favorite-playlist')
        $('.recommend').classList.remove('active-playlist-playing')
        $('.recommend').classList.add('active-profile')
    } 
    
    // Hien thi profile
    displayProfile()

    
})

