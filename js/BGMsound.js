var Audio = Audio || {}

Audio.loadSound = function(scene)
{
    scene.load.audio('menuBackground', 'assets/sound/BGM_twochae.ogg')
}

Audio.playSound = function(scene)
{
    bgm = scene.sound.play('menuBackground')
}

Audio.pauseSound = function(scene)
{
    bgm = scene.sound.pause()
}

Audio.resumeSound = function(scene)
{
    bgm = scene.sound.resume()
}

Audio.stopSound = function(scene)
{
    bgm = scene.sound.stop()
}
// var Audio = new Audio('assets/sound/BGM_twochae.ogg');
// Audio.play();