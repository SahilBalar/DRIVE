const express = require('express');
const userRouter = require('./routes/user.routes')

//for accesing env file to the project
const dotenv = require('dotenv')
dotenv.config()

// getting function access to our main file and calling the connecttodb funtion to connect mongodb to our project
const connectToDB = require('./config/db')
connectToDB();

const app = express();


// for connecting ejs
app.set('view engine', 'ejs');


//to get data we will use middleware
app.use(express.json());
app.use(express.urlencoded({ extended : true}));

//we can use router using userrounter, we dont create rounte in main file in production
app.use('/user', userRouter)

const PORT = process.env.PORT || 4001; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});