var ScenesData = ScenesData || {};
ScenesData.currentScene = null;

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
        ScenesData.currentScene = this;
        ResourceLoader.loadBackGround(this);
        ResourceLoader.loadImage(this);
        Input.inputField.loadImage(this);
        CSVParsing.loadText(this);
        Audio.loadSound(this);
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.scenePlugin({
            key: 'rexbuttonplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexbuttonplugin.min.js',
            sceneKey: 'button'
        });
    },

    create: function()
    {
        BackGround.drawBackground(this);
        Audio.loopSound(this, 'login');
        Input.inputField.generate(this, Input.menuSceneEnterReaction);
        this.userName = this.add.text(100, 100, '내 이름 : ' + PlayerData.userData.userName).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);
        this.money = this.add.text(100, 200, '소지 엽전 : ' + PlayerData.userData.money).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);
        this.hopae = this.add.text(100, 300, '현재 호패 : ' + PlayerData.userData.recentHopae).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);
        this.allHopae = '';
        PlayerData.userData.hopae.forEach(function(element) {this.allHopae += element.name + ' '});
        this.hopae = this.add.text(100, 400, '내 호패들 : ' + allHopae).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);

        this.myCharacter = this.add.sprite(game.config.width / 2, game.config.height / 2 - 200, 'pyeongminStand').setOrigin(0.5, 0.5).setDepth(5).setScale(0.8);
        PlayerData.nickname = PlayerData.userData.recentHopae;



        this.roomEnterDialog = this.rexUI.add.dialog({
            x: game.config.width / 2,
            y: game.config.height / 2,

            background: this.add.sprite(game.config.width / 2, game.config.height / 2, 'panel').setOrigin(0.5, 0.5),

            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x1b0000),
                text: this.add.text(0, 0, '대기실에 참가하시겠습니까?', {
                    fontSize: '24px'
                }).setOrigin(0.5, 0.5),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),
            
            content: this.add.text(0, 0, '대기실에 참가하시겠습니까?', {
                fontSize: '24px'
            }),

            actions: [
                createLabel(this, 'button', 0, 0, 'Yes'),
                createLabel(this, 'button', 0, 0, 'No')
            ],

            space: {
                title: 25,
                content: 25,
                action: 100,

                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: {
                actions: 'center' // 'center'|'left'|'right'
            },

            expand: {
                content: false, // Content is a pure text object
            }
        }).layout().setDepth(10).setVisible(false);

        this.roomEnterDialog
            .on('button.click', function (button, groupName, index) {
                if(index == 0) socket.emit('enterRoom', PlayerData.nickname);
                else
                {
                    this.roomEnterDialog.setVisible(false);
                    this.gameStartBtn.setEnable(true);
                }
            }, this)
            .on('button.over', function (button, groupName, index) {
                //console.log('button over');
            })
            .on('button.out', function (button, groupName, index) {
                //console.log('button out');
        });


        this.gameStartBtn = this.button.add(new Button(this, game.config.width / 2, 900, 'pyeongminWrite', 1, 0, 2).setScale(0.5).setDepth(5),
        {
            enabled: true, mode: 0
        }).on('click', function(button, gameObject, pointer){
            console.log('방 입장');
            this.gameStartBtn.setEnable(false);
            ScenesData.menuScene.roomEnterDialog.setVisible(true).popUp(200);
        }, this);

        this.shopBtn = this.button.add(new Button(this, game.config.width - 100, 900, 'pyeongminThrow', 1, 0, 2).setScale(0.5).setDepth(5),
        {
            enabled: true, mode: 0
        }).on('click', function(button, gameObject, pointer){
            console.log('상점 입장');
        }, this);
        
    }
});

var createLabel = function (scene, image, width, height, text = '') {
    return scene.rexUI.add.label({
        width: width,
        height: height,

        background: scene.add.sprite(0, 0, image).setOrigin(0.5, 0.5),

        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
}

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
        //ResourceLoader.loadBackGround(this);
        this.load.image('playerStand', 'assets/image/character/pyeongmin/pyeong_stand.png');
    },

    create: function()
    {
        BackGround.drawBackground(this);
        BackGround.drawRoom(this);
        Audio.loopSound(this, 'inRoom');
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
});

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
        WordSpace.weightTextObjForTest = this.add.text(game.config.width * 5 / 64, game.config.height * 5 / 48, '뇌의 무게: (현재) 0 / ' + this.brainCapacity + ' (전체)').setDepth(10).setColor('#000000');
        WordSpace.killLogTextForTest = this.add.text(game.config.width * 25 / 32, game.config.height * 5 / 72, WordSpace.killLogForTest).setDepth(10).setColor('#000000').setAlign('right');
    },
    
    create: function()
    {
        WordSpace.gameTimer = new Phaser.Time.Clock(this);
        WordSpace.gameTimer.start();
        ResourceLoader.loadAnimation(this);
        CSVParsing.CSVParse(this);
        BackGround.drawBackground(this);
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

        WordSpace.nameWordTextForTest = this.add.text(50,400,'현재 가진 호패들 : 없음').setDepth(10).setColor('#000000');
        WordSpace.nameQueue.initiate();
        WordSpace.generateWord.Item(this, Enums.item.nameList);
        WordSpace.generateWord.Item(this, Enums.item.nameList);
        WordSpace.generateWord.Item(this, Enums.item.invincible);
        WordSpace.generateWord.Item(this, Enums.item.invincible);
        WordSpace.generateWord.Item(this, Enums.item.charge);
        WordSpace.generateWord.Item(this, Enums.item.charge);
        WordSpace.generateWord.Item(this, Enums.item.clean);
        WordSpace.generateWord.Item(this, Enums.item.clean);
        WordSpace.generateWord.Item(this, Enums.item.heavy);
        WordSpace.generateWord.Item(this, Enums.item.heavy);
        WordSpace.generateWord.Item(this, Enums.item.dark);
        WordSpace.generateWord.Item(this, Enums.item.dark);
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

ScenesData.changeScene = function(scene)
{
    game.scene.stop(ScenesData.currentScene);
    ScenesData.currentScene = scene;
    game.scene.start(scene);
}