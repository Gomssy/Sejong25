WordSpace.startCycle = function(scene)
{
    WordSpace.wordCycle.resetCycle(scene, 3000, 0, true);
    WordSpace.nameCycle.resetCycle(scene, 3000, 0, true);
    WordSpace.playerTypingCycle.resetCycle(scene, 500, 500, true);
}

WordSpace.pauseCycle = function(isPause)
{
    WordSpace.wordCycle.currentCycle.paused = isPause;
    WordSpace.nameCycle.currentCycle.paused = isPause;
    WordSpace.attackGauge.pauseCycle(isPause);
    WordSpace.playerTypingCycle.currentCycle.paused = isPause;
    WordSpace.attackedEvents.forEach(function(element) {element.currentCycle.paused = isPause});
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