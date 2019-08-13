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
        PlayerData.currentHopae = (PlayerData.userData.recentHopae == null) ? PlayerData.userData.hopae[0] : PlayerData.userData.recentHopae;
        PlayerData.nickname = PlayerData.currentHopae.name;

        this.userName = this.add.text(100, 100, '내 이름 : ' + PlayerData.userData.userName).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);
        this.money = this.add.text(100, 200, '소지 엽전 : ' + PlayerData.userData.money).setOrigin(0, 0.5).setColor('#000000').setDepth(10).setPadding(5,5,5,5).setFontSize(40);

        this.organizeHopae = function()
        {
            this.myHopae = [];
            this.myHopae.push({
                    name: PlayerData.currentHopae.name,
                    type: PlayerData.currentHopae.type,
                });
            for(let i = 0; i < PlayerData.userData.hopae.length; i++)
                if(PlayerData.userData.hopae[i].name != PlayerData.currentHopae.name)
                    this.myHopae.push({
                            name: PlayerData.userData.hopae[i].name,
                            type: PlayerData.userData.hopae[i].type,
                        });
        }

        this.createHopaeMenu = function()
        {
            this.hopaeMenuObject = [];
            for(let i = 0; i < this.myHopae.length; i++)
            {
                let temp = UIObject.createButton(this, UIObject.createLabel(this, 100, 300, 10,
                    'nameBgr' + ScenesData.menuScene.myHopae[i].name.length, 1, 'left', ScenesData.menuScene.myHopae[i].name, 25, '#ffffff', 0.45, 0.5), 0, 0, 0, 
                    function()
                    {
                        PlayerData.currentHopae = ScenesData.menuScene.myHopae[i];
                        PlayerData.nickname = ScenesData.menuScene.myHopae[i].name;
                        ScenesData.menuScene.organizeHopae();
                        ScenesData.menuScene.currentHopaeBtn.destroy();
                        ScenesData.menuScene.createCurrentHopae();
                        ScenesData.menuScene.hopaeMenuObject.forEach(function(element){
                            ScenesData.menuScene.tweens.add({
                                targets: element,
                                y: 0,
                                duration: 200,
                                ease: 'Linear',
                                loop: 0,
                                onComplete: function(){element.destroy();}
                            });
                        });
                    });
                ScenesData.menuScene.tweens.add({
                    targets: temp,
                    y: 50 * i,
                    duration: 500,
                    ease: 'Bounce',
                    loop: 0
                });
                this.hopaeMenuObject.push(temp);
            }
        }

        this.createCurrentHopae = function()
        {
            this.currentHopaeBtn = UIObject.createButton(this, UIObject.createLabel(this, 100, 300, 10,
                'nameBgr' + PlayerData.nickname.length, 1, 'left', PlayerData.nickname, 25, '#ffffff', 0.45, 0.5), 0, 0, 0, 
                function()
                {
                    ScenesData.menuScene.currentHopaeBtn.destroy();
                    ScenesData.menuScene.createHopaeMenu();
                })
        }

        this.organizeHopae();
        this.createCurrentHopae();

        this.myCharacter = this.add.sprite(game.config.width / 2, game.config.height / 2 - 200, 'pyeongminStand').setOrigin(0.5, 0.5).setDepth(5).setScale(0.8);

        this.roomEnterDialog = this.rexUI.add.dialog({
            x: game.config.width / 2,
            y: game.config.height / 2,

            background: this.add.sprite(game.config.width / 2, game.config.height / 2, 'panel').setOrigin(0.5, 0.5),
            
            content: this.add.text(0, 0, '대기실에 참가하시겠습니까?', {
                font: '50pt 궁서'
            }),

            actions: [
                UIObject.createLabel(this, 0, 0, 0, 'button', 1, 'center', '예', 50),
                UIObject.createLabel(this, 0, 0, 0, 'button', 1, 'center', '아니오', 50)
            ],

            space: {
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

        
        this.gameStartBtn = UIObject.createButton(this, UIObject.createLabel(this, game.config.width / 2, 900, 5, 'pyeongminWrite', 0.5, 'center'), 1, 0, 2, 
            function()
            {
                ScenesData.menuScene.gameStartBtn.setEnable(false);
                ScenesData.menuScene.roomEnterDialog.setVisible(true);
                ScenesData.menuScene.roomEnterDialog.popUp(200);
            })
        
        this.shopBtn = UIObject.createButton(this, UIObject.createLabel(this, game.config.width - 100, 900, 5, 'pyeongminThrow', 0.5, 'center'), 1, 0, 2, 
            function()
            {
                console.log('상점 입장');
            })
        
        this.hopaeBtn = UIObject.createButton(this, UIObject.createLabel(this, 100, 900, 5, 'pyeongminThrow', 0.5, 'center'), 1, 0, 2, 
            function()
            {
                ScenesData.changeScene('hopaeScene');
            })
    }
});

