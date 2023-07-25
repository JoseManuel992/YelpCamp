if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');


const userRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const dbUrl = process.env.DB_URL

// const uri = dbUrl ;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// mongoose.connect(uri)


// const uri = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

//elemina esta linea
const uri = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(uri)
  .then(() => {
    console.log("Mongo Connection Open!!!")
  })
  .catch(err => {
    console.log("Oh no Mongo Connection Error!!!!")
    console.log(err)
  })


const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create ({
  mongoUrl: uri,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret
  }
})

store.on("error", function(e){
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          styleSrcElem: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dsb9ybqqc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

// app.get("/fakeUser", async(req, res) => {
//   const user = new User({email: "colt@gmail.com", username: "colttt"});
//   const newUser = await User.register(user, "chicken");
//   res.send(newUser);
// })

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);


app.get("/", (req, res) => {
  res.render("home")
})



app.all("*", (req, res, next) => {
  next( new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Oh no, Something Went Wrong!"
  res.status(statusCode).render("error", { err });
})

app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000!!")
})
