function CNickLabel(pPos,oDirMov,iRot,szText,oParentContainer){
    var _pPos = pPos;
    var _oDirMov = oDirMov;
    
    var _oText;
    var _oBg;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(pPos,iRot,szText){
        _oContainer = new createjs.Container();
        _oContainer.x = pPos.x;
        _oContainer.y = pPos.y;
        _oContainer.rotation = iRot;
        _oParentContainer.addChild(_oContainer);
        
        
        var oSpriteBg = s_oSpriteLibrary.getSprite("bg_nick");
        var oData = {   // image to use
                        images: [oSpriteBg], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteBg.width, height: oSpriteBg.height/2}, 
                        animations: {  state_off:0,state_on:1}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        
        var iWidthNick = oSpriteBg.width;
        var iHeightNick = oSpriteBg.height/2;
        _oBg = createSprite(oSpriteSheet,"state_off",0,0,iWidthNick,iHeightNick);
        _oContainer.addChild(_oBg);
        
        var iStartSize = 40;
        _oText = new createjs.Text(szText, iStartSize+"px " + FONT, "#fff");
        _oText.x = iWidthNick/2;
        _oText.y = 38;
        _oText.textAlign = "center";
        _oText.textBaseline = "alphabetic";
        _oContainer.addChild(_oText);
        
        this._resizeFont(iStartSize,iWidthNick);
        
        _oContainer.regX = iWidthNick/2;
        _oContainer.regY = iHeightNick;

        switch(iRot){
            case 0:{
                    _pPos = {x:_pPos.x,y:_pPos.y+CARD_MOVE_UP_OFFSET};
                    break;
            }
            case 90:{
                    _pPos = {x:_pPos.x-CARD_MOVE_UP_OFFSET,y:_pPos.y};
                    break;
            }
            case 180:{
                    _pPos = {x:_pPos.x,y:_pPos.y-CARD_MOVE_UP_OFFSET};
                    break;
            }
            case -90:{
                    _pPos = {x:_pPos.x+CARD_MOVE_UP_OFFSET,y:_pPos.y};
                    break;
            }
        }
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.refreshButtonPos = function(){
        _oContainer.x = _pPos.x + (s_iOffsetX*_oDirMov.dir_x);
        _oContainer.y = _pPos.y + (s_iOffsetY*_oDirMov.dir_y);
    };
    
    this._resizeFont = function(iStartSize,iWidthNick){
        while(_oText.getBounds().width > iWidthNick){
            iStartSize -= 2;
            _oText.font = iStartSize+"px "+ FONT;
        }
    };
    
    this.refreshText = function(szText){
        _oText.text = szText;
    };
    
    this.highlight = function(bOn){
        if(bOn){
            _oBg.gotoAndStop("state_on");
        }else{
            _oBg.gotoAndStop("state_off");
        }
    };
    
    this._init(pPos,iRot,szText);
    
}