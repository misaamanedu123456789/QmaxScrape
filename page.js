async function getJson(url) {
    const response = await fetch(url);
    const jj = await response.json();
    return jj
}
(async () => {
    const rData = await getJson("/scraping/res.json")
    const dernierTest = document.getElementById('lastTest');
    let globAvreage = 0;
    let nbPers = 0;
    rData.forEach(element => {
        if (element[2][0][0]) {
            globAvreage += element[2][0][2];
            nbPers++;
        }
    });
    globAvreage /= nbPers;

    let test = Object.create(rData)
    test.sort((a, b) => {
        if(a[2][0][0] == false) return 1
        if(b[2][0][0] == false) return -1
        return b[2][0][2] - a[2][0][2]
    })

    const names = rData.map((item) => item[0])
    let wow = new Chart(dernierTest, {
        data: {
            labels: names,
            datasets: [{
                type: 'line',
                label: 'avrage',
                data: rData.map((item) => globAvreage),
                borderWidth: 1
            },{
                type: 'bar',
                label: '# points',
                data: rData.map((item) => item[2][0][2]),
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
                    text: 'Notes du dernier Qmax'
                }
            }
        }
    })
    document.getElementById("median").onchange = function (e) {
        if (e.target.checked) {
            wow.data.datasets[1] = {
                type: 'bar',
                label: '# points',
                data: test.map((item) => item[2][0][2]),
                borderWidth: 1
            } 
            wow.data.labels = test.map((item) => item[0])
            
        }else{
            wow.data.datasets[1] = {
                type: 'bar',
                label: '# points',
                data: rData.map((item) => item[2][0][2]),
                borderWidth: 1
            }
            wow.data.labels = names
        }
        wow.update()
    }


    const moyenne = document.getElementById('moy');
    let moy = []
    let questionsNum = []

    for (let i = 0; i < rData[0][2][0][1].length; i++) {

        const element = rData[0][2][0][1][i];
        let nb = 0;
        let pers = 0;
        for (let j = 0; j < rData.length; j++) {
            if (rData[j][2][0][0] == false) continue
            pers++
            nb += rData[j][2][0][1][i];
        }
        moy.push(nb / pers * 100)
        questionsNum.push(i + 1)
    }
    let barreQuestions = new Chart(moyenne, {
        type: 'bar',
        data: {
            labels: questionsNum,
            datasets: [{
                label: '% de bonnes réponses',
                data: moy,
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
                "data": rData[names.indexOf(nom)][2][0][1].map((item) => item * 100),
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
        if (rData[names.indexOf(nom)][2][0][0] == false) return
        const option = document.createElement("option");
        option.value = nom;
        option.text = nom;
        document.getElementById("compEle").appendChild(option);
    })
    document.getElementById("compEle").onchange = function (e) {
        mmettreBarre(e.target.value)
        console.log(e.target.value)
    }

})()