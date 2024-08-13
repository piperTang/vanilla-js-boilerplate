function CComboOnTable(iX,iY,oParentContainer){
    var _bHighlight;
    var _bPlacedOnTable;
    var _iComboType;
    var _iOwner = null;
    var _aCards;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListener;
    
    var _oAttachSprite;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY){
        _bHighlight = false;
        _bPlacedOnTable = false;
        _aCards = new Array();
        _aCbCompleted=new Array();
        _aCbOwner = new Array();

        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        //ATTACH AREA
        var oSpriteAttach = s_oSpriteLibrary.getSprite("attach_card");
        var oData = {   
                        images: [oSpriteAttach], 
                        // width, height & registration point of each sprite
                        frames: {width: oSpriteAttach.width/2, height: oSpriteAttach.height, regX: (oSpriteAttach.width/2)/2, regY: oSpriteAttach.height/2}, 
                        animations: {normal:0,highlight:1}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        
        _oAttachSprite = createSprite(oSpriteSheet,"normal",(oSpriteAttach.width/2)/2,oSpriteAttach.height/2,oSpriteAttach.width/2,oSpriteAttach.height);
        _oContainer.addChild(_oAttachSprite);
        
        _oListener = _oContainer.on("mousedown",this._onSelectCombo,this);
    };
    
    this.unload = function(){
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].unload();
        }
        _oParentContainer.removeChild(_oContainer);
        
        _oContainer.off("mousedown",_oListener);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.reset = function(){
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].unload();
        }
        
        _aCards = new Array();
        this.setOwner(null);
        
        
        _oAttachSprite.visible = true;
        this.unlight();
    };
    
    this.highlight = function(){
        if(_oAttachSprite.visible){
            _oAttachSprite.gotoAndStop("highlight");
        }else{
            _oContainer.shadow = new createjs.Shadow("#fff", 0, 0, 20);
        }
        
        _bHighlight = true;
    };
    
    this.unlight = function(){
        if(_oAttachSprite.visible){
            _oAttachSprite.gotoAndStop("normal");
        }else{
            _oContainer.shadow = null;
        }
        
        _bHighlight = false;
    };
    
    this.addCard = function(oCardToAdd,iComboType){
        _oAttachSprite.visible = false;
        
        if(iComboType === EVALUATE_REPLACE_JOKER){
            //FIND JOKER POSITION
            var iJokerIndex = 0;
            for(var k=0;k<_aCards.length;k++){
                if(_aCards[k].getValue() === JOKER_VALUE){
                    iJokerIndex = k;
                    break;
                }
            }

            
            //GIVE THE JOKER TO THE PLAYER
            s_oGame.dealJokerToTheCurPlayer(_aCards[iJokerIndex]);    
            _aCards.splice(iJokerIndex,1);
        }else{
            _iComboType = iComboType;
        }
        
        var iValue = oCardToAdd.getValue();
        
        if( (iComboType === EVALUATE_STRAIGHT_WITH_ACE_HIGH && oCardToAdd.getValue() === ACE_VALUE) ||
                                        (oCardToAdd.getValue() === ACE_VALUE && _aCards.length>0 && _aCards[_aCards.length-1].getValue() === 13) ){
            iValue = 14;
        }
        
        
        var oCard = new CCard(false,CARD_TABLE, new CVector2(0,0),oCardToAdd.getFrame(),iValue,oCardToAdd.getSuit(),_oContainer);
        _aCards.push(oCard);

        if( (_aCards.length >= 3 &&  iComboType === EVALUATE_REPLACE_JOKER) || 
                                    (s_oGame.isPlayerTurn() === false) || 
                                        (s_oGame.isPlayerTurn() && (iComboType === EVALUATE_STRAIGHT || iComboType === EVALUATE_STRAIGHT_WITH_ACE_HIGH)) ){
            this.sortCombo();
        }else{
            oCard.moveOnX((_aCards.length-1)*CARD_WIDTH_OFFSET_IN_HAND,500);
        }
        
        this.unlight();
        
        playSound("drop",1,false);
    };
    
    this.setOwner = function(iOwner){
        _iOwner = iOwner;
    };
    
    this._sortCardDepth = function(){
        var sortFunction = function(obj1, obj2, options) {
            if (obj1.x > obj2.x) { return 1; }
            if (obj1.x < obj2.x) { return -1; }
            return 0;
        };
        
        _oContainer.sortChildren(sortFunction);
    };
    
    this.sortCombo = function(){
        //CHECK IF FIRST CARD PLACED IN COMBO IS A JOKER
        var bFirstIsJoker = _aCards[0].getValue() === JOKER_VALUE?true:false;
        
        var aIndeces = new Array();
        _aCards.sort(this.compareRank);
        //printCards(_aCards)
        var iCont = _aCards.length-1;
        var iStartIndex = 0;
        while(_aCards[iCont].getValue() === JOKER_VALUE){
            var iIndexOfInsertion = -1;
            for(var i=iStartIndex;i<iCont-1;i++){
                var iDiff = _aCards[i+1].getValue()-_aCards[i].getValue();
                if(iDiff > 1 && iDiff<=_aCards.length-1){
                    iIndexOfInsertion = i+1;
                    break;
                }
            }

            if(iIndexOfInsertion !== -1){
                aIndeces.push(iIndexOfInsertion);
                iStartIndex = iIndexOfInsertion+1;
            }else{
                if(bFirstIsJoker){
                    var oJoker = _aCards.pop();
                    _aCards.unshift(oJoker);
                }
                break;
            }
            
            iCont--;
        }

        for(var j=0;j<aIndeces.length;j++){
            var oJoker = _aCards.pop();
            _aCards.splice(aIndeces[j], 0,oJoker);
        }

        var iXPos = 0;
        for(var i=0;i<_aCards.length;i++){
            _aCards[i].moveOnX(iXPos,500);
            iXPos += CARD_WIDTH_OFFSET_IN_HAND;
        }

        var oParent = this;
        setTimeout(function(){oParent._sortCardDepth();},600); 
    };
    
    this.compareRank = function(a,b) {
        if (a.getValue() < b.getValue())
           return -1;
        if (a.getValue() > b.getValue())
          return 1;
        return 0;
    };

    this.setPos = function(iX,iY){
        _oContainer.x = iX;
        _oContainer.y = iY;
    };
    
    this.setPlaced = function(){
        _bPlacedOnTable = true;
    };
    
    this._onSelectCombo = function(){
        if(_bPlacedOnTable === false && this.isIncomplete()){
            if(_aCbCompleted[ON_SELECT_COMBO]){
                _aCbCompleted[ON_SELECT_COMBO].call(_aCbOwner[ON_SELECT_COMBO],this);
            }
        }
    };
    
    this.isHighlighted = function(){
        return _bHighlight;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getCards = function(){
        return _aCards;
    };
    
    this.getCopyCards = function(){
        var aTmp = new Array();
        for(var i=0;i<_aCards.length;i++){
            aTmp[i] = _aCards[i];
        }
        
        return aTmp;
    };
    
    this.getNumCards = function(){
        return _aCards.length;
    };
    
    this.isIncomplete = function(){
        if(_aCards.length>0  &&  _aCards.length< 3){
            return true;
        }
        
        return false;
    };
    
    this.getType = function(){
        return _iComboType;
    };
    
    this.getSuits = function(){
        var aSuits = new Array();
        for(var k=0;k<_aCards.length;k++){
            aSuits.push(_aCards[k].getSuit());
        }
        
        return aSuits;
    };
    
    this.getPos = function(){
        return {x:_oContainer.x,y:_oContainer.y};
    };
    
    this.getWidth = function(){
        return _oContainer.getBounds().width;
    };
    
    this.getHeight = function(){
        return _oContainer.getBounds().height;
    };
    
    this.getScore = function(){
        return s_oHandEvaluator.getScore(_aCards,_iComboType);
    };
    
    this.getOwner = function(){
        return _iOwner;
    };
    
    this.isPlacedOnTable = function(){
        return _bPlacedOnTable;
    };
    
    this.getRect = function(){
        return new createjs.Rectangle(_oContainer.x,_oContainer.y,_oContainer.getBounds().width,_oContainer.getBounds().height);
    };
    
    this._init(iX,iY);
}