function CGame(){
    var _bUpdate;
    var _bDealing;
    var _bCollideDrag;
    var _bCanShuffle;
    var _bStartGame;
    var _bReadyToChangeTurn;
    var _bPlayerReady = true;
    var _iStartGameTurn = 0;
    var _iCurDealTurn;
    var _iCurTurn;
    var _iLastPlacedComboIndex;
    var _iTimeElaps;
    
    var _aPlayerHand;
    var _aPlayerNick;
    var _aCardUpdating;
    var _oCardPickedFromWaste;
    var _oListenerBlock;
    var _oAiController;
    
    var _oInterface;
    var _oRummyAnim;
    var _oAlertText;
    var _oAreYouSurePanel;
    var _oChoosePanel;
    var _oTableContainer;
    var _oGameOver;
    var _oWinPanel;
    var _oContainerHands;
    var _oBlockControls;
    
    
    this._init = function(){
        setVolume("soundtrack",0.1);

        s_oGameSettings = new CDeckController();
        
        _iCurDealTurn = Math.floor(Math.random()*s_iNumPlayers);
        _iCurTurn = _iStartGameTurn;
    
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); 


        s_oHandEvaluator = new CHandEvaluatorController();

        _oTableContainer = new CTableController();
        _oTableContainer.addEventListener(ON_DECK_RELEASE,this._onDeckRelease,this);

        _oContainerHands = new createjs.Container();
        s_oStage.addChild(_oContainerHands);


        this._initHandPlayers();

        _oBlockControls = _oBg = new createjs.Shape();
        _oBlockControls.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListenerBlock = _oBlockControls.on("click",function(){});
        s_oStage.addChild(_oBlockControls);

        this.reset();

        _oInterface = new CInterface();

        _oAlertText = new CAlertText();

        _oChoosePanel = new CChoosePanel();
        _oChoosePanel.addEventListener(ON_BUT_YES_DOWN,this.removeComboIncomplete,this);

        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,this.onConfirmExit,this);
        
        _oGameOver = new CGameOverPanel();
        _oWinPanel = new CWinPanel();
        
        _oAiController = new CAiController();

        
        _oInterface.showHelp();
        _oRummyAnim = new CRummyAnim(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,s_oStage);
        
        
        this.refreshButtonPos();

        _bUpdate = true;
    };
    
    
    this.unload = function(){
        _oInterface.unload();
        _oTableContainer.unload();
        _oChoosePanel.unload();
        _oBlockControls.off("click",_oListenerBlock);
        _oGameOver.unload();
        _oWinPanel.unload();
        _oAreYouSurePanel.unload();

        s_oGame = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };
    
    this.refreshButtonPos = function(){
        
        _oTableContainer.refreshButtonPos();
        
        this.refreshGridScale();
        
        _oInterface.refreshButtonPos();
        
        for(var i=0;i<_aPlayerHand.length;i++){
            _aPlayerHand[i].refreshButtonPos();
            _aPlayerNick[i].refreshButtonPos();
        }
        
        
    };
    
    this.refreshGridScale = function(){
        var iMaxGridSizeWidth = (CANVAS_WIDTH - (s_iOffsetX*2));
        if(s_bLandscape){

            var iMaxGridSizeHeight = (CANVAS_HEIGHT - (s_iOffsetY*2));
            CUR_GRID_SCALE = iMaxGridSizeHeight/MAX_TABLE_HEIGHT;
        } else {
            var iMaxGridSizeHeight = (CANVAS_HEIGHT - (s_iOffsetY*2));
            var iMinDim = Math.min(iMaxGridSizeHeight, iMaxGridSizeWidth);

            CUR_GRID_SCALE = iMinDim/MAX_TABLE_WIDTH;   
        }
        
        if(CUR_GRID_SCALE <= 1){
            CUR_GRID_SCALE = parseFloat(CUR_GRID_SCALE.toFixed(2));
        }

        _oTableContainer.refreshGridScale(iMaxGridSizeWidth);
    };
    
    this.reset = function(){
       _bCollideDrag = false;
       _bDealing = true;
       _bReadyToChangeTurn = false;
       _bCanShuffle = false;
       _bStartGame = false;
       _bPlayerReady = false;
       
       _iLastPlacedComboIndex = 0;
       _iTimeElaps = 0;
       
       _aCardUpdating = new Array();
       _oCardPickedFromWaste = null;
       
       _oTableContainer.reset();
       
       if(_iCurTurn === 0){
           this.blockControls(false);
       }else{
           this.blockControls(true);
       }
    };
    
    this.restart = function(){
        
        _iStartGameTurn++;

        if(_iStartGameTurn === s_iNumPlayers){
            _iStartGameTurn = 0;
        }
        _iCurDealTurn = _iStartGameTurn;
        _iCurTurn = _iStartGameTurn;
        
        _oTableContainer.restart();
        
        for(var i=0;i<_aPlayerHand.length;i++){
            _aPlayerHand[i].restart();
            _aPlayerNick[i].refreshText(s_aPlayerNames[i] + ": "+ _aPlayerHand[i].getTotalScore());
        }

        
        this.reset();
        
        this.dealCardToPlayer();
        _bUpdate = true;
    };
    
    this.exitFromHelpPanel = function(){
        
        if(_bStartGame === false){
            this.dealCardToPlayer();
        }else{
            this.setUpdate(true);
        }
    };

    this._initHandPlayers = function(){        
        var aDirMov;
        var aStartPos;
        var aRot;
        if(s_iNumPlayers === 2){
            aStartPos = [{x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT - CARD_MOVE_UP_OFFSET},{x:CANVAS_WIDTH/2,y:CARD_MOVE_UP_OFFSET}];
            aDirMov = [{dir_x:0,dir_y:-1},{dir_x:0,dir_y:1}];
            aRot = [0,180];
            
        }else{
            
            aStartPos = [{x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT - CARD_MOVE_UP_OFFSET},{x:CARD_MOVE_UP_OFFSET,y:CANVAS_HEIGHT/2},
                                            {x:CANVAS_WIDTH/2,y:CARD_MOVE_UP_OFFSET},{x:CANVAS_WIDTH-CARD_MOVE_UP_OFFSET,y:CANVAS_HEIGHT/2}];
            aDirMov = [{dir_x:0,dir_y:-1},{dir_x:1,dir_y:0},{dir_x:0,dir_y:1},{dir_x:-1,dir_y:0}];
            aRot = [0,90,180,-90];
            
        }
        
        _aPlayerHand = new Array();
        _aPlayerNick = new Array();
        for(var i=0;i<s_iNumPlayers;i++){
            _aPlayerHand[i] = new CCardHandDisplay(i,aDirMov[i],aStartPos[i],aRot[i],_oContainerHands);
            _aPlayerNick[i] = new CNickLabel(aStartPos[i],aDirMov[i],aRot[i],s_aPlayerNames[i]+": "+ _aPlayerHand[i].getTotalScore() ,s_oStage);
        }
    };
    
    this.dealCardToPlayer = function(){
        _bStartGame = true;
        var oCard = _oTableContainer.getNextCard();
        
        var pPos = _aPlayerHand[_iCurDealTurn].getPos();

        var pLocalPos = _oTableContainer.getLocalPos(pPos);

        oCard.initMov(CARD_HAND,CARD_STATE_DEALING,TIME_CARD_DEALING,_aPlayerHand[_iCurDealTurn].getRot(),pLocalPos);
        
        _aCardUpdating.push(oCard);
        
        return oCard;
    };
    
    this.dealCardInWastePile = function(){
        var oCard = _oTableContainer.getNextCard();

        var iRandRot = Math.floor(Math.random() * 7) -3;
        oCard.initMov(CARD_WASTE,CARD_STATE_DEALING,TIME_CARD_DEALING,iRandRot,_oTableContainer.getWastePilePos(),true);
        
        _aCardUpdating.push(oCard);
    };
    
    this.dealCardFromWaste = function(){
        var oCard = _oTableContainer.removeLastCardInWastePile();
        
        var pPos = _aPlayerHand[_iCurDealTurn].getPos();
        var pLocalPos = _oTableContainer.getLocalPos(pPos);
        
        oCard.addEventListener(ON_CARD_ANIMATION_ENDING,this._onCardAnimEnd);
        oCard.initMov(CARD_HAND,CARD_STATE_DEALING,TIME_CARD_DEALING,_aPlayerHand[_iCurDealTurn].getRot(),pLocalPos);
        
        _aCardUpdating.push(oCard);
    };
    
    
    
    this.blockControls = function(bBlock){
        _oBlockControls.visible = bBlock;
    };
    
    this._checkIfComboIsValid = function(aCards){
        if(aCards.length < 2){
            return false;
        }
    };
    
    this._checkComboUnderConstruction = function(iIndex,oCardToAdd){

        var oCombo = _oTableContainer.getComboOnTable(iIndex);
        var aCards = oCombo.getCopyCards();

        if(aCards.length >= 2){
            //CHECK IF CURRENT CARD CAN REPLACE ANY JOKER
            if(aCards.length >2 && oCardToAdd.getValue() !== JOKER_VALUE &&  s_oHandEvaluator.checkIfCanReplaceJoker(aCards,oCombo.getType(),oCardToAdd) ){
                return EVALUATE_REPLACE_JOKER;
            }
            aCards.push(oCardToAdd);
            var oRet = s_oHandEvaluator.evaluate(true,aCards);

            if(oRet.res === EVALUATE_NULL){
                return EVALUATE_CARD_NO_VALID_IN_COMBO;
            }else{
                return oRet.res;
            }

        }else if(aCards.length === 0 || oCardToAdd.getValue() === JOKER_VALUE || aCards[0].getValue() === JOKER_VALUE){
            return EVALUATE_UNDER_CONSTRUCTION;
        }else if(aCards.length === 1){
            var iFirstRank = aCards[0].getValue();
            var iSecondRank = oCardToAdd.getValue();
            var iFirstSuit = aCards[0].getSuit();
            var iSecondSuit = oCardToAdd.getSuit();
            /*
            trace("iFirstRank "+iFirstRank);
            trace("iSecondRank "+iSecondRank);
            trace("iFirstSuit "+iFirstSuit);
            trace("iSecondSuit "+iSecondSuit);*/
            if(iFirstRank === iSecondRank){
                if(iFirstSuit !== iSecondSuit){
                    return EVALUATE_UNDER_CONSTRUCTION;
                }
            }else if((iFirstRank === iSecondRank+1 || iFirstRank === iSecondRank-1 || this._checkStraightWithAceHigh(iFirstRank,iSecondRank) ) && iFirstSuit === iSecondSuit){
                return EVALUATE_UNDER_CONSTRUCTION;
            }
        }
        return EVALUATE_NULL;
    };
    
    this._checkStraightWithAceHigh = function(iFirstRank,iSecondRank){
        if(!ACE_HIGH){
            return false;
        }
        
        if(iFirstRank === ACE_VALUE){
            if(iSecondRank === 13){
                return true;
            }
        }else if(iSecondRank === ACE_VALUE){
            if(iFirstRank === 13){
                return true;
            }
        }
        
        return false;
    };
    
    this.removeCombo = function(iIndex){
        _oTableContainer.resetCombo(iIndex);
    };
    
    this.resetTimeElaps = function(){
        _iTimeElaps = 0;
    };
    
    this._changeTurn = function(){
        _bReadyToChangeTurn = false;
        
        _aPlayerNick[_iCurTurn].highlight(false);
        _iCurTurn++;
        if(_iCurTurn === s_iNumPlayers){
            _iCurTurn = 0;
        }
        _aPlayerNick[_iCurTurn].highlight(true);
        _aPlayerHand[_iCurTurn].setNumCardsAtTurnStart();
        
        _iCurDealTurn = _iCurTurn;

        _oCardPickedFromWaste = null;
        
        _oTableContainer.endTurn();
        _bPlayerReady = false;
        
        if(_iCurTurn === PLAYER_ID){
           _iTimeElaps = 0;
           
           this.blockControls(false);
           _oTableContainer.showHandAnim(true);
           _oTableContainer.setClickableDeck(true);
        }else{
           this.blockControls(true);
           _oAiController.startCheck(_aPlayerHand[_iCurTurn].getCards());
        }
    };
    
    this._onCardAnimEnd = function(iType,oCard){
        switch(iType){
            case  CARD_HAND:{
                if(_bDealing){
                    _aPlayerHand[_iCurDealTurn].addCard(oCard);

                    _iCurDealTurn++;
        
                    if(_iCurDealTurn === s_iNumPlayers){
                        _iCurDealTurn = 0;
                    }
                    
                    if(_aPlayerHand[_iCurDealTurn].getNumCards() === CARD_TO_DEAL["player_"+s_iNumPlayers]){
                        //STOP DEALING
                        _aPlayerHand[PLAYER_ID].activateCardListener();

                        s_oGame.dealCardInWastePile(); 
                        if(_iCurTurn === PLAYER_ID){
                            _oTableContainer.showHandAnim(true);
                        }else{
                            _oAiController.startCheck(_aPlayerHand[_iCurTurn].getCards());
                        }
                        _iCurDealTurn = _iCurTurn;
                        _bCanShuffle = true;
                    }else{ 
                        s_oGame.dealCardToPlayer();
                    }
                }else{
                    _aPlayerHand[_iCurTurn].addCard(oCard);
                    _aPlayerHand[_iCurTurn].activateCardListener();
                }
                
                break;
            }
            
            
            case CARD_WASTE:{
                    oCard.setClickable(true);

                    oCard.addEventListener(ON_CARD_DRAGGING,s_oGame._checkCollisionBetweenCardAndHand,s_oGame);
                    oCard.addEventListener(ON_CARD_RELEASE,s_oGame._releaseWasteCard,s_oGame);
                    
                    _oTableContainer.addFirstCardInWastePile(oCard);
                    
                    
                    _bDealing = false;
                    _oTableContainer.setClickableDeck(true);
                    _aPlayerNick[_iCurTurn].highlight(true);

                    break;
            }
        }
        
    };
    
    this.addCardToWastePile = function(oCardToAdd,iIndex){
        _oTableContainer.addCardToWastePile(oCardToAdd);
        if(iIndex === undefined){
            _aPlayerHand[_iCurTurn].removeCardFromHand(oCardToAdd);
        }else{
            _aPlayerHand[_iCurTurn].removeCardFromHandByIndex(iIndex);
        }
        
        this.compactCards();

        if(_aPlayerHand[_iCurTurn].getNumCards() === 0){
            this._gameOver();
        }else{
            //CHANGE TURN
            this._changeTurn();
        }
        
    };
    
    this.addCardToAttachArea = function(iIndex,oCardToAdd,iRes){
        _oTableContainer.addCardToAttachArea(iIndex,oCardToAdd,iRes);
    };
    
    this.addCardToLastAttachAreaByIndex = function(iIndex,iIndexAttach,iRes){
        var aCards = _aPlayerHand[_iCurTurn].getCards();

        _oTableContainer.addCardToAttachArea(iIndexAttach,aCards[iIndex],iRes);
    };

    this.removeCardFromHandByIndex = function(iIndex){
        _aPlayerHand[_iCurTurn].removeCardFromHandByIndex(iIndex);
    };
    
    this.compactCards = function(){
        _aPlayerHand[_iCurTurn].compact();
    };
    
    this.checkIfCardFitInAnyCombo = function(oCardToFit,iIndex,iLen){
        return _oTableContainer.checkIfCardFitInAnyCombo(oCardToFit,iIndex,iLen);
    };
    
    this.dealJokerToTheCurPlayer = function(oCardToAdd){
        _aPlayerHand[_iCurTurn].addCard(oCardToAdd);
        _aPlayerHand[_iCurTurn].activateCardListener();
    };
    
    this.showAlertText = function(szText){
        _oAlertText.show(szText);
    };
    
    this.showChoosePanel = function(szText){
        _oChoosePanel.show(szText);
    };
    
    this._checkCollisionBetweenCardAndHand = function(oCard){
        var pCardPos = _oTableContainer.getLocalToGlobal(oCard);
        pCardPos = {x:pCardPos.x/s_iScaleFactor,y:pCardPos.y/s_iScaleFactor};
        var pHandPos = _aPlayerHand[PLAYER_ID].getPos();
        var iHandWidth = _aPlayerHand[PLAYER_ID].getWidth();
        
        
        if(pCardPos.y> pHandPos.y && pCardPos.x > pHandPos.x - iHandWidth/2 && pCardPos.x < pHandPos.x + iHandWidth/2){
            //PLAY GLOW EFECT ON PLAYER HAND
            _aPlayerHand[PLAYER_ID].highlight(true);
        }else{
            //REMOVE GLOW EFECT ON PLAYER HAND
            _aPlayerHand[PLAYER_ID].highlight(false);
        }
    };
    
    this._checkCollisionBetweenCardAndWastePile = function(oCard){
        var pCardPos = _aPlayerHand[PLAYER_ID].getLocalToGlobal(oCard);
        pCardPos = {x:pCardPos.x/s_iScaleFactor,y:pCardPos.y/s_iScaleFactor};
        var pWastePos = _oTableContainer.getGlobalWastePilePos();
        //trace("pCardPos "+JSON.stringify(pCardPos));
        //trace("pWastePos "+JSON.stringify(pWastePos));
        //trace("DIST "+distance(pCardPos,pWastePos))
        
        if(distance(pCardPos,pWastePos) < ((CARD_WIDTH *_oTableContainer.getScale()  ) ) ){
            //PLAY GLOW EFECT ON PLAYER HAND
            _oTableContainer.highlightWastePile(true);
            _oTableContainer.highlightAllAttach(false);
            return true;
        }else{
            //PLAY GLOW EFECT ON PLAYER HAND
            _oTableContainer.highlightWastePile(false);
            return false;
        }

    };
    
    this._checkCollisionBetweenCardAndAttachSprite = function(oCard){
        var oRectCard = _aPlayerHand[PLAYER_ID].getRectInGlobalPos(oCard);
        
        //trace("oRectCard "+JSON.stringify(oRectCard))
        var bRes = false;
        for(var i=0;i<_oTableContainer.getComboListLen();i++){
            var iNumComboCard = _oTableContainer.getNumCardsInCombo(i)-1;
            if(iNumComboCard <0){
                iNumComboCard = 0;
            }
            
            var oRectCombo = _oTableContainer.getComboRectInGlobalPos(i);
            //trace("oRectCombo "+JSON.stringify(oRectCombo))
            if(oRectCard.intersects(oRectCombo)){
                //PLAY GLOW EFFECT ON ATTACH COMBO
                _oTableContainer.highlightAllAttach(false);
                _oTableContainer.highlightAttach(i,true);
                return true;
            }else{
                //REMOVE GLOW EFFECT ON ATTACH COMBO
                _oTableContainer.highlightAttach(i,false);
                bRes = false;
            }

        }
        
        return bRes;
    };
    
    this.checkIfComboIncomplete = function(){
        return _oTableContainer.checkIfComboIncomplete();
    };
    
    this.checkIfDroppingWasteCard = function(oCard){
        if(_oCardPickedFromWaste === null || _oCardPickedFromWaste.getFrame() !== oCard.getFrame()){
            return false;
        }
        
        return true;
    };
    
    this._releaseWasteCard = function(oCard){
        if(_aPlayerHand[PLAYER_ID].isHighlight()){
            _aPlayerHand[PLAYER_ID].highlight(false);
            
            oCard.unload();
            _oTableContainer.removeLastCardInWastePile();
            _aPlayerHand[PLAYER_ID].addCard(oCard);
            _aPlayerHand[PLAYER_ID].activateCardListener();
            
            //REMOVE DECK LISTENER
            _bReadyToChangeTurn = true;
            _oTableContainer.setClickableDeck(false);
            _oTableContainer.setWasteClickable(false);
            
            _oCardPickedFromWaste = oCard;
            
            _oTableContainer.showHandAnim(false);
            _bPlayerReady = true;
        }else{
            oCard.resetPosition();
        }
    };
    
    this.highlightAllAttach = function(bHighlight){
        _oTableContainer.highlightAllAttach(bHighlight);
    };
    
    this.isCardCollidingWithWaste = function(){
        return _oTableContainer.isWasteHighlighted();
    };
    
    this.isCardCollidingWithAttach = function(){
        for(var i=0;i<_oTableContainer.getComboListLen();i++){
            if(_oTableContainer.isAttachHighlighted(i)){
                return i;
            }
        }
        
        return -1;
    };
    
    this._onDeckRelease = function(){
        _bReadyToChangeTurn = true;
        
        //AVOID LISTENER ON WASTE PILE
        _oTableContainer.setWasteClickable(false);
        _oTableContainer.showHandAnim(false);
        _bPlayerReady = true;
        
        this.dealCardToPlayer();
    };
    
    
    
    this.calculateOpeningScore = function(){
        return _oTableContainer.calculateOpeningScore(_iCurTurn);
    };
    
    this.removePlayerCombos = function(){
        var aComboList = _oTableContainer.getPlayerCombos(_iCurTurn);
        for(var i=0;i<aComboList.length;i++){
            var aCardsInCombo = aComboList[i].combo.getCards();
            
            for(var k=0;k<aCardsInCombo.length;k++){
                _aPlayerHand[_iCurTurn].addCard(aCardsInCombo[k]);
            }
            
            if(i===0){
                _oTableContainer.resetCombo(aComboList[i].index);
            }
            
        }

        _aPlayerHand[_iCurTurn].activateCardListener();
    };
    
    this.removeComboIncomplete = function(){
        var iComboIndex = _oTableContainer.getComboIncomplete();
        if(iComboIndex === -1){
            return;
        }
        
        
        var oCombo = _oTableContainer.getComboOnTable(iComboIndex);
        
        var aCardsInCombo = oCombo.getCards();
        for(var k=0;k<aCardsInCombo.length;k++){
            _aPlayerHand[_iCurTurn].addCard(aCardsInCombo[k]);
        }
        
        this.removeCombo(iComboIndex);
        
        _aPlayerHand[_iCurTurn].activateCardListener();
        
        _aPlayerHand[_iCurTurn].resetComboAttempt();
    };
    
    this._calculateScore = function(iHand){
        var aCards = _aPlayerHand[iHand].getCards();
        var iScore = 0;
        for(var k=0;k<aCards.length;k++){
            var iRank = aCards[k].getValue();
            if(iRank >10 && iRank<14){
                iRank = 10;
            }else if(iRank === ACE_VALUE){
                iRank = SCORE_ACE;
            }else if(iRank === JOKER_VALUE){
                iRank = SCORE_JOKER;
            }
            
            iScore += iRank;

        }
        
        return iScore;
    };
    
    this._gameOver = function(){
        _bUpdate = false;
        var iFinalScore = 0;
        for(var i=0;i<_aPlayerHand.length;i++){
            if(i !== _iCurTurn){
                iFinalScore += this._calculateScore(i);
            }
        }
        
        var bRummy = false;
        var iDelay = 0;
        if( GOING_RUMMY_RULE && _aPlayerHand[_iCurTurn].checkRummy()){
            iFinalScore *= 2;
            _oRummyAnim.show();
            bRummy = true;
            iDelay = 4500;
        }

        
        //ADD SCORE TO PLAYER
        _aPlayerHand[_iCurTurn].increaseScore(iFinalScore);
        
        
        var aScores = new Array();
        for(var i=0;i<_aPlayerHand.length;i++){
            aScores[i] = _aPlayerHand[i].getTotalScore();
        }

        
        if(_aPlayerHand[_iCurTurn].getTotalScore() >= SCORE_TO_REACH["player_"+s_iNumPlayers]){
            _oWinPanel.show(_iCurTurn,aScores,bRummy,iDelay);
        }else{
            _oGameOver.show(_iCurTurn,aScores,bRummy,iDelay);
        }
        
    };
    
    this.hideHandSwipe = function(){
        this.resetTimeElaps();
        _oTableContainer.hideHandSwipe();
    };
    
    this.getLastWasteCard = function(){
        return _oTableContainer.getLastCardInWastePile();
    };
 
    this.onExit = function(){
        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE,60);
    };
    
    this.onConfirmExit = function(){
        this.unload();
        
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        
        s_oMain.gotoMenu();
    };
    
    this._cleanCardUpdateArray = function(){
        var iCont = 0;
        while(iCont < _aCardUpdating.length){
            if(_aCardUpdating[iCont].isUpdating() === false){
                _aCardUpdating.splice(iCont,1);
            }else{
                iCont++;
            }
        }
    };
    
    this.onShuffle = function(){
        if(_bCanShuffle === false){
            return;
        }
        _bCanShuffle = false;

        var aCards = _aPlayerHand[0].getCards();
        var aSortedCards = s_oHandEvaluator.sortCards(aCards);

        _aPlayerHand[PLAYER_ID].sortCards(aSortedCards);
        
    };
    
    this.setCanShuffle = function(bValue){
        _bCanShuffle = bValue;
    };
    
    this.setOpeningForCurPlayer = function(){
        _aPlayerHand[_iCurTurn].setOpening(true);
    };
    
    this.setUpdate = function(bUpdate){
        _bUpdate = bUpdate;
    };
    
    this.getPlayerHandY = function(iIndex){
        return _aPlayerHand[iIndex].getY();
    };
    
    this.getWastePilePos = function(){
        return _oTableContainer.getGlobalWastePilePos();
    };
    
    this.getAttachPos = function(iIndex){
        return _oTableContainer.getGlobalAttachPos(iIndex);
    };
    
    this.getTableScale = function(){
        return _oTableContainer.getScale();
    };
    
    this.getComboOnTable = function(iIndex){
        return _oTableContainer.getComboOnTable(iIndex);
    };
    
    this.getCurTurn = function(){
        return _iCurTurn;
    };
            
    this.getLastAvailableAttachIndex = function(){
        return _oTableContainer.getLastAvailableAttachIndex();
    };
    
    this.getNumCardsInCombo = function(iComboIndex,iPlayer){
        return _oTableContainer.getNumCardsInCombo(iComboIndex,iPlayer);
    };
    
    this.checkIfOwner = function(iIndex,iPlayer){
        return _oTableContainer.checkIfOwner(iIndex,iPlayer);
    };
    
    this.isReadyForChangeTurn = function(){
        return _bReadyToChangeTurn;
    };
    
    this.isOpeningScoreReached = function(){
        return _aPlayerHand[_iCurTurn].isOpeningScoreReached();
    };
    
    this.isPlayerTurn = function(){
        return _iCurTurn===PLAYER_ID?true:false;
    };
    
    this.update = function(){
        if(_bUpdate){
            for(var i=0;i<_aCardUpdating.length;i++){
                _aCardUpdating[i].update();
            }
            
            this._cleanCardUpdateArray();
            
            _oAiController.update();
            
            if(_bPlayerReady){
                _iTimeElaps += s_iTimeElaps;
                if(_iTimeElaps > TIME_HELP_PLAYER){
                    _bPlayerReady = false;
                    var pStart = {x:_aPlayerHand[_iCurTurn].getX(),y:_aPlayerHand[_iCurTurn].getY()};
                    var pEnd = {x:0,y:0};
                    _oTableContainer.showSwipeAnim(pStart,pEnd);
                }
            }
        }
    };

    s_oGame = this;
    
    this._init();
}

var s_oGame = null;
var s_oHandEvaluator;