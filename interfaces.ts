export interface Guitar {
    id: string,
    name: string,
    description: string,
    price: number,
    cutaway: boolean,
    releaseDate: string,
    image: string,
    guitarType: string,
    series: Series
}

export interface Series {
    id: string,
    name: string,
    amount: number,
    firstAppearance: number,
    creator: string
}