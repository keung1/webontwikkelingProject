import {Guitar, Series, User} from "./interfaces";
import express, { Express } from "express";
import session from "./session";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import bcrypt from "bcrypt";
import ejs from "ejs";
import { connect, getGuitars, getSeries, editPrice, editCutaway, editPublication, editType, login, register, checkForUser } from "./database";
import dontenv from "dotenv"

const app : Express = express();

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(flashMiddleware)

const saltRounds: number = 10

let guitar: Guitar[] = [];
let series: Series[] = [];

app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/guitar");
    }
    else {
        res.render("login", {
            user: req.session.user
        });
    }
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
});

app.get("/register", (req, res) => {
    res.render("register", {
        user: req.session.user
    });
});

app.post("/register", async (req, res) => {
    const username_signin: string = req.body.username_signin;
    const password_signin: string = req.body.password_signin;
    try {
        if(await checkForUser(username_signin)) {
            req.session.message = {type: "error", message: `Deze gebruiker bestaat al`};
            res.redirect("/register")
        } else {
            await register(username_signin, password_signin);
            res.redirect("/");
        }
    } catch {
        res.redirect("/register");       
    }
});

app.get("/logout",secureMiddleware , async(req, res) => {
    req.session.destroy((err) =>{
        res.redirect("/");
    });
});

app.get("/guitar", secureMiddleware, async(req, res) => {
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
        q: q,
        role: req.session.user?.role,
        user: true
    });
});

app.post("/guitar", secureMiddleware, async (req, res) => {
    const name: string = req.body.name;
    const price: string = req.body.price;
    const date: string = req.body.publication;
    const type: string = req.body.type;
    const cutaway: string = req.body.cutaway;
    if (price != "" && price != undefined) {
        await editPrice(name, price);
    }
    if (date != "" && date != undefined) {
        await editPublication(name, date);
    }
    if (type != undefined) {
        await editType(name, type);
    }
    if (cutaway != undefined) {
        if (cutaway == "yes") {
            await editCutaway(name, true);
        }
        else {
            await editCutaway(name, false);
        }
    };

    guitar = await getGuitars();

    res.redirect("/guitar");
});

app.get("/series", secureMiddleware, async(req, res) => {
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
        sortDirection: sortDirection,
        user: true
    });
});

app.get("/series/:seriesDetail", secureMiddleware, async(req, res) => {
    const detail: string = req.params.seriesDetail;
    const seriesDetail: Series[] = series.filter((series) => {
        return  series.id === detail;
    });
    res.render("serieDetails", { series: seriesDetail[0]});
});

app.get("/guitar/:guitarDetail", (req, res) => {
    const detail: string = req.params.guitarDetail;
    const guitarDetail: Guitar[] = guitar.filter((guitar) => {
        return guitar.name === detail;
    });

    const serie: Series | undefined = series.find((series) => {
        return series.id === guitarDetail[0].series
    });

    res.render("guitarDetails", { 
        guitars: guitarDetail,
        series: serie,
        role: req.session.user?.role,
        user: req.session.user
    });
});

app.listen(app.get("port"), async() => {
    await connect();
    guitar = await getGuitars();
    series = await getSeries();
    console.log("Server started on http://localhost:" + app.get('port'));
});
