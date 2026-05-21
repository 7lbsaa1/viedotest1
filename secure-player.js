window['addEventListener']('keydown', function (_0xkb) {
    if (_0xkb['keyCode'] === 0x7B || 
        (_0xkb['ctrlKey'] && _0xkb['shiftKey'] && (_0xkb['keyCode'] === 0x49 || _0xkb['keyCode'] === 0x4A)) || 
        (_0xkb['ctrlKey'] && _0xkb['keyCode'] === 0x55)) { 
        _0xkb['preventDefault']();
        return false;
    }
});

window['addEventListener']('contextmenu', function (_0xcm) {
    _0xcm['preventDefault']();
    return false;
});

let _0x4f12, _0x8a9c, _0x7b8d; 
const _0x1a2b = 'BrDHsQyhQQE'; // المعرف الجديد الخاص بأغنية طب قصر العيني

function onYouTubeIframeAPIReady() {
    _0x4f12 = new YT['Player']('youtube-player', {
        'videoId': _0x1a2b,
        'playerVars': {
            'controls': 0x0, 'rel': 0x0, 'modestbranding': 0x1,
            'iv_load_policy': 0x3, 'disablekb': 0x1, 'fs': 0x0,
            'autoplay': 0x0, 'showinfo': 0x0, 'origin': window['location']['origin']
        },
        'events': { 'onStateChange': _0x3b9a, 'onReady': _0x5c2d }
    });
}

function _0x5c2d(_0x7f1a) {
    const _0x11ab = document['getElementById']('play-pause-btn'),
          _0x22cd = document['getElementById']('mute-btn'),
          _0x33ef = document['getElementById']('fullscreen-btn'),
          _0x44fa = document['getElementById']('main-player-container'),
          _0x55bc = document['getElementById']('progress-timeline'),
          _0x66de = document['getElementById']('vid-mask');

    const _0x82cc = () => {
        _0x44fa['classList']['remove']('hide-controls');
        clearTimeout(_0x7b8d);
        if (_0x4f12 && _0x4f12['getPlayerState']() === 0x1) {
            _0x7b8d = setTimeout(() => {
                _0x44fa['classList']['add']('hide-controls');
            }, 0xbb8);
        }
    };

    _0x44fa['addEventListener']('mousemove', _0x82cc);
    _0x44fa['addEventListener']('touchstart', _0x82cc, {passive: true});

    const _0x77ef = (_0xev) => {
        if(_0xev) _0xev['preventDefault']();
        const _0x99ab = _0x4f12['getPlayerState']();
        if (_0x99ab === 0x1) {
            _0x4f12['pauseVideo'](); 
            _0x11ab['innerText'] = 'تشغيل';
            clearInterval(_0x8a9c);
            _0x44fa['classList']['remove']('hide-controls');
        } else {
            _0x4f12['playVideo'](); 
            _0x11ab['innerText'] = 'إيقاف مؤقت';
            _0x98bc();
            _0x82cc();
        }
    };

    _0x11ab['addEventListener']('click', _0x77ef);
    _0x66de['addEventListener']('click', _0x77ef);

    _0x22cd['addEventListener']('click', () => {
        if (_0x4f12['isMuted']()) {
            _0x4f12['unMute'](); _0x22cd['innerText'] = 'كتم الصوت';
        } else {
            _0x4f12['mute'](); _0x22cd['innerText'] = 'تشغيل الصوت';
        }
    });

    _0x33ef['addEventListener']('click', () => {
        if (!document['fullscreenElement']) {
            if (_0x44fa['requestFullscreen']) { _0x44fa['requestFullscreen'](); }
            _0x33ef['innerText'] = 'خروج 🗗';
        } else {
            if (document['exitFullscreen']) { document['exitFullscreen'](); }
            _0x33ef['innerText'] = 'ملء الشاشة ⛶';
        }
    });

    _0x55bc['addEventListener']('click', (_0xe321) => {
        const _0xbc12 = _0x55bc['getBoundingClientRect']();
        const _0xac45 = _0xe321['clientX'] - _0xbc12['left'];
        const _0xdc78 = _0xbc12['width'];
        const _0xfc89 = _0x4f12['getDuration']();
        if (_0xfc89) {
            const _0x012a = (_0xac45 / _0xdc78) * _0xfc89;
            _0x4f12['seekTo'](_0x012a, true);
            _0x192a();
        }
    });
}

function _0x98bc() { _0x8a9c = setInterval(_0x192a, 0x1f4); }

function _0x192a() {
    if (_0x4f12 && _0x4f12['getCurrentTime']) {
        const _0x22ff = _0x4f12['getCurrentTime'](),
              _0x33aa = _0x4f12['getDuration']();
        if (_0x33aa) {
            const _0x44bb = (_0x22ff / _0x33aa) * 0x64;
            document['getElementById']('progress-current')['style']['width'] = _0x44bb + '%';
        }
    }
}

function _0x3b9a(_0x55aa) {
    if (_0x55aa['data'] === YT['PlayerState']['ENDED']) {
        document['getElementById']('play-pause-btn')['innerText'] = 'إعادة تشغيل';
        clearInterval(_0x8a9c);
        document['getElementById']('main-player-container')['classList']['remove']('hide-controls');
        document['getElementById']('progress-current')['style']['width'] = '0%';
    } else if (_0x55aa['data'] === YT['PlayerState']['PLAYING']) {
        _0x98bc();
    }
}
