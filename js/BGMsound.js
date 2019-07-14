var Audio = Audio || {}

Audio.loadSound = function(scene)
{
    scene.load.audio('login', 'assets/sound/login.ogg');
    scene.load.audio('startGame', 'assets/sound/startGame.ogg');
}

Audio.playSound = function(scene, title) // 한 번만 재생할 때 사용
{
    var bgm = scene.sound.add(title);
    bgm.play();
}

Audio.loopSound = function(scene, title) // 반복재생할 때 사용
{
    var bgm = scene.sound.add(title);
    bgm.setLoop(true);
    bgm.play();
}

Audio.pauseSound = function(scene, title)
{
    var bgm = scene.sound.add(title);
    bgm.pause();
}

Audio.resumeSound = function(scene, title)
{
    var bgm = scene.sound.add(title);
    bgm = scene.sound.resume();
}

Audio.stopSound = function(scene, title)
{
    var bgm = scene.sound.add(title);
    bgm.setLoop(false);
    bgm.stop();
}

