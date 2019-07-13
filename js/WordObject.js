class WordObject
{
    constructor(text, isNameWord = false)
    {
        this.generationCode = WordSpace.nextWordCode++;
        this.wordText = text;
        this.wordTyping = WordReader.getWordTyping(this.wordText);
        this.wordGrade = WordReader.getWordGrade(this.wordTyping);
        this.wordWeight = WordReader.getWordWeight(this.wordGrade);
        //console.log("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
        this.wordSpeed = 0.5;
        this.isNameWord = isNameWord;
    }

    instantiate(scene, lenRate)
    {
        let p = [{x : 3, y : 0.7}, {x : 20, y : 1.2}];
        let scale = ((p[1].y - p[0].y) / (p[1].x - p[0].x)) * (this.wordWeight - p[0].x) + p[0].y;
        let fontscale = 25;
        var random = WordSpace.getSpawnPoint(lenRate);

        if (!this.isNameWord)
        {
            this.physicsObj = scene.physics.add.sprite(random.x, random.y, 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6))
            .setMass(this.wordWeight * 10)
            .setScale(scale)
            .setFrictionX(0)
            .setFrictionY(0)
            .setBounce(0.5);
        }
        else
        {
            this.physicsObj = scene.physics.add.sprite(random.x, random.y, 'nameBgr' + Math.min(Math.max(2, this.wordText.length), 6))
            .setMass(this.wordWeight * 10)
            .setScale(scale)
            .setFrictionX(0)
            .setFrictionY(0)
            .setBounce(0.5);
        }
        

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
            });
        if (!this.isNameWord) this.wordObj.setColor('#000000').setOrigin(0.5,0.5);
        else this.wordObj.setColor('#ffffff').setOrigin(0.45,0.5);
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
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        if(!this.isNameWord)
        {
            this.wordObj.destroy();
            WordSpace.wordPhysicsGroup.remove(this.physicsObj, true, true);
        }
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
        this.wordObj.setPosition(this.physicsObj.x + (accel.x / 1000 * WordSpace.deltaTime), this.physicsObj.y + (accel.y / 1000 * WordSpace.deltaTime));
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
    constructor(text, _wordGrade, _playerData, isStrong)
    {
        super(text);
        this.wordGrade = _wordGrade;
        this.wordWeight = WordReader.getWordWeight(this.wordGrade);
        if(WordReader.getWordTyping(_playerData.nickname) > 9)
            this.wordWeight += this.wordWeight * 0.2 * (WordReader.getWordTyping(_playerData.nickname) - 9);
        this.wordWeight *= isStrong ? 3 : 2;
        this.attacker = _playerData;
        this.counterTime = WordSpace.gameTimer.now + 1000 * (this.wordTyping <= (5 - _wordGrade) * 2.5 ? this.wordTyping / (Math.max(200, WordSpace.playerTyping) / 60) * 1.5 :
                            ((5 - _wordGrade) * 3 + (this.wordTyping - (5 - _wordGrade) * 2.5) * 2.5) / (Math.max(200, WordSpace.playerTyping) / 60) * 1.5);
        console.log('Attack text : ' + text + ', Attacker : ' + this.attacker.nickname + ', Weight : ' + this.wordWeight);
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
        if(WordSpace.gameTimer.now < this.counterTime)
        {
            WordSpace.nameGroup.push(new NameWord(this.attacker, true));
        }
        //강호패 넣기 구현해야됨
        //WordSpace.generateWord.Name(WordSpace.gameSceneForTest, true);
        super.destroy();
    }
}

class NameWord extends WordObject
{
    constructor(player, _isStrong = false)
    {
        super(player.nickname, true);
        this.ownerId = player.id;
        this.wordWeight = 2;
        this.isStrong = _isStrong;
        this.isActive = true;
        console.log('Name : ' + player.nickname + ', Strong : ' + this.isStrong + ', Weight : ' + this.wordWeight);
    }
    attract()
    {
        if(this.isActive) super.attract();
    }
    destroy()
    {
        WordSpace.attackGauge.add(this.wordTyping * 0.1);
        WordSpace.nameGroup.push(this);
        this.isActive = false;
        this.physicsObj.setVelocity(0, 0);
        this.physicsObj.setPosition(500 + WordSpace.nameGroup.length * 25, 650).setDepth(2);
        this.physicsObj.angle = 90;
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y).setDepth(2);
        this.wordObj.angle = 90;
        super.destroy();
    }
}
