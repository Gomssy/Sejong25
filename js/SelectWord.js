var SelectWord = SelectWord || [];

SelectWord.startWordList = [];

SelectWord.selectWord = function(grade) {
    var selection = "";
    switch(grade)
    {
        case 3: selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade3); break;
        case 2: selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade2); break;
        case 1: selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade1); break;
        case 0: selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade0); break;
        default: break;
    }
    return selection;
}