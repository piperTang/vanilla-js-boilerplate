function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oModeMenu;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        createjs.Touch.enable(s_oStage);
        s_oStage.preventSelection = false;
		
	s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
        
    };
    
    this.preloaderReady = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        this._loadImages();
        _bUpdate = true;
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: './sounds/',filename:'card_dealing',loop:false,volume:1, ingamename: 'card_dealing'});
        aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: './sounds/',filename:'alert',loop:false,volume:1, ingamename: 'alert'});
        aSoundsInfo.push({path: './sounds/',filename:'round_over',loop:false,volume:1, ingamename: 'round_over'});
        aSoundsInfo.push({path: './sounds/',filename:'rummy',loop:false,volume:1, ingamename: 'rummy'});
        aSoundsInfo.push({path: './sounds/',filename:'show_card',loop:false,volume:1, ingamename: 'show_card'});
        aSoundsInfo.push({path: './sounds/',filename:'win',loop:false,volume:1, ingamename: 'win'});
        aSoundsInfo.push({path: './sounds/',filename:'drop',loop:false,volume:1, ingamename: 'drop'});
        aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<aSoundsInfo.length; i++){
            s_aSounds[aSoundsInfo[i].ingamename] = new Howl({ 
                                                            src: [aSoundsInfo[i].path+aSoundsInfo[i].filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: aSoundsInfo[i].loop, 
                                                            volume: aSoundsInfo[i].volume,
                                                            onload: s_oMain.soundLoaded
                                                        });
        }
        
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_start","./sprites/but_start.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");       
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");   
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_yes","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no","./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("but_next","./sprites/but_next.png");
        s_oSpriteLibrary.addSprite("but_help","./sprites/but_help.png");
        s_oSpriteLibrary.addSprite("but_settings","./sprites/but_settings.png");
        s_oSpriteLibrary.addSprite("but_shuffle","./sprites/but_shuffle.png");
        s_oSpriteLibrary.addSprite("waste_pile","./sprites/waste_pile.png");
        s_oSpriteLibrary.addSprite("attach_card","./sprites/attach_card.png");
        s_oSpriteLibrary.addSprite("hand_anim","./sprites/hand_anim.png");
        s_oSpriteLibrary.addSprite("but_p2","./sprites/but_p2.png");
        s_oSpriteLibrary.addSprite("but_p3","./sprites/but_p3.png");
        s_oSpriteLibrary.addSprite("but_p4","./sprites/but_p4.png");
        s_oSpriteLibrary.addSprite("bg_select","./sprites/bg_select.jpg");
        s_oSpriteLibrary.addSprite("bg_nick","./sprites/bg_nick.png");
        s_oSpriteLibrary.addSprite("row_scoreboard","./sprites/row_scoreboard.png");
        s_oSpriteLibrary.addSprite("msg_box_wide","./sprites/msg_box_wide.png");
        s_oSpriteLibrary.addSprite("header_scoreboard","./sprites/header_scoreboard.png");
        s_oSpriteLibrary.addSprite("arrow_left","./sprites/arrow_left.png");
        s_oSpriteLibrary.addSprite("arrow_right","./sprites/arrow_right.png");
        s_oSpriteLibrary.addSprite("hand_swipe","./sprites/hand_swipe.png");
        s_oSpriteLibrary.addSprite("card_shadow","./sprites/cards/card_shadow.png");
        s_oSpriteLibrary.addSprite("double_icon","./sprites/double_icon.png");
        s_oSpriteLibrary.addSprite("but_exit_credits","./sprites/but_exit_credits.png");
        s_oSpriteLibrary.addSprite("msg_box_scoreboard","./sprites/msg_box_scoreboard.png");
        
        for(var i=0;i<55;i++){
            s_oSpriteLibrary.addSprite("card_"+i,"./sprites/cards/card_"+i+".png");
        }
        
        for(var k=1;k<60;k++){
            s_oSpriteLibrary.addSprite("rummy_anim_"+k,"./sprites/rummy_anim/rummy_anim_"+k+".png");
        }
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        //console.log("PERC: "+iPerc);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._onRemovePreloader = function(){

        _oPreloader.unload();

        s_oSoundTrack = playSound("soundtrack", 1,true);

        this.gotoMenu();
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };


    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    }; 
    
    this.gotoSelectPanel = function(){
       _oModeMenu = new CSelectNumPlayersPanel();
       _iState = STATE_MODE;
    };

    this.gotoGame = function(){
        _oGame = new CGame();   						
        _iState = STATE_GAME;
    };

    this.stopUpdateNoBlock = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
    };

    this.startUpdateNoBlock = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false; 
    };

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }

        
        if(_iState === STATE_GAME){
            _oGame.update();
        }

        s_oStage.update(event);
       
    };
    
    s_oMain = this;
    
    _oData = oData;
    
    for(var k=2;k<5;k++){
        CARD_TO_DEAL["player_"+k] = oData["num_cards_for_"+k+"_players"];
        if(CARD_TO_DEAL["player_"+k] <4){
            CARD_TO_DEAL["player_"+k] = 4;
        }else if(CARD_TO_DEAL["player_"+k] > 13){
            CARD_TO_DEAL["player_"+k] = 13;
        }
    }
    
    
    
    JOKER_AVAILABLE = oData.joker_available;
    
    SCORE_TO_REACH["player_2"] = oData.score_to_reach_for_2_players;
    SCORE_TO_REACH["player_3"] = oData.score_to_reach_for_3_players;
    SCORE_TO_REACH["player_4"] = oData.score_to_reach_for_4_players;
    
    SCORE_ACE = oData.score_ace;
    SCORE_JOKER = oData.score_joker;
    ACE_HIGH = oData.ace_high;
    GOING_RUMMY_RULE = oData.going_rummy_rule;
    
    MIN_OPENING_VALUE = oData.min_point_for_opening;
    ENABLE_FULLSCREEN = oData.fullscreen;
    
    this.initContainer();
}

var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_oCanvas;
var s_bFullscreen = false;
var s_aSounds;
var s_oGameSettings;
var s_iNumPlayers;
var s_aPlayerNames;