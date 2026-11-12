import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Property from "../models/property.model.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany();
    await Property.deleteMany();

    console.log("Seeding sample users...");
    const admin = await User.create({
      name: "Admin User",
      email: "admin@realestate.com",
      password: "password123",
      role: "admin",
      phone: "+91 98765 00001",
    });

    const seller = await User.create({
      name: "Rachit Srivastava",
      email: "seller@realestate.com",
      password: "password123",
      role: "seller",
      isSellerApproved: true,
      phone: "+91 98765 00002",
      address: "Infocity Road, Bhubaneswar",
    });

    const buyer = await User.create({
      name: "Rahul Verma",
      email: "buyer@realestate.com",
      password: "password123",
      role: "buyer",
      phone: "+91 98765 00003",
    });

    console.log("Seeding sample properties...");
    const properties = [
      {
        title: "2BHK Luxury Flat in Patia",
        description: "Modern, sun-drenched 2BHK apartment with modular kitchen, private balcony, and close proximity to IT parks and reputed colleges.",
        price: 5200000,
        city: "Bhubaneswar",
        area: "Patia",
        pincode: "751024",
        propertyType: "flat",
        bhk: "2",
        bathrooms: 2,
        areaSize: 1250,
        furnishing: "semi-furnished",
        status: "sale",
        isVerified: true,
        amenities: ["Parking", "Swimming Pool", "Gym", "24/7 Security", "Power Backup"],
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
      {
        title: "Exclusive 4BHK Villa with Private Garden",
        description: "Expansive private villa featuring Italian marble flooring, lush lawn, heated pool, home theater room, and gated community security.",
        price: 18500000,
        city: "Bhubaneswar",
        area: "Chandrasekharpur",
        pincode: "751016",
        propertyType: "villa",
        bhk: "4",
        bathrooms: 4,
        areaSize: 3400,
        furnishing: "furnished",
        status: "sale",
        isVerified: true,
        amenities: ["Garden / Park", "Swimming Pool", "Club House", "24/7 Security", "Power Backup"],
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
      {
        title: "Skyline Sky-Villa & Penthouse",
        description: "Crown penthouse with double-height ceiling, private rooftop terrace with hot tub, smart automation, and 360-degree skyline views.",
        price: 25000000,
        city: "Mumbai",
        area: "Worli",
        pincode: "400018",
        propertyType: "penthouse",
        bhk: "5",
        bathrooms: 5,
        areaSize: 4200,
        furnishing: "furnished",
        status: "sale",
        isVerified: true,
        amenities: ["Swimming Pool", "Gym", "High-Speed Wifi", "Elevator", "24/7 Security"],
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
      {
        title: "Grade-A Commercial IT Office Space",
        description: "Modern commercial office space in prime tech corridor. Open floor plan, meeting pods, central AC, cafeteria, and ample basement parking.",
        price: 12000000,
        city: "Bangalore",
        area: "Whitefield",
        pincode: "560066",
        propertyType: "commercial",
        bhk: "3",
        bathrooms: 2,
        areaSize: 2200,
        furnishing: "furnished",
        status: "sale",
        isVerified: true,
        amenities: ["Parking", "High-Speed Wifi", "Power Backup", "Elevator", "24/7 Security"],
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
      {
        title: "Contemporary 3BHK Apartment in Whitefield",
        description: "Spacious family home in a prestigious gated high-rise complex. Features large balconies, wooden flooring in master suite, and clubhouse access.",
        price: 9200000,
        city: "Bangalore",
        area: "Whitefield",
        pincode: "560066",
        propertyType: "flat",
        bhk: "3",
        bathrooms: 3,
        areaSize: 1800,
        furnishing: "semi-furnished",
        status: "sale",
        isVerified: true,
        amenities: ["Parking", "Swimming Pool", "Gym", "Garden / Park", "Power Backup"],
        images: [
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
      {
        title: "Peaceful Independent 3BHK Villa",
        description: "Charming independent home with private driveway, solar backup, open terrace, and peaceful residential neighborhood.",
        price: 8800000,
        city: "Bhubaneswar",
        area: "Khandagiri",
        pincode: "751030",
        propertyType: "villa",
        bhk: "3",
        bathrooms: 3,
        areaSize: 2100,
        furnishing: "unfurnished",
        status: "sale",
        isVerified: true,
        amenities: ["Parking", "Water Storage", "Garden / Park", "Power Backup"],
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        ],
        seller: seller._id,
      },
    ];

    await Property.insertMany(properties);
    console.log(`✅ Successfully seeded ${properties.length} properties and 3 user accounts!`);
    console.log("--------------------------------------------------");
    console.log("Admin:  admin@realestate.com  / password123");
    console.log("Seller: seller@realestate.com / password123");
    console.log("Buyer:  buyer@realestate.com  / password123");
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
