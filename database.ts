import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Guitar, Series, User } from "./interfaces";
import bcrypt from "bcrypt";

require('dotenv').config()

export const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
export const guitarCollection : Collection<Guitar> = client.db("guitarDB").collection<Guitar>("guitars");
export const seriesCollection : Collection<Series> = client.db("guitarDB").collection<Series>("series");
export const userCollection : Collection<User> = client.db("guitarDB").collection<User>("users");

const saltRounds: number = 10;
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
    if(await guitarCollection.countDocuments() == 0 ) {
        let guitar: Guitar[] = await getUrl(guitarUrl);
        await guitarCollection.insertMany(guitar);
    }
    if(await seriesCollection.countDocuments() == 0 ) {
        let series: Series[] = await getUrl(seriesUrl);
        await seriesCollection.insertMany(series);
    }
}

async function createFirstUsers() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let usernameAdmin: string | undefined = process.env.USER_ADMIN;
    let passwordAdmin: string | undefined = process.env.PASSWORD_ADMIN;
    if (usernameAdmin == undefined || passwordAdmin == undefined) {
        throw new Error(".env admin");
    }
    await userCollection.insertOne({
        username: usernameAdmin,
        password: await bcrypt.hash(passwordAdmin, saltRounds),
        role: "ADMIN"
    });

    let username: string | undefined = process.env.USERNAME;
    let password: string | undefined = process.env.PASSWORD;
    if (username == undefined || password == undefined) {
        throw new Error(".env user");
    }
    await userCollection.insertOne({
        username: username,
        password: await bcrypt.hash(password, saltRounds),
        role: "USER"
    });
}

export async function register(name: string, password: string) {
        await userCollection.insertOne({
            username: name,
            password: await bcrypt.hash(password, saltRounds),
            role: "USER"
        });
}

export async function checkForUser(name: string) {
    return await userCollection.findOne({username: name});
}

export async function login(name: string, password: string) {
    let result: User | null = await userCollection.findOne<User>({username: name});
    if (result) {
        if (await bcrypt.compare(password, result.password!)) {
            return result;
        }
        else {
            throw new Error("login fail");
        }
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
        await createFirstUsers();
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
