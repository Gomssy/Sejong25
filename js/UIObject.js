var UIObject = UIObject || {};

UIObject.createLabel = function (scene, x, y, depth, image, size, align, text = '', textSize = 24, textColor = '#000000', textOriginX = 0.5, textOriginY = 0.5) {
    var temp = scene.rexUI.add.label({
        /*width: width,
        height: height,*/
        x: x,
        y: y,

        background: scene.add.sprite(x, y, image).setScale(size).setOrigin(0.5, 0.5).setDepth(depth),

        text: scene.add.text(x, y, text, {
            font: textSize + 'pt sejongFont',
            align: 'center'
        }).setDepth(depth).setOrigin(textOriginX, textOriginY).setColor(textColor).setPadding(30, 30, 30, 30),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
    switch(align)
    {
        case 'left':
            temp.x += temp.getElement('background').width / 2;
            break;
        case 'right':
            temp.x -= temp.getElement('background').width / 2;
            break;
        case 'center':
            break;
        default:
            break;
    }
    return temp;
}

UIObject.createButton = function(scene, buttonGameObject, overFrame, outFrame, downFrame, clickCallback) {
    var temp = scene.rexUI.add.buttons({
        x: 0,
        y: 0,
        width: undefined,
        height: undefined,
        orientation: 0,
        buttons: [
            buttonGameObject,
        ],
        click: {
            mode: 'pointerdown',
            clickInterval: 100
        }
    });
    let buttonGameObjectBackground = buttonGameObject.getElement('background');
    temp.enabled = true;    
    buttonGameObjectBackground.setFrame(outFrame > 0 ? outFrame : 0).setInteractive()
    .on('pointerover', () => {
        if(temp.enabled)
        {
            if(overFrame > 0) buttonGameObjectBackground.setFrame(overFrame);
            if(overFrame != -2) buttonGameObject.setScale(1.1);
        }
    })
    .on('pointerdown', () => {
        if(temp.enabled)
        {
            if(downFrame > 0) buttonGameObjectBackground.setFrame(downFrame);
            if(downFrame != -2) buttonGameObject.setScale(0.9);
            clickCallback();
        }
    })
    .on('pointerup', () => {
        if(temp.enabled)
        {
            if(overFrame > 0) buttonGameObjectBackground.setFrame(overFrame);
            if(overFrame != -2) buttonGameObject.setScale(1.1);
        }
    })
    .on('pointerout', () => {
        if(outFrame > 0) buttonGameObjectBackground.setFrame(outFrame);
        if(outFrame != -2) buttonGameObject.setScale(1);
    })
    temp.setEnable = function(isEnable)
    {
        temp.enabled = isEnable;
        return temp;
    }
    temp.getBackground = function() { return buttonGameObjectBackground; }

    return temp;
}