class WordObject
{
    constructor(text)
    {
        this.generationCode = WordSpace.nextWordCode++;

        this.wordText = text;
        this.wordTyping = (function(_wordText)
        {
            var temp = 0;
            for(var i = 0; i < _wordText.length; i++)
            {
                temp += firstSound(_wordText.charAt(i)) + middleSound(_wordText.charAt(i)) + lastSound(_wordText.charAt(i));
            }
            return temp;
        })(this.wordText);
        this.wordGrade = 2 < this.wordTyping && this.wordTyping < 6 ? 3 :
                         7 < this.wordTyping && this.wordTyping < 11 ? 2 : 
                         12 < this.wordTyping && this.wordTyping < 16 ? 1 : 0;
        this.wordWeight = (function(_wordGrade)
        {
            var temp = 0;
            temp = _wordGrade == 3 ? 3 : 
                _wordGrade == 2 ? 5 : 
                _wordGrade == 1 ? 7 : 10;
            return temp;
        })(this.wordGrade);
        this.isForced = true;
        //alert("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
    }

    instantiate(scene)
    {
        var randomX = Phaser.Math.Between(100, 700);
        this.physicsObj = scene.physics.add.sprite(randomX, 100, 'wordBackground').setScale(0.3);
        this.physicsObj.body.bounce.set(0.5);
        this.wordObj = scene.add.text(randomX, 100, this.wordText, {fontFamily: '"궁서", 궁서체, serif'}).setColor('#000000');
        this.wordObj.setOrigin(0.5,0.5);
    }

    destroy()
    {
        console.log(this.generationCode + ': ' + this.wordText + ' destroyed');
        this.wordObj.destroy();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
    }

    attract(wordSpeed)
    {
        if (this.isForced)
        {
            var dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
            var angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
            this.physicsObj.setVelocity(dist * Math.cos(angle) * wordSpeed, dist * Math.sin(angle) * wordSpeed);
        }
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
    }

    getWordWeight()
    {
        return this.wordWeight;
    }

    isEqualObject(_generationCode)
    {
        return _generationCode === this.generationCode;
    }

    //***********ToDo*************
    isEqual(inputWord)
    {
        return this.wordText === inputWord;
    }
    //****************************
}

function firstSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0) - parseInt('0xac00',16)) /28) / 21);
    switch(r)
    {
        case 1 || 4 || 8 || 19 || 13: return 1.3;
        default: return 1;
    }
    /*var t = String.fromCharCode(r + parseInt('0x1100',16));
    console.log("first sound : " + r + " " + t);
	return r;*/
}

function middleSound(charText)
{
	var r = parseInt(((charText.charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21);
    switch(r)
    {
        case 3 || 7: return 1.3;
        case 9 || 10 || 11 || 14 || 15 || 16 || 19: return 2;
        default: return 1;
    }
    /*var t = String.fromCharCode(r + parseInt('0x1161',16));
    console.log("middle sound : " + r + " " + t);
	return r;*/
}

function lastSound(charText)
{
	var r = parseInt((charText.charCodeAt(0) - parseInt('0xac00',16)) % 28);
    switch(r)
    {
        case 2 || 20: return 1.3;
        case 3 || 5 || 6 || 9 || 10 || 11 || 12 || 13 || 14 || 15 || 18: return 2;
        case 0: return 0;
        default: return 1;
    }
    /*var t = String.fromCharCode(r + parseInt('0x11A8') -1);
    console.log("last sound : " + r + " " + t);
	return r;*/
}