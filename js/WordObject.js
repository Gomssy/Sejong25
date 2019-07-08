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
        .setMass(this.wordWeight * 10)
        .setScale(scale)
        .setFrictionX(0)
        .setFrictionY(0)
        .setBounce(0.5);

        let dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        let angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);

        //임시땜빵
        this.moveStarted = false;
        this.initSpeed = {x: Math.max(0, 200-WordSpace.totalWeight) * Math.cos(angle), y: Math.max(0, 200-WordSpace.totalWeight) * Math.sin(angle)};
        
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
        WordSpace.resetGameOverTimer();
        this.wordObj.destroy();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
    }


    attract()
    {
        if(!this.moveStarted)
        {
            this.moveStarted = true;
            this.physicsObj.setVelocity(this.initSpeed.x, this.initSpeed.y);
        }
        let gravityScale = 0.8, velocityLimit;
        let accel = {x: this.physicsObj.body.velocity.x, y: this.physicsObj.body.velocity.y};
        let dist, angle;
        let vel;

        dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        velocityLimit = dist * 0.9;
        accel.x += gravityScale * Math.cos(angle);
        accel.y += gravityScale * Math.sin(angle);

        vel = Phaser.Math.Distance.Between(accel.x,accel.y,0,0);
        if(vel > velocityLimit)
        {
            accel.x *= velocityLimit / vel;
            accel.y *= velocityLimit / vel;
        }

        this.physicsObj.setVelocity(accel.x, accel.y);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);

    }

    isEqualObject(_generationCode) { return _generationCode === this.generationCode; }
}

class NormalWord extends WordObject
{
    constructor(text)
    {
        super(text);
    }
    destroy()
    {
        switch(this.wordGrade)
        {
            case 0: WordSpace.attackGauge.add(2.5); break;
            case 1: WordSpace.attackGauge.add(1.5); break;
            case 2: WordSpace.attackGauge.add(0.9); break;
            case 3: WordSpace.attackGauge.add(0.5); break;
            default: console.log('[ERR] wrong grade of word'); break;
        }
        super.destroy();
    }
}

class AttackWord extends WordObject
{
    constructor(text, _wordGrade, _attacker, isStrong)
    {
        super(text);
        this.wordGrade = _wordGrade;
        this.wordWeight = WordReader.getWordWeight(this.wordGrade);
        if(WordReader.getWordTyping(_attacker) <= 9)
            this.wordWeight += this.wordWeight * 0.2 * (WordReader.getWordTyping(playerName) - 9);
        this.wordWeight *= isStrong ? 3 : 2;
        this.attacker = _attacker;
        //서버 사용하게 되면 PlayerTyping을 피격자의 것으로 바꿔야 함
        this.counterTime = WordSpace.gameTimer.now + 1000 * (this.wordTyping <= (5 - _wordGrade) * 2.5 ? this.wordTyping * (WordSpace.playerTyping / 60) * 2 :
                            ((5 - _wordGrade) * 2.5 + (this.wordTyping - (5 - _wordGrade) * 2.5) * 3) * (WordSpace.playerTyping / 60) * 2);
        console.log('Attack text : ' + text + ', Attacker : ' + this.attacker + ', Weight : ' + this.wordWeight);
        console.log('Counter time : ' + this.counterTime);
    }
    destroy()
    {
        switch(this.wordGrade)
        {
            case 0: WordSpace.attackGauge.add(2.5); break;
            case 1: WordSpace.attackGauge.add(1.5); break;
            case 2: WordSpace.attackGauge.add(0.9); break;
            case 3: WordSpace.attackGauge.add(0.5); break;
            default: console.log('[ERR] wrong grade of word'); break;
        }
        if(WordSpace.gameTimer.now < this.counterTime) WordSpace.generateWord.Name(WordSpace.gameSceneForTest, true);
        super.destroy();
    }
}

class NameWord extends WordObject
{
    constructor(text, _isStrong = false)
    {
        super(text);
        this.wordWeight = 2;
        this.isStrong = _isStrong;
        console.log('Name : ' + text + ', Strong : ' + this.isStrong + ', Weight : ' + this.wordWeight);
    }
    destroy()
    {
        WordSpace.attackGauge.add(this.wordTyping * 0.1);
        WordSpace.nameGroup.push(this);
        super.destroy();
    }
}
