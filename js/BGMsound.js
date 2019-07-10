var Audio = Audio || {}

Audio.loadSound = function(scene)
{
    scene.load.audio('BGM', 'assets/sound/BGM_twochae.ogg');
}

Audio.playSound = function(scene)
{
    var bgm = scene.sound.add('BGM');
    bgm.setLoop(true);
    bgm.play();

}

Audio.pauseSound = function(scene)
{
    bgm = scene.sound.pause();
}

Audio.resumeSound = function(scene)
{
    bgm = scene.sound.resume();
}

Audio.stopSound = function(scene)
{
    bgm = scene.sound.stop();
}

