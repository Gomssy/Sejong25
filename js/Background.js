var BackGround = BackGround || {}

BackGround.brainGroup = null;

BackGround.loadImage = function(scene)
{
    scene.load.image('brainGround', 'assets/placeholder/playback.png');
    scene.load.image('menuBackground', 'assets/placeholder/menuBackground.png')
}

BackGround.drawBrain = function(scene)
{
    brains = scene.add.sprite(640, 360, 'brainGround').setDisplaySize(1282, 722).setDepth(1);
}

BackGround.drawMenu = function(scene)
{
    scene.add.sprite(640, 360, 'menuBackground').setDisplaySize(1282, 722).setDepth(1);
}