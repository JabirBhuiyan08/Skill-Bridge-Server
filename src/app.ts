import express, { Application } from "express";
import { reviewRouter } from "./modules/review/review.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"


const app: Application= express();

app.use(cors({
    origin: process.env.APP_URL ||"http://localhost:4000",
    credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));


app.use("/review", reviewRouter)

app.get("/", (req, res)=>{
    res.send("Hello, world!");
})


export default app;