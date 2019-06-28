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

Select.selectWord = function() {
    var GradeProb = []; //default: ?
    var rand = Math.random();
    var selection;

    if(rand<GradeProb[0]) {
        //3급 단어 선택
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade3);
    } else if(rand>=GradeProb[0] && rand<GradeProb[1]) {
        //2급 단어 선택
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade2);
    } else if(rand>=GradeProb[1] && rand<GradeProb[2]) {
        //1급 단어 선택
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade1);
    } else {
        //특급 단어 선택
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.gradeArray.grade0);
    }
}