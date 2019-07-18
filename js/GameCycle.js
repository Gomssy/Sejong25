WordSpace.startCycle = function(scene)
{
    WordSpace.wordCycle.resetCycle(scene, 3000, 0, true);
    WordSpace.nameCycle.resetCycle(scene, 3000, 0, true);
    WordSpace.varAdjustCycle.resetCycle(scene, 100, 0, true);
    WordSpace.playerTypingCycle = setInterval(function()
    {
        socket.emit('setPlayerTyping', WordSpace.playerTyping);
    }, 500);
}

WordSpace.pauseCycle = function(isPause)
{
    WordSpace.wordCycle.currentCycle.paused = isPause;
    WordSpace.nameCycle.currentCycle.paused = isPause;
    WordSpace.varAdjustCycle.currentCycle.paused = isPause;
    WordSpace.attackGauge.pauseCycle(isPause);
    if (isPause) clearInterval(WordSpace.playerTypingCycle);
    else WordSpace.playerTypingCycle = setInterval(function()
    {
        socket.emit('setPlayerTyping', WordSpace.playerTyping);
    }, 500);
}

class Cycle //앞으로 cycle은 이 클래스를 사용해서 구현할 것
{
    constructor(_callback)
    {
        this.delay = 0;
        this.currentCycle = null;
        this.callbackFunction = _callback;
    }
    resetCycle(scene, _delay, _startAt, _loop)
    {
        this.delay = _delay;
        var option = 
        {
            startAt: _startAt,
            delay: _delay,
            callback: this.callbackFunction,
            callbackScope: scene,
            loop: _loop
        };
        if (this.currentCycle != null) this.currentCycle = this.currentCycle.reset(option);
        else this.currentCycle = scene.time.addEvent(option);
    }
}

//단어 생성 사이클
WordSpace.wordCycle = new Cycle(function()
{
    WordSpace.genWordByProb(this);
});
//게임 오버 사이클
WordSpace.gameOverCycle = new Cycle(gameOver);
//호패 생성 사이클
WordSpace.nameCycle = new Cycle(function()
{
    WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
});
//이건 뭐지
WordSpace.varAdjustCycle = new Cycle(function()
{
    //나중에는 메세지 분석해서 Phase랑 playerTypingRate 받겠지만 일단 이렇게 해둠
    //WordSpace.GetPhase();
    //WordSpace.GetPlayerTypingRate();
    WordSpace.AdjustVarByPhase(WordSpace.playerTypingRate, WordSpace.CurrentPhase);
});