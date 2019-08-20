var ResourceLoader = ResourceLoader || {};

ResourceLoader.loadBackGround = function(scene)
{
    scene.load.image('weightWarning', 'assets/image/background/weightWarning.png');
    scene.load.image('baseBackground', 'assets/image/background/yellowBack.png');
    scene.load.image('gameBackground', 'assets/image/background/background_brain.png');
    scene.load.image('menuBackground', 'assets/placeholder/menuBackground.png');
    scene.load.image('roomBackground', 'assets/placeholder/roomBackground.png');
}

ResourceLoader.loadImage = function(scene)
{
    scene.load.image('inputfield', 'assets/image/etc/wordspace.png');
    for (let i = 0; i < 4; i++)
    {
        for (let j = 2; j < 7; j++)
        {
            scene.load.image(('wordBgr' + i + '_' + j), ('assets/image/word/'+i + '_' + j + '.png'));
        }
    }
    for (let i = 0; i < 4; i++)
    {
        scene.load.image('attackAlert' + i, 'assets/placeholder/attackalert' + (i+1) + '.png');
    }
    for (let i = 0; i < 6; i++)
    {
        scene.load.image('item' + i, 'assets/placeholder/item' + i + '.png');
    }
    for (let i = 2; i < 7; i++)
    {
        scene.load.image('nameBgr' + i, 'assets/image/word/name' + i + '.png');
        scene.load.image('strongBgr' + i, 'assets/image/word/strong' + i + '.png');
    }
    
    scene.load.spritesheet('pyeongminSit', 'assets/image/character/pyeongmin/pyeong_sit.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminWrite', 'assets/image/character/pyeongmin/write/pyeong_write.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminThrow', 'assets/image/character/pyeongmin/throw/pyeong_throw.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminBurningSmall', 'assets/image/character/pyeongmin/burning/pyeong_burning_small.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminBurningBig', 'assets/image/character/pyeongmin/burning/pyeong_burning_big.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminGameOver', 'assets/image/character/pyeongmin/balladang/pyeong_balladang.png', { frameWidth: 720, frameHeight: 700 });
    scene.load.image('pyeongminStand', 'assets/image/character/pyeongmin/pyeong_stand.png');
    
    scene.load.spritesheet('wordBreak', 'assets/image/word/wordbreak.png', { frameWidth: 180, frameHeight: 180 });
    scene.load.spritesheet('phase1', 'assets/image/etc/scroll/startPhase/startPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.spritesheet('phase2', 'assets/image/etc/scroll/bonPhase/bonPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.spritesheet('phase3', 'assets/image/etc/scroll/poongPhase/poongPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.image('attackPaper', 'assets/image/etc/paper_crumbled.png');
    scene.load.image('panel', 'assets/placeholder/panel.png');
    scene.load.image('button', 'assets/placeholder/button.png');
    scene.load.image('itemBag', 'assets/image/etc/itembag2.png');
}

ResourceLoader.loadAnimation = function(scene)
{
    scene.anims.create({
        key: 'wordBreakAnim',
        frames: scene.anims.generateFrameNumbers('wordBreak'),
        frameRate: 10,
        repeat: 0
    });
    scene.anims.create({
        key: 'phase1Anim',
        frames: scene.anims.generateFrameNumbers('phase1'),
        frameRate: 20,
        repeat: 0
    });
    scene.anims.create({
        key: 'phase2Anim',
        frames: scene.anims.generateFrameNumbers('phase2'),
        frameRate: 20,
        repeat: 0
    });
    scene.anims.create({
        key: 'phase3Anim',
        frames: scene.anims.generateFrameNumbers('phase3'),
        frameRate: 20,
        repeat: 0
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.sit] = scene.anims.create({
        key: 'pyeongminSitAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminSit'),
        frameRate: 10,
        repeat: 0
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.write] = scene.anims.create({
        key: 'pyeongminWriteAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
        frameRate: 10,
        repeat: 0
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.notBurning] = scene.anims.create({
        key: 'pyeongminnotBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
        frameRate: 10,
        repeat: -1
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.smallBurning] = scene.anims.create({
        key: 'pyeongminsmallBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminBurningSmall'),
        frameRate: 10,
        repeat: -1
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.bigBurning] = scene.anims.create({
        key: 'pyeongminbigBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminBurningBig'),
        frameRate: 10,
        repeat: -1
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.throw] = scene.anims.create({
        key: 'pyeongminThrowAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminThrow'),
        frameRate: 10,
        repeat: 0
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.gameOver] = scene.anims.create({
        key: 'pyeongminGameOverAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminGameOver'),
        frameRate: 10,
        repeat: 0
    });
}