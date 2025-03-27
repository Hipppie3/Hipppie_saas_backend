import { PlayerAttribute } from '../models/index.js';
import { promises as fs } from "fs";
import path from "path";

// Function to get default player attributes from JSON
const defaultPlayerAttributesData = async () => {
  try {
    const filePath = path.resolve("config/defaultPlayerAttributes.json");
    const data = await fs.readFile(filePath, "utf-8");
    const defaultAttributes = JSON.parse(data);
    return defaultAttributes.defaultAttributes || [];
  } catch (error) {
    console.error("Error reading default player attributes JSON:", error);
    return [];
  }
};

// Get player attributes by user ID
export const getPlayerAttributes = async (req, res) => {
      console.log("fetching user", req.session.user)
  try {
    const userId = req.session.user.id;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    let attributes = await PlayerAttribute.findAll({
      where: { user_id: userId },
      order: [["order", "ASC"]],
    });

    if (attributes.length === 0) {
      // ✅ Fetch default attributes correctly
const defaultAttributes = await defaultPlayerAttributesData();
console.log("Default Attributes Data:", defaultAttributes);

if (!defaultAttributes || !Array.isArray(defaultAttributes)) {
  return res.status(500).json({ message: "Invalid default attributes data" });
}

const createdAttributes = await PlayerAttribute.bulkCreate(
  defaultAttributes.map((attr, index) => ({
    user_id: userId,
    attribute_name: attr.name,
    attribute_type: attr.type,
    order: index,
    is_visible: true,
  })),
  { returning: true }
);
      attributes = createdAttributes;
    }
    res.json(attributes);
  } catch (error) {
    console.error("Error fetching player attributes:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Create a new player attribute
export const createPlayerAttribute = async (req, res) => {
  try {
    console.log("🔹 Incoming request body:", req.body);
    console.log("🔹 Session user ID:", req.session.user?.id);

    const { name, type } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User session is missing." });
    }

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }


// Normalize name (remove spaces but keep original case)
const normalizedName = name.replace(/\s+/g, ""); 


    // Check if attribute already exists
    const existingAttribute = await PlayerAttribute.findOne({
      where: { user_id: userId, attribute_name: normalizedName }
    });

    if (existingAttribute) {
      console.log("🔸 Attribute already exists:", existingAttribute.dataValues);
      return res.status(400).json({ message: "Attribute with this name already exists" });
    }

    // Create new attribute
    const newAttribute = await PlayerAttribute.create({
      user_id: userId,
      attribute_name: normalizedName,
      attribute_type: type,
      order: 99,
      is_visible: true,
    });

    console.log("✅ Attribute successfully saved:", newAttribute?.dataValues);

    res.status(201).json(newAttribute);
  } catch (error) {
    console.error("❌ Error creating player attribute:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Hide/unhide a player attribute
export const togglePlayerAttributeVisibility = async (req, res) => {
  console.log('hi')
  try {
    const { id } = req.params;
    const { is_visible } = req.body;
    const userId = req.session.user.id;

    const attribute = await PlayerAttribute.findOne({ where: { id, user_id: userId } });

    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found or not owned by the user" });
    }

    await attribute.update({ is_visible }); // ✅ Correct column name

    res.json({ message: `Attribute visibility updated`, attribute });
  } catch (error) {
    console.error("Error toggling player attribute visibility:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Reset player attributes to default
export const resetPlayerAttributes = async (req, res) => {
  try {
    const userId = req.session.user.id;

    await PlayerAttribute.destroy({ where: { user_id: userId } });

    const defaultAttributes = await defaultPlayerAttributesData();

    for (const attr of defaultAttributes) {
      await PlayerAttribute.create({
        user_id: userId,
        attribute_name: attr.name, // ✅ Match column name
        attribute_type: attr.type, // ✅ Match column name
        order: defaultAttributes.indexOf(attr),
        is_visible: true, // ✅ Match column name
      });
    }

    res.json({ message: "Player attributes reset to default." });
  } catch (error) {
    console.error("Error resetting player attributes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const reorderPlayerAttributes = async (req, res) => {
  try {
    const { attributes } = req.body;
    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    for (const attribute of attributes) {
      await PlayerAttribute.update({ order: attribute.order }, { where: { id: attribute.id } });
    }

    res.json({ message: "Player attributes reordered successfully" });
  } catch (error) {
    console.error("Error reordering player attributes:", error);
    res.status(500).json({ message: "Server error" });
  }
};
