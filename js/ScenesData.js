var gameScene = new Phaser.Class(
{
    Extends: Phaser.Scene,

    initialize:

    function gameScene (config)
    {
        Phaser.Scene.call(this, config);
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