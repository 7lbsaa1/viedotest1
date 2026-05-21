let player;
let isMuted = false;
let controlsTimeout;
let lastTap = 0; 

// تهيئة مشغل YouTube بالـ ID الصحيح لأغنية التخرج
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: 'BrDHsQyhQQE', // تم تعديل المعرف للـ ID الصحيح للأغنية
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'iv_load_policy': 3,
            'disablekb': 1,
            'fs': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

const mainContainer = document.getElementById('main-player-container');
const customPoster = document.getElementById('custom-poster');
const vidMask = document.getElementById('vid-mask');
const controlsPanel = document.getElementById('controls-panel');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const progressTimeline = document.getElementById('progress-timeline');
const progressCurrent = document.getElementById('progress-current');
const fullscreenBtn = document.getElementById('fullscreen-btn');

const volumeZone = document.getElementById('vol-zone');
const volumeTimeline = document.getElementById('volume-timeline');
const volumeCurrent = document.getElementById('volume-current');
const controlsLeft = document.querySelector('.controls-left');

// إنشاء قائمة السرعة ديناميكياً
const speedBtn = document.createElement('button');
speedBtn.className = 'control-btn';
speedBtn.innerHTML = '<i class="fas fa-gauge-high"></i>';
speedBtn.title = "سرعة التشغيل";
speedBtn.style.position = 'relative';

const speedMenu = document.createElement('div');
speedMenu.className = 'dropdown-menu-panel';

[0.5, 0.75, 1, 1.25, 1.5, 2].forEach(speed => {
    const opt = document.createElement('button');
    opt.innerText = speed === 1 ? 'عادي' : speed + 'x';
    opt.onclick = (e) => {
        e.stopPropagation();
        player.setPlaybackRate(speed);
        speedMenu.style.display = 'none';
    };
    speedMenu.appendChild(opt);
});
speedBtn.appendChild(speedMenu);
speedBtn.onclick = (e) => {
    e.stopPropagation();
    qualityMenu.style.display = 'none'; 
    speedMenu.style.display = speedMenu.style.display === 'flex' ? 'none' : 'flex';
};
controlsLeft.insertBefore(speedBtn, fullscreenBtn);

// إنشاء قائمة الجودة ديناميكياً
const qualityBtn = document.createElement('button');
qualityBtn.className = 'control-btn';
qualityBtn.innerHTML = '<i class="fas fa-sliders"></i>';
qualityBtn.title = "الجودة";
qualityBtn.style.position = 'relative';

const qualityMenu = document.createElement('div');
qualityMenu.className = 'dropdown-menu-panel';
qualityBtn.appendChild(qualityMenu);

qualityBtn.onclick = (e) => {
    e.stopPropagation();
    speedMenu.style.display = 'none'; 
    if(qualityMenu.style.display === 'flex') {
        qualityMenu.style.display = 'none';
    } else {
        buildQualityMenu();
        qualityMenu.style.display = 'flex';
    }
};
controlsLeft.insertBefore(qualityBtn, fullscreenBtn);

function buildQualityMenu() {
    qualityMenu.innerHTML = '';
    const levels = player.getAvailableQualityLevels();
    if(levels && levels.length > 0) {
        levels.forEach(level => {
            const opt = document.createElement('button');
            let label = level;
            if(level === 'hd1080') label = '1080p HD';
            if(level === 'hd720') label = '720p HD';
            if(level === 'large') label = '480p';
            if(level === 'medium') label = '360p';
            if(level === 'small') label = '240p';
            if(level === 'tiny') label = '144p';
            if(level === 'default') label = 'تلقائي';

            opt.innerText = label;
            opt.onclick = (e) => {
                e.stopPropagation();
                player.setPlaybackQuality(level);
                qualityMenu.style.display = 'none';
            };
            qualityMenu.appendChild(opt);
        });
    } else {
        qualityMenu.innerHTML = '<button style="color:#aaa; cursor:default;">تلقائي فقط</button>';
    }
}

document.addEventListener('click', () => {
    speedMenu.style.display = 'none';
    qualityMenu.style.display = 'none';
});

function onPlayerReady() {
    setInterval(updateProgress, 200);
}

document.getElementById('img-start-trigger').addEventListener('click', () => {
    customPoster.classList.add('video-started');
    player.playVideo();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

playPauseBtn.addEventListener('click', togglePlay);
vidMask.addEventListener('click', togglePlay);

function togglePlay() {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        customPoster.classList.add('video-started');
        player.playVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else if (event.data === YT.PlayerState.PAUSED) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function updateProgress() {
    if (player && player.getDuration) {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            progressCurrent.style.width = percentage + '%';
        }
    }
}

progressTimeline.addEventListener('click', (e) => {
    const rect = progressTimeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const duration = player.getDuration();
    if (duration > 0) {
        player.seekTo(duration * percentage, true);
    }
});

muteBtn.addEventListener('click', () => {
    if (isMuted) {
        player.unMute();
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        volumeCurrent.style.width = (player.getVolume() || 100) + '%';
    } else {
        player.mute();
        muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
        volumeCurrent.style.width = '0%';
    }
    isMuted = !isMuted;
});

function setVolumeFromEvent(e) {
    const rect = volumeTimeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    let percentage = clickX / width;
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;
    
    const volValue = Math.round(percentage * 100);
    player.setVolume(volValue);
    volumeCurrent.style.width = volValue + '%';
    
    if (volValue === 0) {
        muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
        isMuted = true;
    } else {
        player.unMute();
        muteBtn.innerHTML = volValue > 50 ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-low"></i>';
        isMuted = false;
    }
}

volumeTimeline.addEventListener('click', setVolumeFromEvent);

let isDraggingVolume = false;
volumeTimeline.addEventListener('mousedown', () => isDraggingVolume = true);
document.addEventListener('mouseup', () => isDraggingVolume = false);
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) setVolumeFromEvent(e);
});

volumeZone.addEventListener('touchstart', () => volumeZone.classList.add('active'));
document.addEventListener('touchend', () => volumeZone.classList.remove('active'));

vidMask.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
        toggleFullscreen();
        e.preventDefault();
    }
    lastTap = currentTime;
});

fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        mainContainer.requestFullscreen().catch(err => {
            alert(`خطأ في ملء الشاشة: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function showControls() {
    mainContainer.classList.remove('hide-controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            mainContainer.classList.add('hide-controls');
            speedMenu.style.display = 'none';
            qualityMenu.style.display = 'none';
        }
    }, 3000); 
}

mainContainer.addEventListener('mousemove', showControls);
mainContainer.addEventListener('touchstart', showControls);

const modeSwitcherBtn = document.getElementById('mode-switcher-btn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

modeSwitcherBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark-mode')) {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.add('light-mode');
        themeIcon.innerText = '🌙';
        themeText.innerText = 'الوضع الداكن';
    } else {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');
        themeIcon.innerText = '☀️';
        themeText.innerText = 'الوضع الساطع';
    }
});
