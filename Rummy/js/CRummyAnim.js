function CRummyAnim(iX,iY,oParentContainer){
    var _oLogo;
    var _oText;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY){
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);
        
        var aSprites = new Array();
        for(var k=1;k<60;k++){
            aSprites.push(s_oSpriteLibrary.getSprite("rummy_anim_"+k));
        }
        
       
        var oData = {   
                        images: aSprites, 
                        // width, height & registration point of each sprite
                        frames: {width: aSprites[0].width, height: aSprites[0].height}, 
                        animations: {start:0,anim:[0,58,"stop_anim"],stop_anim:58}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oLogo = createSprite(oSpriteSheet,"start", 0,0,aSprites[0].width,aSprites[0].height);
        _oContainer.addChild(_oLogo);
        
        _oText = new createjs.Text("", "74px " + FONT, "#fff");
        _oText.x = aSprites[0].width/2;
        _oText.y = aSprites[0].height + 50;
        _oText.textAlign = "center";
        _oText.textBaseline = "alphabetic";
        _oContainer.addChild(_oText);
        
        _oContainer.regX = aSprites[0].width/2;
        _oContainer.regY = aSprites[0].height/2;
    };
    
    this.show = function(bMenu){
        playSound("rummy",1,false);
        
        if(bMenu){
            _oText.text = "";
        }else{
            _oText.alpha = 0;
            _oText.text = TEXT_DOUBLE;
            createjs.Tween.get(_oText).wait(500).to({alpha:1}, 1000, createjs.Ease.cubicOut);
            createjs.Tween.get(_oContainer).wait(3000).to({scaleX:0.1,scaleY:0.1,alpha:0}, 500, createjs.Ease.cubicIn).call(function(){
                                                                                _oContainer.visible = false;
                                                                        });
        }
        
        //_oContainer.alpha = 0.5;
        //_oContainer.scaleX = _oContainer.scaleY = 0.1;
        _oContainer.visible = true;
        
        _oLogo.gotoAndPlay("anim")
        
        
    };
    
    this._init(iX,iY);
}