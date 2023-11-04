import mongoose from 'mongoose';
import { Query } from 'mongoose';
import { FilterQuery } from 'mongoose';

declare module 'mongoose' {
    export class Query {
        cache(): FilterQuery<any>;
        toCache: boolean;
    }
}

mongoose.Query.prototype.cache = function () {
    this.toCache = true;
}