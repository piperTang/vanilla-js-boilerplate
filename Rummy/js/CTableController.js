function CTableController(){
    var _bClickable;
    var _iMaxWidth;
    var _aCardDeck;
    var _aCardsInWastePile;
    var _aComboList;
    var _aCbCompleted;
    var _aCbOwner;
    var _pStartPosTable;
    var _pWastePileOffset;
    var _pNextAttachPoint;
    var _pStartAttachPos;
    var _oListener;
    
    var _oHitAreaDeck;
    var _oWastePile;
    var _oCursorHand;
    var _oContainerCombo;
    var _oContainerDeck;
    var _oContainer;
    
    this._init = function(){
        _iMaxWidth = CANVAS_WIDTH;
        
        _pStartPosTable = {x:TABLE_X,y:TABLE_Y};
        _pWastePileOffset = {x:CARD_WIDTH+20,y:0};
        _pNextAttachPoint = {x:_pWastePileOffset.x + CARD_WIDTH + 50,y:_pWastePileOffset.y};
        _pStartAttachPos = {x:_pNextAttachPoint.x,y:_pNextAttachPoint.y};
        _aCardsInWastePile = new Array();
        
        _aCbCompleted=new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.scaleX = _oContainer.scaleY = 0.8;
        s_oStage.addChild(_oContainer);
        
        _oContainerCombo = new createjs.Container();
        _oContainer.addChild(_oContainerCombo);
        
        _oContainerDeck = new createjs.Container();
        _oContainer.addChild(_oContainerDeck);
        
        
        
        _aComboList = new Array();
        this._attachNewComboOnTable();
        
        //WASTE PILE
        var oSpriteWaste = s_oSpriteLibrary.getSprite("waste_pile");
        var oData = {   
                        images: [oSpriteWaste], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteWaste.width/2, height: oSpriteWaste.height, regX: (oSpriteWaste.width/2)/2, regY: oSpriteWaste.height/2}, 
                        animations: {normal:0,highlight:1}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oWastePile = createSprite(oSpriteSheet,"normal",(oSpriteWaste.width/2)/2,oSpriteWaste.height/2,oSpriteWaste.width/2,oSpriteWaste.height);
        _oWastePile.x = _pWastePileOffset.x;
        _oWastePile.y = _pWastePileOffset.y;
        _oWastePile.stop();
        _oContainerDeck.addChild(_oWastePile);
        
        this._initDeck();
        
        _oCursorHand = new CCursorHandController(_oContainer);
        
        _oHitAreaDeck = new createjs.Shape();
        _oHitAreaDeck.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(-CARD_WIDTH/2, -CARD_HEIGHT/2, CARD_WIDTH, CARD_HEIGHT);
        _oListener = _oHitAreaDeck.on("click", this._onDeckRelease);
        _oContainer.addChild(_oHitAreaDeck);
    };
    
    this.unload = function(){
        for(var i=0;i<_aCardsInWastePile.length;i++){
            _aCardsInWastePile[i].unload();
        }

        //REMOVE ALL CARDS FROM THE DECK
        for(var i=0;i<_aCardDeck.length;i++){
            _aCardDeck[i].unload();
        }
        
        //REMOVE ALL COMBOS FROM THE TABLE
        for(var j=0;j<_aComboList.length;j++){
            _aComboList[j].unload();
        }
        
        _oHitAreaDeck.off("click",_oListener);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.refreshButtonPos = function(){
        _oContainer.x = s_iOffsetX + _pStartPosTable.x;
        _oContainer.y = s_iOffsetY + _pStartPosTable.y;
        
    };
    
    this.reset = function(){
        _bClickable = false;
    };
    
    this.restart = function(){
        _pNextAttachPoint = {x:_pWastePileOffset.x + CARD_WIDTH + 50,y:_pWastePileOffset.y};
        
        //REMOVE ALL CARDS IN WASTE PILE
        for(var i=0;i<_aCardsInWastePile.length;i++){
            _aCardsInWastePile[i].unload();
        }
        
        _aCardsInWastePile = new Array();
        
        //REMOVE ALL CARDS FROM THE DECK
        for(var i=0;i<_aCardDeck.length;i++){
            _aCardDeck[i].unload();
        }
        
        _aCardDeck = new Array();
        
        this._initDeck();
        
        //REMOVE ALL COMBOS FROM THE TABLE
        for(var j=0;j<_aComboList.length;j++){
            _aComboList[j].unload();
        }
        
        _aComboList = new Array();
        
        
        
        this.reset();
        this._attachNewComboOnTable();
    };
    
    this.refreshGridScale = function(iMaxWidth){
        _oContainer.scaleX = _oContainer.scaleY = CUR_GRID_SCALE*0.8;
        
        var iOffsetX = TABLE_X;
        if(s_iNumPlayers >3){
            iOffsetX *= 2;
        }
        
        _iMaxWidth = (iMaxWidth - iOffsetX);
        this.repositionCombos();
    };
    
    this.showHandAnim = function(bVisible){
        _oCursorHand.showHandAnim(bVisible);
    };
    
    this.showSwipeAnim = function(pStart,pEnd){
        _oCursorHand.showHandSwipe(pStart,pEnd);
    };
    
    this.hideHandSwipe = function(){
        _oCursorHand.hideHandSwipe();
    };
    
    this._initDeck = function(){
        var aCardInfo = s_oGameSettings.getShuffledCardDeck();
        
        _aCardDeck = new Array();
        for(var k=0;k<aCardInfo.length;k++){
            var pStart = new CVector2( -(0.2*k), -(0.2*k));
            
            var oCard = new CCard(true,CARD_DECK,pStart,aCardInfo[k].frame,aCardInfo[k].rank,aCardInfo[k].suit,_oContainerDeck);
            oCard.setClickable(false);
            oCard.addEventListener(ON_CARD_ANIMATION_ENDING,s_oGame._onCardAnimEnd);
            
            _aCardDeck.push(oCard);
        } 
    };
    
    this.setClickableDeck = function(bClickable){
        _bClickable = bClickable;
    };
    
    this.endTurn = function(){
        for(var k=0;k<_aComboList.length;k++){
            if(_aComboList[k].getNumCards() >= 3){
                _aComboList[k].setPlaced();
            }
            
        }
        
        
        if(_aCardDeck.length === 0){
            //IF DECK IS EMPTY, SHUFFLE ALL CARDS IN WASTE PILE
            var oLastCard = _aCardsInWastePile.pop();
            _aCardsInWastePile = shuffle(_aCardsInWastePile);
            _aCardDeck = new Array();
            for(var k=0;k<_aCardsInWastePile.length;k++){
                var pStart = new CVector2( -(0.2*k), -(0.2*k));

                var oCard = new CCard(true,CARD_DECK,pStart,_aCardsInWastePile[k].getFrame(),_aCardsInWastePile[k].getValue(),_aCardsInWastePile[k].getSuit(),_oContainerDeck);
                oCard.setClickable(false);
                oCard.addEventListener(ON_CARD_ANIMATION_ENDING,s_oGame._onCardAnimEnd);

                _aCardDeck.push(oCard);
                
                _aCardsInWastePile[k].unload();
            } 
         
            //printCards(_aCardDeck)
            _aCardsInWastePile = [oLastCard];

        }
    };

    this.addFirstCardInWastePile = function(oCard){
        _aCardsInWastePile.push(oCard);
    };
    
    this.setWasteClickable = function(bClickable){
        if(_aCardsInWastePile.length>0){
            _aCardsInWastePile[_aCardsInWastePile.length-1].setClickable(bClickable);
        }
    };
    
    this.addCardToWastePile = function(oCardToAdd){
        playSound("drop",1,false);
        
        var oCard = new CCard(false,CARD_WASTE,new CVector2(_pWastePileOffset.x,_pWastePileOffset.y),oCardToAdd.getFrame(),oCardToAdd.getValue(),oCardToAdd.getSuit(),_oContainerDeck);
        s_oGame._onCardAnimEnd(CARD_WASTE,oCard);
    };
    
    this._attachNewComboOnTable = function(){
        var oCombo = new CComboOnTable(_pNextAttachPoint.x,_pNextAttachPoint.y,_oContainerCombo);
        oCombo.addEventListener(ON_SELECT_COMBO,this._onSelectCombo,this);
        _aComboList.push(oCombo);
        
        //SET COMBO OWNER
        if(_aComboList.length > 1){
            _aComboList[_aComboList.length-2].setOwner(s_oGame.getCurTurn());
        }
    };
    
    this.addCardToAttachArea = function(iIndex,oCardToAdd,iRes){
        _aComboList[iIndex].addCard(oCardToAdd,iRes);

        if(_aComboList[iIndex].getNumCards() === 3 && iRes !== EVALUATE_REPLACE_JOKER){
            //REPOSITION THE ATTACH AREA
            var oPos = _aComboList[_aComboList.length-1].getPos();
            
            _pNextAttachPoint = {x: oPos.x + (_aComboList[_aComboList.length-1].getNumCards() * CARD_WIDTH_OFFSET_IN_HAND) + CARD_WIDTH_OFFSET_IN_HAND*2,y:oPos.y};
            this._attachNewComboOnTable();  
        }
        
        this.repositionCombos();
    };
    
    this.repositionCombos = function(){
        var iX = _pStartAttachPos.x;
        var iY = _pStartAttachPos.y;
        //trace("####repositionCombos at max width "+_iMaxWidth)
        for(var k=0;k<_aComboList.length;k++){
            var oCombo = _aComboList[k];

            //trace("check "+((iX+(oCombo.getNumCards() * CARD_WIDTH_OFFSET_IN_HAND))*_oContainer.scaleX))
            if( (iX+(oCombo.getNumCards() * CARD_WIDTH_OFFSET_IN_HAND)) *_oContainer.scaleX > _iMaxWidth){
                iX = 0;
                iY += (CARD_HEIGHT+50);
            }
            oCombo.setPos(iX,iY);

            iX = _aComboList[k].getPos().x + ((oCombo.getNumCards() * CARD_WIDTH_OFFSET_IN_HAND) + CARD_WIDTH_OFFSET_IN_HAND*2);
        }
        
        //trace("##########################")
    };
    
    this.highlightWastePile = function(bHighlight){
        if(bHighlight){
            _oWastePile.gotoAndStop("highlight");
        }else{
            _oWastePile.gotoAndStop("normal");
        }
    };
    
    this.highlightAttach = function(iIndex,bHighlight){
        if(bHighlight){
            _aComboList[iIndex].highlight();
        }else{
            _aComboList[iIndex].unlight();
        }
    };
    
    this.highlightAllAttach = function(bHighlight){
        for(var k=0;k<_aComboList.length;k++){
            if(bHighlight){
                _aComboList[k].highlight();
            }else{
                _aComboList[k].unlight();
            }
            
        }
    };
    
    this.checkIfComboIncomplete = function(){        
        for(var i=0;i<_aComboList.length;i++){
            if(_aComboList[i].isIncomplete()){
                return true;
            }
        }
        
        return false;
    };
    
    this.resetCombo = function(iIndex){
        //trace("resetCombo "+iIndex)
        _aComboList[iIndex].reset(); 
        for(var i=iIndex+1;i<_aComboList.length;i++){
                _aComboList[i].unload();
        }
        
        _aComboList.splice(iIndex+1,_aComboList.length-1-iIndex);
    };
    
    this.removeCombo = function(iIndex){
        //trace("_aComboList "+_aComboList.length)
        _aComboList[iIndex].unload();
        _aComboList.splice(iIndex,1);
    };
    
    this.calculateOpeningScore = function(iPlayer){
        var iScore = 0;
        for(var i=0;i<_aComboList.length;i++){
            //trace("_aComboList["+i+"] "+_aComboList[i].getOwner())
            //printCards(_aComboList[i].getCards())
            if(_aComboList[i].getOwner() === iPlayer){
                iScore += _aComboList[i].getScore();
            }
        }
        //trace("calculateOpeningScore "+iScore)
        return iScore;
    };

    
    this.checkIfCardFitInAnyCombo = function(oCardToFit,iIndex,iLen){
        for(var k=0;k<_aComboList.length-1;k++){
            var oCombo = this.getComboOnTable(k);
            var aComboCards = oCombo.getCards();
            var iComboRes = oCombo.getType();
            var bCardToAdd = false;
            
            if(JOKER_AVAILABLE && s_oHandEvaluator.checkIfCanReplaceJoker(aComboCards,iComboRes,oCardToFit)){
                bCardToAdd = true;
                iComboRes = EVALUATE_REPLACE_JOKER;
                //trace("JOKER REPLACED")
            }else {
                //trace("oCardToFit.getValue() "+oCardToFit.getValue())
                //trace("iLen "+iLen)
                if( oCardToFit.getValue() === JOKER_VALUE && iLen > 3){
                    return false;
                }
                aComboCards.push(oCardToFit);
                var oRes = s_oHandEvaluator.evaluate(true,aComboCards);
                aComboCards.splice(aComboCards.length-1,1);
                //trace("RES "+JSON.stringify(oRes));
                if(oRes.res !== EVALUATE_NULL){
                    //trace("ADD CARD "+oCardToFit.getValue()+" suit "+oCardToFit.getSuit())
                    bCardToAdd = true;
                    iComboRes = oRes.res;
                }
            }

            if(bCardToAdd){
                if(iIndex !== -1){
                    //("oCardToFit "+oCardToFit.getValue()+" suit "+oCardToFit.getSuit())
                    var pPos = s_oGame.getAttachPos(k);
                    oCardToFit.setPos(_oContainer.globalToLocal(pPos.x,pPos.y));
                    oCardToFit.changeType(CARD_TABLE);
                    //oCardToFit.setComboIndex(s_oGame.isCardCollidingWithAttach());


                    s_oGame.removeCardFromHandByIndex(iIndex);
                    this.addCardToAttachArea(k,oCardToFit,iComboRes);
                }
                
                return true;
            }
        }
        
        
        return false;
    };

    
    this._onDeckRelease = function(){
        if(!_bClickable){
            return;
        }
        
        _bClickable = false;
        
        if(_aCbCompleted[ON_DECK_RELEASE]){
           _aCbCompleted[ON_DECK_RELEASE].call(_aCbOwner[ON_DECK_RELEASE]);
        }
    };
    
    this._onSelectCombo = function(oCombo){
        s_oGame.showChoosePanel(TEXT_REMOVE_COMBO);
    };
    
    this.getComboIncomplete = function(){
        for(var i=0;i<_aComboList.length;i++){
            if(_aComboList[i].isIncomplete()){
                return i;
            }
        }
        
        return -1;
    };
    
    this.getNextCard = function(){
        return _aCardDeck.pop();
    };
    
    this.removeLastCardInWastePile = function(){
        return _aCardsInWastePile.pop();
    };
    
    this.getLastCardInWastePile = function(){
        return _aCardsInWastePile[_aCardsInWastePile.length-1];
    };
    
    this.getComboListLen = function(){
        return _aComboList.length;
    };
    
    this.getPlayerCombos = function(iPlayer){
        var aComboList = new Array();
        for(var i=0;i<_aComboList.length;i++){
            if(_aComboList[i].getOwner() === iPlayer){
                aComboList.push({combo:_aComboList[i],index:i});
            }
        }
        
        return aComboList;
    };
    
    this.getLocalPos = function(pPos){
        return _oContainer.globalToLocal(pPos.x,pPos.y);
    };
    
    this.getLocalToGlobal = function(oCard){
        return _oContainer.localToGlobal(oCard.getX(),oCard.getY());
    };
    
    this.getWastePilePos = function(){
        return _pWastePileOffset;
    };
    
    this.getScale = function(){
        return _oContainer.scaleX;
    };
    
    this.getGlobalWastePilePos = function(){
        return {x:_oContainer.x + _pWastePileOffset.x*_oContainer.scaleX,y:_oContainer.y+_pWastePileOffset.y*_oContainer.scaleX};
    };
    
    this.getGlobalAttachPos = function(iIndex){
        return {x:_oContainer.x + _aComboList[iIndex].getX() * _oContainer.scaleX,y:_oContainer.y + _aComboList[iIndex].getY() *_oContainer.scaleY};
    };
    
    this.getComboOnTable = function(iIndex){
        return _aComboList[iIndex];
    };
    
    this.getLastAvailableAttachIndex = function(){
        return _aComboList.length-1;
    };
    
    this.getNumCardsInCombo = function(iComboIndex){
        return _aComboList[iComboIndex].getNumCards();
    };
    
    this.checkIfOwner = function(iIndex,iPlayer){
        if(_aComboList[iIndex].getOwner() === iPlayer || _aComboList[iIndex].getOwner() === null){
            return true;
        }
        
        return false;
    };
    
    this.getScale = function(){
        return _oContainer.scaleX;
    };
    
    //return {x:_oContainer.x + _aComboList[iIndex].getX() * _oContainer.scaleX,y:_oContainer.y + _aComboList[iIndex].getY() *_oContainer.scaleY};
    this.getComboRectInGlobalPos = function(iComboIndex){
        return new createjs.Rectangle(_oContainer.x +_aComboList[iComboIndex].getX()* _oContainer.scaleX,_oContainer.y + _aComboList[iComboIndex].getY()* _oContainer.scaleY,
                                            _aComboList[iComboIndex].getWidth()* _oContainer.scaleX,_aComboList[iComboIndex].getHeight()* _oContainer.scaleY);
    };
    
    this.isWasteHighlighted = function(){
        if(_oWastePile.currentAnimation === "highlight"){
            this.highlightWastePile(false);
            return true;
        }
        return false;
    };
    
    this.isAttachHighlighted = function(iIndex){
        return _aComboList[iIndex].isHighlighted();
    };

    
    this._init();
}