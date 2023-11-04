import express, { Router, Request, Response, NextFunction } from "express";
import { alertHandler, customAlertHandler, newAdditionhandler, ping } from "./controller";
const router: Router = express.Router();


/* 
* Route Paths for Webhook payloads
*/

/* GET /api/v1/alert */
router.get('/alert', ping);

/* POST /api/v1/alert */
router.post('/alert', alertHandler);

/* POST /api/v1/customalert */
router.post('/customalert', customAlertHandler);

/* POST /api/v1/newAddition */
router.post('/newAddition', newAdditionhandler)


export default router;