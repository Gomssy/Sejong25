var UIObject = UIObject || {};

UIObject.createLabel = function (scene, x, y, depth, image, size, text = '', textSize = 24, textColor = '#000000') {
    return scene.rexUI.add.label({
        /*width: width,
        height: height,*/

        background: scene.add.sprite(x, y, image).setScale(size).setOrigin(0.5, 0.5).setDepth(depth),

        text: scene.add.text(x, y, text, {
            fontSize: textSize + 'pt'
        }).setDepth(depth).setOrigin(0.5, 0.5).setColor(textColor),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
}

class Button extends Phaser.GameObjects.Sprite{
  
    constructor(scene, x, y, texture, overFrame, outFrame, downFrame)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
    
        this.setFrame(outFrame).setInteractive()
  
        .on('pointerover', () => {
            this.setFrame(overFrame)
        })
        .on('pointerdown', () => {
            this.setFrame(downFrame)
        })
        .on('pointerup', () => {
            this.setFrame(overFrame)
        })
        .on('pointerout', () => {
            this.setFrame(outFrame)
        })
    }
}