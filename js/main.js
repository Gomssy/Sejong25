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
var playerNum = -1;

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
    WordSpace.wordCycle.resetCycle(this, 3000);
    WordSpace.attackGauge.resetCycle(this);
    CSVParsing.CSVParse(this);
}

function update()
{
    WordSpace.wordForcedGroup.forEach(function(element)
    {
        element.attract();
    });
}

// client side
var socket = io.connect();
socket.on('idSet', function(msg) // {str, num}
{
    console.log(msg.str);
    this.playerNum = msg.num;
});
socket.emit('idRequest');