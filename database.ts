import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Guitar, Series } from "./interfaces";
dotenv.config();

export const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
export const guitarCollection : Collection<Guitar> = client.db("guitarDB").collection<Guitar>("guitars");
export const seriesCollection : Collection<Series> = client.db("guitarDB").collection<Series>("series");

let guitarUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitars.json';
let seriesUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitarSeries.json';

async function getUrl(url: string) {
    const response = await fetch(url);
    return await response.json();
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

async function seed() {
    if(await guitarCollection.countDocuments() == 0) {
        let guitar: Guitar[] = await getUrl(guitarUrl);
        let series: Series[] = await getUrl(seriesUrl);
        await guitarCollection.insertMany(guitar);
        await seriesCollection.insertMany(series);
    }
}

export async function getGuitars() {
    return await guitarCollection.find().toArray();
}

export async function getSeries() {
    return await seriesCollection.find().toArray();
}

export async function editPrice(guitar: string, price: string) {
    return await guitarCollection.updateOne({name: guitar}, {$set: {price: parseFloat(price)}});
}

export async function editPublication(guitar: string, publication: string) {
    return await guitarCollection.updateOne({name: guitar}, {$set: {releaseDate: publication}});
}

export async function editType(guitar: string, type: string) {
    return await guitarCollection.updateOne({name: guitar}, {$set: {guitarType: type}});
}

export async function editCutaway(guitar: string, cutaway: boolean) {
    return await guitarCollection.updateOne({name: guitar}, {$set: {cutaway: cutaway}});
}

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to database");
        await seed();
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
