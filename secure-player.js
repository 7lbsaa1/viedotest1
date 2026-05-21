let player;
let isMuted = false;
let controlsTimeout;
let lastTap = 0; // لحساب النقر المزدوج

// 1. تهيئة مشغل YouTube وتخصيصه بالكامل ليكون مخفياً ومحمياً
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: 'b4N_R-V6wI8', // تأكد من وضع الـ ID الصحيح للفيديو هنا
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

// عناصر التحكم من واجهة الـ DOM
const mainContainer = document.getElementById('main-player-container');
const customPoster = document.getElementById('custom-poster');
const vidMask = document.getElementById('vid-mask');
const controlsPanel = document.getElementById('controls-panel');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const progressTimeline = document.getElementById('progress-timeline');
const progressCurrent = document.getElementById('progress-current');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// شريط الصوت الذكي
const volumeZone = document.getElementById('vol-zone');
const volumeTimeline = document.getElementById('volume-timeline');
const volumeCurrent = document.getElementById('volume-current');

// إضافة أزرار السرعة والجودة ديناميكياً لتوفير مساحة منسقة
const controlsLeft = document.querySelector('.controls-left');

// إنشاء زر وقائمة السرعة
const speedBtn = document.createElement('button');
speedBtn.className = 'control-btn';
speedBtn.innerHTML = '<i class="fas fa-gauge-high"></i>';
speedBtn.title = "سرعة التشغيل";
speedBtn.style.position = 'relative';

const speedMenu = document.createElement('div');
speedMenu.style.cssText = "position:absolute; bottom:55px; left:0; background:rgba(20,20,30,0.95); border:1px solid var(--panel-border); border-radius:8px; display:none; flex-direction:column; padding:5px; z-index:100; backdrop-filter:blur(10px); min-width:70px;";
[0.5, 1, 1.5, 2].forEach(speed => {
    const opt = document.createElement('button');
    opt.innerText = speed === 1 ? 'عادي' : speed + 'x';
    opt.style.cssText = "background:none; border:none; color:#fff; padding:6px; cursor:pointer; font-size:12px; text-align:center; border-radius:4px;";
    opt.onmouseover = () => opt.style.background = 'var(--accent-color)';
    opt.onmouseout = () => opt.style.background = 'none';
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
    speedMenu.style.display = speedMenu.style.display === 'none' ? 'flex' : 'none';
};
controlsLeft.insertBefore(speedBtn, fullscreenBtn);

// إنشاء زر وقائمة الجودة
const qualityBtn = document.createElement('button');
qualityBtn.className = 'control-btn';
qualityBtn.innerHTML = '<i class="fas fa-sliders"></i>';
qualityBtn.title = "الجودة";
qualityBtn.style.position = 'relative';

const qualityMenu = document.createElement('div');
qualityMenu.style.cssText = "position:absolute; bottom:55px; left:0; background:rgba(20,20,30,0.95); border:1px solid var(--panel-border); border-radius:8px; display:none; flex-direction:column; padding:5px; z-index:100; backdrop-filter:blur(10px); min-width:80px;";
qualityBtn.appendChild(qualityMenu);

qualityBtn.onclick = (e) => {
    e.stopPropagation();
    speedMenu.style.display = 'none';
    if(qualityMenu.style.display === 'none') {
        buildQualityMenu();
        qualityMenu.style.display = 'flex';
    } else {
        qualityMenu.style.display = 'none';
    }
};
controlsLeft.insertBefore(qualityBtn, fullscreenBtn);

// دالة لبناء خيارات الجودة المتاحة للفيديو الحالي بشكل ديناميكي
function buildQualityMenu() {
    qualityMenu.innerHTML = '';
    const levels = player.getAvailableQualityLevels();
    if(levels && levels.length > 0) {
        levels.forEach(level => {
            const opt = document.createElement('button');
            // تحسين المسميات لتكون مفهومة للمستخدم
            let label = level;
            if(level === 'hd1080') label = '1080p HD';
            if(level === 'hd720') label = '720p HD';
            if(level === 'large') label = '480p';
            if(level === 'medium') label = '360p';
            if(level === 'small') label = '240p';
            if(level === 'tiny') label = '144p';
            if(level === 'default') label = 'تلقائي';

            opt.innerText = label;
            opt.style.cssText = "background:none; border:none; color:#fff; padding:6px; cursor:pointer; font-size:12px; text-align:center; border-radius:4px;";
            opt.onmouseover = () => opt.style.background = 'var(--accent-color)';
            opt.onmouseout = () => opt.style.background = 'none';
            opt.onclick = (e) => {
                e.stopPropagation();
                player.setPlaybackQuality(level);
                qualityMenu.style.display = 'none';
            };
            qualityMenu.appendChild(opt);
        });
    } else {
        qualityMenu.innerHTML = '<span style="color:#aaa; font-size:11px; padding:5px;">تلقائي فقط</span>';
    }
}

// إغلاق القوائم المنبثقة عند الضغط في أي مكان خارجها
document.addEventListener('click', () => {
    speedMenu.style.display = 'none';
    qualityMenu.style.display = 'none';
});

function onPlayerReady() {
    // تحديث شريط التقدم الزمني بشكل دوري ومستمر
    setInterval(updateProgress, 200);
}

// تشغيل وإيقاف البوستر الرئيسي للفيديو
document.getElementById('img-start-trigger').addEventListener('click', () => {
    customPoster.classList.add('video-started');
    player.playVideo();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

// وظيفة الزر الموحد للتشغيل والإيقاف المؤقت بالأيقونات
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

// تحديث شريط التقدم الزمني للمشاهدة
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

// تقديم وترجيع الفيديو بالضغط على الشريط الزمني
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

// التحكم الذكي في الصوت (كتم / إلغاء الكتم)
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

// برمجة شريط التمرير ومؤشر الصوت عند السحب بالماوس أو اللمس
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

// دعم السحب المباشر للصوت (Drag) ليعمل مثل التطبيقات العالمية
let isDraggingVolume = false;
volumeTimeline.addEventListener('mousedown', () => isDraggingVolume = true);
document.addEventListener('mouseup', () => isDraggingVolume = false);
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) setVolumeFromEvent(e);
});

// إضافة تأثير الكلمس على الهواتف لإظهار شريط الصوت وثباته أثناء اللمس
volumeZone.addEventListener('touchstart', () => volumeZone.classList.add('active'));
document.addEventListener('touchend', () => volumeZone.classList.remove('active'));


// -----------------------------------------------------------------
// ميزة النقر المزدوج (Double Click) لتكبير وتصغير الشاشة تلقائياً
// -----------------------------------------------------------------
vidMask.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
        // تم النقر مرتين! تنفيذ ملء الشاشة
        toggleFullscreen();
        e.preventDefault();
    }
    lastTap = currentTime;
});

fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        mainContainer.requestFullscreen().catch(err => {
            alert(`خطأ أثناء تفعيل ملء الشاشة: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// إخفاء وإظهار شريط التحكم الاحترافي بناءً على حركة المستخدم
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
    }, 3000); // تختفي بعد 3 ثوانٍ من التوقف عن الحركة
}

// تفعيل استماع حركة مؤشر الفأرة واللمس لإظهار شريط التحكم
mainContainer.addEventListener('mousemove', showControls);
mainContainer.addEventListener('touchstart', showControls);


// -----------------------------------------------------------------
// نظام تبديل المظهر المحمي (Dark / Light Mode)
// -----------------------------------------------------------------
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
