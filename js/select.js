var Select = Select || [];

Select.startWordList = [];

Select.selectstartWord = function() {
    var i;

    for(i=0;i<5;i++) {
        Select.startWordList.push(Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade3));
    }

    for(i=0;i<4;i++) {
        Select.startWordList.push(Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade2));
    }

    Select.startWordList.push(Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade1));
}

Select.selectWord = function(grade) {
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