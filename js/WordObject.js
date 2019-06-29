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
        //console.log("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
        this.wordSpeed = 1;
        //alert("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
    }

    instantiate(scene)
    {
        var random = WordSpace.getSpawnPoint();
        this.physicsObj = scene.physics.add.sprite(random.x, random.y, 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6));
        this.wordObj = scene.add.text(random.x, random.y, this.wordText, {fontSize: '18pt', fontFamily: '"궁서", 궁서체, serif'}).setColor('#000000').setOrigin(0.5,0.5);
        WordSpace.totalWeight += this.wordWeight;
        WordSpace.setGameOverTimer();
        console.log("Total weight : " + WordSpace.totalWeight);
    }

    destroy()
    {
        console.log(this.generationCode + ': ' + this.wordText + ' destroyed');
        WordSpace.totalWeight -= this.wordWeight;
        this.wordObj.destroy();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
    }

    attract()
    {
        var dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        var angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        this.physicsObj.setVelocity(dist * Math.cos(angle) * this.wordSpeed, dist * Math.sin(angle) * this.wordSpeed);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
    }

    getWordWeight() { return this.wordWeight; }

    isEqualObject(_generationCode) { return _generationCode === this.generationCode; }
}