function Dictionary() {
    this.add = add;
    this.datastore = new Array();
    this.find = find;
    this.remove = remove;
}

function add(key, value) {
    this.datastore[key] = value;
}

function find(key, value) {
    return this.datastore[key];
}

function remove(key) {
    delete this.datastore[key];
}

var wordDic3 = new Dictionary();
var wordDic2 = new Dictionary();
var wordDic1 = new Dictionary();
var wordDic0 = new Dictionary();

function CSVParse($data) {
    var allRows = $data.split('\n')
    for(var singleRow = 0; singleRow < allRows.length; singleRow++)
    {
        var typing;
        var grade;
        typing = WordReader.getWordTyping(allRows[singleRow]);
        grade = WordReader.getWordGrade(typing);

        if(grade==3) {
            wordDic3.add(allRows[singleRow], grade);
        } else if(grade==2) {
            wordDic2.add(allRows[singleRow], grade);
        } else if(grade==1) {
            wordDic1.add(allRows[singleRow], grade);
        } else {
            wordDic0.add(allRows[singleRow], grade);
        }
    }
}  
