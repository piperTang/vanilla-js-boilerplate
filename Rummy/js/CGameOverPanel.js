function CGameOverPanel(){
    var _oListenerBlock;
    var _oFade;
    var _oTitleText;
    
    var _oButHome;
    var _oButNext;
    var _oScoreBoard;
    var _oContainer;
    var _oContainerPanel;
    
    var _oThis = this;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oListenerBlock = _oFade.on("click",function(){});
        _oFade.alpha = 0;
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oContainer.addChild(_oFade);
        
        _oContainerPanel = new createjs.Container();
        _oContainerPanel.visible = false;
        _oContainer.addChild(_oContainerPanel);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite("msg_box_scoreboard");
        var oBg = createBitmap(oSpriteBg);
        oBg.x = CANVAS_WIDTH/2;
        oBg.y = CANVAS_HEIGHT/2;
        oBg.regX = oSpriteBg.width/2;
        oBg.regY = oSpriteBg.height/2;
        _oContainerPanel.addChild(oBg);
        
        
        _oTitleText = new createjs.Text(TEXT_GAME_OVER," 80px "+FONT,"#fff");
        _oTitleText.x = CANVAS_WIDTH/2;
        _oTitleText.y = CANVAS_HEIGHT/2-270;
        _oTitleText.textAlign = "center";
        _oTitleText.textBaseline = "alphabetic";
        _oContainerPanel.addChild(_oTitleText);  
        
        _oScoreBoard = new CScoreBoard(oBg.x,oBg.y-30,_oContainerPanel);
        
        _oButHome = new CGfxButton(CANVAS_WIDTH/2 - 250,CANVAS_HEIGHT/2+250,s_oSpriteLibrary.getSprite("but_home"),_oContainerPanel);
        _oButHome.addEventListener(ON_MOUSE_UP,this._onHome,this);
        
        _oButNext = new CGfxButton(CANVAS_WIDTH/2+250,CANVAS_HEIGHT/2+250,s_oSpriteLibrary.getSprite("but_next"),_oContainerPanel);
        _oButNext.addEventListener(ON_MOUSE_UP,this._onNext,this);
    };
    
    this.unload = function(){
        _oButHome.unload();
        _oButNext.unload();
        _oFade.off("click",_oListenerBlock);
    };
    
    this.show = function(iWinner,aTotScores,bRummy,iDelay){
        var aStates = new Array();
        for(var i=0;i<s_iNumPlayers;i++){
            if(iWinner === i){
                aStates[i] = SCOREBOARD_WIN_ROUND;
            }else{
                aStates[i] = SCOREBOARD_LOSE_ROUND;
            }
        }
        
        playSound("round_over",1,false);
        
        _oContainer.visible = true;
        _oContainerPanel.alpha = 0;
        _oFade.alpha = 0;
        createjs.Tween.get(_oFade).wait(iDelay).to({alpha:0.7}, 500).call(function(){
                                                    _oScoreBoard.show(aTotScores,aStates,bRummy);
                                                    _oContainerPanel.alpha = 0;
                                                    _oContainerPanel.visible = true;
                                                    createjs.Tween.get(_oContainerPanel).to({alpha:1}, 300);
                                                }); 
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };
    
    this._onHome = function(){
        _oThis.unload();
        s_oMain.gotoMenu();
    };
    
    this._onNext = function(){
        _oThis.hide();
        s_oGame.restart();
    };
    
    this._init();
}