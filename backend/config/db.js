require('dotenv').config();
console.log('PGUSER charge :', process.env.PGUSER);
const {Pool}=require('pg');

const pool= new Pool({
  user:process.env.PGUSER,
  password:process.env.PGPASSWORD,
  host:process.env.PGHOST,
  port:process.env.PGPORT,
  database:process.env.PGDATABASE});

module.exports=pool;