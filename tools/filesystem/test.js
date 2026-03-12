const s = "![Screenshot](/api/files/workspace-files/desktop_test/unnamed.png?sig=a9a8)";
const regex = /(?<!\/api\/files)(\/screenshots\/|\/workspace-files\/)([^? \n\)]+)/g;
let match;
while ((match = regex.exec(s)) !== null) {
    console.log("Matched index:", match.index);
    console.log("Matched string:", match[0]);
    console.log("Before match:", s.substring(0, match.index));
}
console.log(s.replace(regex, (m, p, f) => "/api/files" + p + f));
