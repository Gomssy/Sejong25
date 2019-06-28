var gradeArray = {
    grade3: [], //3급
    grade2: [], //2급
    grade1: [], //1급
    grade0: []  //특급
}

function CSVParse($data) {
    var allRows = $data.split('\n')
    for(var singleRow = 0; singleRow < allRows.length; singleRow++)
    {
        var typing;
        var grade;
        typing = WordReader.getWordTyping(allRows[singleRow]);
        grade = WordReader.getWordGrade(typing);

        if(grade==3) {
            gradeArray.grade3.push(allRows[singleRow]);
        } else if(grade==2) {
            gradeArray.grade2.push(allRows[singleRow]);
        } else if(grade==1) {
            gradeArray.grade1.push(allRows[singleRow]);
        } else {
            gradeArray.grade0.push(allRows[singleRow]);
        }
    }
}