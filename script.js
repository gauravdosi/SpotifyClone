// JavaScript for Spotify Clone Interactivity (e.g., player controls, navigation)
// Will be added later if needed.
console.log("Spotify clone script loaded.");

// Audio player functionality for Spotify Clone
document.addEventListener('DOMContentLoaded', function() {
    // Create audio player instance
    const audioPlayer = new Audio();
    audioPlayer.src = 'music/Future-technology.mp3'; // Path to the song
    
    // Get player elements
    const playButton = document.querySelector('.play-button');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeElement = document.querySelector('.progress-bar-container span:first-child');
    const durationElement = document.querySelector('.progress-bar-container span:last-child');
    
    // Flag to track playing state
    let isPlaying = false;
    
    // Update song info in the player bar (optional, song should already be displayed in HTML)
    const songTitleElement = document.querySelector('.song-title');
    const songArtistElement = document.querySelector('.song-artist');
    if (songTitleElement) songTitleElement.textContent = 'Future-technology';
    if (songArtistElement) songArtistElement.textContent = 'Demo Artist';
    
    // Function to toggle play/pause
    function togglePlay() {
        if (isPlaying) {
            audioPlayer.pause();
            playButton.classList.remove('fa-pause-circle');
            playButton.classList.add('fa-play-circle');
        } else {
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                // If error, handle gracefully (e.g., file not found)
                alert('Could not play the audio file. Please make sure "music/Future-technology.mp3" exists.');
            });
            playButton.classList.remove('fa-play-circle');
            playButton.classList.add('fa-pause-circle');
        }
        isPlaying = !isPlaying;
    }
    
    // Add click event to play button
    playButton.addEventListener('click', togglePlay);
    
    // Update progress bar and time displays
    audioPlayer.addEventListener('timeupdate', function() {
        // Update current time display
        const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
        const currentSeconds = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
        currentTimeElement.textContent = `${currentMinutes}:${currentSeconds}`;
        
        // Update progress bar width
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${progressPercent}%, var(--essential-subdued) ${progressPercent}%, var(--essential-subdued) 100%)`;
        }
    });
    
    // When duration is available, update duration display
    audioPlayer.addEventListener('loadedmetadata', function() {
        const durationMinutes = Math.floor(audioPlayer.duration / 60);
        const durationSeconds = Math.floor(audioPlayer.duration % 60).toString().padStart(2, '0');
        durationElement.textContent = `${durationMinutes}:${durationSeconds}`;
    });
    
    // When song ends, reset play button
    audioPlayer.addEventListener('ended', function() {
        playButton.classList.remove('fa-pause-circle');
        playButton.classList.add('fa-play-circle');
        isPlaying = false;
    });
    
    // Make progress bar clickable to seek
    progressBar.addEventListener('click', function(e) {
        const progressBarWidth = this.clientWidth;
        const clickPosition = e.offsetX;
        const seekTime = (clickPosition / progressBarWidth) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
    
    // Add volume control functionality
    const volumeBar = document.querySelector('.volume-bar');
    const volumeIcon = document.querySelector('.player-right .fa-volume-up');
    
    // Set initial volume to 70%
    audioPlayer.volume = 0.7;
    
    if (volumeBar) {
        // Style volume bar to reflect initial volume
        volumeBar.style.background = `linear-gradient(to right, var(--text-base) 0%, var(--text-base) 70%, var(--essential-subdued) 70%, var(--essential-subdued) 100%)`;
        
        // Make volume bar clickable
        volumeBar.addEventListener('click', function(e) {
            const volumeBarWidth = this.clientWidth;
            const clickPosition = e.offsetX;
            const newVolume = clickPosition / volumeBarWidth;
            
            // Set new volume
            audioPlayer.volume = newVolume;
            
            // Update volume bar visual
            this.style.background = `linear-gradient(to right, var(--text-base) 0%, var(--text-base) ${newVolume * 100}%, var(--essential-subdued) ${newVolume * 100}%, var(--essential-subdued) 100%)`;
            
            // Update volume icon based on level
            updateVolumeIcon(newVolume);
        });
    }
    
    if (volumeIcon) {
        // Toggle mute when clicking volume icon
        volumeIcon.addEventListener('click', function() {
            if (audioPlayer.volume > 0) {
                // Store current volume before muting
                volumeIcon.dataset.previousVolume = audioPlayer.volume;
                audioPlayer.volume = 0;
                updateVolumeIcon(0);
                if (volumeBar) {
                    volumeBar.style.background = `linear-gradient(to right, var(--text-base) 0%, var(--text-base) 0%, var(--essential-subdued) 0%, var(--essential-subdued) 100%)`;
                }
            } else {
                // Restore previous volume
                const previousVolume = parseFloat(volumeIcon.dataset.previousVolume || 0.7);
                audioPlayer.volume = previousVolume;
                updateVolumeIcon(previousVolume);
                if (volumeBar) {
                    volumeBar.style.background = `linear-gradient(to right, var(--text-base) 0%, var(--text-base) ${previousVolume * 100}%, var(--essential-subdued) ${previousVolume * 100}%, var(--essential-subdued) 100%)`;
                }
            }
        });
    }
    
    // Helper function to update volume icon based on level
    function updateVolumeIcon(volume) {
        if (!volumeIcon) return;
        
        // Remove all possible volume classes
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-off', 'fa-volume-mute');
        
        if (volume === 0) {
            volumeIcon.classList.add('fa-volume-mute');
        } else if (volume < 0.3) {
            volumeIcon.classList.add('fa-volume-off');
        } else if (volume < 0.7) {
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.add('fa-volume-up');
        }
    }
    // ===== Playlist Handling =====
    const playlistContainer = document.querySelector('.playlists');
    const createPlaylistLink = document.querySelector('.playlist-nav a');
    const songs = document.querySelectorAll('.song-item, .song-row');

    function attachPlaylistEvents(pl) {
        pl.addEventListener('dragover', e => e.preventDefault());
        pl.addEventListener('drop', function(e) {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if(!data) return;
            const songData = JSON.parse(data);
            const name = pl.textContent.trim();
            const key = 'playlist_' + name;
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            list.push(songData);
            localStorage.setItem(key, JSON.stringify(list));
            alert(`Added ${songData.title} to ${name}`);
        });

        pl.addEventListener('click', function() {
            const name = pl.textContent.trim();
            window.location.href = `playlist.html?name=${encodeURIComponent(name)}`;
        });
    }

    function addPlaylistElement(name) {
        const p = document.createElement('p');
        p.textContent = name;
        playlistContainer.appendChild(p);
        attachPlaylistEvents(p);
    }

    if (playlistContainer) {
        let storedPlaylists = JSON.parse(localStorage.getItem('playlists') || 'null');
        if (!storedPlaylists) {
            storedPlaylists = Array.from(playlistContainer.querySelectorAll('p')).map(el => el.textContent.trim());
            localStorage.setItem('playlists', JSON.stringify(storedPlaylists));
        } else {
            playlistContainer.innerHTML = '';
            storedPlaylists.forEach(name => addPlaylistElement(name));
        }

        if (createPlaylistLink) {
            createPlaylistLink.addEventListener('click', function(e) {
                e.preventDefault();
                let name = prompt('Enter playlist name:');
                if (name === null) return;
                name = name.trim();
                if (!name) return;
                const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
                if (playlists.some(n => n.toLowerCase() === name.toLowerCase())) {
                    alert('Playlist name already exists. Please choose a different name.');
                    return;
                }
                playlists.push(name);
                localStorage.setItem('playlists', JSON.stringify(playlists));
                addPlaylistElement(name);
            });
        }
    }

    // ===== Playlist Drag & Drop Functionality for songs =====

    songs.forEach(song => {
        song.setAttribute('draggable', 'true');
        song.addEventListener('dragstart', function(e) {
            const title = song.querySelector('.item-title')?.textContent || song.querySelector('.song-name')?.textContent || '';
            const artist = song.querySelector('.item-subtitle')?.textContent || song.querySelector('.song-artist')?.textContent || '';
            const img = song.querySelector('img')?.src || '';
            e.dataTransfer.setData('text/plain', JSON.stringify({title, artist, img}));
        });
    });

    // ===== Playlist Page Rendering =====
    const playlistSongs = document.getElementById("playlist-songs");
    if (playlistSongs) {
        const params = new URLSearchParams(window.location.search);
        const playlistName = params.get("name") || "Playlist";
        const heading = document.getElementById("playlist-name");
        if (heading) heading.textContent = playlistName;

        const key = "playlist_" + playlistName;
        const list = JSON.parse(localStorage.getItem(key) || "[]");

        if (list.length === 0) {
            playlistSongs.innerHTML = "<p>No songs in this playlist.</p>";
        } else {
            list.forEach(s => {
                const row = document.createElement("div");
                row.className = "song-row";

                const img = document.createElement("img");
                img.className = "song-row-img";
                img.src = s.img || "https://picsum.photos/seed/song/50";
                img.alt = "Song Art";

                const info = document.createElement("div");
                info.className = "song-info";
                const nameEl = document.createElement("p");
                nameEl.className = "song-name";
                nameEl.textContent = s.title || "";
                const artistEl = document.createElement("p");
                artistEl.className = "song-artist";
                artistEl.textContent = s.artist || "";
                info.appendChild(nameEl);
                info.appendChild(artistEl);

                const durationEl = document.createElement("div");
                durationEl.className = "song-duration";
                durationEl.textContent = s.duration || "";

                row.appendChild(img);
                row.appendChild(info);
                row.appendChild(durationEl);

                playlistSongs.appendChild(row);
            });
        }
    }

});
