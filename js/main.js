var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    backgroundColor: Phaser.Display.Color.GetColor(0,0,0),
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config)

// load assets
function preload()
{
    BackGround.loadImage(this);
    WordSpace.loadImage(this);
    Input.inputField.loadImage(this);
    CSVParsing.loadText(this);
}

function create()
{
    BackGround.drawBrain(this);
    Input.inputField.generate(this);
    WordSpace.wordPhysicsGroup = this.physics.add.group();
    WordSpace.wordCycle.resetCycle(this, 3000, 0);
    WordSpace.nameCycle.resetCycle(this, 3000, 0);
    WordSpace.varAdjustCycle.resetCycle(this, 100, 0);
    WordSpace.attackGauge.resetCycle(this);
    CSVParsing.CSVParse(this);
    WordSpace.spaceInitiate(this);
}

function update()
{
    WordSpace.wordForcedGroup.forEach(function(element)
    {
        element.attract();
    });
}

var socket = io.connect();
socket.on('hi', function(msg) {
    console.log(msg);
});
socket.emit('hello');