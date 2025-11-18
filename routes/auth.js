const express=require('express');
const router=express.Router();
const db=require('../db');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

router.post('/signup',(req,res)=>{
 const {name,email,password}=req.body;
 const hash=bcrypt.hashSync(password,10);
 const stmt=db.prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)");
 stmt.run(name,email,hash,function(err){
   if(err) return res.status(400).json({error:'Email exists'});
   const token=jwt.sign({id:this.lastID,email,role:'user'},process.env.JWT_SECRET);
   res.json({id:this.lastID,name,email,token});
 });
});

router.post('/login',(req,res)=>{
 const {email,password}=req.body;
 db.get("SELECT * FROM users WHERE email=?",[email],(err,row)=>{
   if(!row) return res.status(400).json({error:'Invalid'});
   if(!bcrypt.compareSync(password,row.password)) return res.status(400).json({error:'Invalid'});
   const token=jwt.sign({id:row.id,email:row.email,role:'user'},process.env.JWT_SECRET);
   res.json({id:row.id,name:row.name,email:row.email,token});
 });
});

module.exports=router;