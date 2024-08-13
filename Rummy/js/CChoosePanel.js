function CChoosePanel(){
    var _iStartY;
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oListener;
    var _oButYes;
    var _oButNo;
    var _oMsg;
    var _oFade;
    var _oPanelContainer;
    var _oContainer;
    
    this._init = function () {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener =_oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        _oPanelContainer = new createjs.Container();   
        _oContainer.addChild(_oPanelContainer);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        var oBg = createBitmap(oSpriteBg);
        oBg.regX = oSpriteBg.width * 0.5;
        oBg.regY = oSpriteBg.height * 0.5;
        _oPanelContainer.addChild(oBg);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = _iStartY = - oSpriteBg.height/2;    
        
        _oMsg = new createjs.Text("", "28px " + FONT, "#fff");
        _oMsg.x = 0;
        _oMsg.y = -50;
        _oMsg.textAlign = "center";
        _oMsg.textBaseline = "alphabetic";
        _oMsg.lineWidth = oSpriteBg.width -100;
        _oPanelContainer.addChild(_oMsg);
        
        
        _oButNo = new CGfxButton(- 200, 130, s_oSpriteLibrary.getSprite('but_no'), _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
        
        _oButYes = new CGfxButton(200, 130, s_oSpriteLibrary.getSprite('but_yes'), _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);
        
        createjs.Tween.get(_oPanelContainer).to({y: CANVAS_HEIGHT/2}, 1000, createjs.Ease.cubicOut);
    };
    
    this.unload = function(){
        _oButNo.unload();
        _oButYes.unload();
        _oFade.off("click",_oListener);
    };
    
    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };
    
    this.show = function (szText) {
        _oMsg.text = szText;
        _oPanelContainer.y = _iStartY;
        _oContainer.visible = true;
        createjs.Tween.get(_oPanelContainer).to({y: CANVAS_HEIGHT/2}, 500, createjs.Ease.cubicOut);
    };
    
    this._onButNo = function(){
        _oContainer.visible = false;
        
        if (_aCbCompleted[ON_BUT_NO_DOWN]) {
            _aCbCompleted[ON_BUT_NO_DOWN].call(_aCbOwner[ON_BUT_NO_DOWN]);
        }
    };
    
    this._onButYes = function(){
        
        
        _oContainer.visible = false;
        
        if (_aCbCompleted[ON_BUT_YES_DOWN]) {
            _aCbCompleted[ON_BUT_YES_DOWN].call(_aCbOwner[ON_BUT_YES_DOWN]);
        }
    };
    
    this._init();
}