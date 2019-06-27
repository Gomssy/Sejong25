var WordSpace = WordSpace || {};

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.brainCapacity = 20; //수용 가능한 단어 무게 최대치
WordSpace.defeatTime = 3000;
WordSpace.gameOverTimer = null; //게임 오버 판정 타이머
WordSpace.isTimerOn = false;

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

function gameOver()
{
    this.wordCycle.paused = true;
    //To Do
}

//게임 오버 판정을 위한 타이머
WordSpace.setGameOverTimer = function()
{
    //만약 현재 단어 무게 총합이 뇌 용량보다 크다면 타이머를 시작함
    if(this.brainCapacity < this.totalWeight && !this.isTimerOn)
    {
        this.gameOverTimer = setTimeout(gameOver.bind(this), this.defeatTime);
        isTimerOn = true;
    }
}