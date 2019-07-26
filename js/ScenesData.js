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
        BackGround.loadImage(this);
        this.load.image('playerStand', 'assets/image/character/pyeongmin/pyeong_stand.png');
    },

    create: function()
    {
        BackGround.drawRoom(this);

        this.players = [];

        this.isCounting = false;
        this.isCountEnd = false;
        this.endTime = 0;
        this.peopleCount = 1;
        this.countText = this.add.text(game.config.width / 2, game.config.height / 2, '사람들을 위해 대기중입니다...').setOrigin(0.5, 0.5).setColor('#000000').setBackgroundColor('#ffffff').setDepth(10).setPadding(5,5,5,5);
        this.peopleText = this.add.text(game.config.width / 2, game.config.height / 9, '1 / 10').setOrigin(0.5, 0.5).setColor('#000000').setBackgroundColor('#ffffff').setDepth(10);
    },

    update: function()
    {
        this.peopleText.setText(this.peopleCount + ' / 10');
        
        if (this.isCounting)
        {
            this.countText.setText(((this.endTime - Date.now()) / 1000).toFixed(1));
            if (this.endTime < Date.now()) 
            {
                //console.log('end Count');
                setTimeout(() => {
                    socket.emit('endCount');
                }, (Phaser.Math.Distance.Between(0, 0, game.config.width / 2, game.config.height * 10 / 9) * 3));
                this.isCounting = false;
                this.isCountEnd = true;
                this.players.forEach(function(element){
                    element.follower = { t: 0, vec: new Phaser.Math.Vector2() };
                    element.path = new Phaser.Curves.Line([
                        element.sprite.x, element.sprite.y,
                        game.config.width / 2, game.config.height * 10 / 9
                    ]);
                    ScenesData.roomScene.tweens.add({
                        targets: element.follower,
                        t: 1,
                        ease: 'Linear',
                        duration: Phaser.Math.Distance.Between(element.sprite.x, element.sprite.y, game.config.width / 2, game.config.height * 10 / 9) * 3,
                        repeat: 0
                    });
                });
            }
        }
        else if (this.isCountEnd)
        {
            this.players.forEach(function(element){
                element.path.getPoint(element.follower.t, element.follower.vec);
                element.sprite.setPosition(element.follower.vec.x, element.follower.vec.y);
                element.nickname.setPosition(element.sprite.x - game.config.width / 128, element.sprite.y - game.config.height / 12);
            });
            this.countText.setText('잠시만 기다려주세요...');
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

        WordSpace.startCycle(this);
        
        WordSpace.setPlayerTyping.initiate(this);

        WordSpace.nameWordTextForTest = ScenesData.gameScene.add.text(50,400,'현재 가진 호패들 : 없음').setDepth(10).setColor('#000000');
        WordSpace.nameQueue.initiate();
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.nameList);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.nameList);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.invincible);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.invincible);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.charge);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.charge);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.clean);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.clean);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.heavy);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.heavy);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.dark);
        WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item.dark);

        // for test
        WordSpace.attackGauge.add(11);
        /*WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);*/
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
        WordSpace.attackPaperGroup.forEach(function(element){
            element.moveObject(element);
        });
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