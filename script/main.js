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

// load assets
function preload()
{
    BackGround.loadImage(this);
}

function create()
{
    BackGround.drawBrain(this);
    var word = new Word('살려주세요');
    word.generate(this);
}

function update()
{
    
}