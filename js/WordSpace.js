var WordSpace = WordSpace || {};

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;

WordSpace.wordGroup = [];
WordSpace.wordForcedGroup = [];
WordSpace.wordPhysicsGroup = null;

WordSpace.gravityPoint = {x: 400, y: 300};

WordSpace.wordCycle = null;
WordSpace.resetCycle = function(scene, _delay)
{
    var option = 
    {
        delay: _delay,
        callback: function()
        {
            WordSpace.generateWord(this)
        },
        callbackScope: scene,
        loop: true
    };
    if (this.wordCycle != null)
    {
        this.wordCycle = this.wordCycle.reset(option);
    }
    else
    {
        this.wordCycle = scene.time.addEvent(option);
    }
}

WordSpace.loadImage = function(scene)
{
    if (!this.isImageLoaded)
    {
        scene.load.image('wordBackground', 'assets/wordBackground.png');
    }
}

WordSpace.generateWord = function(scene)
{
    word = new WordObject("솽젠커");
    word.instantiate(scene);
    WordSpace.wordGroup.push(word);
    WordSpace.wordForcedGroup.push(word);
    scene.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup);
    scene.physics.add.collider(word.physicsObj, BackGround.brainGroup);
    WordSpace.wordPhysicsGroup.add(word.physicsObj);
}