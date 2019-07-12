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
        Input.inputField.generate(this, Input.menuSceneEnterReaction);
        BackGround.drawMenu(this);
        Audio.playSound(this);
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
        BackGround.loadImage(this);
        WordSpace.loadImage(this);
        Input.inputField.loadImage(this);
        CSVParsing.loadText(this);
    },

    create: function()
    {
        CSVParsing.CSVParse(this);
        BackGround.drawBrain(this);

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
        console.log(RoomData.myself);
    },

    update: function()
    {
        WordSpace.wordForcedGroup.forEach(function(element)
        {
            element.attract();
        });
        let tempNames = '';
        WordSpace.nameGroup.forEach(function(element)
        {
            tempNames += element.wordText + (element.isStrong?' [강]':'') + '\n';
        });
        
        WordSpace.nameWordTextForTest.setText('현재 가진 호패들 : \n' + tempNames);
        WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / '+ WordSpace.brainCapacity+' (전체)');
        WordSpace.killLogTextForTest.setText(WordSpace.killLogForTest);
        WordSpace.setPlayerTyping.add('');
    }
});