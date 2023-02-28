/** Listen to external <OBJECT> dynamic changes ... */
(function(window) {
    var _DEBUG_ = false;

    function injectBroadcastVideoMethods(oipfPluginObject) {
        var isVideoPlayerAlreadyAdded = oipfPluginObject.children.length > 0;
        if (!isVideoPlayerAlreadyAdded) {
            var videoTag = document.createElement('video');
            videoTag.setAttribute('id', 'video-player');
            videoTag.setAttribute('autoplay', ''); // note: call to bindToCurrentChannel() or play() is doing it
            videoTag.setAttribute('muted', 'true'); // Patch for Firefox 66+ in order to fix autoplay video -> https://hacks.mozilla.org/2019/02/firefox-66-to-block-automatically-playing-audible-video-and-audio/
            videoTag.setAttribute('loop', '');
            videoTag.setAttribute('style', 'top:inherit; left:inherit; width:inherit; height:-webkit-fill-available;');
            //videoTag.src = localStorage.getItem('tvViewer_broadcast_url') || 'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4';
            videoTag.src = 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4';
            oipfPluginObject.appendChild(videoTag);
            _DEBUG_ && console.info('BROADCAST VIDEO PLAYER ... ADDED');
        }

        // inject OIPF methods ...

        //import { oipfBroadcastVideoMethods } from './videobc.mjs'; // FireFox 60+ -> https://jakearchibald.com/2017/es-modules-in-browsers/
        //oipfBroadcastVideoMethods(oipfPluginObject);

        //oipfPluginObject = window.oipfBroadcastbroadcastObject; // pre-loaded by videobc.js for ES5 browser compatibility

        var currentChannel = {
            'TYPE_TV': 12,
            'channelType': 12,
            'sid': 1,
            'onid': 1,
            'tsid': 1,
            'name': 'test',
            'ccid': 'ccid:dvbt.0',
            'dsd': ''
        };
        oipfPluginObject.currentChannel = currentChannel;
        oipfPluginObject.createChannelObject = function() {
            console.timeStamp && console.timeStamp('bcVideo.createChannelObject');
        };
        oipfPluginObject.bindToCurrentChannel = function() {
            console.timeStamp && console.timeStamp('bcVideo.bindToCurrentChannel');
            var player = document.getElementById('video-player');
            if (player) {
                player.play();
                // TODO: If there is no channel currently being presented, the OITF SHALL dispatch an event to the onPlayStateChange listener(s) whereby the state parameter is given value 0 (“ unrealized ")
            }
            return ; // TODO: must return a Channel object
        };
        oipfPluginObject.setChannel = function() {
            console.timeStamp && console.timeStamp('bcVideo.setChannel');
        };
        oipfPluginObject.prevChannel = function() {
            console.timeStamp && console.timeStamp('bcVideo.prevChannel');
            return currentChannel;
        };
        oipfPluginObject.nextChannel = function() {
            console.timeStamp && console.timeStamp('bcVideo.nextChannel');
            return currentChannel;
        };
        oipfPluginObject.release = function() {
            console.timeStamp && console.timeStamp('bcVideo.release');
            var player = document.getElementById('video-player');
            if (player) {
                player.pause();
                player.parentNode.removeChild(player);
            }
        };
        function ChannelConfig() {
        }
        ChannelConfig.prototype.channelList = {};
        ChannelConfig.prototype.channelList._list = [];
        ChannelConfig.prototype.channelList._list.push(currentChannel);
        Object.defineProperties(ChannelConfig.prototype.channelList, {
            'length': {
                enumerable: true,
                get : function length() {
                    return window.oipf.ChannelConfig.channelList._list.length;
                }
            }
        });
        ChannelConfig.prototype.channelList.item = function(index) {
            return window.oipf.ChannelConfig.channelList._list[index];
        };
        ChannelConfig.prototype.channelList.getChannel = function(ccid) {
            var channels = window.oipf.ChannelConfig.channelList._list;
            for (var channelIdx in channels) {
                var channel = channels[channelIdx];
                if (ccid === channel.ccid)
                    return channel;
            }
            return null;
        };
        ChannelConfig.prototype.channelList.getChannelByTriplet = function(onid, tsid, sid, nid) {
            var channels = window.oipf.ChannelConfig.channelList._list;
            for (var channelIdx in channels) {
                var channel = channels[channelIdx];
                if (onid === channel.onid &&
                    tsid === channel.tsid &&
                    sid === channel.sid)
                    return channel;
            }
            return null;
        };
        window.oipf.ChannelConfig = new ChannelConfig();
        oipfPluginObject.getChannelConfig = {}; // OIPF 7.13.9 getChannelConfig
        Object.defineProperties(oipfPluginObject, {
            'getChannelConfig': {
                value : function() {
                    return window.oipf.ChannelConfig;
                },
                enumerable: true,
                writable : false
            }
        });
        oipfPluginObject.programmes = [];
        oipfPluginObject.programmes.push({name:'Event 1, umlaut \u00e4',channelId:'ccid:dvbt.0',duration:600,startTime:Date.now()/1000,description:'EIT present event is under construction'});
        oipfPluginObject.programmes.push({name:'Event 2, umlaut \u00f6',channelId:'ccid:dvbt.0',duration:300,startTime:Date.now()/1000+600,description:'EIT following event is under construction'});
        Object.defineProperty(oipfPluginObject, 'COMPONENT_TYPE_VIDEO', { value: 0, enumerable: true });
        Object.defineProperty(oipfPluginObject, 'COMPONENT_TYPE_AUDIO', { value: 1, enumerable: true });
        Object.defineProperty(oipfPluginObject, 'COMPONENT_TYPE_SUBTITLE', { value: 2, enumerable: true });
        class AVComponent {
            constructor() {
                this.COMPONENT_TYPE_VIDEO = 0;
                this.COMPONENT_TYPE_AUDIO = 1;
                this.COMPONENT_TYPE_SUBTITLE = 2;
                this.componentTag = 0;
                this.pid = undefined;
                this.type = undefined;
                this.encoding = 'DVB-SUBT';
                this.encrypted = false;
            }
        }
        class AVVideoComponent extends AVComponent {
            constructor() {
                super();
                this.type = this.COMPONENT_TYPE_VIDEO;
                this.aspectRatio = 1.78;
            }
        }
        class AVAudioComponent extends AVComponent {
            constructor() {
                super();
                this.type = this.COMPONENT_TYPE_AUDIO;
                this.language = 'eng';
                this.audioDescription = false;
                this.audioChannels = 2;
            }
        }
        class AVSubtitleComponent extends AVComponent {
            constructor() {
                super();
                this.type = this.COMPONENT_TYPE_SUBTITLE;
                this.language = 'deu';
                this.hearingImpaired = false;
            }
        }
        class AVComponentCollection extends Array {
            constructor(num) {
                super(num);
            }
            item(idx) {
                return idx < this.length ? this[idx] : [];
            }
        }
        oipfPluginObject.getComponents = (function(type) {
            return [
                type === this.COMPONENT_TYPE_VIDEO ? new AVVideoComponent() :
                    type === this.COMPONENT_TYPE_AUDIO ? new AVAudioComponent() :
                        type === this.COMPONENT_TYPE_SUBTITLE ? new AVSubtitleComponent() : null
            ];
        }).bind(oipfPluginObject);
        // TODO: read those values from a message to the extension (+ using a dedicated worker to retrieve those values from the TS file inside broadcast_url form field)
        oipfPluginObject.getCurrentActiveComponents = (function() { return [ new AVVideoComponent(), new AVAudioComponent(), new AVSubtitleComponent() ]; }).bind(oipfPluginObject);
        oipfPluginObject.selectComponent = (function(cpt) { return true; }).bind(oipfPluginObject);
        oipfPluginObject.unselectComponent = (function(cpt) { return true; }).bind(oipfPluginObject);
        oipfPluginObject.setFullScreen = (function(state) { this.onFullScreenChange(state); var player = this.children.length > 0 ? this.children[0] : undefined; if (player && state) { player.style.width='100%'; player.style.height='100%'; } }).bind(oipfPluginObject);
        oipfPluginObject.onFullScreenChange = function() {
        };
        oipfPluginObject.onChannelChangeError = function(channel, error) {
        };
        oipfPluginObject.onChannelChangeSucceeded = function(channel) {
        };
        oipfPluginObject.addStreamEventListener = function(url, eventName, listener) {

        };
        oipfPluginObject.removeStreamEventListener = function(url, eventName, listener) {

        };
    }

    /**
     * Method adding missing video player events to the user defined object one.
     * @param {object} objectElement A reference on the object tag.
     * @param {object} videoPlayer A reference on the Dash.JS player instance.
     */
    function registerOipfEventsToVideoPlayer(objectElement, videoPlayer) {
        // objectElement.onPlayStateChange = objectElement.onPlayStateChange || function(s) {
        //     _DEBUG_ && console.log('>>>>>> onPlayStateChange state= ', s);
        //     objectElement.playState = s;
        // };
        // objectElement.onPlaySpeedChanged = objectElement.onPlaySpeedChanged || function(speed) {
        //     _DEBUG_ && console.log(">>>>>> onPlaySpeedChanged speed= ", speed);
        //     objectElement.playSpeed = speed;
        // };
        // objectElement.onPlayPositionChanged = objectElement.onPlayPositionChanged || function(p) {
        //     _DEBUG_ && console.log('>>>>>> onPlayPositionChanged speed= ', p);
        //     objectElement.playPosition = p;
        //
        // };
        objectElement.play = objectElement.play || function(speed) {
            speed = typeof speed == 'number' ? speed : 1;
            _DEBUG_ && console.log('>>>>>> play with speed= ', speed);

            var videoTag = document.getElementById('dash-player') || document.getElementById('video-player');
            var videoPlayer = videoTag && videoTag == document.getElementById('dash-player') ? videoTag._player : videoTag;

            if (speed == 0) {
                _DEBUG_ && console.log('>>>>>> pausing ...');
                videoPlayer && videoPlayer.pause();
            } else if (videoPlayer) {
                _DEBUG_ && console.log('>>>>>> playing ...');
                videoPlayer.setPlaybackRate && videoPlayer.setPlaybackRate(speed);
                videoPlayer.play();
            }
        };
        // objectElement.pause = objectElement.pause || function() {
        //     _DEBUG_ && console.log(">>>>>> pause (method doesn't exist)");
        // };
        objectElement.stop = objectElement.stop || function() {
            _DEBUG_ && console.log('>>>>>> stop');
            // if (typeof objectElement.data !== 'undefined') {
            //     objectElement.data = null;
            // } else if (typeof objectElement.src !== 'undefined') {
            //     objectElement.src = null;
            // }
            var videoTag = document.getElementById('dash-player') || document.getElementById('video-player');
            var videoPlayer = videoTag && videoTag == document.getElementById('dash-player') ? videoTag._player : videoTag;

            if (videoPlayer) {
                _DEBUG_ && console.log('>>>>>> stopping ...');
                if (typeof videoPlayer.stop !== 'undefined') {
                    _DEBUG_ && console.log('>>>>>> HTML5 video stop ...');
                    videoPlayer.stop();
                } else {
                    _DEBUG_ && console.log('>>>>>> PLAYER reset ...');
                    //videoPlayer.reset();
                    videoPlayer.seek(videoPlayer.duration());
                    //videoPlayer.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE):
                }
            }
            objectElement._queue = [];
            objectElement.onPlayStateChange && objectElement.onPlayStateChange(0); // stopped
        };
        objectElement.release = objectElement.release || function() {
            _DEBUG_ && console.log('>>>>>> release');

        };
        objectElement.queue = objectElement.queue || function(url) {
            _DEBUG_ && console.log('>>>>>> queue url= ', url);
            if (url) {
                objectElement._queue = objectElement._queue || [];
                objectElement._queue.push(url);
            } else if (url == null) {
                _DEBUG_ && console.log('>>>>>> reset queue');
                objectElement._queue = [];
            }
        };
        objectElement.seek = objectElement.seek || function(pos) { // pos in milliseconds
            var videoPlayer, videoTag = document.getElementById('dash-player');
            if (videoTag) {
                videoPlayer = videoTag._player;
                var videoDuration = videoPlayer.duration() * 1000;
                _DEBUG_ && console.log('>>>>>> seek pos= ', pos, '/', videoDuration);
                if (videoPlayer && pos < videoDuration) {
                    videoPlayer.seek(pos / 1000); // relative time in seconds
                }
            } else {
                videoTag = document.getElementById('video-player');
                videoPlayer = videoTag;
                _DEBUG_ && console.log('>>>>>> HTML5 seek pos= ', pos, '/', videoPlayer.duration);
                if (videoPlayer && pos < videoPlayer.duration) {
                    videoPlayer.currentTime = pos; // relative time in seconds
                }
            }
        };
        //  OIPF PLAYER    <->    DASH PLAYER   http://cdn.dashjs.org/latest/jsdoc/module-MediaPlayer.html
        // setComponent()  <-> setCurrentTrack(track instanceof MediaInfo)
        // getComponents() <-> getTracksFor(type)
        // ?? <-> setTextDefaultLanguage(lang)
        // ?? <-> enableText(false) or setTextTrack(-1)
    }

    /**
     * Method mapping the dash player events to the defined object one.
     * @param {object} objectElement A reference on the object tag.
     * @param {object} videoTag A reference on the dash player video tag
     */
    function registerDashVideoPlayerEvents(objectElement, videoTag) {
        videoTag.onwaiting = function(evt) {
            _DEBUG_ && console.log('>>>>>> onwaiting ', evt.timeStamp);
            objectElement.playState = 4; // buffering
            if (objectElement.onPlayStateChange) {
                _DEBUG_ && console.log('>>>>>> dispatchEvent onPlayStateChange', objectElement.playState);
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onplaying = function(evt) {
            objectElement.playTime = Math.floor(videoTag._player.duration() * 1000);
            _DEBUG_ && console.log('>>>>>> onplaying duration=', objectElement.playTime);
            objectElement.playState = 1;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onpause = function(evt) {
            _DEBUG_ && console.log('>>>>>> onpause ', evt.timeStamp);
            objectElement.playState = 2;
            if (objectElement.onPlayStateChange) {
                _DEBUG_ && console.log('>>>>>> dispatchEvent onPlayStateChange', objectElement.playState);
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onloadstart = function(evt) {
            _DEBUG_ && console.log('>>>>>> onloadstart');
            objectElement.playState = 3; // connecting
            if (objectElement.onPlayStateChange) {
                _DEBUG_ && console.log('>>>>>> dispatchEvent onPlayStateChange', objectElement.playState);
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        // videoTag.onprogress = function(evt) {
        //     _DEBUG_ && console.log('>>>>>> onprogress ', evt);
        //     var pos = videoTag._player.time();
        //     objectElement.playState = 4; // buffering
        //     if (objectElement.onPlayPositionChanged) {
        //         objectElement.onPlayPositionChanged(pos);
        //     } else {
        //         _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
        //         var playerEvent = new Event('PlayPositionChanged');
        //         playerEvent.position = pos;
        //         objectElement.dispatchEvent(playerEvent);
        //     }
        // };
        videoTag.onended = function(evt) {
            _DEBUG_ && console.log('>>>>>> onended ', evt.timeStamp);
            objectElement.playState = 5;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onerror = function(evt) {
            _DEBUG_ && console.log('>>>>>> onerror ', evt.timeStamp);
            objectElement.playState = 6;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onratechange = function() {
            var playRate = videoTag._player.getPlaybackRate();
            _DEBUG_ && console.log('>>>>>> onratechange ', playRate);
            objectElement.playSpeed = playRate;
            if (objectElement.onPlaySpeedChanged) {
                objectElement.onPlaySpeedChanged(playRate);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlaySpeedChanged', objectElement.playSpeed);
                var playerEvent = new Event('PlaySpeedChanged');
                playerEvent.speed = objectElement.playSpeed;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.ontimeupdate = function(evt) {
            //_DEBUG_ && console.log(">>>>>> ontimeupdate ");
            var pos = Math.floor(videoTag._player.time() * 1000);
            objectElement.playPosition = pos;
            if (objectElement.onPlayPositionChanged) {
                objectElement.onPlayPositionChanged(pos);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
                var playerEvent = new Event('PlayPositionChanged');
                playerEvent.position = pos;
                objectElement.dispatchEvent(playerEvent);
            }
        };
        videoTag.onseeked = function(evt) {
            _DEBUG_ && console.log('>>>>>> onseeked ', evt);
            // var pos = videoTag._player.time();
            // if (objectElement.onPlayPositionChanged) {
            //     objectElement.onPlayPositionChanged(pos);
            // } else {
            //     _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
            //     var playerEvent = new Event('PlayPositionChanged');
            //     playerEvent.position = pos;
            //     objectElement.dispatchEvent(playerEvent);
            // }
        };
        videoTag.onseeking = function(evt) {
            _DEBUG_ && console.log('>>>>>> onseeking ', evt);
            // var pos = videoTag._player.time();
            // if (objectElement.onPlayPositionChanged) {
            //     objectElement.onPlayPositionChanged(pos);
            // } else {
            //     _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
            //     var playerEvent = new Event('PlayPositionChanged');
            //     playerEvent.position = pos;
            //     objectElement.dispatchEvent(playerEvent);
            // }
        };
        videoTag.onteardown = function(evt) {
            _DEBUG_ && console.log('>>>>>> onteardown ', evt);
            objectElement.playState = 0;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        };
    }

    /**
     * Method mapping the HTML5 player events to the defined object one.
     * @param {object} objectElement A reference on the object tag.
     * @param {object} videoTag A reference on the HTML5 player video tag
     */
    function registerVideoPlayerEvents(objectElement, videoTag) {
        videoTag && videoTag.addEventListener && videoTag.addEventListener('play', function() {
            _DEBUG_ && console.log(')))))) play');
            objectElement.playState = 1;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('pause', function() {
            _DEBUG_ && console.log(')))))) pause');
            objectElement.playState = 2;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('loadstart', function() {
            _DEBUG_ && console.log(')))))) loadstart');
            objectElement.playState = 3;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        // videoTag && videoTag.addEventListener && videoTag.addEventListener('progress', function() {
        //     _DEBUG_ && console.log(')))))) progress');
        //     objectElement.playState = 4;
        //     _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
        //     var playerEvent = new Event('PlayStateChange');
        //     playerEvent.state = objectElement.playState;
        //     objectElement.dispatchEvent(playerEvent);
        // }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('ended', function() {
            _DEBUG_ && console.log(')))))) ended');
            objectElement.playState = 5;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('error', function() {
            _DEBUG_ && console.log(')))))) error');
            objectElement.playState = 6;
            if (objectElement.onPlayStateChange) {
                objectElement.onPlayStateChange(objectElement.playState);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayStateChange', objectElement.playState);
                var playerEvent = new Event('PlayStateChange');
                playerEvent.state = objectElement.playState;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('timeupdate', function() {
            //_DEBUG_ && console.log(')))))) timeupdate');
            var pos = Math.floor(videoTag.currentTime * 1000);
            if (objectElement.onPlayPositionChanged) {
                objectElement.playPosition = pos;
                objectElement.PlayPositionChanged(pos);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
                var playerEvent = new Event('PlayPositionChanged');
                playerEvent.position = pos;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('ratechange', function() {
            _DEBUG_ && console.log(')))))) ratechange');
            var playSpeed = videoTag.playbackRate;

            _DEBUG_ && console.log('>>>>>> dispatchEvent PlaySpeedChanged', playSpeed);
            var playerEvent = new Event('PlaySpeedChanged');
            playerEvent.speed = playSpeed;
            objectElement.dispatchEvent(playerEvent);

        }, false);

        videoTag && videoTag.addEventListener && videoTag.addEventListener('seeked', function() {
            _DEBUG_ && console.log(')))))) seeked');
            var pos = Math.floor(videoTag.currentTime * 1000);
            if (objectElement.onPlayPositionChanged) {
                objectElement.playPosition = pos;
                objectElement.PlayPositionChanged(pos);
            } else {
                _DEBUG_ && console.log('>>>>>> dispatchEvent PlayPositionChanged', pos);
                var playerEvent = new Event('PlayPositionChanged');
                playerEvent.position = pos;
                objectElement.dispatchEvent(playerEvent);
            }
        }, false);
    }

    /**
     * Method mapping the internal embbeded player events to the defined object one.
     * @param {object} objectElement A reference on the object tag.
     * @param {=object} optionHtmlPlayer A reference on the embedded html player video tag.
     */
    function registerEmbeddedVideoPlayerEvents(objectElement, optionHtmlPlayer) {
        //console.log('>> registerEmbeddedVideoPlayerEvents', objectElement);
        var embbededDocument = objectElement.contentDocument;
        _DEBUG_ && console.log('>> registerEmbeddedVideoPlayerEvents doc=', embbededDocument);
        // objectElement.onreadystatechange = function() {
        //   console.log("onreadystatechange state=", objectElement.readyState)
        // };

        if (optionHtmlPlayer) {
            registerVideoPlayerEvents(objectElement, optionHtmlPlayer); // same events for HTML5 video tag
            return;
        }

        // objectElement.onload/*objectElement.onDOMContentLoaded*/ = function(evt) {
        //     _DEBUG_ && console.log('>> HTML5 LOADED: ', evt);
        //     var player = evt.target.contentDocument && evt.target.contentDocument.document ? evt.target.contentDocument.document.getElementsByTagName('video') : null;
        //     player = evt.target.contentDocument && evt.target.contentDocument.body ? evt.target.contentDocument.body.getElementsByTagName('video') : null;
        //     _DEBUG_ && console.log('>> HTML5 PLAYER: ', player);
        //     if (player) {
        //         registerVideoPlayerEvents(objectElement, player);
        //         if (player.currentTime) {
        //             _DEBUG_ && console.log('>> HTML5 playing ...');
        //             objectElement.playState = 1;
        //             if (objectElement.onPlayStateChange) {
        //                 objectElement.onPlayStateChange(objectElement.playState);
        //             } else {
        //                 console.log('>> dispatchEvent PlayStateChange', objectElement.playState);
        //                 var playerEvent = new Event('PlayStateChange');
        //                 playerEvent.state = objectElement.playState;
        //                 objectElement.dispatchEvent(playerEvent);
        //             }
        //         }
        //     }
        // };

        /*var watchDogVideoTag = setInterval*/setTimeout(function () {
            var embbededDocument = document.getElementById(objectElement.id);
            embbededDocument = embbededDocument && embbededDocument.contentDocument ? embbededDocument.contentDocument : null;
            _DEBUG_ && console.log('>> doc=', embbededDocument);
            if (embbededDocument) {
                var items = embbededDocument.body.children, player;
                function scanChildrenForPlayer(items) {
                    Array.from(items).forEach(function(item) {
                        if ('VIDEO' === item.tagName) {
                            player = item;
                        } else if (item.children) {
                            scanChildrenForPlayer(item.children);
                        }
                    });
                }
                scanChildrenForPlayer(items);
                _DEBUG_ && console.log('>> PLAYER:', player);
                if (player) {
                    //clearInterval(watchDogVideoTag);
                    registerVideoPlayerEvents(objectElement, player); // same events for HTML5 video tag
                    if (typeof player.getAttribute('autoplay') !== 'undefined') {
                        objectElement.playState = 1;
                        if (objectElement.onPlayStateChange) {
                            objectElement.onPlayStateChange(objectElement.playState);
                        } else {
                            _DEBUG_ && console.log('>> dispatchEvent PlayStateChange', objectElement.playState);
                            var playerEvent = new Event('PlayStateChange');
                            playerEvent.state = objectElement.playState;
                            objectElement.dispatchEvent(playerEvent);
                        }
                    }
                }
            }
        }, 200); // fixme: delay as inner document is not created so quickly by the browser or can take time to start ...
    }

    /**
     * Called for every <object> element in the page.
     * @param {object} elem An object element to analyse.
     */
    function watchObject(elem) {
        
        console.log("WATCH OBJECT");
        var mimeType = elem.type;
        _DEBUG_ && console.log('object mimetype=' + mimeType);

        mimeType = mimeType.toLowerCase(); // ensure lower case string comparison
        var srcAttribute = 'src' in elem ? 'src' : 'data'; // data attribute is most of time used
        var videoPath = elem[srcAttribute];
        _DEBUG_ && console.log('object url=' + videoPath);

        if (elem.__already_seen__) {
            _DEBUG_ && console.log('object __already_seen__');
            return;
        }
        elem.__already_seen__ = true;

        if (mimeType.lastIndexOf('application/dash+xml', 0) == 0) {
            _DEBUG_ && console.warn('DASH VIDEO PLAYER ... ADDED');
            var videoTag = document.createElement('video');
            videoTag.setAttribute('id', 'dash-player');
            videoTag.setAttribute('style', 'top:inherit; left:inherit; width:inherit; height:-webkit-fill-available;');
            elem.appendChild(videoTag);
            if (dashjs) {
                _DEBUG_ && console.warn('starting DASH.JS video at url=' + videoPath + ' ...');
                videoTag._player = dashjs.MediaPlayer().create();
                videoTag._player.initialize(videoTag, videoPath, true); // autostart as we can't grab the play() method call
                registerOipfEventsToVideoPlayer(elem, videoTag._player);
                registerDashVideoPlayerEvents(elem, videoTag);
            }

        } else if (mimeType.lastIndexOf('video/mpeg4', 0) == 0 ||
                   mimeType.lastIndexOf('video/mp4', 0) == 0 ||  // h.264 video
                   mimeType.lastIndexOf('audio/mp4', 0) == 0 ||  // aac audio
                   mimeType.lastIndexOf('audio/mpeg', 0) == 0) { // mp3 audio
            _DEBUG_ && console.warn('started ' + (mimeType.lastIndexOf('audio/') !== -1 ? 'audio' : 'video') + ' player ...');
            registerOipfEventsToVideoPlayer(elem);

            // checking if a VIDEO tag is not already present inside the object ... (issue under FIREFOX)
            var videoTag;
            // if (videoPath.indexOf('.php') == -1) { // a true file and not a PHP file returning an HTML page embedding a video tag
            //     videoTag = document.createElement('video');
            //     videoTag.setAttribute('id', 'video-player');
            //     videoTag.setAttribute('autoplay', ''); // setting src will start the video and send an event
            //     videoTag.setAttribute('style', 'top:inherit; left:inherit; width:inherit; height:-webkit-fill-available;');
            //     videoTag.src = videoPath; // copy object data url to html5 video tag src attribute ...
            //     elem.appendChild(videoTag);
            //     _DEBUG_ && console.warn('BROADBAND VIDEO PLAYER ... ADDED');
            // }

            registerEmbeddedVideoPlayerEvents(elem, videoTag); // videoTag = undefined when using a PHP link (i.e. scanning for inner video tag)

            //muxjs ausgeklammert
        } else if (mimeType.lastIndexOf('video/mpeg', 0) == 0) {
            console.log("BROADBAND VIDEO PLAYER");
            _DEBUG_ && console.warn('TS VIDEO PLAYER ...');
            /*var videoTag = document.createElement('video');
            videoTag.setAttribute('id', 'ts-player');
            videoTag.setAttribute('style', 'top:inherit; left:inherit; width:inherit; height:-webkit-fill-available;');
            videoTag.controls = true;
            elem.appendChild(videoTag);
            mediaSource = new MediaSource();
            videoTag.src = URL.createObjectURL(mediaSource);
            //mediaSource.addEventListener('error', logevent);
            //mediaSource.addEventListener('opened', logevent);
            //mediaSource.addEventListener('closed', logevent);
            //mediaSource.addEventListener('sourceended', logevent);
            var transmuxer = new muxjs.mp4.Transmuxer({ remux: true });
            // FIXME: read the TS file and feed the transmuxer with data ...
            transmuxer.on('data', function (segment) { // event when generate fMP4 segment is ready ...
                var parsed = muxjs.mp4.tools.inspect(segment.data.buffer);
                console.log('transmuxed', parsed);
                //document.body.appendChild(document.createTextNode(muxjs.textifyMp4(parsed)));

                sourceBuffer.appendBuffer(segment.data.buffer); // adding segment to MSE buffer ...
            });
            transmuxer.on('done', function () {
            });*/

        } else if (mimeType.lastIndexOf('video/broadcast', 0) == 0) {
            console.log("BROADCAST VIDEO PLAYER");
            _DEBUG_ && console.warn('LIVE BROADCAST VIDEO PLAYER ...');
            injectBroadcastVideoMethods(elem);

        } else if (mimeType.lastIndexOf('application/oipfConfiguration', 0) == 0) {
            _DEBUG_ && console.log('new application/oipfConfiguration object ...');
            if (window.oipfApplicationManager) {
                _DEBUG_ && console.log('adding methods to application/oipfConfiguration object ...');
                Object.assign(elem, window.oipfApplicationManager);
            }
        } else if (mimeType.lastIndexOf('application/oipfApplicationManager', 0) == 0) {
            _DEBUG_ && console.log('new application/oipfApplicationManager object ...');
            if (window.oipfConfiguration) {
                _DEBUG_ && console.log('adding methods to application/oipfConfiguration object ...');
                Object.assign(elem, window.oipfConfiguration);
            }
        } else if (mimeType.lastIndexOf('application/oipfCapabilities', 0) == 0) {
            _DEBUG_ && console.log('new application/oipfCapabilities object ...');
            if (window.oipfCapabilities) {
                _DEBUG_ && console.log('adding methods to application/oipfCapabilities object ...');
                Object.assign(elem, window.oipfCapabilities);
            }
        }

        function updateViewerFrame(mutationsList) {
            for (var mutation of mutationsList) {
                //console.log(mutation);
                if (mutation.attributeName === 'type') {
                    var videoType = mutation.target.type;
                    if (videoType.lastIndexOf('application/dash+xml', 0) == 0) {
                        _DEBUG_ && console.warn('DASH VIDEO PLAYER ... added');
                        var videoTag = document.createElement('video');
                        videoTag.setAttribute('id', 'dash-player');
                        videoTag.setAttribute('style', 'top:inherit; left:inherit; width:inherit; height:-webkit-fill-available;');
                        mutation.target.appendChild(videoTag);
                    }
                } else if (mutation.attributeName === 'data' && mutation.target.type.lastIndexOf('application/dash+xml', 0) == 0) {
                    var videoPath = mutation.target.data;
                    _DEBUG_ && console.warn('DASH VIDEO PLAYER source: ', videoPath);
                    var videoTag = document.getElementById('dash-player');
                    if (dashjs) {
                        _DEBUG_ && console.warn('DASH VIDEO PLAYER start ...');
                        videoTag._player = dashjs.MediaPlayer().create();
                        videoTag._player.initialize(videoTag, videoPath, false); // don't autostart as play() will be called
                        videoTag._player.attachSource(videoPath);
                        //registerOipfEventsToVideoPlayer(mutation.target);
                        registerDashVideoPlayerEvents(mutation.target, videoTag);
                    }
                } else if (mutation.attributeName === 'data' && mutation.target.type.lastIndexOf('video/mpeg', 0) == 0) {
                    console.log('TAG:', mutation, ' has changed its data attribute ...');

                }
            }

            // TODO: notify extension to update url for such dynamic video allocation + notify web worker to handle TS analysis ...
            //chrome.runtime.sendMessage('hybridtvviewer@github.com', { videoUrl : videoPath }, function(response) {
            //    console.log(response);
            //    //if (!response.success) {}
            //});
        }

        // Watch for changes of the src/data/type attributes ...
        var srcObserver = new MutationObserver(updateViewerFrame);
        srcObserver.observe(elem, {
            'childList': false,
            'characterData': false,
            'attributes': true,
            'attributeFilter': [ srcAttribute, 'type' ]
        });
    }

    function onAnimationStart(event) {
        console.log("ON ANIMATION START");
        _DEBUG_ && console.info('object: ', event);
        if ('detected-object' === event.animationName) {
            watchObject(event.target);
        }
    }



    function NotSupportedError(){
        this.name = "NotSupportedError";
    }


    /*
    specification of switchMediaPresentation according to ETSI TS 103 736-1 V1.1.1 (2020-06)
    // DEFINITION 8.1.4.1
    // originalMediaObject: video/broadcast object or HTML5 video element
    // timelineSelector: URN identifying a timeline or null which indicates a switch to happen
    // timelineSource: true: timeline is carried in originalMediaObject, false: timeline is in newMediaObject
    // switchTime: if timelineSelector is URN, this defines time in seconds when switch from originalMediaObject to newMediaObject, if null: irrelevant
    // newMediaObjec: video/broadcast object or HTML5 video element
    // minimumSwitchPerformanceRequired: zero or one performance profiles that apply to the switch, if zero: empty string, if profile: URN included
    // return promise
    */
    function switchMediaPresentation(originalMediaObject, timelineSelector, timelineSource, switchTime, newMediaObject, minimumSwitchPerformanceRequired){
        console.log(originalMediaObject.firstChild);
        console.log(newMediaObject.firstChild);
        /*
        setTimeout(function(){
            console.log("First switch");
            videoplayer = originalMediaObject.firstChild;
            videoplayer.muted = true;
            originalMediaObject.style.zIndex = "3";
            //originalMediaObject.firstChild.mute();
    
            videoplayer2 = newMediaObject.firstChild;
            newMediaObject.style.zIndex = "7";
            videoplayer2.play();
            videoplayer2.muted = false;


            setTimeout(function(){
                console.log("Second switch back");
                videoplayer = originalMediaObject.firstChild;
                videoplayer.muted = false;
                originalMediaObject.style.zIndex = "5";
                //originalMediaObject.firstChild.mute();
        
                videoplayer2 = newMediaObject.firstChild;
                newMediaObject.style.zIndex = "0";
                videoplayer2.pause();
                videoplayer2.muted = true;
            }, 4000);



        }, 10200);
        */

        let callInProgress = false;
        let isMonitoring = false;
        // Anticipating Step 3
        if(callInProgress){
            return resolve("CallInProgress");
        }

        // Anticipating Step 5 - calculating switchTime with actual time
        var initNow = new Date();
        initNow.setSeconds(initNow.getSeconds() + switchTime);

        // Step 1)
        return new Promise((resolve, reject) => {
            
            // Step 2)
            if(!(originalMediaObject.type == 'video/broadcast' || isMimeTypeHTML5Video(originalMediaObject.type))){
                return reject(new NotSupportedError('Preconditions not met'));
            }

            console.log(originalMediaObject);
            if(originalMediaObject.type == 'video/broadcast'){
                if(!((originalMediaObject.firstChild.getAttribute("readyState") == 'presenting') &&((isMimeTypeHTML5Video(newMediaObject.type))))){
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }

            if((isMimeTypeHTML5Video(originalMediaObject.type))){
                // NOTE: readyState = 4 == HAVE_ENOUGH_DATA
                if(!(((newMediaObject.type == 'video/broadcast') || ((isMimeTypeHTML5Video(newMediaObject.type)))) && ((originalMediaObject.firstChild.readyState == '4') || (originalMediaObject.firstChild.getAttribute("readyState") == 'HAVE_FUTURE_DATA'))) ){
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }

            if(newMediaObject.type == 'video/broadcast'){
                if(!(newMediaObject.firstChild.getAttribute("visibility") == 'true' && ((newMediaObject.firstChild.readyState == 'stopped') ||(newMediaObject.firstChild.readyState == 'presenting')||(newMediaObject.firstChild.readyState == '4')))){
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }

            if((isMimeTypeHTML5Video(newMediaObject.type))){
                if(!(newMediaObject.firstChild.getAttribute("readyState") == 'HAVE_ENOUGH_DATA')){
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }

            if((isMimeTypeHTML5Video(newMediaObject.type))){
                if(!(newMediaObject.firstChild.getAttribute("onSeeking") == 'false')){
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }

            if(timelineSource == 'true'){
                // Definition 10.2.3 timelines
                // ETSI TS 103 286-2 [i.5] as referenced from ETSI TS 102 796 [1].
                if(!((timelineSelector == 'null') || (isTimelineSupported(originalMediaObject, timelineSelector)))){
                    return reject(new NotSupportedError('Timeline is not supported'));
                }
            }

            if(timelineSource == 'false'){
                // Definition 10.2.3 timelines
                // ETSI TS 103 286-2 [i.5] as referenced from ETSI TS 102 796 [1].

                if(!(isTimelineSupported(newMediaObject, timelineSelector))){
                    return reject(new NotSupportedError('Timeline is not supported'));
                }

                // UNCLEAR:
                // When content delivered via broadband and MSE is presented by an HTML5 video element, the media timeline
                // of the media resource of an HTML media element shall be supported as defined in clause 4.8.12.6 of the
                // HTML specification [3] and clause 13.1.2 of the present document. 

            }

            if(timelineSelector == 'null'){
                if(!((isMimeTypeHTML5Video(originalMediaObject.type)))){
                    return reject(new NotSupportedError('Timeline is not supported'));
                }
            }

            if(!(originalMediaObject.parentElement == newMediaObject.parentElement)){
                return reject(new NotSupportedError('Preconditions not met'));
            }
            
            /*
            // check/debug if zIndex correct path is indeed .style.zIndex
            */
            if(!((originalMediaObject.style.zIndex > newMediaObject.style.zIndex) || ((originalMediaObject.style.zIndex < newMediaObject.style.zIndex)&&(newMediaObject.firstChild.style.visibility == '')))){
                return reject(new NotSupportedError('Preconditions not met'));
            }

            // Definition 10.3.1
            if(minimumSwitchPerformanceRequired == ''){

            }else{
                // profile elements shall be present as child of the ta element

                // UNCLEAR in if clause:
                // if terminal (?) meets the requirement for profile 1 --> 5.3.2 of ETSI TS 103 736-2 [9]
                // if terminal (?) meets the requirement for profile 2 --> 5.3.2 of ETSI TS 103 736-2 [9]
                // additional profile elements --> ETSI TS 103 736-2 [9] listed first
                if((minimumSwitchPerformanceRequired.version == '1.1.1') && (minimumSwitchPerformanceRequired.children.name == 'ta')){
                    // Definition 10.2.3
                    if(timeline.startsWith("urn:dvb:css:timeline:temi:") || timelineSelector.startsWith("urn:dvb:css:timeline:pts:") ){
                        if(!(minimumSwitchPerformanceRequired.broadcastTimelineMonitoring == 'true')){
                            return reject(new NotSupportedError('Preconditions not met'));
                        }
                    }else{
                        if(!minimumSwitchPerformanceRequired.broadcastTimelineMonitoring == 'false'){
                            return reject(new NotSupportedError('Preconditions not met'));
                        }
                    }

                    // Definition 10.4 / Clause 4.2.6
                    // if the terminal is able to maintain state relating to broadcast video and audio after the end of a switch from broadcast to broadband
                    if('Definition 10.4 / Clause 4.2.6'){
                        if(!(minimumSwitchPerformanceRequired.GOPIndependentSwitchToBroadcast == 'true')){
                            return reject(new NotSupportedError('Preconditions not met'));

                        }
                    }else{
                        if(!(minimumSwitchPerformanceRequired.GOPIndependentSwitchToBroadcast == 'false')){
                            return reject(new NotSupportedError('Preconditions not met'));

                        }
                    }

                }else {
                    return reject(new NotSupportedError('Preconditions not met'));
                }
            }
            // Step 3) 
            callInProgress = true;

            // Step 4)
            if(timelineSelector == null){
                return Promise.reject(new NotSupportedError('Preconditions not met'));
            }

            // Step 5)
            startMonitoringTimeline(timelineSelector,originalMediaObject,newMediaObject,timelineSource);


            // Step 6)
            // 4.2.1 clause - calculated time by timestamp at call and now with switchTime
            var now = new Date();
            //console.log(initNow);
            //console.log(now);
            if (timelineSelector != null && ((initNow <= now) || (switchTime >= now.getTime()+10*60000))) {
              return resolve("InThePast");
            }

            // Step 7) Switch preparation deadline 
            // Definition 10.2.4
            // switchPreparationDeadline in seconds
            let switchPreparationDeadline = 2;

            // Definition 8.1.4.2 
            timelineTime(switchTime, timelineSelector, switchPreparationDeadline, isMonitoring);
            
            
            prepTimeSwitchTimeDate = new Date();
            prepTimeSwitchTimeDate.setSeconds(switchPrepDate.getSeconds() + switchPreparationDeadline);
            if(Date.now() > (prepTimeSwitchTimeDate)){
                return resolve('SwitchPreparationDeadlinePassed');
            }
            waitingTime = initNow - Date.now();

            //Step 5 of 8.1.4.2
            console.log("waiting Time is :" +waitingTime);
            setTimeout(function() {
                // Invoke the algorithm for allocating suitable decoders for newMediaObject
                // Step 8) of 8.1.4.1 Allocate suitable Video and start of Definition 8.1.4.4
                executingSwitch(originalMediaObject, newMediaObject,timelineSelector, switchTime, timelineTime, minimumSwitchPerformanceRequired)
                //allocateVideoAudioDecoders(newMediaObject);
              }, waitingTime);

            // Step 9)
            return resolve();

        });

        


    }

    //NOTE 2: Clause 10.2 definition which timelines are required to be supported under what circumstances
    function isTimelineSupported(MediaObject, timelineSelector){
        if((MediaObject.type == 'video/broadcast')){
            if(timelineSelector.startsWith("urn:dvb:css:timeline:pts:")){
                return true;
            // TEMI : "urn:dvb:css:timeline:temi:<component_tag>:<timeline_id>"
            }else if(timelineSelector.startsWith("urn:dvb:css:timeline:temi:")){
                return true;
            }else{
                return false;
            }
        }else if(((isMimeTypeHTML5Video(MediaObject.type))) &&('non-adaptive HTTP streaming')){
            // ISOBMFF : "urn:dvb:css:timeline:ct"
            if((timelineSelector.startsWith("urn:dvb:css:timeline:ct"))){
                return true;

                }
        }else if(((isMimeTypeHTML5Video(MediaObject.type))) &&('streaming content delievered by DASH')){
            // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>" 
            if(timelineSelector.startsWith("urn:dvb:css:timeline:mpd:period:rel:")){
                return true;
            // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>:<period-id>"
            }else if(timelineSelector.startsWith("urn:dvb:css:timeline:mpd:period:rel:")){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    function startMonitoringTimeline(timelineSelector, originalMediaObject, newMediaObject, timelineSource) {
        isMonitoring = true;
        // If timelineSource is true, the terminal will be monitoring the timeline as part of decoding the media, so we don't need to start monitoring it here.
        if (timelineSource === true) {
          return;
        }
      
        // If timelineSource is false and timelineSelector is null, there is no timeline to monitor, so we don't need to start monitoring it here.
        if (timelineSource === false && timelineSelector === null) {
          return;
        }
      
        // If timelineSource is false and timelineSelector is not null, we need to start asynchronously monitoring the timeline indicated by timelineSelector.
        if (timelineSource === false && timelineSelector !== null) {
          let mediaObject = originalMediaObject;
      
          // If originalMediaObject is an HTML5 video element and newMediaObject is an HTML5 video element, use newMediaObject instead of originalMediaObject.
          if (isMimeTypeHTML5Video(originalMediaObject) && isMimeTypeHTML5Video(newMediaObject)) {
            mediaObject = newMediaObject;
          }
      
          // If the application has previously called MediaSynchroniser.initMediaSynchroniser with timelineSelector, it will be monitoring that timeline, so we don't need to start monitoring it here.
          if (MediaSynchroniser.getMonitoredTimeline(timelineSelector) !== null) {
            return;
          }
      
          // Start asynchronously monitoring the timeline indicated by timelineSelector.
          MediaSynchroniser.initMediaSynchroniser(mediaObject, timelineSelector);
        }
      }
      

    // 8.1.4.2 Between a call to switchMediaPresentation and the start of the switch
    function timelineTime(switchTime, timeline, switchPreparationDeadline, isMonitoring){
        if(timeline.startsWith("urn:dvb:css:timeline:temi:")){
            if(!isMonitoring && timeline == null){
                //current timeline time not known
                return reject(new NotSupportedError('Timeline time not known'));
            }
            switchPreparationDeadline =+ 2,5;
        }else{
            if(timeline == null){
                return reject(new NotSupportedError('Timeline time not known'));
            }
        }

        var switchTimeDate = new Date();
        switchTimeDate.setSeconds(switchTimeDate.getSeconds() + switchTime);
        if(switchTimeDate < Date.now()){
            throw new InvalidStateError('Switch time is in the past');

        }

        // calculate switchPrepDateTime
        switchPrepDate = new Date();
        switchPrepDate.setSeconds(switchPrepDate.getSeconds() + switchPreparationDeadline);
        if(new Date() > switchPrepDate){
            throw new InvalidStateError('Switch preparation deadline passed');

        }
        if(switchTimeDate >= new Date().getTime()+10*60000){
            throw new InvalidStateError('Switch Time is more than 10 minutes in the future');

        }
    }

    // 8.1.4.2
    function checkSwitch(originalMediaObject, promise){
        /*
        promise
        .then(function(error) {
            if((originalMediaObject.type == "video/broadcast") && originalMediaObject.onChannelChangeSucceeded == true ){
                return Promise.resolve("ChannelChanged");
            }
            if(((isMimeTypeHTML5Video(originalMediaObject.type))) && srcIsChanged == true ){
                return Promise.resolve("SourceChanged");
            }

            if((isMimeTypeHTML5Video(newMediaObject.type))){
                if(newMediaObject.state == "changed"){
                    return Promise.resolve("NewObjectChanged");
                }
            }

            // 8.1.4.2 4)
            //TODO clause 10.2.7 user make changes to terminal audio language - terminal audio language not in scope

        })
        */
    }

    // 8.1.4.3 executing the switch
    function executingSwitch(originalMediaObject, newMediaObject,timelineSelector, switchTime, timelineTime, minimumSwitchPerformanceRequired){
        return new Promise(function(resolve,reject){
            console.log("switch in progress");
            if(timelineSelector == null){
                return reject(new InvalidStateError('Timeline Selector null'));
            }
            if(timelineSelector != null && (timelineTime > switchTime)){
                return reject(new InvalidStateError('Switch time is in the past'));
            }
            if(originalMediaObject.type == "html5video" && originalMediaObject.detectedPlayback && timelineTime > switchTime){
                return reject(new InvalidStateError('Switch time is in the past'));
            }

            /**
             * Unclear how this translate into code: "Performance Profile"
             * 
             * If minimumSwitchPerformanceRequired is a URN that identifies a performance profile supported by the
                terminal and it is known to the terminal that the requirements of that performance profile will not be met then
                resolve promise with "NoPerformanceProfileMet"
            */
            // if(minimumSwitchPerformanceRequired == "URN supported but not met"){
            //    return reject(new NoPerformanceProfileMet('No Performance Profile Met'));
            //}


            /** old code snippet for testing
             * 
            videoplayer = originalMediaObject.firstChild;
            videoplayer.muted = true;
            originalMediaObject.style.zIndex = "5";
            //originalMediaObject.firstChild.mute();
            videoplayer2 = newMediaObject.firstChild;
            newMediaObject.style.zIndex = "7";
            videoplayer2.play();
            videoplayer2.muted = false;
             * 
             */


            //STEP 3
            // assumption: no suitable video decoder for newMediaObject if no
            if(newMediaObject == "not suitable video decoder"){
                originalMediaObject.contentDocument.visibilityState = "hidden";
                if(originalMediaObject == "video/broadcast"){
                    originalMediaObject.contentDocument.readyState = "stopped";
                }
                if(isMimeTypeHTML5Video(originalMediaObject.type)){
                    originalMediaObject.contentDocument.readyState = "pause";
                }

            }

        
            //STEP 4
            if(newMediaObject.type == "video/broadcast"){
                if(newMediaObject.firstChild.readyState == "4"){
                    newMediaObject.firstChild.readyState = "presenting";
                    newMediaObject.firstChild.style.visibility = "visible";
                }
            }

            //STEP 5
            if(isMimeTypeHTML5Video(newMediaObject.type)){
                //NOTE: 4 == have enough data which means paused
                if(newMediaObject.firstChild.readyState == "paused" || newMediaObject.firstChild.readyState == "4"){
                    newMediaObject.firstChild.readyState = "play";
                    newMediaObject.firstChild.play();
                }
            }

            //STEP 6 WAIT ASYNC
            waitForPresentationState(newMediaObject);

            //STEP 7
            if(newMediaObject.type == "video/broadcast" && newMediaObject.onChannelChangeError == "true"){
                return resolve('VideoBroadcastPresentingFailed');

            }

            //STEP 8
            if(isMimeTypeHTML5Video(newMediaObject.type) && newMediaObject.errorEvent){
                return resolve('MediaElementError');

            }

            //STEP 9
            newMediaObject.firstChild.visibilityState = "visible";
            // NOTE: video/broadcast doesnt have audio attribute
            if(newMediaObject.type == "video/broadcast"){
                //newMediaObject.firstChild.audio = "100";
                newMediaObject.firstChild.volume = 1.0;
            }else if((isMimeTypeHTML5Video(newMediaObject.type))){
                newMediaObject.firstChild.volume = 1.0;
            }

            //STEP 10
            originalMediaObject.firstChild.style.visibility = "hidden";
            //originalMediaObject.firstChild.style.zIndex = 3;
            //newMediaObject.firstChild.style.zIndex = 5;
            
            originalMediaObject.firstChild.volume = 0.0;




            //STEP 11
            if(originalMediaObject.type == "video/broadcast"){
                if(originalMediaObject.firstChild.readyState == "presenting"){
                    originalMediaObject.firstChild.readyState = "presenting";
                }
            }

            //STEP 12
            if((isMimeTypeHTML5Video(originalMediaObject.type))){
                if(!(originalMediaObject.firstChild.readyState == "paused")){
                    originalMediaObject.firstChild.readyState = "paused";
                }
            }
            console.log("switch performed");

            //resolve is undefined
            return resolve('undefined');
        });
    }

    async function waitForPresentationState(newMediaObject) {
        return new Promise(resolve => {
          if (newMediaObject.type == "video/broadcast") {
            if (newMediaObject.readyState == "presenting") {
              resolve();
            } else {
              newMediaObject.addEventListener('loadedmetadata', resolve);
            }
          } else if (isMimeTypeHTML5Video(newMediaObject.type)) {
            newMediaObject.addEventListener('loadeddata', resolve);
          } else {
            resolve();
          }
        });
      }

    // 8.1.4.4 (and step 8 of 8.1.4.1) - allocate suitable video and audio decoders for newMediaObject
    async function allocateVideoAudioDecoders(originalMediaObject, newMediaObject, timelineSelector, switchTime){
        //check if visible through newMediaObject attributes
        // 1)
        if(newMediaObject == 'already suitable decoder'){
            return; //stop
        }

        // 2)    
        // UNCLEAR: If the terminal has more than one suitable video or audio decoder available to HbbTV® but not allocated, it is implementation specific which are allocated. 
        if(newMediaObject.extraSDVideoDecodes == '' && newMediaObject.extraHDVideoDecodes == ''){


        }

         // 3)
         // UNCLEAR: 
        if('suitable video/audio decoder allocated for HTML5 video' == 'paused'){
            'suitable video/audio decoder allocated for HTML5 video allocate to newMediaObject';
            return; //stop
        }


         // 4)
        if(newMediaObject.type == 'video/broadcast'){
            // UNCLEAR: does 3) mean, if newMediaObject and originalMediaObject are NOT in presenting state and both NOT css visibility to hidden?
            if((newMediaObject.readyState == 'presenting') && (newMediaObject.visibility == 'hidden') && ('READ UNCLEAR ABOVE')){
                return; //stop
            }
        }


         // 5)
        if('suitable video/audio decoder allocated for originalMediaObject'){
            return; //stop
        }

         // 6)
        return resolve('NoSuitableMediaDecoderAvaiable');
    }

    //returns true if MIME type is html5 video
    function isMimeTypeHTML5Video(type){
        if((type == 'video/mp4') || (type=='video/webm') || (type=='video/ogg') || (type=='video/mpeg')){
            return true;
        }else{
            return false;
        }

    }



    broadbandTestVideo = window.oipfObjectFactory.createVideoMpegObject();
    // just add a listener on new <OBJECT> tags that will be animated when newly created ...
    window.document.addEventListener(window.CSS.supports('animation', '0s') ? 'animationstart' : 'webkitAnimationStart', onAnimationStart, true);
    //console.log(document.getElementById('video-player'));
    //console.log(document.getElementById('video'));
    //console.log(document.getElementById('video2'));

    //originalMediaObject, timelineSelector, timelineSource, switchTime, newMediaObject, minimumSwitchPerformanceRequired
    //timeline in newMediaObject if timelineSource false, if true in originalMediaObject
    console.log("first switch announced");
    result = switchMediaPresentation(document.getElementById('video'),"urn:dvb:css:timeline:pts:1800,3600",true,5,document.getElementById('video2'),"");
    checkSwitch(document.getElementById('video'),document.getElementById('video2'),result);
    console.log("second switch announced");
    result2 = switchMediaPresentation(document.getElementById('video2'),"urn:dvb:css:timeline:mpd:period:rel:1535502844",true,15,document.getElementById('video'),"");

})(
    typeof self !== 'undefined' && self ||
    typeof window !== 'undefined' && window ||
    typeof global !== 'undefined' && global || {}
);
