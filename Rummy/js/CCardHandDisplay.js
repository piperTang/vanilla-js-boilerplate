function CCardHandDisplay(iIndex,oDirMov,pStartPos,iRot,oParentContainer){
    var _bHighlight;
    var _bTryingToPlaceCombo;
    var _bOpeningScoreReached;
    var _iNumCardsAtTurnStart;
    var _iOpeningScore;
    var _iTotScore;
    var _iIndex = iIndex;
    var _iContCard;
    var _iMaxHandSizeWidth;
    var _aCards;
    var _aIndexInvolvedInCombo;
    var _oDirMov = oDirMov;
    var _pStartPos = pStartPos;

    var _oContainer;
    var _oParentContainer = oParentContainer;
    var _oThis = this;
    
    this._init = function(iRot){
        _iTotScore = 0;
        this.reset();
        
        _oContainer = new createjs.Container();
        _oContainer.rotation = iRot;
        _oParentContainer.addChild(_oContainer);


        
        var iOffset;
        if( iRot === 90 || iRot === -90){
            iOffset = 300;
        }else{
            iOffset = 300;
        }
        
       _iMaxHandSizeWidth = ((CARD_TO_DEAL["player_"+s_iNumPlayers]+1)*CARD_WIDTH_OFFSET_IN_HAND) + iOffset;
       
       
       
       this.refreshButtonPos();
    };
    
    this.refreshButtonPos = function(){
        _oContainer.x = _pStartPos.x + (s_iOffsetX*_oDirMov.dir_x);
        _oContainer.y = _pStartPos.y + (s_iOffsetY*_oDirMov.dir_y);

        
        var iMaxSize;
        if(_oDirMov.dir_x === 0){
            iMaxSize = CANVAS_WIDTH - (s_iOffsetX*2);
        }else{
            iMaxSize = CANVAS_HEIGHT - (s_iOffsetY*2);
        }

        if(_iMaxHandSizeWidth > iMaxSize){
            var iScale = iMaxSize /_iMaxHandSizeWidth;
            iScale = parseFloat(iScale.toFixed(2));
            _oContainer.scaleX = _oContainer.scaleY = iScale;
            
        }      
    };
    
    this.unload = function(){
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].unload();
        }
        
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.reset = function(){
        _bHighlight = false;
        _bTryingToPlaceCombo = false;
        
        _iNumCardsAtTurnStart = CARD_TO_DEAL["player_"+s_iNumPlayers];
        _bOpeningScoreReached = MIN_OPENING_VALUE===0?true:false;
        _iOpeningScore = 0;
        
        _aCards = new Array();
    };
    
    this.restart = function(){
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].unload();
        };
        
        this.reset();
    };
    
    this.centerContainer = function(){
        createjs.Tween.get(_oContainer).to({regX:_oContainer.getBounds().width/2}, 500,createjs.Ease.cubicOut);
    };
    
    this._reassignArrayIndex = function(){
        _aCards.sort(function(a, b){
                                if (a.getX() == b.getX()) return a.getY() - b.getY();
                                    return a.getX() - b.getX() || a.getY() - b.getY();
                            });                   
    };
        
    this.setOpening = function(bOpening){
        _bOpeningScoreReached = bOpening;
    };
    
    this.compact = function(){
        _iContCard = 0;
        
        var iXPos = CARD_WIDTH/2;
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].moveOnX(iXPos,500);
            
            iXPos += CARD_WIDTH_OFFSET_IN_HAND;
        }
        
        this._sortCardDepth();
    };
    
    this.highlight = function(bVisible){
        _bHighlight = bVisible;
        
        if(bVisible){
            _oContainer.shadow = new createjs.Shadow("#fff", 0, 0, 20);
            
        }else{
            _oContainer.shadow = null;
        }
    };
    
    this.setNumCardsAtTurnStart = function(){
        _iNumCardsAtTurnStart = _aCards.length;
    };

    
    this.addCard = function(oCardDealed){
        oCardDealed.unload();
        
        var iXPos = CARD_WIDTH/2 + (_aCards.length*CARD_WIDTH_OFFSET_IN_HAND);
        
        var oCard = new CCard(true,CARD_HAND,new CVector2(iXPos,CARD_HEIGHT),oCardDealed.getFrame(),oCardDealed.getValue(),oCardDealed.getSuit(),_oContainer);
        
        
        //if(_iIndex === PLAYER_ID){
            oCard.moveOnYByOffset(-CARD_MOVE_UP_OFFSET,true);
            oCard.showCard();
        //}else{
          //  oCard.moveOnYByOffset(-CARD_CPU_MOVE_UP_OFFSET,true);
        //}
        
        oCard.setClickable(false);
        oCard.addEventListener(ON_CARD_MOVE_UP_END,this._onCardMoveUpEnd,this);
        oCard.addEventListener(ON_CARD_ANIMATION_ENDING,this._onCardAnimationEnd,this);
        oCard.addEventListener(ON_CARD_SWAP,this._onSwapCards,this);
        oCard.addEventListener(ON_CARD_DRAGGING,this._onDragCard,this);
        oCard.addEventListener(ON_CARD_RELEASE,this._onCardRelease,this);
        oCard.addEventListener(ON_CARD_MOVE_X_END,this._onCardEndXMove,this);
        oCard.addEventListener(ON_CARD_END_SCALE,this._putCardOnTable,this);
        
        _aCards.push(oCard);
    };
    
    this.activateCardListener = function(){
        if(_iIndex === PLAYER_ID){
            
            for(var i=0;i<_aCards.length;i++){
                _aCards[i].setClickable(true);
            }
        }
        
    };
    
    this.resetComboAttempt = function(){
        _bTryingToPlaceCombo = false;
    };
    
    this.moveCardOnXByOffset = function(iIndex,iOffset,iTime){
        _aCards[iIndex].moveOnXByOffset(iOffset,iTime);
    };
    
    this.increaseScore = function(iScore){
        _iTotScore += iScore;
    };
    
    this._onCardMoveUpEnd = function(oCard){
       _oThis.centerContainer();
    };
    
    this._onCardAnimationEnd = function(oCard){

    };
    
    this._onSwapCards = function(oCardToSwap,szDir){
        var iIndex = -1;
        for(var i=0;i<_aCards.length;i++){
            if(_aCards[i] === oCardToSwap){
                iIndex = i;
                break;
            }
        }
        
        var iSecondIndex = -1;
        if(szDir === "left" && iIndex > 0){
            iSecondIndex = iIndex-1
            _aCards[iSecondIndex].moveOnXByOffset(CARD_WIDTH_OFFSET_IN_HAND,0);
            _aCards[iIndex].moveOnXByOffset(-CARD_WIDTH_OFFSET_IN_HAND,0);
            
        }else if(szDir === "right" && iIndex < _aCards.length-1){
            iSecondIndex = iIndex+1;
            _aCards[iSecondIndex].moveOnXByOffset(-CARD_WIDTH_OFFSET_IN_HAND,0);
            _aCards[iIndex].moveOnXByOffset(CARD_WIDTH_OFFSET_IN_HAND,0);
        }else{
            _aCards[iIndex]._onRelease();
            return;
        }
        

        if(iSecondIndex === -1){   
            if(szDir === "right"){
                iIndex = _aCards.length-1;
                iSecondIndex = iIndex-1;
            }else{
                iIndex = 0;
                iSecondIndex = iIndex+1;
            }
        }

        //SWAP DEPTH
        _oContainer.swapChildren( _aCards[iSecondIndex].getContainer(), _aCards[iIndex].getContainer() );


        //SWAP ELEM IN ARRAY
        var oTmp = _aCards[iIndex];
        _aCards[iIndex] = _aCards[iSecondIndex];
        _aCards[iSecondIndex] = oTmp;
    };
    
    this._onDragCard = function(oCardDragging){
        if(s_oGame._checkCollisionBetweenCardAndWastePile(oCardDragging) === false){
            if(s_oGame._checkCollisionBetweenCardAndAttachSprite(oCardDragging)){
                oCardDragging.tweenScale(s_oGame.getTableScale());
            }else{
                oCardDragging.tweenScale(1);
            }
        }else{
            oCardDragging.tweenScale(s_oGame.getTableScale());
        } 
    };
    
    this._onCardRelease = function(oCard){
        s_oGame.hideHandSwipe();
        
        //CHECK IF COLLIDES WITH WASTE PILE
        if(s_oGame.isCardCollidingWithWaste()){
            
            if(s_oGame.isReadyForChangeTurn() === false){
                //USER CAN'T DROP A CARD BEFORE PICK A NEW ONE FROM THE DECK
                s_oGame.showAlertText(TEXT_NO_WASTE);
                this.resetCardFromRelease(oCard);
                return;
            }
            
            if(s_oGame.checkIfComboIncomplete()){
                //IF THERE ARE SOME INCOMPLETE COMBOS REMOVE THEM FROM THE TABLE
                s_oGame.showChoosePanel(TEXT_INCOMPLETE_COMBO);
                this.resetCardFromRelease(oCard);
                return;
            }
            
            if(s_oGame.checkIfDroppingWasteCard(oCard)){
                //USE CAN'T DISCARD A CARD PREVIOUSLY PICKED FROM  THE WASTE PILE
                s_oGame.showAlertText(TEXT_CANT_DISCARD_WASTE_CARD);
                this.resetCardFromRelease(oCard);
                return;
            }
            
            if(_bTryingToPlaceCombo){
                if(!_bOpeningScoreReached && s_oGame.calculateOpeningScore() < MIN_OPENING_VALUE){
                    _bTryingToPlaceCombo = false;
                    s_oGame.showAlertText(TEXT_NOT_ENOUGH_POINTS);
                    s_oGame.removePlayerCombos();
                    this.resetCardFromRelease(oCard);
                    return;
                }

                _bOpeningScoreReached = true;
            }
            
            s_oGame.blockControls(true);
            
            oCard.setClickable(false);
            var pPos = s_oGame.getWastePilePos();
            oCard.setPos(_oContainer.globalToLocal(pPos.x,pPos.y));
            oCard.changeType(CARD_WASTE);
            
            
            
            
            s_oGame.addCardToWastePile(oCard);

        }else if(s_oGame.isCardCollidingWithAttach() > -1 && _aCards.length > 1){
            var iAttachIndex = s_oGame.isCardCollidingWithAttach();
          
            var iRes = s_oGame._checkComboUnderConstruction(iAttachIndex,oCard);
            if(s_oGame.checkIfOwner(iAttachIndex,_iIndex) === false && !_bOpeningScoreReached && s_oGame.calculateOpeningScore() < MIN_OPENING_VALUE){
                s_oGame.showAlertText(TEXT_CANT_PLACE_CARDS_IF_NOT_OPENING + " " + MIN_OPENING_VALUE + " " + TEXT_POINTS);
                this.resetCardFromRelease(oCard);  
            }else if(iRes === EVALUATE_CARD_NO_VALID_IN_COMBO){                
                s_oGame.showAlertText(TEXT_INVALID_CARD_IN_COMBO);
                this.resetCardFromRelease(oCard);               
            }else if(_aCards.length + s_oGame.getNumCardsInCombo(iAttachIndex) < 4){
                //AVOID TO PLACE A CARD ON THE TABLE IF THE NUMBER OF CARDS IN HAND ARE NOT SUFFICIENT FOR A COMBO
                this.resetCardFromRelease(oCard);      
            }else if(iRes !== EVALUATE_NULL){
                oCard.setClickable(false);
                var pPos = s_oGame.getAttachPos(iAttachIndex);
    
                oCard.setPos(_oContainer.globalToLocal(pPos.x,pPos.y));
                oCard.changeType(CARD_TABLE);
                oCard.setComboIndex(iAttachIndex);

                this._addCardToAttachArea(oCard,iAttachIndex,iRes);
                
                _bTryingToPlaceCombo = true;
            }else{
                this.resetCardFromRelease(oCard);

                var oCombo = s_oGame.getComboOnTable(iAttachIndex);
                if(oCombo.isPlacedOnTable() === false){
                    s_oGame.showAlertText(TEXT_INVALID_COMBO);
                    var aCardsInCombo = oCombo.getCards();
                    for(var k=0;k<aCardsInCombo.length;k++){
                        this.addCard(aCardsInCombo[k])
                    }

                    s_oGame.removeCombo(iAttachIndex);
                }
                this.activateCardListener();
            }  
        }else{
            this.resetCardFromRelease(oCard);
        }  
        
        s_oGame.highlightAllAttach(false);
    };

    this._onCardEndXMove = function(){
        _iContCard++;
        if(_iContCard === _aCards.length){
            this._sortCardDepth();
            this.centerContainer();
            this._reassignArrayIndex();
            
            s_oGame.setCanShuffle(true);
        }
    };
    
    this.checkRummy = function(){
        //CHECK IF PLAYER MELD ALL CARDS IN A SINGLE TURN
        //trace("_iNumCardsAtTurnStart "+_iNumCardsAtTurnStart);
        //trace("_aCards.length"+_aCards.length)
        if(_iNumCardsAtTurnStart ===  CARD_TO_DEAL["player_"+s_iNumPlayers] && _aCards.length === 0){
            return true
        }
        return false;
    }
    
    this._putCardOnTable = function(oCard,iIndex){
      
    };
    
    this._addCardToAttachArea = function(oCard,iIndex,iRes){
        //REMOVE CARD FROM THE HAND
        this.removeCardFromHand(oCard);
        
        //ADD IT TO ATTACH AREA
        s_oGame.addCardToAttachArea(iIndex,oCard,iRes);
    };
    
    this.resetCardFromRelease = function(oCard){
        var iX =  CARD_WIDTH/2;
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].setX(iX);

            iX += CARD_WIDTH_OFFSET_IN_HAND;
        }
        
        
        oCard.setY(oCard.getStartingPos().getY() - CARD_MOVE_UP_OFFSET); 
        //oCard.tweenScale(1);
        
        this._sortCardDepth();
        oCard.setScale(1);
    };
    
    this.removeCardFromHand = function(oCard){
        for(var i=0;i<_aCards.length;i++){
            if(_aCards[i] === oCard ){
                _aCards[i].unload();
                _aCards.splice(i,1);
                break;
            }
        }

        this.compact();
    };
    
    this.removeCardFromHandByIndex = function(iIndex){
        if(iIndex<0){
            return;
        }
        _aCards[iIndex].unload();
        _aCards.splice(iIndex,1);
    };
    
    this._sortCardDepth = function(){
        var sortFunction = function(obj1, obj2, options) {
            if (obj1.x > obj2.x) { return 1; }
            if (obj1.x < obj2.x) { return -1; }
            return 0;
        };
        
        _oContainer.sortChildren(sortFunction);
    };
    
    this.sortCards = function(aSortedCards){
        _iContCard = 0;
        
        var iXPos = CARD_WIDTH/2;
        for(var i=0;i<aSortedCards.length;i++){
            _aCards[aSortedCards[i]].moveOnX(iXPos,500);
            
            iXPos += CARD_WIDTH_OFFSET_IN_HAND;
        }
    };

    
    this.getNumCards = function(){
        return _aCards.length;
    };

    
    this.getRot = function(){
        return _oContainer.rotation;
    };
    
    this.getCards = function(){
        return _aCards;
    };
    
    this.geCardByIndex = function(iIndex){
        return _aCards[iIndex];
    };
    
    this.getCardIndex = function(oCard){
        for(var i=0;i<_aCards.length;i++){
            if(oCard === _aCards[i]){
                return i;
            }
        }
        
        return -1;
    };
    
    this.getPos = function(){
        return {x:_oContainer.x,y:_oContainer.y};
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getScale = function(){
        return _oContainer.scaleX;
    };
    
    this.getWidth = function(){
        return _oContainer.getBounds().width;
    };
    
    this.isHighlight = function(){
        return _bHighlight;
    };

    this.getLocalToGlobal = function(oCard){
        return _oContainer.localToGlobal(oCard.getX(),oCard.getY());
    };
    
    this.getRectInGlobalPos = function(oCard){
        var pPos = _oContainer.localToGlobal(oCard.getX(),oCard.getY());

        return new createjs.Rectangle(pPos.x/s_iScaleFactor,pPos.y/s_iScaleFactor,CARD_WIDTH*oCard.getScale(),CARD_HEIGHT*oCard.getScale());
    };
    
    this.isOpeningScoreReached = function(){
        return _bOpeningScoreReached;
    };
    
    this.getTotalScore = function(){
        return _iTotScore;
    };

    
    this._init(iRot);
    
}