class WordObject
{
    constructor(text, isNameWord = false)
    {
        this.generationCode = WordSpace.nextWordCode++;
        this.wordText = text;
        this.wordTyping = WordReader.getWordTyping(this.wordText);
        this.wordGrade = WordReader.getWordGrade(this.wordTyping);
        this.wordWeight = WordReader.normalWeight[3 - this.wordGrade];
        //console.log("wordTyping : " + this.wordTyping + '\n' + "wordGrade : " + this.wordGrade + '\n' + "wordWeight : " + this.wordWeight + '\n');
        this.wordSpeed = 0.5;
        this.isNameWord = isNameWord;
    }

    instantiate(scene, spriteName, textColor, lenRate)
    {
        let p = [{x : 3, y : 1.05}, {x : 20, y : 1.85}];
        this.scale = ((p[1].y - p[0].y) / (p[1].x - p[0].x)) * (this.wordWeight - p[0].x) + p[0].y;
        this.fontScale = 25;
        var random = WordSpace.getSpawnPoint(lenRate);

        this.physicsObj = scene.physics.add.sprite(random.x, random.y, spriteName).setMass(this.wordWeight * 10).setScale(this.scale)
        .setFrictionX(0).setFrictionY(0).setBounce(0.5);
        this.physicsObj.wordCollider = null;
        let dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        let angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);

        //임시땜빵
        this.moveStarted = false;
        this.initSpeed = {x: Math.max(0, 200-WordSpace.totalWeight) * Math.cos(angle), y: Math.max(0, 200-WordSpace.totalWeight) * Math.sin(angle)};
        
        this.wordObj = scene.add.text(random.x, random.y, this.wordText, 
            {
                fontSize: (this.scale * this.fontScale) +'pt',
                fontFamily: '"궁서", 궁서체, serif',
                //fontStyle: (this.wordWeight > 5 ? 'bold' : '')
            });
        this.wordObj.setColor(textColor).setOrigin(0.5,0.5);
        this.createdTime = WordSpace.gameTimer.now;
        WordSpace.totalWeight += this.wordWeight;
        WordSpace.totalWordNum += 1;
        WordSpace.setGameOverTimer();
        //console.log("Total weight : " + WordSpace.totalWeight);
    }

    destroy()
    {
        //console.log(this.generationCode + ': ' + this.wordText + ' destroyed');
        WordSpace.totalWeight -= this.wordWeight;
        WordSpace.totalWordNum -= 1;
        WordSpace.resetGameOverTimer();
        const groupIdx = WordSpace.wordGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (groupIdx > -1) WordSpace.wordGroup.splice(groupIdx, 1);
        const forceIdx = WordSpace.wordForcedGroup.findIndex(function(item) {return this.isEqualObject(item.generationCode)}, this);
        if (forceIdx > -1) WordSpace.wordForcedGroup.splice(forceIdx, 1);
        WordSpace.wordPhysicsGroup.remove(this.physicsObj);
        let breakAnim = ScenesData.gameScene.add.sprite(this.physicsObj.x, this.physicsObj.y, 'wordBreak').setScale(0.5).setDepth(3).play('wordBreakAnim');
        setTimeout(function() {
            breakAnim.destroy();
        }, 200);
        RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.write]);
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
    instantiate(scene, lenRate)
    {
        let spriteName = 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6);
        let textColor = '#000000'
        super.instantiate(scene, spriteName, textColor, lenRate);
    }
    destroy(isNormallyRemoved = true)
    {
        super.destroy();
        if(isNormallyRemoved)
        {
            switch(this.wordGrade)
            {
                case 0: WordSpace.attackGauge.add(2.5); break;
                case 1: WordSpace.attackGauge.add(1.5); break;
                case 2: WordSpace.attackGauge.add(0.9); break;
                case 3: WordSpace.attackGauge.add(0.5); break;
                default: console.log('[ERR] wrong grade of word'); break;
            }
        }
        this.wordObj.destroy();
        this.physicsObj.destroy();
    }
}

