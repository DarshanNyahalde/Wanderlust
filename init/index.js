const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to db");
   // initDB();
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
    
}

// const initDB=async()=>{
//     await Listing.deleteMany({});
//     await Listing.insertMany(initData.data);
//     console.log("data was initialized");
// };

const initDB = async () => {
    try {
        await Listing.deleteMany({});  // Delete existing data
        initData.data=initData.data.map((obj)=>({...obj,owner:'685ad65ab0a6bb0da2815e90'}));
        await Listing.insertMany(initData.data);  // Insert new data
        console.log("Data has been initialized");
    } catch (err) {
        console.error("Error initializing the database:", err);
    }
};

initDB();
