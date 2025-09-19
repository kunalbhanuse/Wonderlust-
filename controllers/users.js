const user = require("../models/user")

module.exports.renderSignupForm =(req,res) => {
    res.render("users/signup.ejs");
}


module.exports.signUp = async(req,res) => {
        try{
            let {username, email,password} = req.body;
            let newUser = new user({email,username});
            const registerdUser = await user.register(newUser,password);
            console.log(registerdUser);
            req.login(registerdUser,(err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success","welcome to WonderLust");
                res.redirect("/listings")
            })
          
        } catch(e){
            req.flash("error",e.message);
            res.redirect("/signup");
        }

}

module.exports.renderLoginForm =async(req,res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req,res) => {
            req.flash("success","Welcome back to wonderlust ");
            let redirectUrl = res.locals.redirectUrl ||"/listings";
            res.redirect(redirectUrl);

}

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
          return next(err);
        }
        req.flash("success","You are logged out! ");
        res.redirect("/listings");
    })
}