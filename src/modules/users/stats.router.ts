import express, { Router } from "express";
import { statsController } from "./stats.controller";

const router = express.Router();

router.get("/home", statsController.getHomePageStats);

export const statsRouter: Router = router;
