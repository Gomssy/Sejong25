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
        Input.inputField.loadImage(this);
        BackGround.loadImage(this);
        Audio.loadSound(this);
    },

    create: function()
    {
        Audio.playSound(this);
        Input.inputField.generate(this, Input.menuSceneEnterReaction);
        BackGround.drawMenu(this);
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

        WordSpace.nameWordTextForTest = WordSpace.gameSceneForTest.add.text(50,400,'현재 가진 호패들 : 없음').setDepth(10).setColor('#000000');
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
        WordSpace.test = WordSpace.generateWord.Name(this, false, null);
        console.log('1' + WordSpace.test.physicsObj.body.width);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.generateWord.Name(this, false, null);
        WordSpace.attackGauge.add(5);



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
            tempNames += element.wordText + (element.isStrong?' [강]':'') + '\n';
        });
        
        WordSpace.nameWordTextForTest.setText('현재 가진 호패들 : \n' + tempNames);
        WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / '+ WordSpace.brainCapacity+' (전체)');
        WordSpace.setPlayerTyping.add('');
    }
});