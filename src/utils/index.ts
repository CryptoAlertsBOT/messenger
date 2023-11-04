import mongoose from 'mongoose';
import { Base} from "../types";
import { endsWithBase } from "./telegram";
import usdtSymbolDB from '../models/usdtDB';
import btcSymbolDB from '../models/btcDB';
import { ISingleSymbolDocument } from "../types/models";




/**
 * Function to calculate the change % for the price.
 */

export const calculateChange = (currentPrice: number, newPrice: number): number => {
    let percentageChange;
    if (newPrice > currentPrice) {
        percentageChange = ((newPrice - currentPrice) / currentPrice) * 100;
    } else if (currentPrice > newPrice){
        percentageChange = ((newPrice - currentPrice) / currentPrice) * 100;
    } else {
        percentageChange = 0;
    }
    return percentageChange;
};




/**
 *  Functions to get the current time string [hh:mm:ss] 
 *  @returns TimeString [hh:mm:ss]
 */

export const getCurrentTimeString = (): string => {
    let date: Date;
    let hours: string | number;
    let minutes: string | number;
    let seconds: string | number;


    date = new Date();
    hours = date.getHours();
    minutes = date.getMinutes();
    seconds = date.getSeconds();

    hours = hours < 10 ? addZero(hours) : hours;
    minutes = minutes < 10 ? addZero(minutes) : minutes;
    seconds = seconds < 10 ? addZero(seconds) : seconds;

    return `[${hours}:${minutes}:${seconds}]`;

}

/**
 * - Function to get formatted date string
 * 
 */

 export const getFormattedDateTime = (): string => {
     let now: Date = new Date();

     const year: number = now.getUTCFullYear();
     const month: number = now.getUTCMonth();
     const day: number = now.getUTCDate();
     let hours: string | number = now.getUTCHours();
     let minutes: string | number = now.getUTCMinutes();
     let seconds: string | number = now.getUTCSeconds();

    hours = hours < 10 ? addZero(hours) : hours;
    minutes = minutes < 10 ? addZero(minutes) : minutes;
    seconds = seconds < 10 ? addZero(seconds) : seconds;

    let monthString: string ='';
     switch(month) {
         case 0: 
            monthString = "Jan";
            break;
         case 1: 
            monthString = "Feb";
            break;
         case 2: 
            monthString = "Mar";
            break;
         case 3: 
            monthString = "Apr";
            break;
         case 4: 
            monthString = "May";
            break;
         case 5: 
            monthString = "Jun";
            break;
         case 6: 
            monthString = "Jul";
            break;
         case 7: 
            monthString = "Aug";
            break;
         case 8: 
            monthString = "Sep";
            break;
         case 9: 
            monthString = "Oct";
            break;
         case 10: 
            monthString = "Nov";
            break;
         case 11:  
            monthString = "Dec";
            break;
         default:
            break;
     }

     const dateTimeString: string = `[${day} ${monthString}] - ${hours}:${minutes}:${seconds} UTC`;
     return dateTimeString;
 };


const addZero = (value: number): string => {
    return `0${value}`;
};


/**
 * - Function to get the first SYMBOL quote asset.
 * - removes base
 */

export const getQuoteAsset = (symbol: string): string | void => {
    const base: Base | boolean = endsWithBase(symbol);
    if(base === false) return;

    if (base === Base.USDT) {
        const quoteAsset = symbol.replace("USDT", "");
        return quoteAsset;
    } else if(base === Base.BTC){
        const quoteAsset = symbol.replace("BTC", "");
        return quoteAsset;
    }
}


/**
 * Function to get the Base in string.
 */

export const getBaseAbbrevation = (base: Base): string => {
    return base === Base.USDT ? "USDT" : "BTC";
};  

/**
 * Check if time > 6 hours
 */

export const isMoreThan1Hour = (seconds: number) => {
    return seconds > 3600;
}


/**
 * - Get the formatted Trigger Time. 
 * 
 */

export const formatTriggerTime = (time: number): string => {
    // time is in seconds
    if(time >= 86400) {
        return `${(time / 86400).toFixed(0)} day(s)`;
    } else if (time >= 3600) {
        return `${(time / 3600).toFixed(1)} hour(s)`;
    } else if (time >= 60){
        return `${(time / 60).toFixed(1)} min(s)`;
    } else {
        return `${(time).toFixed(0)} secs`;
    }
}



/**
 * Function to get the current price of a symbol.
 */

 export const getSymbolPrice = async (symbol: string, base: Base): Promise<number | null>  => {
    let DB = base === Base.USDT? usdtSymbolDB : btcSymbolDB;
    let symbolData: mongoose.Document<Partial<ISingleSymbolDocument>> | null = await DB.findOne({symbol: symbol}, {'last_price': 1, '_id': 0}).exec();
    if(!symbolData) {
        return null;
    } else {
        return symbolData.get('last_price');
    }
 };


