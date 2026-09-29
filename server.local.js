import express from "express";
import api from "./api/index.js";

const app=express();
const PORT=process.env.PORT||3000;

app.use("/api",api);

app.get("/",(req,res)=>res.sendFile(process.cwd()+"/index.html"));
app.get("*",(req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({success:false,error:"API route not found"});
  res.sendFile(process.cwd()+"/index.html");
});

app.listen(PORT,()=>console.log("MOONX7 Profile listening on "+PORT));
