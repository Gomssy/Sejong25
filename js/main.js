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

var game = new Phaser.Game(config);

var tec;

// load assets
function preload()
{
    BackGround.loadImage(this);
    WordSpace.loadImage(this);
}

function create()
{
    BackGround.drawBrain(this);
    WordSpace.wordGroup = [];
    WordSpace.wordPhysicsGroup = this.physics.add.group();

    this.time.addEvent(
        {
            delay: 2000,
            callback: function()
            {
                word = new WordObject("솽젠커");
                word.generate(this);
                WordSpace.wordGroup.push(word);
                this.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup);
                WordSpace.wordPhysicsGroup.add(word.physicsObj);
            },
            callbackScope: this,
            repeat: 10
        }
    );
}

function update()
{
    var socket = io.connect();
    socket.on('hi', function(msg) {
        console.log(msg);
    });
    socket.emit('hello');
    
    for(i = 0; i < WordSpace.wordGroup.length; i++)
    {
        WordSpace.wordGroup[i].attract(0.3);
    }
}



