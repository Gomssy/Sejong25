class WordObject
{
    constructor(text)
    {
        this.generationCode = WordSpace.nextWordCode++;
        this.wordText = text;
        this.wordTyping = WordReader.getWordTyping(this.wordText);
        this.wordGrade = WordReader.getWordGrade(this.wordTyping);
        this.wordWeight = WordReader.getWordWeight(this.wordGrade);
        //console.log("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
        this.wordSpeed = 0.5;
    }

    instantiate(scene,lenRate)
    {
        let p = [{x : 3, y : 0.7}, {x : 20, y : 1.8}];
        let scale = ((p[1].y - p[0].y) / (p[1].x - p[0].x)) * (this.wordWeight - p[0].x) + p[0].y;
        let fontscale = 25;
        var random = WordSpace.getSpawnPoint(lenRate);
        this.physicsObj = scene.physics.add.sprite(random.x, random.y, 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6))
        .setMass(this.wordWeight)
        .setScale(scale)
        .setBounce(0.5);
        
        this.wordObj = scene.add.text(random.x, random.y, this.wordText, 
            {
                fontSize: (scale * fontscale) +'pt',
                fontFamily: '"궁서", 궁서체, serif',
                fontStyle: (this.wordWeight > 5 ? 'bold' : '')
            }).setColor('#000000').setOrigin(0.5,0.5);
        WordSpace.totalWeight += this.wordWeight;
        WordSpace.totalWordNum += 1;
        WordSpace.setGameOverTimer();
        //console.log("Total weight : " + WordSpace.totalWeight);
    }

    destroy()
    {
        console.log(this.generationCode + ': ' + this.wordText + ' destroyed');
        WordSpace.totalWeight -= this.wordWeight;
        WordSpace.totalWordNum -= 1;
        this.wordObj.destroy();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
    }

    attract()
    {
        let gravityScale = 0.1;
        let accel = {x: 0, y: 0};
        let dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        let angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        accel.x += Math.pow(dist,2) * gravityScale * Math.cos(angle);
        accel.y += Math.pow(dist,2) * gravityScale * Math.sin(angle);

        this.physicsObj.setVelocity(dist * Math.cos(angle) * this.wordSpeed, dist * Math.sin(angle) * this.wordSpeed);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
        this.physicsObj.setVelocity(dist * Math.cos(angle) * this.wordSpeed, dist * Math.sin(angle) * this.wordSpeed);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
    }

    isEqualObject(_generationCode) { return _generationCode === this.generationCode; }
}

class AttackWord extends WordObject
{
    constructor(text, _attacker)
    {
        super(text);
        this.attacker = _attacker;
        this.attackedTime = WordSpace.gameTimer.now;
        console.log('Attack text : ' + text + ', Attacker : ' + _attacker);
    }
}