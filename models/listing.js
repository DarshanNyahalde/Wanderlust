const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");


const defaultImageUrl = "https://static.vecteezy.com/system/resources/previews/013/951/373/large_2x/awesome-nature-landscape-beautiful-scene.jpg";

const imageSchema = new Schema({
  url: {
    type: String,
    default: defaultImageUrl
  },
  filename: {
    type: String
  }
});


const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        //  type:String,
        //  required: true,
        //  type: Map,
        //  of: String,  // This allows the image to store an object with string values
        // required: true,
        
    //    url: { type: String, required: true },
    //    filename: String
      
     type: imageSchema,
    default: () => ({}) ,
        
        
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
      ref:"User",
  },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
  
});


const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;


//default:"https://in.images.search.yahoo.com/images/view;_ylt=AwrPpfPETeZnfjkRfQK9HAx.;_ylu=c2VjA3NyBHNsawNpbWcEb2lkA2ZmNjkyNWJiYTMzZWUxODQxYTEzYTRhY2FmMzM1M2M2BGdwb3MDNARpdANiaW5n?back=https%3A%2F%2Fin.images.search.yahoo.com%2Fsearch%2Fimages%3Fp%3Dnature%2Bimages%26type%3DE211IN885G0%26fr%3Dmcafee%26fr2%3Dpiv-web%26tab%3Dorganic%26ri%3D4&w=2939&h=1960&imgurl=static.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F013%2F951%2F373%2Flarge_2x%2Fawesome-nature-landscape-beautiful-scene-with-high-tatra-mountain-peaks-stones-in-mountain-lake-calm-lake-water-reflection-colorful-sunset-sky-amazing-nature-background-autumn-adventure-hiking-photo.jpg&rurl=https%3A%2F%2Fwww.vecteezy.com%2Fphoto%2F13951373-awesome-nature-landscape-beautiful-scene-with-high-tatra-mountain-peaks-stones-in-mountain-lake-calm-lake-water-reflection-colorful-sunset-sky-amazing-nature-background-autumn-adventure-hiking&size=891KB&p=nature+images&oid=ff6925bba33ee1841a13a4acaf3353c6&fr2=piv-web&fr=mcafee&tt=Awesome+nature+landscape.+Beautiful+scene+with+high+Tatra+mountain+...&b=0&ni=21&no=4&ts=&tab=organic&sigr=7DE7Lt8d.8K2&sigb=y1mK9F9IP6R8&sigi=tsG9EZDsBWXl&sigt=AxNigA7hSF9_&.crumb=791dpCdvNvk&fr=mcafee&fr2=piv-web&type=E211IN885G0",
  //      set:(v)=>v==="" ? this.default:v,