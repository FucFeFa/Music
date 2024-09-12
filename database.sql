use music;

create table songs (
	song_id int auto_increment primary key,
    song_title varchar(255) not null,
    song_thumb longblob not null,
    song_sound longblob not null,
    song_rate float,
    author_id int,
    foreign key(author_id) references authors(author_id)
);
select * from songs;
alter table songs 
change column song_sound song_sound varchar(255) not null;

create table authors (
	author_id int auto_increment primary key,
    author_name varchar(255) not null,
    author_avatar longblob not null,
    author_rate float
);
select * from authors;
alter table authors
change column author_avatar author_avatar varchar(255) not null;

create table users(
	user_id int auto_increment primary key,
    user_fullname varchar(255) not null,
    user_username varchar(255) not null,
    user_password varchar(255) not null,
    user_email varchar(255),
    user_phone varchar(10),
    user_sex boolean,
    user_date_signup datetime,
    user_avatar longblob,
    user_theme varchar(255) not null
);
select * from users;
alter table users
change column user_avatar user_avatar varchar(255) default './asset/img/default.jpg';

create table favorites(
	favorite_id int auto_increment primary key,
    user_id int,
    song_id int,
    foreign key (user_id) references users(user_id),
    foreign key (song_id) references songs(song_id)
);
select * from favorites;

create table playlists (
	playlist_id int auto_increment primary key,
    playlist_name varchar(255) not null,
    user_id int,
    foreign key (user_id) references users(user_id)
);
select * from playlists;
alter table playlists
add column playlist_rate float;

create table playlist_songs (
	playlist_song_id int auto_increment primary key,
    playlist_id int,
    song_id int,
    foreign key (playlist_id) references playlists(playlist_id),
    foreign key (song_id) references songs(song_id)
);
select * from playlist_songs;

/*Insert user*/
insert into users (
    user_fullname,
    user_username,
    user_password,
    user_email,
    user_phone,
    user_sex,
    user_date_signup,
    user_theme) 
values (
    'Pham Hoang Phuc',
    'phuc',
    '123',
    'phuc@gmail.com',
    '0918451822',
    true,
    '2024-09-12 21:05:34',
    'Dark'
    );

/*Insert author*/
insert into authors(author_name, author_avatar) values ('Rin1', './asset/img/artworks-1ucaBWENwzSv6CyR-kPBfTg-t500x500.jpg');

/*Insert songs*/
insert into songs (song_title , song_thumb, song_sound, song_rate, author_id)
values ('Hit me up', './asset/img/artworks-1ucaBWENwzSv6CyR-kPBfTg-t500x500.jpg', './asset/music/utomp3.com - Muse DashHIT ME UPOfficial MV.mp3', '', 1);
insert into songs (song_title , song_thumb, song_sound, song_rate, author_id)
values ('Sunny', './asset/img/1200x1200bf-60 (1).jpg', './asset/music/y2mate.com - Sunny.mp3', '', 2);

/*Insert playlist*/
insert into playlists (playlist_name, playlist_rate, user_id) values ('KIRA', 0, 1);
insert into playlists (playlist_name, playlist_rate, user_id) values ('123', 0, 1);

/*Insert playlist_songs*/
insert into playlist_songs (playlist_id, song_id) values (2, 1);
insert into playlist_songs (playlist_id, song_id) values (2, 2);