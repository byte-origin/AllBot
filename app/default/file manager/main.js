const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(function(file) {
        filelist = fs.statSync(path.join(dir, file)).isDirectory() ? walkSync(path.join(dir, file), filelist) : filelist.concat(path.join(dir, file));
    });
    return filelist;
}

function getFiles(dir) {
    let listFiles = [];
    let dirFiles = fs.readdirSync(dir);
    let i = 0;
    dirFiles.forEach(function(file) {
        try {
            var dirFile = path.join(dir, file);
            if(fs.existsSync(dirFile)) {
                listFiles.push(i);
                var dirFileStats = fs.lstatSync(dirFile);
                listFiles[i].name = file;
                listFiles[i].isDir = dirFileStats.isDirectory();
                listFiles[i].isSymLink = dirFileStats.isSymbolicLink();
                listFiles[i].metacontent = {
                    "Created/Edited At": dirFileStats.birthtime,
                    "File Permissions": (dirFileStats.mode & parseInt('777', 8)).toString(8),
                    "Size": walkSync(dir).length
                }
                i++;
            }
        } catch(fileScanError) {
            if(fileScanError.errno == -13) {
                console.log(`Could not scan "${fileScanError.path}"`);
            } else {
                console.log(fileScanError);
            }
        }
    });
    return listFiles;
}

//window.onload = getFiles(require('os').homedir());
console.log(getFiles(require('os').homedir()))