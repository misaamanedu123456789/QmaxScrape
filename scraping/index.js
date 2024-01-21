const cheerio = require("cheerio");
const fs = require("fs");
let db = JSON.parse(fs.readFileSync("./res.json", "utf-8"));

const aFaitQMax = async (email, password) => {
	try {
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
		const setcook = prem.headers.get("set-cookie").split(";")[0]
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
	} catch (error) {
		console.error(error)
		return false
	}
}

const multchar = (char, n) => {
	let res = ""
	for (let i = 0; i < n; i++) {
		res += char
	}
	return res
}
function sleep(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
}

(async() => {
	let n = 4;
	let modif = false;
	if(db[0][2].length <= n){
		console.log("Modification du questionnaire n°"+n+" en cours...")
		n--;
		modif = true;
	}else{
		console.log("ajout du questionnaire n°"+n+" en cours...")
	}

	let done = 0;
	let moy = 0;
	let tout = 0;
	let pasFait = []
	let reschar = multchar(" ", db.length).split("")

	for (let i = 0; i < db.length; i++) {
		const email = db[i][1];
		const res = await aFaitQMax(email, "mShkk7iO")
		if(modif) db[i][2][n] = res
		else db[i][2].push(res)
		if(res[0]) {
			done++
			if (tout == 0) tout = db[i][2][n][3]
			reschar[i] = "✅"
		}
		else {
			reschar[i] = "❌"
			pasFait.push(db[i][0])
		}
		if(res[2] != undefined) moy += res[2];
		process.stdout.write(" " + (i+1) + "/" + db.length + reschar.join("") + " [" + db[i][0] + "] : " + res[0] + "         \r")
		await sleep(1000)
	}
	console.log("\nTéléchargement terminé :     ")
	console.log(" - Nombre de personnes ayant fait le questionnaire : " + done + "/" + db.length)
	console.log(" - Moyenne de bonnes réponses : " + (moy / done).toFixed(2)+"/"+tout)
	console.log(" - Personnes n'ayant pas fait le questionnaire : " + pasFait.join(", "))
	console.log("Enregistrement en cours ...")
	fs.writeFileSync("./res.json", JSON.stringify(db,null, 4))
})()