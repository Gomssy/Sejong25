var BackGround = BackGround || {}

BackGround.isImageLoaded = false;

BackGround.brainGroup = null;

BackGround.loadImage = function(scene)
{
    if (!this.isImageLoaded)
    {
        scene.load.image('brainGround0', 'assets/platform.png'); // horizontal
        scene.load.image('brainGround1', 'assets/platform2.png'); // vertical
    }
}

BackGround.drawBrain = function(scene)
{
    brains = scene.physics.add.staticGroup();

    brains.create(400, 500, 'brainGround0').setScale(1.5).refreshBody();
    brains.create(400, 100, 'brainGround0').setScale(1.5).refreshBody();
    brains.create(100, 300, 'brainGround1').setScale(0.5).refreshBody();
    brains.create(700, 300, 'brainGround1').setScale(0.5).refreshBody();

    brains.immovable = true;

    this.brainGroup = brains;
}