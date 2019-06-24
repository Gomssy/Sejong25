class Word
{
    constructor(text)
    {
        this.wordText = text;
    }

    generate(scene)
    {
        scene.add.text(400,300, this.wordText, {fontFamily: '"궁서", 궁서체, serif'}).setBackgroundColor('#FF00FF');
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