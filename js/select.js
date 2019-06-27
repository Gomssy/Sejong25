function selectstartWord()
{
    var i;
    var grade3List = {};
    var grade2List = {};
    var grade1List = {};

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