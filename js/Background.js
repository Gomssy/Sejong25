var BackGround = BackGround || {}

BackGround.brainGroup = null;
BackGround.myCharacter = null;

BackGround.loadImage = function(scene)
{
    scene.load.image('brainGround', 'assets/image/background/background_brain.png');
    scene.load.image('menuBackground', 'assets/placeholder/menuBackground.png');
    scene.load.image('roomBackground', 'assets/placeholder/roomBackground.png');
}

BackGround.drawCharacter = function(scene)
{
    BackGround.myCharacter = scene.add.sprite(game.config.width / 2, game.config.height * 41 / 48, 'pyeongminWrite').setScale(0.45).setDepth(2);
}

BackGround.drawBrain = function(scene)
{
    brains = scene.add.sprite(game.config.width / 2, game.config.height / 2, 'brainGround').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}

BackGround.drawMenu = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'menuBackground').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}

BackGround.drawRoom = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'roomBackground').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}