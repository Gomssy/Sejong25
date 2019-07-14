var Audio = Audio || {}

Audio.loadSound = function(scene)
{
    scene.load.audio('login', 'assets/sound/login.ogg');
    scene.load.audio('startGame', 'assets/sound/startGame.ogg');
}

Audio.playLogin = function(scene)
{
    var bgm = scene.sound.add('login');
    bgm.setLoop(true);
    bgm.play();
}

Audio.playStart = function(scene)
{
    var bgm = scene.sound.add('startGame');
    bgm.play();
}

Audio.pauseSound = function(scene)
{
    var bgm = scene.sound.add('BGM');
    bgm.pause();
}

Audio.resumeSound = function(scene)
{
    var bgm = scene.sound.add('BGM');
    bgm = scene.sound.resume();
}

Audio.stopSound = function(scene)
{
    var bgm = scene.sound.add('login');
    bgm.setLoop(false);
    bgm.stop();
}

