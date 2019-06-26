class WordObject
{
    constructor(text)
    {
        this.generationCode = WordSpace.nextWordCode++;

        this.wordText = text;
        //this.wordText = Input.removeConVow(text);
        this.wordTyping = (function(_wordText)
        {
            var temp = 0;
            for(var i = 0; i < _wordText.length; i++)
            {
                temp += parseFloat(firstSound(_wordText.charAt(i))) + middleSound(_wordText.charAt(i)) + lastSound(_wordText.charAt(i));
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
        //console.log("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
    }

    instantiate(scene)
    {
        var randomX = Phaser.Math.Between(100, 700);
        this.physicsObj = scene.physics.add.sprite(randomX, 100, 'wordBackground').setScale(0.3);
        this.wordObj = scene.add.text(randomX, 100, this.wordText, {fontFamily: '"궁서", 궁서체, serif'}).setColor('#000000');
        this.wordObj.setOrigin(0.5,0.5);
    }

    destroy()
    {
        this.wordObj.destroy();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
    }
    
    attract(wordSpeed)
    {
        var dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        var angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        this.physicsObj.setVelocity(dist * Math.cos(angle) * wordSpeed, dist * Math.sin(angle) * wordSpeed);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
    }

    getWordWeight() { return this.wordWeight; }

    isEqualObject(_generationCode) { return _generationCode === this._generationCode; }
}

function firstSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0) - parseInt('0xac00',16)) /28) / 21);
    if(r === 1 || r === 4 || r === 8 || r === 10 || r === 13) return 1.3;
    else return 1;
}

function middleSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21);
    if(r === 3 || r === 7) return 1.3;
    else if(r === 9 || r === 10 || r === 11 || r === 14 || r === 15 || r === 16 || r === 19) return 2;
    else return 1;
}

function lastSound(charText)
{
    var r = parseInt((charText.charCodeAt(0) - parseInt('0xac00',16)) % 28);
    if(r === 2 || r === 20) return 1.3;
    else if(r === 0) return 0;
    else if(r === 3 || r === 5 || r === 6 || r === 9 || r === 10 || r === 11 || r === 12 || r === 13 || r === 14 || r === 15 || r === 18) return 2;
    else return 1;
}