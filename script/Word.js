class Word
{
    constructor(text)
    {
        this.wordText = text;
    }

    generate(scene)
    {
        var randomX = Phaser.Math.Between(100, 500);
        this.physicsObj = scene.physics.add.sprite(randomX, 100, 'wordBackground').setScale(0.5);
        this.wordObj = scene.add.text(randomX, 100, this.wordText, {fontFamily: '"궁서", 궁서체, serif'}).setColor('#000000');
        this.wordObj.setOrigin(0.5,0.5);
    }

    attract(wordSpeed)
    {
        var dist = Phaser.Math.Distance.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        var angle = Phaser.Math.Angle.Between(this.physicsObj.x, this.physicsObj.y, WordSpace.gravityPoint.x, WordSpace.gravityPoint.y);
        this.physicsObj.setVelocity(dist * Math.cos(angle) * wordSpeed, dist * Math.sin(angle) * wordSpeed);
        this.wordObj.setPosition(this.physicsObj.x, this.physicsObj.y);
    }
}

/*
function Word()
{
    this.wordText = '임시텍스트';
}

Word.prototype.generate = function(scene)
{
    myText = scene.add.text(400,300, this.wordText, {fontFamily: '"궁서", 궁서체, serif'}).setBackgroundColor('#FF00FF');
}

Word.prototype.delete = function()
{

}*/