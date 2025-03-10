require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const MenuItem = require('./menuItem');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log("Connected to database"))
  .catch(err => console.error("Error connecting to database", err));

app.post('/menu', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json({ message: "Menu item created successfully", data: newItem });
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error retrieving menu items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }
    
    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    
    res.status(200).json({ message: "Menu item updated successfully", data: updatedItem });
  } catch (error) {
    console.error("Error updating menu item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await MenuItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
