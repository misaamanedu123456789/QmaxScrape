async function getJson(url) {
    const response = await fetch(url);
    const jj = await response.json();
    return jj
}

const range = (start, end) => {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

(async () => {
    const rData = await getJson("/scraping/res.json");
    const selectQ = document.getElementById('selectQ');
    const nbTests = rData[0][2].length
    for (let i = 0; i < nbTests; i++) {
        const option = document.createElement("option");
        option.innerText = "Qmax n°" + (i + 1)
        option.value = i;
        selectQ.appendChild(option)
    }


    // calcul des moyennes et du nombre de questions
    const nbquest = []
    let globAvreage = [];
    let nbPers = [];
    for (let i = 0; i < nbTests; i++) {
        globAvreage.push(0);
        nbPers.push(0);
        rData.forEach((element,i2) => {
            if (element[2][i][0]) {
                globAvreage[i] += element[2][i][2];
                nbPers[i]++;
                if (nbquest.length <= i) {
                    nbquest.push(element[2][i][3])
                }
            }
        });
    }

    let percentAvreage = [];
    for (let i = 0; i < nbTests; i++) {
        globAvreage[i] /= nbPers[i];

        percentAvreage.push((globAvreage[i] / nbquest[i]) * 100);
    }

    selectQ.value = nbTests - 1;
    let nq = Number(selectQ.value);


    // trie des nom en fonction des résultats
    let test = Object.create(rData)
    test.sort((a, b) => {
        if(a[2][nq][0] == false) return 1
        if(b[2][nq][0] == false) return -1
        return b[2][nq][2] - a[2][nq][2]
    })
    const dernierTest = document.getElementById('fullgrade');
    const names = rData.map((item) => item[0])
    let wow = new Chart(dernierTest, {
        data: {
            labels: names,
            datasets: [{
                type: 'line',
                label: 'moyenne',
                data: rData.map((item) => globAvreage[nq]),
                borderWidth: 1,
                pointStyle: false
            },{
                type: 'bar',
                label: '# points',
                data: rData.map((item) => item[2][nq][2]),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Notes Qmax'
                }
            }
        }
    })
    document.getElementById("sort").onchange = function (e) {
        if (e.target.checked) {
            wow.data.datasets[1]["data"] = test.map((item) => item[2][nq][2])
            wow.data.labels = test.map((item) => item[0])
        }else{
            wow.data.datasets[1]["data"] = rData.map((item) => item[2][nq][2])
            wow.data.labels = names
        }
        wow.update()
    }

    const moyenne = document.getElementById('moy');
    let moy = []
    let questionsNum = []
    for (let nn = 0; nn < nbTests; nn++) {
        moy.push([])
        questionsNum.push([])
        for (let i = 0; i < nbquest[nn]; i++) {
            let nb = 0;
            let pers = 0;
            for (let j = 0; j < rData.length; j++) {
                if (rData[j][2][nn][0] == false) continue
                pers++
                nb += rData[j][2][nn][1][i];
            }
            moy[nn].push(nb / pers * 100)
            questionsNum[nn].push(i + 1)
        }
    }
    let barreQuestions = new Chart(moyenne, {
        type: 'bar',
        data: {
            labels: questionsNum[nq],
            datasets: [{
                label: '% de bonnes réponses',
                data: moy[nq],
                borderWidth: 1
            },{}]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    // stacked: true
                },
                x: {
                    stacked: true
                }
            }, plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Moyenne par questions'
                }
            }
        }
    });
    const mmettreBarre = (nom) => {
        

        if(nom != "") {
            barreQuestions.data.datasets[1] = {
                "label": "réponse de " + nom,
                "borderColor": "#FF0000",
                "backgroundColor": "#FF000060",
                "data": rData[names.indexOf(nom)][2][nq][1].map((item) => item * 100),
                borderWidth: 1
            }
            barreQuestions.update();
        }else{
            barreQuestions.data.datasets[1] = {}
            barreQuestions.update();
        }
        
    }
    mmettreBarre("")
    names.forEach(nom => {
        if (rData[names.indexOf(nom)][2][nq][0] == false) return
        const option = document.createElement("option");
        option.value = nom;
        option.text = nom;
        document.getElementById("compEle").appendChild(option);
    })
    
    


    const evolution = document.getElementById('evol');
    const evolutionChart = new Chart(evolution, {
        type: 'line',
        data: {
            labels: range(1, nbTests),
            datasets: [{
                label: 'moyenne',
                data: percentAvreage,

                "cubicInterpolationMode": 'monotone',
                "tension": 0.4,
                borderWidth: 1
            }, {}]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '% de bonnes réponses'
                    },
                    // stacked: true
                },
                x: {
                    stacked: true
                }
            }, plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'évolution des moyennes'
                }
            }
        }
    });
    const mettreligne = (nom) => {
        if (nom != "") {
            console.log(rData[names.indexOf(nom)],nom)
            evolutionChart.data.datasets[1] = {
                "label": "% de bonne réponses de " + nom,

                "borderColor": "#FF0000",
                "backgroundColor": "#FF000060",
                "cubicInterpolationMode": 'monotone',
                "tension": 0.4,
                "data": rData[names.indexOf(nom)][2].map(item => {
                    console.log(item)
                    if (item[0] == false) return 0
                    return (item[2] / item[3]) * 100
                }),
                borderWidth: 1
            }
            evolutionChart.update();
        } else {
            evolutionChart.data.datasets[1] = {}
            evolutionChart.update();
        }
    }

    document.getElementById("compEle").onchange = function (e) {
        mmettreBarre(e.target.value)
        mettreligne(e.target.value)
        console.log(e.target.value)
    }
    

    selectQ.onchange = function (e) {
        nq = Number(e.target.value);
        console.log("Qmax n°" + (nq + 1))
        test.sort((a, b) => {
            if (a[2][nq][0] == false) return 1
            if (b[2][nq][0] == false) return -1
            return b[2][nq][2] - a[2][nq][2]
        })
        wow.data.datasets[0]["data"] = rData.map((item) => globAvreage[nq])
        wow.data.datasets[1]["data"] = rData.map((item) => item[2][nq][2])
        wow.data.labels = names
        document.getElementById("sort").checked = false
        wow.update()

        barreQuestions.data.labels = questionsNum[nq]
        barreQuestions.data.datasets[0]["data"] = moy[nq]
        barreQuestions.update()

        document.getElementById("compEle").innerHTML = "<option value=''> Sans comparaison </option>"
        names.forEach(nom => {
            if (rData[names.indexOf(nom)][2][nq][0] == false) return
            const option = document.createElement("option");
            option.value = nom;
            option.text = nom;
            document.getElementById("compEle").appendChild(option);
        })
        mmettreBarre("")
        mettreligne("")
    }

})()