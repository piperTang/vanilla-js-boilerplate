function CCard(bFolded,iType,pStartingPoint,szFrame,iValue,iSuit,oParentContainer){
    var _bFolded;
    var _bClickable;
    var _bDragging;
    var _iState = -1;
    var _iTimeMoving;
    var _iType;
    var _iNumBlocks;
    var _iCurRow;
    var _iPrevRot;
    var _iComboIndex;
    var _szFrame;
    var _iValue;
    var _iSuit;
    var _iTimeElaps;
    var _pStartingPoint;
    var _pEndingPoint;
    var _oPressPoint;
    var _oCurMovePoint;
    var _oListenerPress;
    var _oListenerMove;
    var _oListenerRelease;
    
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oThis = this;
    var _oShadow;
    var _oCardSprite;
    var _oContainer;
    var _oParentContainer;
                
    this._init = function(bFolded,iType,pStartingPoint,szFrame,iValue,iSuit){
        _bFolded = bFolded;
        _iType = iType;
        _iNumBlocks = 0;
        _iPrevRot = 0;
        _bClickable = false;
        _bDragging = false;
        
        _oContainer = new createjs.Container();
        _oContainer.x = pStartingPoint.getX();
        _oContainer.y = pStartingPoint.getY();
        _oParentContainer.addChild(_oContainer);
        
        var oSpriteShadow = s_oSpriteLibrary.getSprite("card_shadow");
        _oShadow = createBitmap(oSpriteShadow);
        _oShadow.regX = oSpriteShadow.width/2;
        _oShadow.regY = oSpriteShadow.height/2;
        _oShadow.x = 8;
        _oShadow.y = 8;
        _oShadow.alpha = 0;
        _oContainer.addChild(_oShadow);

        var aSprites = new Array();
        for(var i=0;i<55;i++){
            aSprites.push(s_oSpriteLibrary.getSprite("card_"+i));
        }
        var oData = {   // image to use
                        images: aSprites, 
                        // width, height & registration point of each sprite
                        frames: {width: CARD_WIDTH, height: CARD_HEIGHT, regX: CARD_WIDTH/2, regY: CARD_HEIGHT/2}, 
                        animations: {  card_0: 0,card_1:1,card_2:2,card_3:3,card_4:4,card_5:5,card_6:6,card_7:7,
                                       card_8:8,card_9:9,card_10:10,card_11:11,card_12:12,
                                       card_13: 13,card_14:14,card_15:15,card_16:16,card_17:17,card_18:18,card_19:19,
                                       card_20:20, card_21:21,card_22:22,card_23:23,card_24:24,card_25:25,
                                       card_26: 26,card_27:27,card_28:28,card_29:29,card_30:30,card_31:31,card_32:32,
                                       card_33:33, card_34:34,card_35:35,card_36:36,card_37:37,card_38:38,
                                       card_39: 39,card_40:40,card_41:41,card_42:42,card_43:43,card_44:44,card_45:45,
                                       card_46:46, card_47:47,card_48:48,card_49:49,card_50:50,card_51:51,joker:52,joker2:53,back:54}
                        
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oCardSprite = createSprite(oSpriteSheet,bFolded?"back":szFrame,CARD_WIDTH/2,CARD_HEIGHT/2,CARD_WIDTH, CARD_HEIGHT);
        _oCardSprite.stop();
        _oContainer.addChild(_oCardSprite);

        _oListenerPress =  _oCardSprite.on("mousedown",this._onPress);
        
        _iTimeElaps=0;
        _szFrame = szFrame;
        _iValue=iValue;
        _iSuit = iSuit;
   
        _pStartingPoint = pStartingPoint;

        _aCbCompleted=new Array();
        _aCbOwner =new Array();
    };
    
    this.unload = function(){
        
        _oCardSprite.off("mousedown",_oListenerPress);
        _oCardSprite.off("pressmove",_oListenerMove);
        _oCardSprite.off("pressup",_oListenerRelease);
        
        _pStartingPoint=null;
        _pEndingPoint=null;
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this.setClickable = function(bClickable){
        _bClickable = bClickable;
    };
    
    this.setRowInBoard = function(iRow){
        _iCurRow = iRow;
    };
    
    this.moveOnXByOffset = function(iOffset,iTime){
        var iNewX = _oContainer.x+iOffset;
        createjs.Tween.get(_oContainer).to({x:iNewX}, iTime,createjs.Ease.cubicOut);
    };
    
    this.moveOnX = function(iNewX,iTime){
        
        createjs.Tween.get(_oContainer).to({x:iNewX}, iTime,createjs.Ease.cubicIn).call(function(){
                                                                                    if(_aCbCompleted[ON_CARD_MOVE_X_END]){
                                                                                        _aCbCompleted[ON_CARD_MOVE_X_END].call(_aCbOwner[ON_CARD_MOVE_X_END],_oThis);
                                                                                    }
                                                                                });
    };
    
    this.moveOnYByOffset = function(iOffset,bCallBack){
        var iNewY = _oContainer.y+iOffset;
        createjs.Tween.get(_oContainer).to({y:iNewY}, TIME_CARD_MOVE_Y,createjs.Ease.cubicOut).call(function(){                                                                                    
                                                                                        if(_aCbCompleted[ON_CARD_MOVE_UP_END] && bCallBack){
                                                                                            _aCbCompleted[ON_CARD_MOVE_UP_END].call(_aCbOwner[ON_CARD_MOVE_UP_END],_oThis);
                                                                                        }
                                                                                });
    };
    
    this.initMov = function(iType,iState,iTime,iRot,pEndingPoint,bShow){
        _oContainer.visible = true;

        if(bShow){
            this.showCard();
        }
        
        playSound("card_dealing",1,false);

        _pEndingPoint = new CVector2(pEndingPoint.x,pEndingPoint.y);
        _iTimeMoving = iTime;
        _iState=iState;
        _iType = iType;
        _iPrevRot = iRot;
        
        createjs.Tween.get(_oContainer).to({rotation:iRot}, _iTimeMoving,createjs.Ease.cubicOut);
    };
    
    this.changeValue = function(szValue){
        _oCardSprite.gotoAndStop(szValue);
    };
    
    this.setValue = function(){
        _oCardSprite.gotoAndStop(_szFrame);
        var oParent = this;
        createjs.Tween.get(_oCardSprite).to({scaleX:1}, 100).call(function(){oParent.cardShown()});
    };
    
    this.setDepth = function(iDepth){
        _oParentContainer.setChildIndex(_oContainer,iDepth);
    };
    
    this.setScale = function(iScale){
        createjs.Tween.removeTweens(_oCardSprite);
        createjs.Tween.removeTweens(_oShadow);
        _oShadow.scaleX = _oShadow.scaleY = iScale;
        _oCardSprite.scaleX = _oCardSprite.scaleY = iScale;
    };
    
    this.tweenScale = function(iScale){

        if(createjs.Tween.hasActiveTweens(_oCardSprite)){
            return;
        }
        createjs.Tween.get(_oShadow).to({scaleX:iScale,scaleY:iScale}, 400,createjs.Ease.cubicOut);
        createjs.Tween.get(_oCardSprite).to({scaleX:iScale,scaleY:iScale}, 400,createjs.Ease.cubicOut).call(function(){
                                                                                        if(_aCbCompleted[ON_CARD_END_SCALE]){
                                                                                            _aCbCompleted[ON_CARD_END_SCALE].call(_aCbOwner[ON_CARD_END_SCALE],_oThis,_iComboIndex);
                                                                                        }
                                                                                });
    };
    
    this.setRotation = function(iRot){
        _oContainer.rotation = iRot;
    };
    
    this.changeType = function(iType){
        _iType = iType;
    };
    
    this.setComboIndex = function(iIndex){
        _iComboIndex = iIndex;
    };
    
    this.showCard = function(){
        _bFolded = false;
        var oParent = this;
        createjs.Tween.get(_oCardSprite).to({scaleX:0.1}, 100).call(function(){oParent.setValue()});
        
        playSound("show_card",1,false);
    };
		
    this.cardShown = function(){
        if(_aCbCompleted[ON_CARD_SHOWN]){
            _aCbCompleted[ON_CARD_SHOWN].call(_aCbOwner[ON_CARD_SHOWN]);
        }
    };
    
    this.tremble = function(){
        createjs.Tween.get(_oContainer).to({rotation:10}, 40,createjs.Ease.cubicOut).to({rotation:-10},80).to({rotation:10},80).to({rotation:-10},80).to({rotation:0},40);

    };
    
    this._onPress = function(evt){
        if(!_bClickable){
            return;
        }

        if(_iType === CARD_HAND){
            _oThis.moveOnYByOffset(-CARD_HEIGHT_OFFSET_IN_HAND,false);
            _oPressPoint = {x:s_oStage.mouseX,y:s_oStage.mouseY};

        }else if(_iType === CARD_WASTE){
            _oContainer.rotation = 0;
            _oPressPoint = {x:s_oStage.mouseX,y:s_oGame.getPlayerHandY(0)};
        }
        
        _oListenerMove = _oCardSprite.on("pressmove",_oThis._onPressMove);
        _oListenerRelease = _oCardSprite.on("pressup",_oThis._onRelease);
        
        _oShadow.alpha = 1;
    };
    
    this._onPressMove = function(evt){       
        if(!_bClickable || createjs.Tween.hasActiveTweens(_oContainer)){
            return;
        }
        
        _oCurMovePoint = {x:s_oStage.mouseX,y:s_oStage.mouseY};

        var pPos = _oParentContainer.globalToLocal(evt.stageX,evt.stageY);

        _oContainer.x = pPos.x;
        _oContainer.y = pPos.y;

        if(_iType === CARD_HAND){
            if( Math.abs(_oPressPoint.y - evt.stageY) > CARD_HEIGHT/4){
                if(_aCbCompleted[ON_CARD_DRAGGING]){
                    _aCbCompleted[ON_CARD_DRAGGING].call(_aCbOwner[ON_CARD_DRAGGING],_oThis);
                }
            }else if((_oCurMovePoint.x-_oPressPoint.x) < -CARD_WIDTH_OFFSET_IN_HAND){
                //SHIFT LEFT
                _oPressPoint = _oCurMovePoint;
                if(_aCbCompleted[ON_CARD_SWAP]){
                    _aCbCompleted[ON_CARD_SWAP].call(_aCbOwner[ON_CARD_SWAP],_oThis,"left");
                }
            }else if((_oCurMovePoint.x-_oPressPoint.x) > CARD_WIDTH_OFFSET_IN_HAND){
                //SHIFT RIGHT
                _oPressPoint = _oCurMovePoint;
                if(_aCbCompleted[ON_CARD_SWAP]){
                    _aCbCompleted[ON_CARD_SWAP].call(_aCbOwner[ON_CARD_SWAP],_oThis,"right");
                }
            }
        }else{
            if(_aCbCompleted[ON_CARD_DRAGGING]){
                _aCbCompleted[ON_CARD_DRAGGING].call(_aCbOwner[ON_CARD_DRAGGING],_oThis);
            }
        }
        
    };
    
    this._onRelease = function(evt){
        if(!_bClickable){
            return;
        }

        
        _oCardSprite.off("pressmove",_oListenerMove);
        _oCardSprite.off("pressup",_oListenerRelease);

        _oShadow.alpha = 0;
        createjs.Tween.removeTweens(_oContainer);

        if(_aCbCompleted[ON_CARD_RELEASE]){
            _aCbCompleted[ON_CARD_RELEASE].call(_aCbOwner[ON_CARD_RELEASE],_oThis);
        }
    };
    
    this.setPos = function(pPos){
        _oContainer.x = pPos.x;
        _oContainer.y = pPos.y;
    };
    
    this.resetPosition = function(){
        _oContainer.x = _pStartingPoint.getX();
        _oContainer.y = _pStartingPoint.getY();
        _oContainer.rotation = _iPrevRot;
    };
    
    this.printCardInfo = function(){
        console.log("value--->"+_iValue+" suit---->"+_iSuit)
    };
    
    this.setX = function(iX){
        _oContainer.x = iX;
    };
    
    this.setY = function(iY){
        _oContainer.y = iY;
    };
	
    this.getValue = function(){
        return _iValue;
    };
    
    this.getSuit = function(){
        return _iSuit;
    };

    this.getFrame = function(){
        return _szFrame;
    };

    this.isClickable = function(){
        return _bClickable;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getScale = function(){
        return _oCardSprite.scaleX;
    };
    
    this.getDepth = function(){
        return _oParentContainer.getChildIndex(_oContainer);
    };
    
    this.getContainer = function(){
        return _oContainer;
    };
    
    this.getRow = function(){
        return _iCurRow;
    };
    
    this.getStartingPos = function(){
        return _pStartingPoint;
    };
    
    this.isFolded = function(){
        return _bFolded;
    };
    
    this.getType = function(){
        return _iType;
    };
    
    this.isUpdating = function(){
        return _iState===-1?false:true;
    };
    
    this._updateDealing = function(){
        _iTimeElaps+=s_iTimeElaps;

        if (_iTimeElaps > _iTimeMoving) {
                _iState=-1;
                _iTimeElaps = 0;

                _oContainer.x=_pEndingPoint.getX();
                _oContainer.y=_pEndingPoint.getY();

                _pStartingPoint = new CVector2(_oContainer.x,_oContainer.y);
                if(_aCbCompleted[ON_CARD_ANIMATION_ENDING]){
                    
                    _aCbCompleted[ON_CARD_ANIMATION_ENDING].call(_aCbOwner[ON_CARD_ANIMATION_ENDING],_iType,_oThis);
                }      
        }else{
                this.visible=true;
                var fLerp = easeInOutCubic( _iTimeElaps, 0, 1, _iTimeMoving);
                
                var oPoint = new CVector2();

                oPoint = tweenVectors(_pStartingPoint, _pEndingPoint, fLerp,oPoint);

                _oContainer.x=oPoint.getX();
                _oContainer.y=oPoint.getY();
        }
        
    };

    this.update = function(){
        switch(_iState){
            case CARD_STATE_DEALING:{
                this._updateDealing();
                break;
            }
        }
    };
    
    _oParentContainer = oParentContainer;
    this._init(bFolded,iType,pStartingPoint,szFrame,iValue,iSuit);
                
}