var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    backgroundColor: Phaser.Display.Color.GetColor(0,0,0),
    scene: [ gameScene, menuScene ]
};

var game = new Phaser.Game(config)

//플레이어 정보, 서버 통신시 필요할 듯
//테스트용이므로 차후 수정 요망
var playerNum = -1; //플레이어 아이디, 고유 번호
var playerName = '임시아이디' //플레이어 닉네임


// client side
var socket = io.connect();
socket.emit('idRequest');
socket.on('idSet', function(msg) // {str, num}
{
    console.log(msg.str);
    this.playerNum = msg.num;
});

//test
/*window.addEventListener("message", function(event)
{
    var sub = 0;
    if(event.data == "tick"){
        if(window.lafcb)
            if((new Date().getTime()/1000) - window.lafcb.started > 0.5){
                window.lafcb.func(new Date().getTime()+16)
                window.lafcb = null;
            }
        var i = window.timeouts.length;
        while (i--) {
            if(window.timeouts[i].ran){
                window.timeouts.splice(i,1);
            }
        }
        var i = window.timeouts.length;
        while (i--) {
            if(new Date().getTime() - window.timeouts[i].started >= window.timeouts[i].delay && window.timeouts[i]){
                window.timeouts[i].func();
                window.timeouts[i].ran = true;
            }
        }
        for(var i in window.intervals){
            var currTime = new Date().getTime();
            if(currTime - window.intervals[i].last >= window.intervals[i].delay && window.intervals[i]){
                window.intervals[i].last = currTime;
                window.intervals[i].func();
            }
        }
        window.postMessage('tick', '*');
    }
}, false);
(function(context) {
  'use strict';
    window.lafcb = null;
    context.timeouts = [];
    context.intervals = [];
    var lastTime = new Date().getTime();
    context.old = {};
    
    old.setTimeout = (i,ii)=> context.setTimeout(i,ii);
    old.setInterval = (i,ii) =>context.setInterval(i,ii);
    old.clearTimeout = (i) =>context.clearTimeout(i);
    old.clearInterval = (i) =>context.clearInterval(i);
    if(typeof(context.postMessage) == 'function'){
        context.setTimeout = function(fn, millis) {
            var id = timeouts.length 
            timeouts[id] = {id: id,func: fn, delay: millis,started: new Date().getTime()};
            return id;
        };
        context.clearTimeout = function(cancel) {
            for(var i in timeouts){
                if(timeouts[i].id == cancel){
                    timeouts.splice(i,1);
                    break;
                }
            }
        };
        context.setInterval = function(fn, delay ) {
            intervals[intervals.length] = {func: fn, delay: delay,last: new Date().getTime()};
            return intervals[intervals.length-1];
        };
        context.clearInterval = function(cancel) {
            for(var i in intervals){
                if(intervals[i] == cancel){
                    intervals.splice(i,1);
                    break;
                }
            }
        };
    }
    
    context.requestAnimationFrame = function( callback, element ) {
        lafcb = {started: new Date().getTime()/1000,func: callback};
        var currTime = new Date().getTime();
        var timeToCall = 16;
        var id = context.setTimeout( function() {
            callback( currTime+timeToCall);
        }, timeToCall );
        return id;
    };
    context.cancelAnimationFrame = function( id ) {
        lafcb 
        context.clearTimeout( id );
    };
    context.addEventListener("load",function(){
        if(typeof(context.postMessage) == 'function'){
            context.postMessage('tick', '*');
        }else{
            context.setTimeout = old.setTimeout
            context.setInterval = old.setInterval
            context.clearTimeout = old.clearTimeout
            context.clearInterval = old.clearInterval
            alert("Your browser does not support postMessage. Sorry but you will be forced to default to the standard setInterval and setTimeout functions. This means you may experience pauses in your game when you navigate away from the tab it is playing in.");
        }
    });
})(this);*/
