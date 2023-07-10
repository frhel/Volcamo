const player_settings = {
    cam_duration: 20000,
    cams: [],
    videos: [],
    current_cam: 0,
    cam_timer: null,
    cams_ready_count: 0,
};

player_settings.videos = [
    'yJfiMhqLgTY',
    '_q1N4J5oTSE',
    //'OivAGrxLueo',
    'uZGleOgreBY',
    'LMb66idO7DE',
    'dPtOhow3KY0',
    '3uE8TEdK4C4',
]

const main_player = document.getElementById('main-player');
const playlist = document.getElementById('playlist');
const preview_cams = document.getElementById('preview-cams');
const auto_play_toggle = document.getElementById('automatic-toggle');

document.addEventListener('DOMContentLoaded', function() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentElement.insertBefore(tag, firstScriptTag);

    auto_play_toggle.addEventListener( "click", function(e) {
        e.preventDefault();
        if (auto_play_toggle.classList.contains( "on" )) {
            auto_play_toggle.classList.remove( "on" );
            clearTimeout( player_settings.cam_timer );
        } else {
            auto_play_toggle.classList.add( "on" );
            start_autoplay();
        }
    } );

    preview_cams.addEventListener( "click", function(e) {
        if (e.target.tagName === 'INPUT') {
            const index = e.target.closest( ".video-wrapper" ).dataset.index;
            if (e.target.checked) {       
                player_settings.cams[index].seekTo( player_settings.cams[index].getDuration() - 1 );
                player_settings.cams[index].playVideo();
            } else {
                player_settings.cams[index].pauseVideo();
            }
            return;
        }
        const closest_cam = e.target.closest( ".video-wrapper" );
        const index = closest_cam.dataset.index;
        const id = closest_cam.querySelector( "iframe" ).id;
        gtag("event", "change_video", {video_change: id, send_to: "G-HY3B905J73"})
        player_settings.current_cam = index;
        focus_video( index );
        start_autoplay();
    } );
} );

function start_autoplay() {
    if (auto_play_toggle.classList.contains( "on" )) {
        clearTimeout( player_settings.cam_timer );
        player_settings.cam_timer = setTimeout( next_focus, player_settings.cam_duration );
    }
}

function next_focus() {
    player_settings.current_cam++;
    if( player_settings.current_cam >= player_settings.cams.length ) {
        player_settings.current_cam = 0;
    }
    if ( player_settings.cams[player_settings.current_cam].getPlayerState() !== YT.PlayerState.PLAYING ) {
        next_focus();
        return;
    }
    focus_video( player_settings.current_cam );
    start_autoplay();
}

function focus_video( index ) {
    const video = player_settings.cams[index];
    const all_videos = document.querySelectorAll( "iframe" );
    all_videos.forEach( video => {
       video.parentElement.classList.remove( "current" );
    });
    video.getIframe().parentElement.classList.add( "current" );
}

function onYouTubeIframeAPIReady() {
    player_settings.videos.forEach( video => {
        const wrapper = document.getElementById('video-template').content.firstElementChild.cloneNode(true);
        wrapper.dataset.index = player_settings.cams.length;
        wrapper.querySelector('div').id = video;
       
        preview_cams.appendChild( wrapper );

        const player = new YT.Player( video, {
            videoId: video,
            playerVars: {
                'controls': 1,
                'mute': 1,
                'modestbranding': 1,
                'fs': 1,
                'rel': 0,
                'showinfo': 0,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        } );
        player_settings.cams.push( player );
    } );
}

function onPlayerReady( event ) {
    event.target.playVideo();
    player_settings.cams_ready_count++;
    if( player_settings.cams_ready_count == player_settings.cams.length ) {
        focus_video( player_settings.current_cam );
        player_settings.cam_timer = setTimeout( next_focus, player_settings.cam_duration );
    }
}

function onPlayerStateChange( event ) {
    if ( event.data == YT.PlayerState.PLAYING ) {
        event.target.getIframe().parentElement.classList.add( "visible" );
        event.target.getIframe().parentElement.classList.remove( "buffering" );
    } else if ( event.data == YT.PlayerState.BUFFERING ) {
        event.target.getIframe().parentElement.classList.add("buffering" );
        setTimeout( function() {
            if ( event.target.getPlayerState() == YT.PlayerState.BUFFERING ) {
                event.target.getIframe().parentElement.classList.remove( "visible" );
            }
        }, 10000 );
    } else if ( event.data == YT.PlayerState.ENDED ) {
        event.target.destroy();
    } else if ( event.data == YT.PlayerState.PAUSED ) {
    }
}

function onPlayerError( event ) {
    console.log('error', event.data);
    event.target.destroy();
}
