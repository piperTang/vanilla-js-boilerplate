function CHandEvaluatorController(){
    var _bStrictMode;
    var _iCurSortIndex = 0;
    var _iNumJoker;
    var _aSortedHand;
    var _aCards;
    var _aCombos;
    
    var _oThis = this;
    
    this.sortCards = function(aCards){
        var aSortedHand = new Array();
        for(var i=0;i<aCards.length;i++){
            aSortedHand[i] = {rank:aCards[i].getValue(),suit:aCards[i].getSuit(),orig_index:i};
        }
 
        switch(_iCurSortIndex){
            case 0:{
                    //SORT BY SUIT AND RANK
                    aSortedHand.sort(this.compareSuitAndRank);
                    break;
            }
            case 1:{
                    //SORT BY RANK
                    aSortedHand.sort(compareRank);
                    break
            }
        }
        
 
        _iCurSortIndex++;
        if(_iCurSortIndex >1){
            _iCurSortIndex = 0;
        }
        
        var aNewSort = new Array();
        for(var i=0;i<aSortedHand.length;i++){
            aNewSort[i] = aSortedHand[i].orig_index;
        }
        
        return aNewSort;
    };
    
    this.evaluate = function(bStrictMode,aCards){
        _bStrictMode = bStrictMode;
        _aSortedHand = new Array();
        _aCards = new Array();
        for(var i=0;i<aCards.length;i++){
            _aSortedHand[i] = {rank:aCards[i].getValue(),suit:aCards[i].getSuit(),orig_index:i};
            _aCards[i] = aCards[i];
        }
        
        _aSortedHand.sort(compareRank);
        //trace("evaluate sorted hand: "+JSON.stringify(_aSortedHand))
        
        this._checkJokerNum();
        
        return  this._rankHand();
        
    };
    
    this.compareSuitAndRank = function(a,b) {
        if(a.suit < b.suit){
            return -1;
        }else if(a.suit > b.suit){
            return 1;
        }else{
            return compareRank(a,b);
        }
    };
    
    
    
    this._compareSuits = function(aSuits){
        var object = {};
        var result = [];

        aSuits.forEach(function (item) {
          if(!object[item])
              object[item] = 0;
            object[item] += 1;
        });

        for (var prop in object) {
           if(object[prop] >= 2) {
               result.push(prop);
           }
        }

        return result.length>0?true:false;
    };
    
    this._checkJokerNum = function(){
        _iNumJoker = 0;
        
        if(_aSortedHand.length > 0 && _aSortedHand[_aSortedHand.length-1].rank === JOKER_VALUE){
            _iNumJoker++;
        }
        
        if(_aSortedHand.length > 1 && _aSortedHand[_aSortedHand.length-2].rank === JOKER_VALUE){
            _iNumJoker++;
        }
    };
    
    this._rankHand = function(){
        _aCombos = new Array();
        
        if(_aSortedHand.length >= 4 && this._checkPoker() === EVALUATE_POKER){
            return {res:EVALUATE_POKER,combo:_aCombos};
        }else if(ACE_HIGH && this._isStraightWithAceHigh()){
            return {res:EVALUATE_STRAIGHT_WITH_ACE_HIGH,combo:_aCombos};
        }else if(this._isClassicStraight()){
            return {res:EVALUATE_STRAIGHT,combo:_aCombos};
        }else if(_aSortedHand.length >= 3 && this._checkTris() === EVALUATE_TRIS){
            return {res:EVALUATE_TRIS,combo:_aCombos};
        }else{
            return {res:EVALUATE_NULL,combo:null};
        }
        
    };
    
    this._checkPoker = function(){
        if(_bStrictMode && _aSortedHand.length !== 4){
            return EVALUATE_NULL;
        }
        
        for(var i=0;i<_aSortedHand.length-3;i++){
            if(_aSortedHand[i].rank === _aSortedHand[i+1].rank && _aSortedHand[i].suit !== _aSortedHand[i+1].suit){
                var iCont = i+2;
                var aSuits = [_aSortedHand[i].suit,_aSortedHand[i+1].suit,_aSortedHand[iCont].suit,_aSortedHand[iCont+1].suit];
                if(_aSortedHand[iCont].rank === _aSortedHand[i].rank && _aSortedHand[iCont].rank === _aSortedHand[iCont+1].rank 
                                                                            && this._compareSuits(aSuits) === false){
                    
                    
                    //FOUND A POKER
                    _aCombos.push( _aSortedHand[i].orig_index);
                    _aCombos.push( _aSortedHand[i+1].orig_index);
                    _aCombos.push( _aSortedHand[iCont].orig_index);
                    _aCombos.push( _aSortedHand[iCont+1].orig_index);

                    //trace("FOUND POKER 1")
                    return EVALUATE_POKER;
                    
                } else if(_bStrictMode && _bStrictMode && _iNumJoker === 2 && _aSortedHand[0].rank === _aSortedHand[1].rank 
                                                        && _aSortedHand[0].suit !== _aSortedHand[1].suit && _aSortedHand.length === 4){
                    //FOUND A POKER WITH 2 JOKER
                    _aCombos.push( _aSortedHand[i].orig_index);
                    _aCombos.push( _aSortedHand[i+1].orig_index);
                    _aCombos.push( _aSortedHand[_aSortedHand.length-2].orig_index);
                    _aCombos.push( _aSortedHand[_aSortedHand.length-1].orig_index);

                    _iNumJoker = 0;
                    //trace("FOUND POKER 2")
                    return EVALUATE_POKER;
                } else if(_iNumJoker === 1 && _bStrictMode && _aSortedHand[iCont].rank === _aSortedHand[i].rank && 
                                            this._compareSuits([_aSortedHand[i].suit,_aSortedHand[i+1].suit,_aSortedHand[iCont].suit]) === false){
                    //FOUND A POKER WITH 1 JOKER
                    _aCombos.push( _aSortedHand[i].orig_index);
                    _aCombos.push( _aSortedHand[i+1].orig_index);
                    _aCombos.push( _aSortedHand[iCont].orig_index);
                    _aCombos.push( _aSortedHand[_aSortedHand.length-1].orig_index);
                   
                    _iNumJoker--;
                    //trace("FOUND POKER 3")
                    return EVALUATE_POKER; 
                }
            }
        }
        
        return EVALUATE_NULL;
    };
    
    this._checkTris = function(){
        _aCombos = new Array();
        if(_bStrictMode && _aSortedHand.length !== 3){
            return EVALUATE_NULL;
        }

        for(var i=0;i<_aSortedHand.length-2;i++){
            if(_aSortedHand[i].rank === _aSortedHand[i+1].rank && _aSortedHand[i].suit !== _aSortedHand[i+1].suit){
                var aSuits = [_aSortedHand[i].suit,_aSortedHand[i+1].suit,_aSortedHand[i+2].suit];
                if(_aSortedHand[i+2].rank === _aSortedHand[i].rank && this._compareSuits(aSuits) === false){
                    
                    //FOUND A TRIS
                    _aCombos.push( _aSortedHand[i].orig_index);
                    _aCombos.push( _aSortedHand[i+1].orig_index);
                    _aCombos.push( _aSortedHand[i+2].orig_index);
                  

                    //trace("FOUND TRIS 1")
                    return EVALUATE_TRIS;
                    
                }else if(_iNumJoker > 0){
                    //FOUND A TRIS WITH 1 JOKER
                    _aCombos.push( _aSortedHand[i].orig_index);
                    _aCombos.push( _aSortedHand[i+1].orig_index);
                    _aCombos.push( _aSortedHand[_aSortedHand.length-1].orig_index);
                    
                    _iNumJoker--;
                    //trace("FOUND TRIS 2")
                    return EVALUATE_TRIS;
                    
                }
            }else if(_bStrictMode && _iNumJoker === 2){
                _aCombos.push( _aSortedHand[i].orig_index);
                _aCombos.push( _aSortedHand[_aSortedHand.length-2].orig_index);
                _aCombos.push( _aSortedHand[_aSortedHand.length-1].orig_index);
                //trace("FOUND TRIS 3")
                return EVALUATE_TRIS;    
            }
        }
        
        return EVALUATE_NULL;
    };

    
    this._isStraight = function() {    
        if(_aSortedHand[0].rank === 13 || (_aSortedHand.length === 3 && _iNumJoker === 2)){
            return false;
        }
        
        for(var i=0;i<_aSortedHand.length-2;i++){
            var iCurRank = _aSortedHand[i].rank;
            var iCont = i+1;
            var bJokerAvailable = _iNumJoker>=1?true:false;
            _aCombos = new Array();
            _aCombos.push( _aSortedHand[i].orig_index);
            while(iCont< _aSortedHand.length){
                if( (iCurRank +1 === _aSortedHand[iCont].rank && _aSortedHand[i].suit === _aSortedHand[iCont].suit)){ 
                    
                    _aCombos.push( _aSortedHand[iCont].orig_index);
                    iCurRank++;
                    iCont += 1;
                }else if( _bStrictMode && _aSortedHand[iCont].rank !== JOKER_VALUE && _iNumJoker>0 && _aSortedHand[iCont].rank-(iCurRank+1) <= _iNumJoker ){ 
                    var iNum = _aSortedHand[iCont].rank-(iCurRank+1);
                    if(iNum <= 0){
                        iCont++;
                    }else{
                        for(var k=0;k<iNum;k++){
                            _aCombos.push( _aSortedHand[_aSortedHand.length-(k+1)].orig_index);
                            iCurRank++;
                            _iNumJoker--;
                        }
                        bJokerAvailable = false;
                    }
                    
                    
                    
                }else if( ((iCurRank + 2 === _aSortedHand[iCont].rank && _aSortedHand[i].suit === _aSortedHand[iCont].suit) || 
                                        (!_bStrictMode && _aSortedHand[iCont].rank === JOKER_VALUE && _aCombos.length<3) ) && bJokerAvailable){
                    bJokerAvailable = false;
                    if(_aSortedHand[iCont].rank !== JOKER_VALUE){
                        _aCombos.push( _aSortedHand[iCont].orig_index);
                    }
                    
                    //ADD JOKER CARD
                    _aCombos.push( _aSortedHand[_aSortedHand.length-1].orig_index);
                    
                    iCurRank += 2;
                }else{
                    iCont += 1;
                }
                
                
            }
            
            if(_bStrictMode){
                if(_aCombos.length === _aCards.length-_iNumJoker){
                    if(_aSortedHand[_aSortedHand.length-1-_iNumJoker].rank === 13 && _iNumJoker>0 && !ACE_HIGH){
                        return false;
                    }else if(_iNumJoker>0){
                        for(var j=0;j<_iNumJoker;j++){
                            _aCombos.push(_aSortedHand[_aSortedHand.length-j-1].orig_index)
                        }
                        
                    }
                    //trace("FOUND STRAIGHT");
                    return true;
                }else{
                    return false;
                }
            }else if(_aCombos.length>2){
                //trace("FOUND STRAIGHT")
                return true;
            }

        }
        
        return false;
    };
    
    this._isClassicStraight = function(){
        _aSortedHand = new Array();
        for(var i=0;i<_aCards.length;i++){
            _aSortedHand[i] = {rank:_aCards[i].getValue()===ACE_VALUE?1:_aCards[i].getValue(),suit:_aCards[i].getSuit(),orig_index:i};
        }
        
        _aSortedHand.sort(compareRank);
        
        return this._isStraight();
    };
    
    this._isStraightWithAceHigh = function(){
        _aSortedHand = new Array();
        for(var i=0;i<_aCards.length;i++){
            _aSortedHand[i] = {rank:_aCards[i].getValue()===ACE_VALUE?14:_aCards[i].getValue(),suit:_aCards[i].getSuit(),orig_index:i};
        }
        
        _aSortedHand.sort(compareRank);
        
        
        var bStraight = this._isStraight();
        if(bStraight){
            //CHECK IF THERE IS AN ACE IN THE STRAIGHT OR JOKER IS REPLACING AN ACE
            for(var k=0;k<_aCombos.length;k++){
                if(_aCards[_aCombos[k]].getValue() === ACE_VALUE || (_aCards[_aCombos[k]].getValue() === JOKER_VALUE && k>0 && _aCards[_aCombos[k-1]].getValue() === 13) ){
                    return true;
                }
            }
            //RESET JOKER FOR FOLLOWING HAND EVALUATION
            this._checkJokerNum();
            return false;
        }else{
            this._checkJokerNum();
            return false;
        }
    };
    
    this._checkIfAllSuitAreEqual = function(iLastIndex){
        var iSuit = _aSortedHand[0].suit;
        for(var i=1;i<iLastIndex;i++){
            if(iSuit !== _aSortedHand[i].suit){
                return false;
            }
        }
        
        return true;
    };

   
    
    
    this.checkIfCanReplaceJoker = function(aCards,iComboType,oCardToReplace){
        var aSortedCard = new Array();
        var iNumJoker = 0;
        var aIndexJoker = [];
        for(var i=0;i<aCards.length;i++){
            aSortedCard[i] = {rank:aCards[i].getValue(),suit:aCards[i].getSuit()};
            if(aCards[i].getValue() === JOKER_VALUE){
                iNumJoker++;
                aIndexJoker.push(i);
            }
        }
        
        if(iNumJoker === 0){
            return false;
        }
        
        aSortedCard.sort(compareRank);
        
        switch(iComboType){
            case EVALUATE_POKER:
            case EVALUATE_TRIS:{
                    var aSuits = [0,1,2,3];
                    var iRank = -1;
                    for(var i=0;i<aCards.length;i++){
                        
                        if(aCards[i].getValue() === JOKER_VALUE && oCardToReplace.getValue() === iRank && aSuits.indexOf(oCardToReplace.getSuit()) > -1){
                             return true;
                        }else{
                            iRank = aCards[i].getValue();
                            var iIndex = aSuits.indexOf(aCards[i].getSuit());
                            aSuits.splice(iIndex,1);
                        }
                    }
                    break;
            }
            
            case EVALUATE_STRAIGHT:{
                    for(var k=0;k<aIndexJoker.length;k++){
                        if(aIndexJoker[k]>0){
                            var iRank = aCards[aIndexJoker[k]-1].getValue()+1;
                            var iSuit = aCards[aIndexJoker[k]-1].getSuit();
                            if( oCardToReplace.getValue() === iRank && oCardToReplace.getSuit() === iSuit){
                                return true;
                            }
                        }else{
                            var iRank = aCards[aIndexJoker[k]+1].getValue()-1;
                            var iSuit = aCards[aIndexJoker[k]+1].getSuit();
                            if( oCardToReplace.getValue() === iRank && oCardToReplace.getSuit() === iSuit){
                                return true;
                            }
                        }
                    }
                    break;
            }
            case EVALUATE_STRAIGHT_WITH_ACE_HIGH:{
                    for(var k=0;k<aIndexJoker.length;k++){
                        if(aIndexJoker[k]>0){
                            var iRank = aCards[aIndexJoker[k]-1].getValue()+1;
                            var iSuit = aCards[aIndexJoker[k]-1].getSuit();
                            if((  (oCardToReplace.getValue() === iRank || (iRank === 14 && oCardToReplace.getValue() === ACE_VALUE) )&& oCardToReplace.getSuit() === iSuit) ){
                                return true;
                            }
                        }else{
                            var iRank = aCards[aIndexJoker[k]+1].getValue()-1;
                            var iSuit = aCards[aIndexJoker[k]+1].getSuit();
                            if( oCardToReplace.getValue() === iRank && oCardToReplace.getSuit() === iSuit){
                                return true;
                            }
                        }
                    }   
                    break;
            }
        }
        
        return false;
    };
    
    this.getJokerValue = function(aCards,iCardIndex,iComboType){
        var iNumJoker = 0;
        for(var i=0;i<aCards.length;i++){
            if(aCards[i].getValue() === JOKER_VALUE){
                iNumJoker++;
            }
        }
        
        if(iNumJoker === 0){
            return 0;
        }

        
        switch(iComboType){
            case EVALUATE_POKER:
            case EVALUATE_TRIS:{
                    for(var k=0;k<aCards.length;k++){
                        if(aCards[k].getValue() === JOKER_VALUE){
                            if(k>0){
                                return aCards[k-1].getValue();
                            }else{
                                return aCards[k+1].getValue();
                            }
                            
                        }
                    }
                    break;
            }
            
            case EVALUATE_STRAIGHT:{
                    var iOffset = 0;
                    var iNewIndex = iCardIndex;
                    if(iCardIndex === 0){
                        /*
                        do{
                            iNewIndex++;
                            iOffset--;
                        }while(aCards[iNewIndex].getValue() === JOKER_VALUE);
                        */
                            
                        while(iNewIndex < aCards.length && aCards[iNewIndex].getValue() === JOKER_VALUE){
                            iNewIndex++;
                            iOffset--;
                        }
                    }else{
                        /*
                        do{
                            iNewIndex--;
                            iOffset++;
                        }while(aCards[iNewIndex].getValue() === JOKER_VALUE);*/
                        while(iNewIndex >= 0 && aCards[iNewIndex].getValue() === JOKER_VALUE){
                            iNewIndex--;
                            iOffset++;
                        }
                        
                    }
                    //trace("iCardIndex "+iCardIndex)
                    //trace("iNewIndex "+iNewIndex)
                    //printCards(aCards)
                    if(aCards[iNewIndex].getValue() >9 && aCards[iNewIndex].getValue()<14){
                        return 10;
                    }else if(aCards[iNewIndex].getValue() === ACE_VALUE){
                        return 2;
                    }else{
                        //trace("aCards["+iNewIndex+"].getValue() "+aCards[iNewIndex].getValue())
                        return aCards[iNewIndex].getValue() + iOffset;
                    }
            }
            case EVALUATE_STRAIGHT_WITH_ACE_HIGH:{
                    var iOffset;
                    var iNewIndex;
                    if(iCardIndex === 0){
                        iNewIndex = iCardIndex+1;
                        iOffset = -1;
                    }else{
                        iOffset = 1;
                        iNewIndex = iCardIndex-1;
                    }
                    
                    if(aCards[iNewIndex].getValue() === ACE_VALUE){
                        return 11;
                    }else{
                        return aCards[iNewIndex].getValue() + iOffset;
                    }

                    break;
            }
        }
    };
    
    
    this.getScore = function(aCards,iComboType){
        var iScore = 0;
        for(var k=0;k<aCards.length;k++){
            var iValue = aCards[k].getValue();
        
            if(iValue>10 && iValue <14){
                iValue = 10;
            }else if(iValue === ACE_VALUE || iValue === 14){
                if(iComboType === EVALUATE_STRAIGHT_WITH_ACE_HIGH){
                    iValue = 11;
                }else{
                    iValue = 1;
                }
                
            }else if(iValue === 15){
                iValue = s_oHandEvaluator.getJokerValue(aCards,k,iComboType);
            }

            //trace("iValue "+iValue)
            iScore += iValue;
            
        }
        //trace("iScore "+iScore)
        return iScore;
    };

}