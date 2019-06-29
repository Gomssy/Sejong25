var CSVParsing = CSVParsing || {};

CSVParsing.gradeArray = {
    grade3: [], //3급
    grade2: [], //2급
    grade1: [], //1급
    grade0: []  //특급
}

CSVParsing.loadText = function(scene) {
    scene.load.text('parseword','assets/KKUTU_word.txt');
}

CSVParsing.CSVParse = function(scene) {
    var data = scene.cache.text.get('parseword');
    console.log('xx' + data);
    var allRows = data.split('\n')
    for(var singleRow = 0; singleRow < allRows.length; singleRow++)
    {
        var typing;
        var grade;
        typing = WordReader.getWordTyping(allRows[singleRow].trim());
        grade = WordReader.getWordGrade(typing);

        if(grade==3) {
            CSVParsing.gradeArray.grade3.push(allRows[singleRow].trim());
        } else if(grade==2) {
            CSVParsing.gradeArray.grade2.push(allRows[singleRow].trim());
        } else if(grade==1) {
            CSVParsing.gradeArray.grade1.push(allRows[singleRow].trim());
        } else {
            CSVParsing.gradeArray.grade0.push(allRows[singleRow].trim());
        }
    }
}