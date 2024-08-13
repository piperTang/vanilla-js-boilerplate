function CInterface(){
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _oAudioToggle;
    var _oButFullscreen;
    var _oButExit;
    var _oButHelp;
    var _oButShuffle;
    var _oGUIExpandible;
    var _oHelpPanel;

    var _pStartPosExit;
    var _pStartPosShuffle;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    this._init = function(){                  
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
	_pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2) -10,y:(oSprite.height/2) +10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _pStartPosAudio = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width/2,y:_pStartPosAudio.y};
        }else{
            _pStartPosFullscreen = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oButHelp = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,s_oSpriteLibrary.getSprite("but_help"),s_oStage);
        _oButHelp.addEventListener(ON_MOUSE_UP,this._onHelp,this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_settings');
        _oGUIExpandible = new CGUIExpandible(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oGUIExpandible.addButton(_oButExit);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oGUIExpandible.addButton(_oAudioToggle);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oGUIExpandible.addButton(_oButFullscreen);
        }

        _oGUIExpandible.addButton(_oButHelp);
        
        
        var oSprite = s_oSpriteLibrary.getSprite("but_shuffle");
        _pStartPosShuffle = {x:_pStartPosExit.x,y:CANVAS_HEIGHT-oSprite.height/2 - 10};
        _oButShuffle = new CGfxButton(_pStartPosShuffle.x,_pStartPosShuffle.y,oSprite,s_oStage);
        _oButShuffle.addEventListener(ON_MOUSE_UP,this._onShuffle,this);
        
        _oHelpPanel = new CHelpPanel(s_oStage);
    };
    
    this.unload = function(){
        _oGUIExpandible.unload();
        _oButShuffle.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButHelp.unload();
        

        s_oInterface = null;
    };
        
    this.refreshButtonPos = function(){
        _oGUIExpandible.refreshPos();
        _oButShuffle.setPosition(_pStartPosShuffle.x-s_iOffsetX,_pStartPosShuffle.y-s_iOffsetY);
    };
    
    this.showHelp = function(){
        _oHelpPanel.show();
    };

    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        s_oGame.onExit();
    };
    
    this._onHelp = function(){
        s_oGame.setUpdate(false);
        _oHelpPanel.show();
        
        var tweenObjs = createjs.Tween._tweens
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };
        
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    this._onShuffle = function(){
        s_oGame.onShuffle();
    };

    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;