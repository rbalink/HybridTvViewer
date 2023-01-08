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
            videoTag.src = localStorage.getItem('tvViewer_broadcast_url') || 'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4';
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

        } else if (mimeType.lastIndexOf('video/mpeg', 0) == 0 && muxjs) {
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
    // return promise: does that mean, calling the promise again, or letting the promise open? like pending?
    */
    function switchMediaPresentation(originalMediaObject, timelineSelector, timelineSource, switchTime, newMediaObject, minimumSwitchPerformanceRequired){
        var called = false;
        //return new Promise((resolve, reject) =>
        const hbbPromise = new Promise((resolve, reject) => {

            /*
            // notes/questions:
            input for "newMediaObject" is unclear --> structure of video/broadcast and html5 same?
            what is the tag for html5 video/elements? ('html5video')
            is state always readyState? Or are there different states??
            is "hidden (true/false)" actually the CSS visibility?
            what are the actual statements of readyState (stopped, HAVE_FUTURE_DATA, presenting etc)
            is "onseeking" the actual "seeking" attribute??
            TODO: Read clause 10.2
            URN = is oipf.ownerDocument.timeline.currentTime: 436653.845 an URN???
            Step 3 unclear: check inside the Promise, if the Promise was called before? Is this possible inside a Promise?
            Step 4 unclear: return Promise inside a Promise??
            Step 5 unclear: async monitoring?
            Step 7 unclear: What is switch preparation deadline? How to calculate
            */
            console.log(this);
            //console.log(hbbPromise);
            
            if(!(originalMediaObject.type == 'video/broadcast' || originalMediaObject.type == 'html5video')){
                reject('NotSupportedError');
            }

            console.log(originalMediaObject.ownerDocument.readyState);
            if(originalMediaObject.type == 'video/broadcast'){
                if(!((originalMediaObject.ownerDocument.readyState == 'presenting') &&(originalMediaObject.type == 'html5video'))){
                    reject('NotSupportedError');
                }
            }

            if(originalMediaObject.type == 'html5video'){
                if(!(((newMediaObject == 'video/broadcast') || (newMediaObject == 'html5video')) && ((originalMediaObject.ownerDocument.readyState == 'HAVE_FUTURE_DATA') || (originalMediaObject.ownerDocument.readyState == 'HAVE_FUTURE_DATA'))) ){
                    reject('NotSupportedError');
                }
            }

            if(newMediaObject.type == 'video/broadcast'){
                if(!(newMediaObject.ownerDocument.visibility == 'true' && ((newMediaObject.ownerDocument.readyState == 'stopped') ||(newMediaObject.ownerDocument.readyState == 'presenting')))){
                    reject('NotSupportedError');
                }
            }

            if(newMediaObject.type == 'html5video'){
                if(!(newMediaObject.ownerDocument.readyState == 'HAVE_ENOUGH_DATA')){
                    reject('NotSupportedError');
                }
            }

            if(newMediaObject.type == 'html5video'){
                if(!(newMediaObject.ownerDocument.onseeking == 'false')){
                    reject('NotSupportedError');
                }
            }

            if(timelineSource == 'true'){
                // Definition 10.2.3 timelines
                // ETSI TS 103 286-2 [i.5] as referenced from ETSI TS 102 796 [1].
                if(!((timelineSelector == 'null') || (originalMediaObject.type == 'video/broadcast'))){
                    reject('NotSupportedError');
                }

                if((originalMediaObject.type == 'video/broadcast')){
                    // timelineSelector has to be supported for following formats

                    // PTS : "urn:dvb:css:timeline:pts"
                    if(timelineSelector == 'TODO: PTS FORMAT'){
                        

                    // TEMI : "urn:dvb:css:timeline:temi:<component_tag>:<timeline_id>"
                    }else if(timelineSelector == 'TODO: TEMI FORMAT'){

                    }else{

                        reject('NotSupportedError');
                    }
                }else if((originalMediaObject.type == 'html5video') &&('non-adaptive HTTP streaming')){
                    // When an ISOBMFF file delivered by non-adaptive HTTP streaming is presented by an HTML5 video element, 
                    // ISOBMFF composition time ("urn:dvb:css:timeline:ct") shall be supported.
                    // ISOBMFF : "urn:dvb:css:timeline:ct"
                    if(!(timelineSelector == 'TODO: ISOBMFF FORMAT')){
                        reject('NotSupportedError');

                    }
                }else if((originalMediaObject.type == 'html5video') &&('streaming content delievered by DASH')){

                    // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>" 
                    if(timelineSelector == 'TODO periood relative Timeline'){

                    // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>:<period-id>"
                    }else if(timelineSelector == 'TODO periood relative Timeline'){
                        
                    }else{
                        reject('NotSupportedError');

                    }
                }else{
                    reject('NotSupportedError');
                }

                // UNCLEAR:
                // When content delivered via broadband and MSE is presented by an HTML5 video element, the media timeline
                // of the media resource of an HTML media element shall be supported as defined in clause 4.8.12.6 of the
                // HTML specification [3] and clause 13.1.2 of the present document. 

                
            }

            if(timelineSource == 'false'){
                // Definition 10.2.3 timelines
                // ETSI TS 103 286-2 [i.5] as referenced from ETSI TS 102 796 [1].

                if((newMediaObject.type == 'video/broadcast')){
                    // timelineSelector has to be supported for following formats

                    // PTS : "urn:dvb:css:timeline:pts"
                    if(timelineSelector == 'TODO: PTS FORMAT'){
                        

                    // TEMI : "urn:dvb:css:timeline:temi:<component_tag>:<timeline_id>"
                    }else if(timelineSelector == 'TODO: TEMI FORMAT'){

                    }else{

                        reject('NotSupportedError');
                    }
                }else if((newMediaObject.type == 'html5video') &&('non-adaptive HTTP streaming')){
                    // When an ISOBMFF file delivered by non-adaptive HTTP streaming is presented by an HTML5 video element, 
                    // ISOBMFF composition time ("urn:dvb:css:timeline:ct") shall be supported.
                    // ISOBMFF : "urn:dvb:css:timeline:ct"
                    if(!(timelineSelector == 'TODO: ISOBMFF FORMAT')){
                        reject('NotSupportedError');

                    }
                }else if((newMediaObject.type == 'html5video') &&('streaming content delievered by DASH')){

                    // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>" 
                    if(timelineSelector == 'TODO periood relative Timeline'){

                    // "urn:dvb:css:timeline:mpd:period:rel:<ticks-per-second>:<period-id>"
                    }else if(timelineSelector == 'TODO periood relative Timeline'){
                        
                    }else{
                        reject('NotSupportedError');

                    }
                }else{
                    reject('NotSupportedError');
                }

                // UNCLEAR:
                // When content delivered via broadband and MSE is presented by an HTML5 video element, the media timeline
                // of the media resource of an HTML media element shall be supported as defined in clause 4.8.12.6 of the
                // HTML specification [3] and clause 13.1.2 of the present document. 

            }

            if(timelineSource == 'null'){
                if(!(originalMediaObject.type == 'html5video')){
                    reject('NotSupportedError');
                }
            }

            if(!(originalMediaObject.parentElement == newMediaObject.parentElement)){
                reject('NotSupportedError');
            }
            
            /*
            // check/debug if zIndex correct path is indeed .style.zIndex
            */
            if(!((originalMediaObject.style.zIndex > newMediaObject.style.zIndex) || ((originalMediaObject.style.zIndex < newMediaObject.style.zIndex)&&(newMediaObject.ownerDocument.visibility == 'hidden')))){
                reject('NotSupportedError');
            }

            // Definition 10.3.1
            if(minimumSwitchPerformanceRequired == ''){

            }else{
                // profile elements shall be present as child of the ta element

                // UNCLEAR and TODO / ADD in if clause:
                // if terminal (?) meets the requirement for profile 1 --> 5.3.2 of ETSI TS 103 736-2 [9]
                // if terminal (?) meets the requirement for profile 2 --> 5.3.2 of ETSI TS 103 736-2 [9]
                // additional profile elements --> ETSI TS 103 736-2 [9] listed first
                if((minimumSwitchPerformanceRequired.version == '1.1.1') && (minimumSwitchPerformanceRequired.children == 'ta Element')){
                    // Definition 10.2.3
                    // UNCLEAR: TEMI or PTS supported timeline check
                    if('TEMI OR PTS broadcast timeline supported'){
                        if(!(minimumSwitchPerformanceRequired.broadcastTimelineMonitoring == 'true')){
                            reject('NotSupportedError');
                        }
                    }else{
                        if(!minimumSwitchPerformanceRequired.broadcastTimelineMonitoring == 'false'){
                            reject('NotSupportedError');
                        }
                    }

                    // Definition 10.4 / Clause 4.2.6
                    // if the terminal is able to maintain state relating to broadcast video and audio after the end of a switch from broadcast to broadband
                    if('TODO: Definition 10.4 / Clause 4.2.6'){
                        if(!(minimumSwitchPerformanceRequired.GOPIndependentSwitchToBroadcast == 'true')){
                            reject('NotSupportedError');

                        }
                    }else{
                        if(!(minimumSwitchPerformanceRequired.GOPIndependentSwitchToBroadcast == 'false')){
                            reject('NotSupportedError');

                        }
                    }

                }else {
                    reject('NotSupportedError');
                }
            }
            // 3) 
            // UNSURE about the correct logic here - var called
            // if function was called already - resolve with InProgress
            // How can we make a global var for dynamic promise function like this?
            // Access previous call of the function? Is this possible?
            // Doesnt this terminate every other step behind ???
            if(!called){
                called = true;
                resolve('CallInProgress');
            }

            // 4)
            if(timelineSelector == null){
                return;
            }

            // 5)
            // Find indicator inside timelineSource for originalMediaObject or newMediaObject
            // UNCLEAR: How to async monitoring the timeline, what object is the timeline? 
            if(timelineSource.source == 'originalMediaObject'){
                //async monitoring the timeline of originalMediaObject
            }else{
                //async monitoring the timeline of newMediaObject
            }

            if(timelineSource == 'true' && ' != TEMI '){
                // UNCLEAR: what does that mean?
                // except for TEMI, the terminal will be monitoring the timeline as part of decoding the media concerned
            }else if('TEMI'){
                //if called before 
                if(MediaSynchroniser.initMediaSynchroniser == 'active'){
                    //async the MediaSynchroniser.initMediaSynchroniser
                }
            }


            // 6)
            // CHECK algorithm from 4.2.1 clause to check switchTime for the TODO
            if(timelineSelector != null && switchTime == 'TODO'){
                resolve('InThePast');
            }

            // 7) Switch preparation deadline
            // Definition 10.2.4
            // switchPreparationDeadline in seconds
            let switchPreparationDeadline = 2;
            // CHECK how to receive TEMI data --> then add 2,5s
            if(timelineSelector == 'TEMI timeline'){
                switchPreparationDeadline =+ 2,5;
            }
            
            // CHECK/DEBUG TIME CALCULATION
            if(Date.now() > (timelineSelector + switchPreparationDeadline)){
                resolve('SwitchPreparationDeadlinePassed');
            }

            // 8)
            // call algorithm for attempting to allocate suitable video and audio decoders for newMediaObject
            // ADD ALGORITHM video/audio decoder for newMediaObject
            // Definition 8.1.4.4 !!!
            async function videoAudioDecoderNewMediaObject(newMediaObject){
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
                resolve('NoSuitableMediaDecoderAvaiable');
            }

            videoAudioDecoderNewMediaObject(newMediaObject);


            // 9)
            return;

        })


        console.log(hbbPromise);
        hbbPromise.then((msg) => {
            console.log('Promise Resolved: '+ msg) 
        }).catch((error) =>{
            console.log('Promise Rejected: '+ error)
        })

        


    }

    // just for testing / not important
    NotSupportedError.prototype = Error.prototype;

    //call the method
    switchMediaPresentation(window.oipf.videoObject,null,null,null,null,null);

    
    // just add a listener on new <OBJECT> tags that will be animated when newly created ...
    window.document.addEventListener(window.CSS.supports('animation', '0s') ? 'animationstart' : 'webkitAnimationStart', onAnimationStart, true);

})(
    typeof self !== 'undefined' && self ||
    typeof window !== 'undefined' && window ||
    typeof global !== 'undefined' && global || {}
);
