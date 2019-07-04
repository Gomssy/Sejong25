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
        //Input.inputField.loadImage(this);
    },

    create: function()
    {
        //Input.inputField.generate(this);
    },

    update: function()
    {
        
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

        Input.inputField.generate(this);
        WordSpace.attackGauge.generate(this);
        WordSpace.spaceInitiate(this);

        // cycle
        WordSpace.attackGauge.resetCycle(this);
        WordSpace.wordCycle.resetCycle(this, 3000, 0);
        WordSpace.nameCycle.resetCycle(this, 3000, 0);
        WordSpace.varAdjustCycle.resetCycle(this, 100);
        
        WordSpace.playerTyping.initiate(this);
    },

    update: function()
    {
        WordSpace.wordForcedGroup.forEach(function(element)
        {
            element.attract();
        });
        WordSpace.playerTyping.add('');
    }
});