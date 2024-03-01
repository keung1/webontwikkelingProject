import {Guitar, Series} from "./interfaces"
import * as readline from "readline-sync"

let guitarUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitars.json'
let seriesUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitarSeries.json'


async function getData(url: string) {
    const response = await fetch(url)
    return response.json();
}

async function viewData() {
    let guitar = await getData(guitarUrl);
    let series = await getData(seriesUrl);
    for (let i: number = 0; i < 10; i++) {
        console.log(`- ${guitar[i].name} (${guitar[i].id})`);
        console.log(`   - Description: ${guitar[i].description}`);
        console.log(`   - Price: ${guitar[i].price}`);
        console.log(`   - Cutaway: ${guitar[i].cutaway}`);
        console.log(`   - Releasedate: ${guitar[i].releaseDate}`);
        console.log(`   - Image URL: ${guitar[i].image}`);
        console.log(`   - Guitar type: ${guitar[i].guitarType}`);
        let result: string = ""
        for(let material of guitar[i].materials) {
            result = result + material;          
        }
        console.log(`   - materials: ${result}`);
        for (let j: number = 0; i < 6; i++) {
            if (guitar[i].series === series[j].id) {
                console.log(`   - Series: ${series.name}`);
                console.log(`       - Stock: ${series.amount}`);
                console.log(`       - First appearance: ${series.firstAppearance}`);
                console.log(`       - Creator: ${series.creator}`);
            }
        }
    }
}
viewData();
/*
let option: number = 0
while (option != 3) {
    console.log("Welcome to JSON data viewer!");
    console.log("1. Bekijk alle data");
    console.log("2. Filter door ID");
    console.log("3. Exit");
    option = readline.questionInt("Welke optie kies je: ")
    if (option === 1) {
        viewData();
    }
    else if (option === 2) {

    }
}
*/









