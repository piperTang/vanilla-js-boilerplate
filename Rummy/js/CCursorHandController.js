function CCursorHandController(oParentContainer){
    var _oHandAnim;
    var _oSwipeContainer;
    var _oSwipeHand;
    var _oTextSwipe;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        
        var oData = {   // image to use
                        images: [s_oSpriteLibrary.getSprite("hand_anim")], 
                        framerate:30,
                        // width, height & registration point of each sprite
                        frames: {width: 156, height: 284, regX: 78, regY:142}, 
                        animations: {  start: 0,anim:[0,19]}

        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oHandAnim = createSprite(oSpriteSheet,"start",156,284,78, 142);
        _oHandAnim.visible = false;
        _oHandAnim.x = 0;
        _oHandAnim.y = CARD_HEIGHT/2;
        _oContainer.addChild(_oHandAnim);
        
        _oSwipeContainer = new createjs.Container();
        _oSwipeContainer.visible = false;
        _oContainer.addChild(_oSwipeContainer);

        _oSwipeHand = createBitmap(s_oSpriteLibrary.getSprite("hand_swipe"));
        _oSwipeContainer.addChild(_oSwipeHand);
        
        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("rgba(0,0,0,0.7)").drawRoundRect (CARD_WIDTH-100,CARD_HEIGHT/2 + 10,240,120,10);
        _oSwipeContainer.addChild(oBg);
        
        _oTextSwipe = new createjs.Text(TEXT_HELP_WASTE," 34px "+FONT,"#fff");
        _oTextSwipe.x = CARD_WIDTH+20;
        _oTextSwipe.y = CARD_HEIGHT/2 + 50;
        _oTextSwipe.textAlign = "center";
        _oTextSwipe.lineWidth = CARD_WIDTH;
        _oTextSwipe.textBaseline = "alphabetic";
        _oSwipeContainer.addChild(_oTextSwipe);  
    };
    
    this.showHandAnim = function(bVisible){
        if(bVisible){
            _oHandAnim.gotoAndPlay("anim");
        }else{
            _oHandAnim.gotoAndPlay("start");
        }
        
        _oHandAnim.visible = bVisible;
    };
    
    this.showHandSwipe = function(pStart,pEnd){
        _oSwipeContainer.visible = true;
        _oSwipeHand.x = pStart.x;
        _oSwipeHand.y = pStart.y;
        createjs.Tween.get(_oSwipeHand,{loop:-1}).to({x:pEnd.x,y: pEnd.y}, 1000, createjs.Ease.cubicOut).call(function(){
                                                                                                    _oSwipeHand.x = pStart.x;
                                                                                                    _oSwipeHand.y = pStart.y;
                                                                                                });
    };
    
    this.hideHandSwipe = function(){
        _oSwipeContainer.visible = false;
        createjs.Tween.removeTweens(_oSwipeHand);
    };
    
    this._init();
}