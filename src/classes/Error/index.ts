
/**
 * @classdesc Custom error class for CryptoBOT
 */
export class ErrorLog extends Error {
    public __fileName: string;
    public __time: Date;

    constructor(message: string, fileName: string) {
        super(message);
        this.__fileName = fileName;
        this.__time = new Date();
    }
};