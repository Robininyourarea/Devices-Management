import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import env from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { jwtDecode } from "jwt-decode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..'); 

// console.log(__dirname)

// Load .env from the env folder in the root directory
env.config({ path: path.resolve(rootDir, 'env', '.env') });



// server config
const app = express();
const port = process.env.PORT;
console.log(port);
const saltRounds = 10;


// middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));


// connect to mongodb
console.log(process.env.MONGODB_USERNAME);
console.log(process.env.MONGODB_PASSWORD);


mongoose.connect(
    // `mongodb://127.0.0.1:27017/mydatabase`, // Use for local environmant
    `mongodb://mongodb/mydatabase`, // Use for docker
  {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((error) => {
    console.log("Error connecting to database");
    console.error(error);
    process.exit(1);
  });


// define mongodb schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
});

const deviceSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true }, 
    name: { type: String, default: null },
    type: { type: String, default: null },
    location: { type: String, default: null },
    status: { type: String, default: null },
});


// creat mongoose models from schema
// create User model
const User = mongoose.model('User', userSchema);
// creat Device model
const Device = mongoose.model('Device', deviceSchema);

// Function to insert default devices
const insertDefaultDevices = async () => {
    try {
      // Remove all existing devices from the database
          await Device.deleteMany({});
  
          console.log('All existing devices have been removed from the database');
  
      // Define default devices
      const defaultDevices = [
        { id: 1, name: 'Apple Inch.', type: 'Laptop', location: 'working room', status: 'working'},
        { id: 2, name: 'Logitech' , type: 'Accessories', location: 'working room', status: 'working'}, 
        { id: 3, name: 'Keychron' , type: 'Accessories', location: 'working room', status: 'stopped'},
        { id: 4, name: 'LG monitor' , type: 'Monitor & Display', location: 'living room', status: 'stopped'},
        { id: 5, name: 'TP-Link' , type: 'Network', location: 'working room', status: 'working'},
        { id: 6, name: 'LG refrigerator' , type: 'Refrigerator', location: 'kitchen room', status: 'working'}
      ];
  
      // Insert default devices into the database
      await Device.insertMany(defaultDevices);
  
      console.log('Default devices inserted into the database');
    } catch (error) {
      console.error('Error inserting default devices:', error);
    }

  };


// insert default devices
insertDefaultDevices();

// 1.device management route
app.get('/devices', authenticateToken, async(req, res) => {
    try {
        // Fetch devices from the database
        const devices = await Device.find();  // Fetch all devices

        // Return the devices to the client
        return res.status(200).json(devices);
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred while fetching devices");
    }
})  


// 2.register route
app.post('/api/register', async (req, res) => {

    try {
        // Get user input
        const { username, email, password } = req.body;
        console.log(username);
        console.log(email);
        console.log(password);
        // Validate user input
        // Validate user input: Check if any fields are missing or empty
        if (!(username && email && password)) {
            return res.status(400).json({ message: "All input is required" });
        }
        // Check if user already exist
        // Validate if user exist in put database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            console.log('5');
            return res.json({message:"Email already exists. Try logging in."});
        }

        // Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, saltRounds);

        // Create user (collection) in out database
        // If the user collection doesn't already exist, 
        // MongoDB will automatically create 

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        // Return new user
        return res.status(201).json({message: 'Your registration already successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occurred during registration");
    }   
});


// 3.login route
app.post('/api/login', async (req, res) => {
    
    try {
        // Get user input
        const {username, password} = req.body;
        
        // Validate user input
        if (!(username && password)) {
            return res.json({message:"All input is require"});
        }

        // Validate if user exist in out database
        const user = await User.findOne({ username });
        
        // Check if user not exists
        if (!user) {
            return res.json({ message: "This username not registered" });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            // if login password match storedpassword
            // Create token
            const accessToken = jwt.sign(
                { id: user._id, username: user.username },
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: "1h" }
            );

            // // Verify token expire
            // console.log(accessToken)
            // const { exp } = jwtDecode(accessToken)
            // const expirationDate = new Date(exp * 1000);
            // console.log("Token expiration date:", expirationDate.toString());

            return res.status(200).json({message: 'Login successful',accessToken: accessToken});
        } else {
            return res.json({ message: 'Incorrect password' })
        }


    } catch(err) {
        console.log(err);
        return res.status(500).send("An error occurred during login");
    }

})


// 4.Update specific fields of a device by ID
app.patch('/devices/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;  // This will contain the fields to be updated

    try {
        // Find the device by ID and update it with the provided fields
        const updatedDevice = await Device.findOneAndUpdate(
            { id: id },
            { $set: updates },
            { new: true }  // Return the updated document
        );

        if (!updatedDevice) {
            return res.status(404).json({ message: "Device not found" });
        }

        return res.status(200).json(updatedDevice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the device" });
    }
});


// 5.Add device
app.post('/devices', authenticateToken, async (req, res) => {
    const { id, name, type, location, status } = req.body;

    // Validate request body
    if (!id || !name || !type || !location || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if device with the same id already exists
        const existingDevice = await Device.findOne({ id });
        if (existingDevice) {
            return res.status(409).json({ message: "Device with this ID already exists" });
        }

        // Create new device
        const newDevice = new Device({
            id,
            name,
            type,
            location,
            status
        });

        // Save device to the database
        await newDevice.save();

        return res.status(201).json(newDevice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while adding the device" });
    }
});


// 6.Delete a device by ID
app.delete('/devices/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDevice = await Device.findOneAndDelete({ id: id });

        if (!deletedDevice) {
            return res.status(404).json({ message: "Device not found" });
        }

        return res.status(200).json({ message: "Device deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while deleting the device" });
    }
});


// 7.Authenticate token middleware 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // check if token not exist
    if (!token) {
        return res.status(401).send("Token is required for authentication");
    }

    // verify if token exist
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
        // check if token is invalid
        if (err) {
            return res.status(403).send("Token is invalid");
        }
        // if token valid
        req.user = user;
        next();
    });
}

// Export the app for use in tests
export default app;

// 8.start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}.`)
  });

