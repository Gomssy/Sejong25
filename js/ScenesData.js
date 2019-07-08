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
    },

    create: function()
    {
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
        
        WordSpace.setPlayerTyping.initiate(this);
    },

    update: function()
    {
        WordSpace.wordForcedGroup.forEach(function(element)
        {
            element.attract();
        });
        WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / '+ WordSpace.brainCapacity+' (전체)');
        WordSpace.setPlayerTyping.add('');
    }
});