var hopaeScene = new Phaser.Class(
{
    Extends: Phaser.Scene,

    initialize: 

    function hopaeScene ()
    {
        Phaser.Scene.call(this, {key: 'hopaeScene'});
    },

    preload: function()
    {
        ScenesData.hopaeScene = this;
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
        
        Input.inputField.generate(this, function(){}, 
            UIObject.createLabel(this, game.config.width / 2, game.config.height / 2, 10, 'nameBgr6', 2, 'center', '', 50, '#ffffff').getElement('text').setOrigin(0.45,0.5), true);

        this.checkDialog = this.rexUI.add.dialog({
            x: game.config.width / 2,
            y: game.config.height / 2,

            background: this.add.sprite(game.config.width / 2, game.config.height / 2, 'panel').setOrigin(0.5, 0.5),
            
            content: this.add.text(0, 0, '이 이름으로 하시겠습니까?\n변경에는 엽전이 소모됩니다.', {
                font: '50pt 궁서',
                color: '#000000'
            }),

            actions: [
                UIObject.createLabel(this, 0, 0, 0, 'button', 1, 'center', '예', 50),
                UIObject.createLabel(this, 0, 0, 0, 'button', 1, 'center', '아니오', 50)
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

        this.checkDialog
        .on('button.click', function (button, groupName, index) {
            if(index == 0)
            {
                if(PlayerData.userData.money > 0)
                {
                    fbClient.updateUserData('hopae', {name: Input.inputField.text.text, type: 'wood'});
                    fbClient.updateUserData('money', -1);
                    ScenesData.changeScene('menuScene');
                }
                else
                {
                    this.checkDialog.setVisible(false);

                    this.errorMsg = UIObject.createButton(this, UIObject.createLabel(this, game.config.width / 2, game.config.height / 2, 10, 'panel', 1, 'center', 
                        '엽전이 부족합니다', 50, '#000000').layout().popUp(200), 0, 0, 0, 
                        function()
                        {
                            ScenesData.hopaeScene.errorMsg.destroy();
                            ScenesData.hopaeScene.checkBtn.setEnable(true);
                        })
                }
            }
            else
            {
                this.checkDialog.setVisible(false);
                this.checkBtn.setEnable(true);
            }
        }, this)
        .on('button.over', function (button, groupName, index) {
            //console.log('button over');
        })
        .on('button.out', function (button, groupName, index) {
            //console.log('button out');
        });
        this.warningText = UIObject.createLabel(this, game.config.width / 2, game.config.height / 2 - 100, 2, 'panel', 1, 'center', 
            '이름 타수가 많아 플레이에 패널티가 있을 수 있습니다', 40, '#000000').setVisible(false).layout();
            
        this.checkBtn = UIObject.createButton(this, UIObject.createLabel(this, game.config.width / 2, 900, 5, 'pyeongminWrite', 0.5, 'center'), 1, 0, 2, 
            function()
            {
                if(Input.checkProperInput(Input.inputField.text.text))
                {
                    ScenesData.hopaeScene.checkBtn.setEnable(false);
                    ScenesData.hopaeScene.checkDialog.setVisible(true).popUp(200);
                }
            })

        this.backBtn = UIObject.createButton(this, UIObject.createLabel(this, 100, 900, 5, 'pyeongminWrite', 0.5, 'center'), 1, 0, 2, 
            function()
            {
                ScenesData.changeScene('menuScene');
            });
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
                }, (Phaser.Math.Distance.Between(0, 0, game.config.width / 2, game.config.height * 10 / 9) * 10));
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
            
        Input.inputField.generate(this, Input.gameSceneEnterReaction, 
            UIObject.createLabel(ScenesData.gameScene, game.config.width / 2, game.config.height * 25 / 36, 10, 'inputfield', 1, 'center', '', 25, '#000000').getElement('text'));
        
        WordSpace.attackGauge.generate(this);
        WordSpace.spaceInitiate(this);
        WordSpace.attackGauge.resetCycle(this);

        WordSpace.startCycle(this);
        
        WordSpace.setPlayerTyping.initiate(this);

        WordSpace.nameWordTextForTest = this.add.text(50,400,'현재 가진 호패들 : 없음').setDepth(10).setColor('#000000');
        WordSpace.nameQueue.initiate();
        //WordSpace.attackGauge.add(11);

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

ScenesData.changeScene = function(sceneKey)
{
    ScenesData.currentScene.scene.start(sceneKey);
    Input.input = [];
    Input.converted = '';
    Input.convInput = '';
    Input.finalInput = '';
    ScenesData.currentScene = game.scene.getScene(sceneKey);
}