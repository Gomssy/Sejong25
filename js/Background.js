var BackGround = BackGround || {}

BackGround.isImageLoaded = false;

BackGround.brainGroup = null;

BackGround.loadImage = function(scene)
{
    if (!this.isImageLoaded)
    {
        scene.load.image('brainGround0', 'assets/placeholder/playback.png');
    }
}

BackGround.drawBrain = function(scene)
{
    brains = scene.add.sprite(640, 360, 'brainGround0').setDisplaySize(1282, 722).setDepth(1);
}