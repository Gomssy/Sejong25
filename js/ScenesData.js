var ScenesData = ScenesData || {};

var menuScene = new Phaser.Class(
{
    Extends: Phaser.Scene,

    initialize: 

    function menuScene ()
    {
        Phaser.Scene.call(this, {key: 'menuScene'});
    },

    preload: function()
    {
        ScenesData.menuScene = this;
        Input.inputField.loadImage(this);
        BackGround.loadImage(this);
        Audio.loadSound(this);
    },

    create: function()
    {
        Audio.loopSound(this, 'login');
        Input.inputField.generate(this, Input.menuSceneEnterReaction);
        BackGround.drawMenu(this);

    }
});

var roomScene = new Phaser.Class(
{
    Extends: Phaser.Scene,

    initialize:

    function roomScene ()
    {
        Phaser.Scene.call(this, {key: 'roomScene'});
    },

    preload: function()
    {
        ScenesData.roomScene = this;
    },

    create: function()
    {
        this.isCounting = false;
        this.endTime = 0;
        this.peopleCount = 1;
        this.countText = this.add.text(640, 360, '사람들을 위해 대기중입니다...').setOrigin(0.5, 0.5).setColor('#000000');
        this.peopleText = this.add.text(640, 100, '1 / 10').setOrigin(0.5, 0.5).setColor('#000000');
    },

    update: function()
    {
        this.peopleText.setText(this.peopleCount + ' / 10');
        if (this.isCounting)
        {
            this.countText.setText(((this.endTime - Date.now()) / 1000).toFixed(1));
            if (this.endTime - Date.now() < 0) 
            {
                socket.emit('endCount');
                this.isCounting = false;
            }
        }
        else
        {
            this.countText.setText('사람들을 위해 대기중입니다...');
        }
    }
})

var gameScene = new Phaser.Class(
{
    Extends: Phaser.Scene,

    initialize:

    function gameScene ()
    {
        Phaser.Scene.call(this, {key: 'gameScene'});
    },

    preload: function()
    {
        ScenesData.gameScene = this;
        BackGround.loadImage(this);
        WordSpace.loadImage(this);
        Input.inputField.loadImage(this);
        CSVParsing.loadText(this);
        Audio.loadSound(this);
    },
    
    create: function()
    {
        WordSpace.gameTimer = new Phaser.Time.Clock(this);
        WordSpace.gameTimer.start();
        WordSpace.loadAnimation(this);
        CSVParsing.CSVParse(this);
        BackGround.drawBrain(this);
        BackGround.drawCharacter(this);
        Audio.playSound(this, 'startGame');
        WordSpace.wordPhysicsGroup = this.physics.add.group();

        Input.inputField.generate(this, Input.gameSceneEnterReaction);
        WordSpace.attackGauge.generate(this);
        WordSpace.spaceInitiate(this);
        WordSpace.attackGauge.resetCycle(this);

        WordSpace.wordCycle.resetCycle(this, 3000, 0, true);
        WordSpace.nameCycle.resetCycle(this, 3000, 0, true);
        WordSpace.varAdjustCycle.resetCycle(this, 100, 0, true);
        WordSpace.playerTypingCycle = setInterval(function()
        {
            socket.emit('setPlayerTyping', WordSpace.playerTyping);
        }, 500);
        
        WordSpace.setPlayerTyping.initiate(this);

        WordSpace.nameWordTextForTest = ScenesData.gameScene.add.text(50,400,'현재 가진 호패들 : 없음').setDepth(10).setColor('#000000');
        WordSpace.nameQueue.initiate();
        RoomData.players.forEach(function(element)
        {
            if(element.nickname == PlayerData.nickname)
            {
                RoomData.myself = element;
                return;
            }
        });
        WordSpace.attackGauge.add(11);
    },

    update: function()
    {
        WordSpace.deltaTime = this.sys.game.loop.delta;
        WordSpace.wordForcedGroup.forEach(function(element)
        {
            element.attract();
        });
        WordSpace.nameGroup.forEach(function(element)
        {
            element.attract();
        })
        let tempNames = '';
        WordSpace.nameGroup.forEach(function(element)
        {
            //테스트용
            tempNames += element.wordText + (element.isStrong?' [강]':'') + '\n';
        });
        
        WordSpace.nameWordTextForTest.setText('현재 가진 호패들 : \n' + tempNames);
        WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / '+ WordSpace.brainCapacity+' (전체)');
        WordSpace.killLogTextForTest.setText(WordSpace.killLogForTest);
        WordSpace.setPlayerTyping.add('');
    }
});