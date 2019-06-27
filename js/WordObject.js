class WordObject
{
    constructor(text)
    {
        this.generationCode = WordSpace.nextWordCode++;
        this.wordText = text;
        //this.wordText = Input.removeConVow(text);
        this.wordTyping = WordReader.getWordTyping(this.wordText);
        this.wordGrade = WordReader.getWordGrade(this.wordTyping);
        this.wordWeight = (function(_wordGrade)
        {
            var temp = 0;
            temp = _wordGrade == 3 ? 3 : 
                _wordGrade == 2 ? 5 : 
                _wordGrade == 1 ? 7 : 10;
            return temp;
        })(this.wordGrade);
        WordSpace.totalWeight += this.wordWeight;
        WordSpace.setGameOverTimer();
        console.log("Total weight : " + WordSpace.totalWeight);
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