class AttackWord extends WordObject
{
    constructor(text, _wordGrade, _playerData, _attackOption, lenRate)
    {
        super(text);
        this.wordGrade = _wordGrade;
        this.wordWeight = _attackOption.isStrong ? WordReader.strongAttackWeight[3 - this.wordGrade] : WordReader.attackWeight[3 - this.wordGrade];
        if(WordReader.getWordTyping(_playerData.nickname) > 9)
            this.wordWeight += this.wordWeight * 0.2 * (WordReader.getWordTyping(_playerData.nickname) - 9);
        if(_attackOption.isHeavy) this.wordWeight *= 2;
        this.attacker = _playerData;
        if(!_attackOption.isCountable) this.counterTime = 0;
        else this.counterTime = WordSpace.gameTimer.now + 1000 * (this.wordTyping <= (5 - _wordGrade) * 2.5 ? this.wordTyping / (Math.max(200, WordSpace.playerTyping) / 60) * 1.5 :
                            ((5 - _wordGrade) * 3 + (this.wordTyping - (5 - _wordGrade) * 2.5) * 2.5) / (Math.max(200, WordSpace.playerTyping) / 60) * 1.5);
        this.isDark = _attackOption.isDark;
        console.log('Attack text : ' + text + ', Attacker : ' + this.attacker.nickname + ', Weight : ' + this.wordWeight);
        console.log('Counter time : ' + this.counterTime);
    }
    instantiate(scene, lenRate)
    {
        let spriteName = 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6);
        let textColor = '#000000'
        super.instantiate(scene, spriteName, textColor, lenRate);
        this.maskBackground = scene.physics.add.sprite(this.physicsObj.x, this.physicsObj.y, 'wordBgr' + this.wordGrade + '_' + Math.min(Math.max(2, this.wordText.length), 6))
        .setTint(Phaser.Display.Color.GetColor(120, 120, 120)).setScale(this.scale);
        this.maskBackground.alpha = this.isDark ? 1 : 0.5;
        this.shape = scene.make.graphics();
        var rect = new Phaser.Geom.Rectangle(0, 0, this.maskBackground.width * this.scale, this.maskBackground.height * this.scale);
        this.shape.fillStyle(0xffffff).fillRectShape(rect);

        this.mask = this.shape.createGeometryMask();
        this.maskStart = this.physicsObj.x;
        this.maskEnd = this.physicsObj.x - this.physicsObj.width * this.scale;

        if(this.isDark)
        {
            setTimeout(() => {
                if(this.maskBackground != null && this.mask != null) 
                {
                    this.maskBackground.setMask(this.mask);
                    this.maskBackground.alpha = 0.5;
                }
            }, 4000);
        }
        else this.maskBackground.setMask(this.mask);
    }

    attract()
    {
        super.attract();
        if(WordSpace.gameTimer.now < this.counterTime)
        {
            this.maskBackground.setPosition(this.physicsObj.x, this.physicsObj.y);
            this.shape.x = this.physicsObj.x + (this.maskEnd - this.maskStart) * 
                            ((WordSpace.gameTimer.now - this.createdTime) / (this.counterTime - this.createdTime)) - this.physicsObj.width * this.scale / 2;
            this.shape.y = this.physicsObj.y - this.physicsObj.height * this.scale / 2;
        }
        else if(this.maskBackground != null) this.maskBackground.destroy();
    }

    destroy(isNormallyRemoved = true)
    {
        super.destroy();
        if(isNormallyRemoved)
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
                let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, this.attacker);
                tempWord.physicsObj.setPosition(this.physicsObj.x, this.physicsObj.y);
                tempWord.wordObj.setPosition(tempWord.physicsObj.x, tempWord.physicsObj.y);
                tempWord.destroy();
                let attackData = 
                {
                    roomNum: RoomData.roomId,
                    attackerId: RoomData.myself.id,
                    victimId: this.attacker.id,
                    text: this.wordText,
                    grade: Math.min(3, this.wordGrade + 1),
                    attackOption: {
                        isStrong: false,
                        isCountable: false,
                        isHeavy: false,
                        isDark: false
                    },
                }
                socket.emit('attack', attackData);
            }
        }
        if(this.maskBackground != null) this.maskBackground.destroy();
        this.wordObj.destroy();
        this.physicsObj.destroy();
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
        //console.log('Name : ' + player.nickname + ', Strong : ' + this.isStrong + ', Weight : ' + this.wordWeight);
    }
    instantiate(scene, lenRate)
    {
        let spriteName = (this.isStrong ? 'strongBgr' : 'nameBgr') + Math.min(Math.max(2, this.wordText.length), 6)
        let textColor = '#ffffff'
        super.instantiate(scene, spriteName, textColor, lenRate);
        this.wordObj.setOrigin(0.45,0.5);
    }
    attract()
    {
        if(this.isActive) super.attract();
        else
        {
            this.path.getPoint(this.follower.t, this.follower.vec);
            this.physicsObj.setPosition(this.follower.vec.x, this.follower.vec.y);
            this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
            this.physicsObj.angle = (this.isStrong ? 450 : 90) * this.follower.t
            this.wordObj.angle = this.physicsObj.angle;
            if(this.isStrong)
            {
                this.physicsObj.setScale(this.follower.t < 0.2 ? 0.2 : this.follower.t * this.scale);
                this.wordObj.setFont({
                    fontSize: (this.follower.t < 0.2 ? 0.05 : this.follower.t * this.scale * this.fontScale) +'pt',
                    fontFamily: '"궁서", 궁서체, serif',
                    fontStyle: (this.wordWeight > 5 ? 'bold' : '')
                });
            }
        }
    }
    destroy(isNormallyRemoved = true)
    {
        super.destroy();
        if(isNormallyRemoved)
        {
            ScenesData.gameScene.physics.world.removeCollider(this.physicsObj.wordCollider);
            WordSpace.wordGroup.forEach(function(element)
            {
                ScenesData.gameScene.physics.world.removeCollider(element.physicsObj.wordCollider);
                element.physicsObj.wordCollider = ScenesData.gameScene.physics.add.collider(element.physicsObj, WordSpace.wordPhysicsGroup, function(object1) 
                {
                    object1.topObj.attract();
                });
            });
            if(!this.isStrong) WordSpace.attackGauge.add(this.wordTyping * 0.1);
            WordSpace.nameGroup.push(this);
            this.isActive = false;
            this.physicsObj.setVelocity(0, 0).setDepth(20);
            this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y).setDepth(20);
            this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
            this.path = new Phaser.Curves.Spline([
                this.physicsObj.x, this.physicsObj.y,
                (this.physicsObj.x + game.config.width * (500 + WordSpace.nameGroup.length * 15) / 1280) / 2, this.physicsObj.y - game.config.height * 5 / 72,
                game.config.width * (500 + WordSpace.nameGroup.length * 15) / 1280, game.config.height * (680 + this.wordText.length * 10 + (Math.random() * 20 - 10)) / 720
            ]);
            ScenesData.gameScene.tweens.add({
                targets: this.follower,
                t: 1,
                ease: 'Sine',
                duration: 2000,
                repeat: 0
            });
            //이동경로 디버그
            /*var graphics = ScenesData.gameScene.add.graphics();
            graphics.lineStyle(2, 0xffffff, 1);
            this.path.draw(graphics);*/
        }
    }
}

