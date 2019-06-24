var WordSpace = WordSpace || {};

WordSpace.isImageLoaded = false;

WordSpace.wordGroup = null;
WordSpace.wordPhysicsGroup = null;

WordSpace.gravityPoint = {x: 400, y: 300};

WordSpace.loadImage = function(scene)
{
    if (!this.isImageLoaded)
    {
        scene.load.image('wordBackground', 'assets/wordBackground.png');
    }
}