import { ObjectId } from "mongodb"

export interface Guitar {
    id: string,
    name: string,
    description: string,
    price: number,
    cutaway: boolean,
    releaseDate: string,
    image: string,
    guitarType: string,
    materials: string[],
    series: string
}

export interface Series {
    id: string,
    name: string,
    amount: number,
    firstAppearance: number,
    creator: string,
    image: string
}

export interface User {
    _id?: ObjectId,
    username?: string,
    password?: string,
    role: "USER" | "ADMIN"
}

export interface FlashMessage {
    type: "error" | 'succes',
    message: string
}