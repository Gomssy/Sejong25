var WordSpace = WordSpace || {};

WordSpace.isImageLoaded = false;

WordSpace.wordGroup = null;
WordSpace.wordPhysicsGroup = null;

WordSpace.gravityPoint = {x: 400, y: 300};

WordSpace.wordCycle = null;
WordSpace.resetCycle = function(scene, _delay)
{
    if (this.wordCycle != null)
    {
        this.wordCycle = this.wordCycle.reset(
            {
                delay: _delay,
                callback: function()
                {
                    word = new WordObject("솽젠커");
                    word.generate(this);
                    WordSpace.wordGroup.push(word);
                    this.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup);
                    WordSpace.wordPhysicsGroup.add(word.physicsObj);
                },
                callbackScope: scene,
                loop: true
            }
        );
    }
    else
    {
        this.wordCycle = scene.time.addEvent(
            {
                delay: _delay,
                callback: function()
                {
                    word = new WordObject("솽젠커");
                    word.generate(this);
                    WordSpace.wordGroup.push(word);
                    this.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup);
                    this.physics.add.collider(word.physicsObj, BackGround.brainGroup);
                    WordSpace.wordPhysicsGroup.add(word.physicsObj);
                },
                callbackScope: scene,
                loop: true
            }
        );
    }
}

WordSpace.loadImage = function(scene)
{
    if (!this.isImageLoaded)
    {
        scene.load.image('wordBackground', 'assets/wordBackground.png');
    }
}