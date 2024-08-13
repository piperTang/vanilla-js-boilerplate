function CScoreBoard(iX,iY,oParentContainer){
    var _aRows;
    var _aNicknames;
    var _aScores;
    
    var _oContainer;
    var _oDoubleIcon;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY){
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        this._initRows();
        
        _oContainer.regX = _oContainer.getBounds().width/2;
        _oContainer.regY = _oContainer.getBounds().height/2;
    };
    
    this._initRows = function(){
        //SCOREBOARD HEADER
        var oSpriteHeader = s_oSpriteLibrary.getSprite("header_scoreboard");
        var oHeader = createBitmap(oSpriteHeader);
        _oContainer.addChild(oHeader);
        
        
        var oTextNick = new createjs.Text(TEXT_NICK,"26px "+FONT,"#fff");
        oTextNick.x = 180;
        oTextNick.y = 36;
        oTextNick.textAlign = "center";
        oTextNick.textBaseline = "alphabetic";
        _oContainer.addChild(oTextNick);  
        
        var oTextScore = new createjs.Text(TEXT_SCORE,"26px "+FONT,"#fff");
        oTextScore.x = 440;
        oTextScore.y = oTextNick.y;
        oTextScore.textAlign = "center";
        oTextScore.textBaseline = "alphabetic";
        _oContainer.addChild(oTextScore); 
        
        
        var oTextWin = new createjs.Text(TEXT_WIN,"26px "+FONT,"#fff");
        oTextWin.x = 590;
        oTextWin.y = oTextNick.y;
        oTextWin.textAlign = "center";
        oTextWin.textBaseline = "alphabetic";
        _oContainer.addChild(oTextWin); 
        
        
        
        //SCOREBOARD ROWS
        var oSpriteBg = s_oSpriteLibrary.getSprite("row_scoreboard");
        var oData = {   // image to use
                        images: [oSpriteBg], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteBg.width, height: oSpriteBg.height/4}, 
                        animations: {  state_idle:0,state_win_round:1,state_win_game:2,state_lose_round:3}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        
        _aRows = new Array();
        _aNicknames = new Array();
        _aScores = new Array();
        var iY = oSpriteHeader.height;
        for(var i=0;i<s_iNumPlayers;i++){
            var oRow = createSprite(oSpriteSheet,"state_idle",0,0,oSpriteBg.width,oSpriteBg.height/4);
            oRow.y = iY;
            _oContainer.addChild(oRow);
            
            var oText = new createjs.Text(s_aPlayerNames[i]," 40px "+FONT,"#fff");
            oText.x = oTextNick.x;
            oText.y = iY+55;
            oText.textAlign = "center";
            oText.textBaseline = "alphabetic";
            _oContainer.addChild(oText);  
            
            var oTextScore = new createjs.Text("0/"+SCORE_TO_REACH["player_"+s_iNumPlayers]," 40px "+FONT,"#fff");
            oTextScore.x = 440;
            oTextScore.y = oText.y;
            oTextScore.textAlign = "center";
            oTextScore.textBaseline = "alphabetic";
            _oContainer.addChild(oTextScore);  
            
            iY += oSpriteBg.height/4;
            
            _aRows[i] = oRow;
            _aNicknames[i] = oText;
            _aScores[i] = oTextScore;
        }
        
        _oDoubleIcon = createBitmap(s_oSpriteLibrary.getSprite("double_icon"));
        _oDoubleIcon.x = 554;
        _oContainer.addChild(_oDoubleIcon);
    };
    
    this.show = function(aScores,aStates,bRummy){
        if(bRummy){
            _oDoubleIcon.visible = true;
        }else{
            _oDoubleIcon.visible = false;
        }
        
        this.refreshBoard(aScores,aStates,bRummy);
        
        _oContainer.visible = true;
    };
    
    this.refreshBoard = function(aScores,aStates,bRummy){
        for(var i=0;i<s_iNumPlayers;i++){
            _aRows[i].gotoAndStop(aStates[i]);
            _aScores[i].text = aScores[i]+"/"+SCORE_TO_REACH["player_"+s_iNumPlayers];
            if(bRummy && aStates[i] === "state_win_round"){
                _oDoubleIcon.y = _aScores[i].y-44;
            }
        }
    };
    
    this._init(iX,iY);
}