var Audio = Audio || {}

var bgm;
Audio.loadSound = function(scene)
{
    // 게임 시작 전 BGM
    scene.load.audio('login', 'assets/sound/login.ogg');
    scene.load.audio('inRoom', 'assets/sound/waitingRoom.ogg');

    // 징 소리
    scene.load.audio('startGame', 'assets/sound/startGame.ogg');

    // 게임 진행 중 효과음들
    scene.load.audio('attack', 'assets/sound/attackShort.ogg');
    scene.load.audio('Bagazi', 'aassets/sound/Bagazi_ddak.ogg');
    scene.load.audio('getItem', 'assets/sound/getItem.ogg');
    scene.load.audio('killLog', 'assets/sound/killLog.ogg');
    scene.load.audio('killWord', 'assets/sound/killWord.ogg');

    // 페이즈별 인게임 BGM    
    scene.load.audio('Phase1', 'assets/sound/Phase1.ogg');
    scene.load.audio('Phase2', 'assets/sound/Phase2.ogg');
    scene.load.audio('Phase3', 'assets/sound/Phase3.ogg');
    
    // 승패 BGM
    scene.load.audio('victory', 'assets/sound/victory.ogg');
    scene.load.audio('defeat', 'assets/sound/defeat.ogg');
}

Audio.playSound = function(scene, title) // 한 번만 재생할 때 사용
{
    bgm = scene.sound.add(title);
    bgm.play();
}

Audio.loopSound = function(scene, title) // 반복재생할 때 사용
{
    bgm = scene.sound.add(title);
    bgm.setLoop(true);
    bgm.play();
}

Audio.pauseSound = function(scene, title)
{
    bgm.pause();
}

Audio.resumeSound = function(scene, title)
{
    bgm = scene.sound.resume();
}

Audio.killSound = function(scene, title)
{
    bgm.setLoop(false);
    bgm.stop();
}

