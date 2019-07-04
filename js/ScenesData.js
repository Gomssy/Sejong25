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
        BackGround.drawBrain(this);
        Input.inputField.generate(this);
        WordSpace.wordPhysicsGroup = this.physics.add.group();
        WordSpace.wordCycle.resetCycle(this, 3000);
        WordSpace.attackGauge.resetCycle(this);
        WordSpace.playerTyping.initiate(this);
        CSVParsing.CSVParse(this);
    },

    update: function()
    {
        WordSpace.wordForcedGroup.forEach(function(element)
        {
            element.attract();
        });
    }
});