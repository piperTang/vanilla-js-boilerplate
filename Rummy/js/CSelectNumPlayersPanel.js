function CSelectNumPlayersPanel(){
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pStartPosExit;
    
    var _oButExit;
    var _oButPlayer2;
    var _oButPlayer3;
    var _oButPlayer4;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oContainer;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_select"));
        _oContainer.addChild(oBg);
        
        
        
        var oText = new createjs.Text(TEXT_SELECT_NUM," 80px "+FONT,"#fff");
        oText.x = CANVAS_WIDTH/2;
        oText.y = CANVAS_HEIGHT/2-250;
        oText.lineWidth = 960;
        oText.textAlign = "center";
        oText.textBaseline = "alphabetic";
        _oContainer.addChild(oText);  
        
        
        _oButPlayer2 = new CGfxButton(CANVAS_WIDTH/2 - 300,CANVAS_HEIGHT/2+100,s_oSpriteLibrary.getSprite("but_p2"),_oContainer);
        _oButPlayer2.addEventListener(ON_MOUSE_UP,this._onPlayer2,this);
        
        _oButPlayer3 = new CGfxButton(CANVAS_WIDTH/2,CANVAS_HEIGHT/2+100,s_oSpriteLibrary.getSprite("but_p3"),_oContainer);
        _oButPlayer3.addEventListener(ON_MOUSE_UP,this._onPlayer3,this);
        
        _oButPlayer4 = new CGfxButton(CANVAS_WIDTH/2 + 300,CANVAS_HEIGHT/2+100,s_oSpriteLibrary.getSprite("but_p4"),_oContainer);
        _oButPlayer4.addEventListener(ON_MOUSE_UP,this._onPlayer4,this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
	_pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2) -10,y:(oSprite.height/2) +10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - (oSprite.height) - 10, y: (oSprite.height/2) + 10};
            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);    
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }
        
        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oContainer.addChild(oFade);
        
        createjs.Tween.get(oFade).to({alpha:0}, 1000).call(function(){oFade.visible = false;}); 
        
        this.refreshButtonPos();
    };
    
    this.unload = function(){
        _oButPlayer2.unload();
        _oButPlayer3.unload();
        _oButPlayer4.unload();
        _oButExit.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.unload();
        }
        
        s_oStage.removeAllChildren();
        
        s_oSelectPanel = null;
    };
    
    this.refreshButtonPos = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }        
        
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,_pStartPosExit.y + s_iOffsetY);
    };
    
    
    this._onPlayer2 = function(){
        s_iNumPlayers = 2;
        s_aPlayerNames = [TEXT_PLAYER+" 1",TEXT_PLAYER+" 2"];
        
        s_oSelectPanel.unload();
        s_oMain.gotoGame();
    };
    
    this._onPlayer3 = function(){
        s_iNumPlayers = 3;
        s_aPlayerNames = [TEXT_PLAYER+" 1",TEXT_PLAYER+" 2",TEXT_PLAYER+" 3"];
        
        s_oSelectPanel.unload();
        s_oMain.gotoGame();
    };
    
    this._onPlayer4 = function(){
        s_iNumPlayers = 4;
        s_aPlayerNames = [TEXT_PLAYER+" 1",TEXT_PLAYER+" 2",TEXT_PLAYER+" 3",TEXT_PLAYER+" 4"];
        
        s_oSelectPanel.unload();
        s_oMain.gotoGame();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
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
    
    this._onExit = function(){
        s_oSelectPanel.unload();
        s_oMain.gotoMenu();
    };
    
    s_oSelectPanel = this;
    
    this._init();
}

var s_oSelectPanel = null;