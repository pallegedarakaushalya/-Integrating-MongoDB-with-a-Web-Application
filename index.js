const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGO_URI = "mongodb://localhost:27017/crudoperations"; // Replace with your actual MongoDB URI

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => console.log("Server is running on port", PORT));
})
.catch((err) => console.log("DB Connection Error:", err));

// Schema
const schemaData = new mongoose.Schema(
    {
        name: String,
        email: String,
        mobile: Number,
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.model("user", schemaData);

// Read data
app.get("/", async (req, res) => {
    try {
        const data = await userModel.find({});
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create data
app.post("/create", async (req, res) => {
    try {
        console.log(req.body);
        const data = new userModel(req.body);
        await data.save();
        res.send({ success: true, message: "Data saved successfully", data: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update data
app.put("/update", async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, error: "ID is required" });
        }
        
        console.log(req.body);

        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.mobile) updateData.mobile = req.body.mobile;

        const updatedUser = await userModel.findByIdAndUpdate(
            req.body.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.send({ success: true, message: "Data updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete data
app.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    console.log("Deleting document with ID:", id);

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const deletedData = await userModel.findOneAndDelete({ _id: id });

        if (!deletedData) {
            return res.status(404).json({ success: false, message: "No data found with the given ID" });
        }

        res.send({ success: true, message: "Data deleted successfully", data: deletedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

