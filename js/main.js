var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
}

function create()
{
    BackGround.drawBrain(this);
    Input.inputField.generate(this);
    WordSpace.wordPhysicsGroup = this.physics.add.group();
    WordSpace.wordCycle.resetCycle(this, 2000);
    WordSpace.attackGauge.resetCycle(this);
}

function update()
{
    WordSpace.wordForcedGroup.forEach(function(element)
    {
        element.attract(0.3);
    });
}

var socket = io.connect();
socket.on('hi', function(msg) {
    console.log(msg);
});
socket.emit('hello');