import mongoose from "mongoose"


const connectDB=async()=>{

          try{
                    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}`)

                    console.log(`MongoDB is connected DBHOST !! ${connectionInstance.connection.host}`)
          }
          catch(error){
                    console.log("Mongodb connetion error !!" );
                    process.exit(1)
          }
          

}
export default connectDB;