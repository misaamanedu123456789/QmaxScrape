const fs = require("fs")
const path = require("path")
let res = []
const txt = fs.readFileSync(path.join(__dirname, "./emails.txt"), "utf-8")
txt.split(">,\n").forEach((email) => {
    if(email == "") return
    const temp = email.split(" <")
    const fullname = temp[0].split(" ")
    let newname = fullname.slice(1, fullname.length).join(" ") +" "+ fullname[0]
    res.push([newname, temp[1]])
})
res.sort((a, b) => a[0].localeCompare(b[0]))

fs.writeFileSync(path.join(__dirname, "./emails.json"), JSON.stringify(res))