class ItemWord extends WordObject
{
    constructor(_itemType)
    {
        super(_itemType);
        this.wordWeight = 2;
        this.itemType = _itemType
        //console.log('Name : ' + player.nickname + ', Strong : ' + this.isStrong + ', Weight : ' + this.wordWeight);
    }
    instantiate(scene, lenRate)
    {
        let spriteName = null;
        let textColor = null;
        switch(this.itemType)
        {
            case Enums.item.invincible:
                spriteName = 'item0';
                textColor = '#23D9B7'
                break;
            case Enums.item.nameList:
                spriteName = 'item1';
                textColor = '#FFB28F'
                break;
            case Enums.item.charge:
                spriteName = 'item2';
                textColor = '#FF9515'
                break;
            case Enums.item.clean:
                spriteName = 'item3';
                textColor = '#263387'
                break;
            case Enums.item.heavy:
                spriteName = 'item4';
                textColor = '#dddddd'
                break;
            case Enums.item.dark:
                spriteName = 'item5';
                textColor = '#dddd70'
                break;
            default:
                console.log("Item type is inappropriate. Item type : " + this.itemType);
                break;
        }
        super.instantiate(scene, spriteName, textColor, lenRate);
    }
    destroy(isNormallyRemoved = true)
    {
        super.destroy();
        if(isNormallyRemoved)
        {
            WordSpace.attackGauge.add(0.5);
            switch(this.itemType)
            {
                case Enums.item.invincible:
                    WordSpace.isInvincible = true;
                    setTimeout(() => {
                        WordSpace.isInvincible = false;
                    }, 5000);
                    break;
                case Enums.item.nameList:
                    let tempNames = [];
                    RoomData.players.forEach(function(element){
                        if(element.id != RoomData.myself.id && element.isAlive) tempNames.push(element.index)
                    });
                    let length = Math.min(tempNames.length, 8);
                    tempNames = Phaser.Utils.Array.Shuffle(tempNames);
                    for(let i = 0; i < length; i++)
                    {
                        let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, RoomData.players[tempNames[i]]);
                        tempWord.physicsObj.setPosition(this.physicsObj.x, this.physicsObj.y);
                        tempWord.wordObj.setPosition(tempWord.physicsObj.x, tempWord.physicsObj.y);
                        tempWord.destroy();
                    }
                    break;
                case Enums.item.charge:
                    WordSpace.attackGauge.add(11);
                    break;
                case Enums.item.clean:
                    let tempWords = [];
                    WordSpace.wordGroup.forEach(function(element){
                        tempWords.push(WordSpace.wordGroup.indexOf(element));
                    });
                    tempWords = Phaser.Utils.Array.Shuffle(tempWords);
                    let tempLenth = tempWords.length * 0.3;
                    for(let i = 0; i < tempLenth; i++)
                        if(WordSpace.wordGroup[tempWords[i]] != null) WordSpace.wordGroup[tempWords[i]].destroy();
                    break;
                case Enums.item.heavy:
                    Input.attackOption.isHeavy = true;
                    break;
                case Enums.item.dark:
                    Input.attackOption.isDark = true;
                    break;
                default:
                    console.log("Item type is inappropriate. Item type : " + this.itemType);
                    break;
            }
        }
        this.wordObj.destroy();
        this.physicsObj.destroy();
    }
}