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

WordSpace.attackGauge = 
{
    value: 0,
    add: function(plus)
    {
        if (this.value + plus > 11) this.value = 11;
        else this.value += plus;
        this.text.setText('게이지: ' + this.value.toFixed(1));
    },
    sub: function(minus)
    {
        if (this.value - minus < 0) this.value = 0;
        else this.value -= minus;
        this.text.setText('게이지: ' + this.value.toFixed(1));
    },
    resetValue: function() {this.value = 0;},
    cutValue: function(cutOut) {this.value *= (1-cutOut);},
    resetCycle: function(scene)
    {
        var option = 
        {
            delay: 300,
            callback: function()
            {
                WordSpace.attackGauge.sub(0.1);
            },
            loop: true
        };
        this.currentCycle = scene.time.addEvent(option);

        this.text = scene.add.text(100,100,'게이지: ' + this.value.toFixed(1)).setColor('#ffffff');
    },
    pauseCycle: function(bool) {this.currentCycle.paused = bool;}
    // showValue: 아래쪽에 바의 길이로 게이지 표시, 색으로 게이지의 강도 표현
}

WordSpace.wordCycle =
{
    currentCycle: null,
    resetCycle: function(scene, _delay)
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
        if (this.currentCycle != null)
        {
            this.currentCycle = this.currentCycle.reset(option);
        }
        else
        {
            this.currentCycle = scene.time.addEvent(option);
        }
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
    word.physicsObj.topObj = word;
    scene.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup, function(object1) 
    {
        object1.topObj.wordSpeed = 0.1;
        object1.topObj.attract();
    });
    scene.physics.add.collider(word.physicsObj, BackGround.brainGroup);
    WordSpace.wordPhysicsGroup.add(word.physicsObj);
}

function gameOver()
{
    this.wordCycle.currentCycle.paused = true;
    //To Do
    console.log('defeat');
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

WordSpace.findWord = function(word)
{
    var found = WordSpace.wordGroup.filter(function(element)
    {
        return Input.isEqual(word, element.wordText);
    });
    if (found.length != 0)
    {
        let weightest = found[0];
        found.forEach(function(element) 
        {
            if (weightest.wordWeight < element.wordWeight) weightest = element;
        });
        switch(weightest.wordGrade) // 이부분 나중에 더 효율적으로 바꿀수있지 않을까
        {
            case 0: WordSpace.attackGauge.add(2.5); break;
            case 1: WordSpace.attackGauge.add(1.5); break;
            case 2: WordSpace.attackGauge.add(0.9); break;
            case 3: WordSpace.attackGauge.add(0.5); break;
            default: console.log('[ERR] wrong grade of word'); break;
        }
        weightest.destroy();
    }
    else if (word === '공격') // 공격모드 진입.
    {
        console.log('attack mode');
    }
}