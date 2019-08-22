var ResourceLoader = ResourceLoader || {};

ResourceLoader.loadBackGround = function(scene)
{
    scene.load.image('weightWarning', 'assets/image/background/weightWarning.png');
    scene.load.image('baseBackground', 'assets/image/background/yellowBack.png');
    scene.load.image('gameBackground', 'assets/image/background/background_brain.png');
    scene.load.image('menuBackground', 'assets/image/UI/main/mainBackground.png');
    scene.load.image('roomBackground', 'assets/placeholder/roomBackground.png');
    scene.load.image('shopBackground', 'assets/image/UI/shop/shop_background.png');
}

ResourceLoader.loadImage = function(scene)
{
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
    
    scene.load.spritesheet('sunbiSit', 'assets/image/character/sunbi/sunbi_sit.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('sunbiWrite', 'assets/image/character/sunbi/sunbi_write.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('sunbiThrow', 'assets/image/character/sunbi/sunbi_throw.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('sunbiBurningSmall', 'assets/image/character/sunbi/sunbi_burning_small.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('sunbiBurningBig', 'assets/image/character/sunbi/sunbi_burning_big.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('sunbiGameOver', 'assets/image/character/sunbi/sunbi_die.png', { frameWidth: 720, frameHeight: 700 });
    scene.load.image('sunbiStand', 'assets/image/character/sunbi/sunbi_stand.png');
    
    scene.load.spritesheet('wordBreak', 'assets/image/word/wordbreak.png', { frameWidth: 180, frameHeight: 180 });
    scene.load.spritesheet('hopaeSceneInput', 'assets/image/word/hopaeSceneInput.png', { frameWidth: 239, frameHeight: 45 });
    scene.load.spritesheet('gameSceneInput', 'assets/image/etc/wordSpace/wordspace.png', { frameWidth: 253, frameHeight: 67 });
    scene.load.image('attackPaper', 'assets/image/etc/paper_crumbled.png');
    scene.load.image('itemBag', 'assets/image/etc/itembag2.png');
    scene.load.image('mat', 'assets/image/etc/mat.png');

    scene.load.image('button', 'assets/placeholder/button.png');
    scene.load.image('panel', 'assets/placeholder/panel.png');
    
    scene.load.image('dialog1', 'assets/image/UI/dialog/dialog1.png');
    scene.load.image('dialog2', 'assets/image/UI/dialog/dialog2.png');
    scene.load.image('resultDialog', 'assets/image/UI/dialog/result_background.png');
    scene.load.image('resultStamp', 'assets/image/UI/dialog/result_stamp.png');
    scene.load.image('friendlyPlayBtn', 'assets/image/UI/main/friendlyPlay.png');
    scene.load.image('rankPlayBtn', 'assets/image/UI/main/rankPlay.png');
    scene.load.image('shopBtn', 'assets/image/UI/main/shop.png');
    scene.load.image('boughtItem', 'assets/image/UI/shop/bought_item.png');
    scene.load.image('hopaeManageBtn', 'assets/image/UI/main/hopaeManage.png');
    scene.load.image('helpBtn', 'assets/image/UI/main/help.png');

    
    scene.load.image('cancelBtn', 'assets/image/UI/decisionBtn/cancel.png');
    scene.load.image('confirmBtn', 'assets/image/UI/decisionBtn/confirm.png');
    scene.load.image('exitBtn', 'assets/image/UI/decisionBtn/exit.png');
    scene.load.image('noBtn', 'assets/image/UI/decisionBtn/no.png');
    scene.load.image('spectateBtn', 'assets/image/UI/decisionBtn/spectate.png');
    scene.load.image('yesBtn', 'assets/image/UI/decisionBtn/yes.png');
    scene.load.image('buyBtn', 'assets/image/UI/decisionBtn/buy.png');
    

    
    scene.load.spritesheet('phase1', 'assets/image/etc/scroll/startPhase/startPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.spritesheet('phase2', 'assets/image/etc/scroll/bonPhase/bonPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.spritesheet('phase3', 'assets/image/etc/scroll/poongPhase/poongPhase.png', { frameWidth: 280, frameHeight: 920 });
    scene.load.spritesheet('tutorialImage', 'assets/image/UI/tutorial/tutorialImages.png', { frameWidth: 1080, frameHeight: 615 });
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

    for(let i = 0; i < 2; i++)
    {
        WordSpace.characterAnims[i][Enums.characterAnim.sit] = scene.anims.create({
            key: Enums.characterSkin[i] + 'SitAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'Sit'),
            frameRate: 10,
            repeat: 0
        });
        WordSpace.characterAnims[i][Enums.characterAnim.write] = scene.anims.create({
            key: Enums.characterSkin[i] + 'WriteAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'Write'),
            frameRate: 10,
            repeat: 0
        });
        WordSpace.characterAnims[i][Enums.characterAnim.notBurning] = scene.anims.create({
            key: Enums.characterSkin[i] + 'notBurningAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'Write'),
            frameRate: 10,
            repeat: -1
        });
        WordSpace.characterAnims[i][Enums.characterAnim.smallBurning] = scene.anims.create({
            key: Enums.characterSkin[i] + 'smallBurningAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'BurningSmall'),
            frameRate: 10,
            repeat: -1
        });
        WordSpace.characterAnims[i][Enums.characterAnim.bigBurning] = scene.anims.create({
            key: Enums.characterSkin[i] + 'bigBurningAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'BurningBig'),
            frameRate: 10,
            repeat: -1
        });
        WordSpace.characterAnims[i][Enums.characterAnim.throw] = scene.anims.create({
            key: Enums.characterSkin[i] + 'ThrowAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'Throw'),
            frameRate: 10,
            repeat: 0
        });
        WordSpace.characterAnims[i][Enums.characterAnim.gameOver] = scene.anims.create({
            key: Enums.characterSkin[i] + 'GameOverAnim',
            frames: scene.anims.generateFrameNumbers(Enums.characterSkin[i] + 'GameOver'),
            frameRate: 10,
            repeat: 0
        });
    }
}