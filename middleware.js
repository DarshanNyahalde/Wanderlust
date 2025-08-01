module.exports.isLoggedIn=(req,res,next)=>{
    //console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
       // req.flash("error","you must be logged in to create listings");
       //return res.render("listings/new.ejs");
       return res.redirect("/login"); 
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;

    }
    next();
};
