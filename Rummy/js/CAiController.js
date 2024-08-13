function CAiController(){
    var _bUpdate = false;
    var _iTimeElaps;
    var _iCurState = STATE_AI_IDLE;
    var _iCurComboIndexToDeal;
    var _iCurCardIndexToDeal;
    var _iCurComboIndexAttach;
    var _aCards;
    var _aOrigCards;
    var _aComboList;
    
    this.startCheck = function(aCards){
        _iCurState = STATE_AI_IDLE
        _aComboList = new Array();
        _aCards = new Array();
        _aOrigCards = new Array();
        for(var i=0;i<aCards.length;i++){
            _aCards[i] = aCards[i];
            _aOrigCards[i] = aCards[i];
        }
        _iTimeElaps = 0;
        
        if(_aCards.length>2){
            _iCurState = STATE_AI_READY_TO_START;
        }else{
            //CHECK IF WASTE CARD CAN BE PLACED ON ANY COMBOS, PICK UP FROM THE DECK OTHERWISE
            var oParent = this;
            var oWasteCard = s_oGame.getLastWasteCard();
            _aCards.push(oWasteCard);
            if(s_oGame.checkIfCardFitInAnyCombo(oWasteCard,-1,_aCards.length)){
                setTimeout(function(){
                    s_oGame.dealCardFromWaste();
                    _iCurState = STATE_AI_CHECKED_COMBO;
                },1500);
                
            }else{
                _aCards.pop();
                setTimeout(function(){
                    oParent.getCardFromTheDeck();
                    _iCurState = STATE_AI_CHECKED_COMBO;
                },1500);
            }
            
        }
        
        
        _bUpdate = true;
    };
    
    this.restoreCards = function(){
        _aCards = new Array();
        for(var j=0;j<_aOrigCards.length;j++){
            _aCards[j] = _aOrigCards[j];
        }
        
        _aComboList = new Array();
    };
    
    this._checkWastePile = function(){
        //trace("@@@@@@@_checkWastePile@@@@@@@@@@@@@@");
        var oWasteCard = s_oGame.getLastWasteCard();
        _aCards.push(oWasteCard);
        _aOrigCards.push(oWasteCard);
        
        this._checkForCombos(true,oWasteCard);
        //trace("##################");
        _iCurState = STATE_AI_CHECKED_WASTE;
    };
    
    this._checkForCombos = function(bWasteCheck,oWasteCard){
        //trace("@@@@@@@_checkForCombos@@@@@@@@@@@@@@")
        //CHECK IF THERE ARE ANY COMBOS 
        var iWasteCardIndex = -1;
        if(bWasteCheck){
            iWasteCardIndex = _aCards.length-1;
        }
        
        var bWasteUseful = false;
        do{
            var oEvaluation = s_oHandEvaluator.evaluate(false,_aCards);
            var aCombo = oEvaluation.combo;
            
            if(aCombo !== null){

                var aSortedCombo = this.sortCombo(aCombo);
                //trace("SORTE COMBO "+aSortedCombo);
                
                //CHECK IF THIS COMBO USES ALL AVAILABLE CARDS IN THE HAND. AVOID THIS OR THE PLAYER CAN'T DISCARD ANY CARD!
                if(_aCards.length === aSortedCombo.length){
                    //SORT CARDS TO FIND HIGHER CARD
                    _aCards.sort(compareRank);
                    _aCards.pop();
                }else{
                    for (var i = aSortedCombo.length -1; i >= 0; i--){
                        _aCards.splice(aSortedCombo[i],1);
                    }

                    _aComboList.push({combo:aCombo,res:oEvaluation.res}); 

                    //trace("iWasteCardIndex "+iWasteCardIndex);
                    if(bWasteCheck && aCombo.indexOf(iWasteCardIndex) !== -1){
                        iWasteCardIndex = -1;
                        bWasteUseful = true;
                        //trace("WASTE GOGOGOGOGOGO")
                    }else{
                        iWasteCardIndex = _aCards.length-1;
                    }
                }
                
                
            }
        }while(oEvaluation.res !== EVALUATE_NULL && _aCards.length > 3);
        
        if( (_aComboList.length > 0 && this._checkOpeningScore()) || (bWasteCheck && oWasteCard.getValue() === JOKER_VALUE)  ){
            if(bWasteCheck && bWasteUseful){
                //trace("DEAL CARD FROM WASTE")
                //PICK THE CARD FROM THE WASTE
                s_oGame.dealCardFromWaste();
                _iCurState = STATE_AI_CARD_DEALING;
            }else if(bWasteCheck === false){
                _iCurComboIndexToDeal = 0;
                _iCurCardIndexToDeal = 0;
                _iCurComboIndexAttach = s_oGame.getLastAvailableAttachIndex();
                
                _iCurState = STATE_AI_CARD_DEALING;
            }else{
                _aOrigCards.pop();
                this.restoreCards();

                this.getCardFromTheDeck();
            }
            
        }else{
            _aComboList = new Array();
            if(bWasteCheck){
                
                _aOrigCards.pop();
                this.restoreCards();

                this.getCardFromTheDeck();
            }else{
                if(s_oGame.isOpeningScoreReached()){
                    _iCurState = STATE_AI_CHECKED_COMBO;
                }else{
                    _iCurState = STATE_AI_CHECKED_CARD_TABLE;
                }
            }    
        }
    };

    
    this.getCardFromTheDeck = function(){
        //GET A CARD FROM THE DECK
        var oCard = s_oGame.dealCardToPlayer();
        _aCards.push(oCard);
        _aOrigCards.push(oCard);
    };
    
    this._checkOpeningScore = function(){
        var iTotScore = 0;
        //trace("_aComboList.length "+_aComboList.length)
        for(var k=0;k<_aComboList.length;k++){
            var aComboCards = new Array();
            var aCurCombo = _aComboList[k].combo;
            for(var j=0;j<aCurCombo.length;j++){
                aComboCards.push(_aOrigCards[aCurCombo[j]]);
            }
            
            iTotScore += s_oHandEvaluator.getScore(aComboCards,_aComboList[k].res);
        }
        //trace("iTotScore "+iTotScore)
        
        if(s_oGame.isOpeningScoreReached()=== false && iTotScore < MIN_OPENING_VALUE){
            return false;
        }
        
        s_oGame.setOpeningForCurPlayer();
        return true;
    };

    
    this.sortCombo = function(aCombo){
        var aSortedCombo = new Array();
        for(var i=0;i<aCombo.length;i++){
            aSortedCombo[i] = aCombo[i];
        }
        return aSortedCombo.sort(function(a, b){return a - b;});
    };
    
    this._checkCardOnTable = function(){
        //trace("@@@@@@@_checkCardOnTable@@@@@@@@@@@@@@")
        var bFound = true;
        while(bFound && _aCards.length > 1){
            bFound = false;
            for(var k=0;k<_aCards.length;k++){
                if( s_oGame.checkIfCardFitInAnyCombo(_aCards[k],k,_aCards.length) ){
                    _aCards.splice(k,1);
                    bFound = true;
                    break;
                }
            }

        }

        //trace("print cards after _checkCardOnTable");
        //printCards(_aCards);
        
        _iCurState = STATE_AI_CHECKED_CARD_TABLE;
    }
    
    this._decideCardToWaste = function(){
        //trace("@@@@@@@_decideCardToWaste@@@@@@@@@@@@@@")
        _bUpdate = false;
        var aCardForWasting = new Array();
        
        if(_aCards.length === 1){
            aCardForWasting.push({rank:_aCards[0].getValue(),suit:_aCards[0].getSuit(),orig_index:0,card:_aCards[0]});
        }else{
            for(var k=0;k<_aCards.length;k++){
                if(_aCards[k] !== JOKER_VALUE){
                    if (this._evaluateSingleCardPotentiality(_aCards[k],k) === false || _aCards.length<4){
                        aCardForWasting.push({rank:_aCards[k].getValue(),suit:_aCards[k].getSuit(),orig_index:k,card:_aCards[k]});
                        //trace("aCardForWasting.push "+_aCards[k].getValue())
                    }
                }
            }
        }
        

        if(aCardForWasting.length > 0){
            aCardForWasting.sort(compareRank);
            
            var iCont = aCardForWasting.length-1;
            while(_aCards[iCont].getValue() === JOKER_VALUE && iCont > 0){
                iCont--;
            }
            
            s_oGame.addCardToWastePile(aCardForWasting[iCont].card,aCardForWasting[iCont].orig_index);
        }else{
            do{
               var iRandIndex = Math.floor(Math.random()*_aCards.length);
            }while(_aCards[iRandIndex].getValue() === JOKER_VALUE);
            s_oGame.addCardToWastePile(_aCards[iRandIndex],iRandIndex);
        }
    };
    
    this._evaluateSingleCardPotentiality = function(oCardToEvaluate,iIndex){
        //CHECK IF THERE IS ANOTHER CARD OF THE SAME TYPE
        for(var k=0;k<_aCards.length;k++){
            var oCard = _aCards[k];
            if(iIndex !== k){
                if(oCardToEvaluate.getSuit() === oCard.getSuit() && oCardToEvaluate.getValue() === oCard.getValue() ){
                    return false;
                }
            }
        }
        
        for(var i=0;i<_aCards.length;i++){
            var oCard = _aCards[i];
            if(iIndex !== i){
                if(oCardToEvaluate.getValue() === JOKER_VALUE){
                    return true;
                }

                //CHECK IF THESE TWO CARDS ARE COMPATIBLE FOR A TRIS COMBINATION
                if(oCardToEvaluate.getSuit() !== oCard.getSuit() && (oCardToEvaluate.getValue() === oCard.getValue()) ){
                    return true;
                }
                
                //CHECK IF THESE TWO CARDS ARE COMPATIBLE FOR A STRAIGHT COMBINATION
                if(oCardToEvaluate.getSuit() === oCard.getSuit() && (oCardToEvaluate.getValue() === oCard.getValue() +1 || oCardToEvaluate.getValue() === oCard.getValue() -1) ){
                    return true;
                }
                
                if(oCardToEvaluate.getSuit() === oCard.getSuit() && (oCardToEvaluate.getValue() === oCard.getValue() +2 || oCardToEvaluate.getValue() === oCard.getValue() -2) ){
                    return true;
                }
                
            }
        }
        
        return false;
    };
    
    this.placeComboOnTable = function(){
        //trace("@@@@@@@placeComboOnTable@@@@@@@@@@@@@@")
        //trace("_aComboList["+_iCurComboIndexToDeal+"] "+JSON.stringify(_aComboList[_iCurComboIndexToDeal]));
        var aCombo = _aComboList[_iCurComboIndexToDeal].combo;
        var iRes = _aComboList[_iCurComboIndexToDeal].res;

        var iIndex = aCombo[_iCurCardIndexToDeal];
        s_oGame.addCardToLastAttachAreaByIndex(iIndex,_iCurComboIndexAttach,iRes);
            
        _iCurCardIndexToDeal++;
        if(_iCurCardIndexToDeal === aCombo.length){
            _iCurCardIndexToDeal = 0;
            var aSortedCombo = this.sortCombo(aCombo);
            aSortedCombo = aSortedCombo.reverse();
            for(var k=0;k<aSortedCombo.length;k++){
                
                s_oGame.removeCardFromHandByIndex(aSortedCombo[k]);
            }
            
            s_oGame.compactCards();
            
            _iCurComboIndexToDeal++;
            _iCurComboIndexAttach = s_oGame.getLastAvailableAttachIndex();
            if(_iCurComboIndexToDeal === _aComboList.length){
                if(s_oGame.isOpeningScoreReached()){
                    _iCurState = STATE_AI_CHECKED_COMBO;
                }else{
                    _iCurState = STATE_AI_CHECKED_CARD_TABLE;
                }
                
            }
        }
        
    };
    
    this.update = function(){
        if(!_bUpdate){
            return;
        }
        
        _iTimeElaps += s_iTimeElaps;
        switch(_iCurState){
            case STATE_AI_READY_TO_START:{
                    if(_iTimeElaps > 2000){
                        _iCurState = -1;
                        _iTimeElaps = 0;
                        this._checkWastePile();
                    }
                    break;
            }
            case STATE_AI_CHECKED_WASTE:{
                    if(_iTimeElaps > 2000){
                        _iCurState = -1;
                        _iTimeElaps = 0;
                        this._checkForCombos(false);
                    }
                    break;
            }
            case STATE_AI_CARD_DEALING:{
                    if(_iTimeElaps > 1000){
                        _iTimeElaps = 0;
                        this.placeComboOnTable();
                    }
                    break;
            }
            case STATE_AI_CHECKED_COMBO:{
                    if(_iTimeElaps > 2000){
                        _iCurState = -1;
                        _iTimeElaps = 0;
                        this._checkCardOnTable();
                    }
                    break;
            }
            case STATE_AI_CHECKED_CARD_TABLE:{
                    if(_iTimeElaps > 1000){
                        _iCurState = -1;
                        _iTimeElaps = 0;
                        this._decideCardToWaste();
                    }
                    break;
            }
        }
    };
    
}