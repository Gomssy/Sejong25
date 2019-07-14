var Audio = Audio || {}

Audio.loadSound = function(scene)
{
    scene.load.audio('BGM', 'assets/sound/login.ogg');
}

Audio.playSound = function(scene)
{
    var bgm = scene.sound.add('BGM');
    bgm.setLoop(true);
    bgm.play();
    console.log('PlayMusic');

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
    var bgm = scene.sound.add('BGM');
    bgm.stop();
    console.log('StopMusic');
}

