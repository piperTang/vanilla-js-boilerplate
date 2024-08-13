function CAlertText(){
    var _oText;
    var _oBg;
    var _oContainer;
    
    this._init = function(){
        
        _oContainer = new createjs.Container();
        _oContainer.x =  CANVAS_WIDTH/2;
        _oContainer.y = CANVAS_HEIGHT/2;
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        _oBg = new createjs.Shape();
        _oBg.graphics.beginFill("rgba(0,0,0,0.7)").drawRoundRect (-300,0,600,200,10);
        _oContainer.addChild(_oBg);

        
        _oText = new createjs.Text(""," 40px "+FONT,"#fff");
        _oText.y = 30;
        _oText.lineWidth = 500;
        _oText.textAlign = "center";
        _oText.textBaseline = "middle";
        _oContainer.addChild(_oText);  
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };
    
    this.show = function(szText){
        if(createjs.Tween.hasActiveTweens(_oContainer)){
            return;
        }
        
        _oText.text = szText;
        
        var iHeight = _oText.getBounds().height + 20;
        _oBg.graphics.clear();
        _oBg.graphics.beginFill("rgba(0,0,0,0.7)").drawRoundRect (-300,0,600,iHeight,10);
        _oContainer.visible = true;
        
        _oContainer.scaleX = _oContainer.scaleY = 0.1;
        
        playSound("alert",1,false);
        
        new createjs.Tween.get(_oContainer).to({scaleX:1,scaleY:1},600, createjs.Ease.cubicOut)
                .wait(1500).to({scaleX:0.1,scaleY:0.1},500, createjs.Ease.cubicIn).call(function(){_oContainer.visible = false;});
    };
    
    this._init();
}