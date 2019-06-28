function selectstartWord()
{
    var i;
    var grade3List = [];
    var grade2List = [];
    var grade1List = [];

    for(i=0;i<5;i++)
    {
        grade3List[i] = Phaser.Utils.Array.GetRandom(CSVParsing.grade3Array);
    }

    for(i=0;i<4;i++)
    {
        grade2List[i] = Phaser.Utils.Array.GetRandom(CSVParsing.grade2Array);
    }

    grade1List[0] = Phaser.Utils.Array.GetRandom(CSVParsing.grade1Array);    
}

function selectWord()
{
    var GradeProb = []; //default: ?
    var rand = Math.random();
    var selection;

    if(rand<GradeProb[0]) {
        //3급 단어 생성
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.grade3Array);
    } else if(rand>=GradeProb[0] && rand<GradeProb[1]) {
        //2급 단어 생성
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.grade2Array);
    } else if(rand>=GradeProb[1] && rand<GradeProb[2]) {
        //1급 단어 생성
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.grade1Array);
    } else {
        //특급 단어 생성
        selection = Phaser.Utils.Array.GetRandom(CSVParsing.grade0Array);
    }


}