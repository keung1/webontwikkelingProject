import {Guitar, Series} from "./interfaces"
import * as readline from "readline-sync"

let guitarUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitars.json'
let seriesUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitarSeries.json'


async function getData(url: string) {
    const response = await fetch(url)
    return await response.json();
}

async function viewData() {
    let guitar: Guitar[] = await getData(guitarUrl);
    let series: Series[] = await getData(seriesUrl);
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
            if (String(guitar[i].series) == series[j].id) {
                console.log(`   - Series: ${series[j].name}`);
                console.log(`       - Stock: ${series[j].amount}`);
                console.log(`       - First appearance: ${series[j].firstAppearance}`);
                console.log(`       - Creator: ${series[j].creator}\n`);
            }
        }
    }
}

async function filterData(id: string) {
    let guitar: Guitar[] = await getData(guitarUrl);
    let series: Series[] = await getData(seriesUrl);
    console.log(guitar);
    console.log(series);
    for (let i: number = 0; i < 10; i++) {
        if (guitar[i].id === id) {
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
            console.log(`   - Materials: ${result.split(" ").join(", ")}`);
            for (let j: number = 0; i < 6; i++) {
                if (String(guitar[i].series) === series[j].id) {
                    console.log(`   - Series: ${series[j].name}`);
                    console.log(`       - Stock: ${series[j].amount}`);
                    console.log(`       - First appearance: ${series[j].firstAppearance}`);
                    console.log(`       - Creator: ${series[j].creator}\n`);
                }
            }
        }
    }
}

async function main() {
    let option: number = 0
    while (option != 3) {
        console.log("Welcome to JSON data viewer!");
        console.log("1. Bekijk alle data");
        console.log("2. Filter door ID");
        console.log("3. Exit");
        option = readline.questionInt("Welke optie kies je: ")
        if (option === 1) {
                await viewData();
        }
        else if (option === 2) {
            let filterChoice: string = readline.question("Welke ID wil je filteren: ");
                await filterData(filterChoice);
        }2
    }
}

main();
    










