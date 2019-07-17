var BackGround = BackGround || {}

BackGround.brainGroup = null;
BackGround.myCharacter = null;

BackGround.loadImage = function(scene)
{
    scene.load.image('brainGround', 'assets/image/background/background_brain.png');
    scene.load.image('menuBackground', 'assets/placeholder/menuBackground.png')
}

BackGround.drawCharacter = function(scene)
{
    BackGround.myCharacter = scene.add.sprite(640, 615, 'pyeongminWrite').setScale(0.45).setDepth(2);
}

BackGround.drawBrain = function(scene)
{
    brains = scene.add.sprite(640, 360, 'brainGround').setDisplaySize(1282, 722).setDepth(1);
}

BackGround.drawMenu = function(scene)
{
    scene.add.sprite(640, 360, 'menuBackground').setDisplaySize(1282, 722).setDepth(1);
}