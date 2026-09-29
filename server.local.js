import express from "express";
import api from "./api/index.js";

const app=express();
const PORT=process.env.PORT||3000;
app.use(express.static("public"));
app.use("/api",api);
app.get("*",(req,res)=>res.sendFile(process.cwd()+"/public/index.html"));
app.listen(PORT,()=>console.log("MOONX7 Profile listening on "+PORT));
