import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import passwordRouter from './routes/passwordRoute.js';




const app = express()
const port = process.env.PORT || 4000

connectDb()


app.use(express.json())
app.use(cors())

app.use('/api/user',userRouter);
app.use('/api/passwords', passwordRouter);


app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>console.log('Server started on PORT:'+port))