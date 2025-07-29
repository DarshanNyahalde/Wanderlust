const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const engine=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const Review=require("./models/review.js");
const {reviewSchema}=require("./schema.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const {isLoggedIn}=require("./middleware.js");
const {saveRedirectUrl}=require("./middleware.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
//const dbUrl =process.env.ATLASDB_URL ;



main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});
 
async function main() {
    await mongoose.connect(MONGO_URL);
    
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',engine);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+7* 24* 60* 60* 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};

app.use(session(sessionOptions));
app.use(flash());


//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//demo user

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"Darshan"
//     });
//    let registerUser=await User.register(fakeUser,"helloworld");
//    res.send(registerUser);
// });


// app.get("/",(req,res)=>{
//    // console.log("Hi I AM Root ");
//    res.send("Hi I AM Root")
// });

const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);

    }else{
        next();
    }
};

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});


//index route

// app.get("/listings",async(req,res)=>{
//    const allListing= await Listing.find({});
//     res.render("/listings/index.ejs",{allListing});
//     // console.log("Hi I AM Root ");
//     //res.send("Hi I AM Root")
//  });
app.get("/listings", async (req, res) => {
    try {
        const allListing = await Listing.find({});
        res.render("listings/index", { allListing });  // Corrected here
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});

//new route
app.get("/listings/new",isLoggedIn,(req,res)=>{
    //console.log(req.user);
  
    res.render("listings/new.ejs");
 });

//show route
app.get("/listings/:id",async(req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
  // res.render("listings/show",{listing});
  console.log(listing);
  res.render("listings/show", { listing }); 
 });
 
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     next();
// });

 //creaate route
 app.post("/listings",isLoggedIn,async(req,res,next)=>{
   //let {title,description,image,price,country,location}=req.body;
   //let listing=req.body.listing;
//      const newListing=new Listing(req.body.listing);
//      await newListing.save();
   //console.log(listing);
//     res.redirect("/listings");

//----->>>>multer i thinkkk
if (typeof req.body.listing.image === "string" && req.body.listing.image.trim() === "") {
        delete req.body.listing.image;
    }

    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner=req.user._id ;
        await newListing.save();
       // req.flash("sucess","new listing created");
        res.redirect("/listings");
    } catch (err) {
        next(err);
        console.error("Create failed:", err.message);
        res.status(500).send("Something went wrong while creating.");
    }
  });

//edit route
app.get("/listings/:id/edit",isLoggedIn,async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   res.render("listings/edit.ejs",{listing});
});

//update route
// app.put("/listings/:id",async(req,res)=>{
//     let {id}=req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect("/listings");
// });

app.put("/listings/:id", isLoggedIn,async (req, res) => {
    try { 
        let { id } = req.params;
        let updateData = { ...req.body.listing };
        // If image is a string, convert to object format
        if (updateData.image && typeof updateData.image === 'string') {
            updateData.image = { url: updateData.image, filename: '' };
        }
        await Listing.findByIdAndUpdate(id, updateData);
        res.redirect(`/listings/${id}`);
    } 
    catch (err) {
        console.error("Update failed:", err.message);
        res.status(500).send("Something went wrong while updating.");
    }
});
//delete route
app.delete("/listings/:id", isLoggedIn,async (req, res) => {
     let {id}=req.params;
   let deleteListing=await Listing.findByIdAndDelete(id);
   console.log.deleteListing;
   res.redirect("/listings");

});

//reviews
//post route
app.post("/listings/:id/reviews", isLoggedIn,async (req, res) => {
   let listing=await Listing.findById(req.params.id);
   let newReview=new Review(req.body.review);

   newReview.author=req.user._id;
   

   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();

//    console.log("new review saved");
//    res.send("new reviewd saved");
 res.redirect(`/listings/${listing._id}`);
});

//delete review route
app.delete("/listings/:id/reviews/:reviewId" ,isLoggedIn, async(req,res)=>{
    let{id,reviewId}=req.params;



        let review=await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id)){
          return  res.redirect(`/listings/${id}`);
        }

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
});

//signUp user get
app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

//signup user post method
app.post("/signup",async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
     let registerUser=await User.register(newUser,password);
    // console.log(registerUser);
     req.logIn(registerUser,(err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/listings");
     });
     
    }catch(e){
       // res.send("user is already registerd");
        res.redirect("/signup");
    }
   
});

//login user get method
app.get("/login",async(req,res)=>{
    res.render("users/login.ejs");
});
//login user post method
app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    //res.flash("welcome to wanderlust,you are logged in!!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

//logout method
app.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
          return  next(err);
        }
        //req.flash("success","logged out")
        res.redirect("/listings");
    })
}
);



app.use((err,req,res,next) => {
    res.send("something went wrong");
});

app.listen(8080,()=>{
    console.log("server is listing on port 8080");
});