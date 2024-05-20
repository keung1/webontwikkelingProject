import {Guitar, Series, User} from "./interfaces";
import express, { Express } from "express";
import ejs from "ejs";
import { connect, getGuitars, getSeries, editPrice, editCutaway, editPublication, editType, login, register } from "./database";
import dontenv from "dotenv"

const app : Express = express();

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let guitarUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitars.json';
let seriesUrl: string = 'https://raw.githubusercontent.com/keung1/webontwikkelingProjectJson/master/guitarSeries.json';

async function getData(url: string) {
    const response = await fetch(url);
    return await response.json();
}

let guitar: Guitar[] = [];
let series: Series[] = [];

app.get("/", (req, res) => {
    res.render("login");
});

app.post("/", async(req, res) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    try {
        let user: User | undefined =  await login(username, password);
        if (user) {
            delete user.password;
            req.session.user = user;
            res.redirect("/guitar");
        }
    } catch (e: any) {
        res.redirect("/");
    }
})

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/logout", async(req, res) => {
    req.session.destroy(() =>{
        res.redirect("/");
    });
});

app.get("/guitar", (req, res) => {
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    let sortedGuitars = [...guitar].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "price") {
            return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
        } else if (sortField === "guitarType") {
            return sortDirection === "asc" ? a.guitarType.localeCompare(b.guitarType) : b.guitarType.localeCompare(a.guitarType);
        } else if (sortField === "cutaway") {
            return sortDirection === "asc" ? Number(a.cutaway) - Number(b.cutaway) : Number(b.cutaway) - Number(a.cutaway);
        } else {
            return 0;
        }
    });

    let q : string = ""
    if (typeof req.query.q === "string") {
        q = req.query.q;
    }
    let filteredGuitars: Guitar[] = sortedGuitars.filter((sortedGuitars) => {
        return sortedGuitars.name.toLowerCase().includes(q.toLowerCase());
    });

    const sortFields = [
        { value: 'name', text: 'Naam', selected: sortField === 'name' ? 'selected' : '' },
        { value: 'price', text: 'Prijs', selected: sortField === 'price' ? 'selected' : ''},
        { value: 'material', text: 'Materiaal', selected: sortField === 'material' ? 'selected' : ''},
        { value: 'guitarType', text: 'Type', selected: sortField === 'guitarType' ? 'selected' : ''},
        { value: 'cutaway', text: 'Cutaway', selected: sortField === 'cutaway' ? 'selected' : ''}
    ];
    
    const sortDirections = [
        { value: 'asc', text: 'Ascending', selected: sortDirection === 'asc' ? 'selected' : ''},
        { value: 'desc', text: 'Descending', selected: sortDirection === 'desc' ? 'selected' : ''}
    ];

    res.render("guitars", {
        guitars: filteredGuitars,
        sortFields: sortFields,
        sortDirections: sortDirections,
        sortField: sortField,
        sortDirection: sortDirection,
        q: q
    });
});

app.get("/series", (req, res) => {
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    let sortedSeries = [...series].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "amount") {
            return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
        } else if (sortField === "firstAppearance") {
            return sortDirection === "asc" ? a.firstAppearance - b.firstAppearance : b.firstAppearance - a.firstAppearance;
        } else if (sortField === "creator") {
            return sortDirection === "asc" ? a.creator.localeCompare(b.creator) : b.creator.localeCompare(a.creator);
        } else {
            return 0;
        }
    });

    const sortFields = [
        { value: 'name', text: 'Naam', selected: sortField === 'name' ? 'selected' : '' },
        { value: 'amount', text: 'Voorraad', selected: sortField === 'amount' ? 'selected' : ''},
        { value: 'firstAppearance', text: 'Jaar', selected: sortField === 'firstAppearance' ? 'selected' : ''},
        { value: 'creator', text: 'Luthier', selected: sortField === 'creator' ? 'selected' : ''},
    ];
    
    const sortDirections = [
        { value: 'asc', text: 'Ascending', selected: sortDirection === 'asc' ? 'selected' : ''},
        { value: 'desc', text: 'Descending', selected: sortDirection === 'desc' ? 'selected' : ''}
    ];

    res.render("series", {
        series: sortedSeries,
        sortFields: sortFields,
        sortDirections: sortDirections,
        sortField: sortField,
        sortDirection: sortDirection
    });
});

app.get("/series/:seriesDetail", (req, res) => {
    const detail = req.params.seriesDetail;
    const seriesDetail = series.filter((series) => {
        return ":" + series.name === detail;
    });
    res.render("serieDetails", { series: seriesDetail});
});

app.get("/:guitarDetail", (req, res) => {
    const detail = req.params.guitarDetail;
    const guitarDetail = guitar.filter((guitar) => {
        return ":" + guitar.name === detail;
    });

    res.render("guitarDetails", { guitars: guitarDetail});
});

app.post("/:guitarDetail", async (req, res) => {
    const name: string = req.body.name;
    const price: string = req.body.price;
    const date: string = req.body.publication;
    const type: string = req.body.type;
    const cutaway: string = req.body.cutaway;
    if (price != undefined) {
        await editPrice(name, price);
    }
    else if (date != undefined) {
        await editPublication(name, date);
    }
    else if (type != undefined) {
        await editType(name, type);
    }
    else if (cutaway != undefined) {
        if (cutaway == "yes") {
            await editCutaway(name, true);
        }
        else {
            await editCutaway(name, false);
        }
    };

    guitar = await getGuitars();
    series = await getSeries();
    
    const guitarDetail = guitar.filter((guitar) => {
        return guitar.name === name;
    });

    res.render("guitarDetails", { guitars: guitarDetail});
})


app.listen(app.get("port"), async() => {
    await connect();
    guitar = await getGuitars();
    series = await getSeries();
    console.log("Server started on http://localhost:" + app.get('port'));
});