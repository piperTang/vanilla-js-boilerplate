function CDeckController(){
    var _aCardDeck;
    var _aShuffledCardDecks;
    var _aCardValue;
    
    this._init = function(){
       
        _aCardDeck=new Array();
        
        var iNumDeck = s_iNumPlayers===2?1:2;
        for(var i=0;i<iNumDeck;i++){
            var iSuit = 0;
            for(var j=0;j<52;j++){
            
                var iRest=(j+1)%13;
                _aCardDeck.push({frame:j,rank:iRest===0?13:iRest,suit:iSuit});
                //trace("frame:"+j+",rank:"+iRest+",suit:"+iSuit )
                if(iRest === 0){
                    iSuit++;
                } 
            }
        }
        
        if(JOKER_AVAILABLE){
            //ADD TWO JOKER
            _aCardDeck.push({frame:52,rank:JOKER_VALUE,suit:5});
            _aCardDeck.push({frame:53,rank:JOKER_VALUE,suit:5});
            
            
            if(s_iNumPlayers>2){
                _aCardDeck.push({frame:52,rank:JOKER_VALUE,suit:5});
                _aCardDeck.push({frame:53,rank:JOKER_VALUE,suit:5});
            }
        }
        
    };
		
    this.getShuffledCardDeck = function(){
        _aShuffledCardDecks = new Array();

        for(var i=0;i<_aCardDeck.length;i++){
                _aShuffledCardDecks[i]=_aCardDeck[i];
        }
        
        _aShuffledCardDecks = shuffle(_aShuffledCardDecks);
        
        return _aShuffledCardDecks;
    };

    
    this.getCardValue = function(iId){
        return _aCardValue[iId];
    };
    
    this.getStartingDeckLength = function(){
        return _aCardDeck.length;
    };
                
    this._init();
}