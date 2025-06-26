import mongoose from 'mongoose';


export async function connect() {
    try {
        mongoose.connect(process.env.MONGO_URI!);
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("MongoDB connected successfully")
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error!!!');
            process.exit();
        })

    } catch (error) {
        console.log("Error connecting to DB")
        console.log(error)
    }
    
}