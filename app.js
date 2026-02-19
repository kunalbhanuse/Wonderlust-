if(process.env.NODE_ENV != "production") {
    require('dotenv').config();

}


const express =require("express");
const app =express();
const mongoose =require("mongoose")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash =require("connect-flash");
const passport = require("passport");
const LocalStratergy =require("passport-local");
const User = require("./models/user.js");

const listingsRouter =require("./routes/listing.js")
const reviewsRouter =require("./routes/review.js");
const userRouter =require("./routes/user.js");
const { error } = require('console');





const dbUrl = process.env.ATLASDB_URL

main().then( () => {
    console.log("connected to DB")
}).catch(err => {
    console.log(err);
});
async function main() {
   await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// session info store on AtlasDataMongo
const store = MongoStore.create({
    mongoUrl :dbUrl,
    crypto:{
        secret : process.env.SECRET},
    touchAfter: 24*3600,
});

store.on("error",() =>{
    console.log("Error in MONGO SESSION STORE",err)
})

const sessionOption = {
    store:store,
    secret : process.env.SECRET,
    resave : false,
   saveUninitialized : true,
   cookie : {
    expires  : Date.now() +7 * 24 * 60 * 1000,
    maxAge :7 * 24 * 60 * 1000,
   },

};
// Root Route
// app.get("/",(req,res) => {
//     res.send("Root is working fine");
// });



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()) ;
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser =req.user;

    next();
});



// app.get("/demouser",async(req,res) =>{
//     let fakeUser = new User({
//         email :"student@gmail.com",
//         username : "delta-student"
//     });
//     let registerdUser = await User.register(fakeUser,"helloworld");
//     res.send(registerdUser);
// });

app.use("/listings" ,listingsRouter);
app.use("/listings/:id/reviews" ,reviewsRouter);
app.use("/",userRouter);

// app.get("/testListing",async(req,res) => {
//     let sampleListing =new Listing({
//         title:"My New Villa",
//         description: "By the Beach",
//         price : 1200,
//         location: "Calangute ,Goa",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful Testing");c
// });

// app.all("*", (req, res, next) => {
// next(new ExpressError(404, "Page Not Found"));
// });
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.all(/.*/, (req, res, next) => {
           next(new ExpressError(404, "Page Not Found"));
      });

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});



app.listen(8080,() => {
    console.log("app is listening on 8080");
})
