import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_configs.findFirst();
    if (!existingConfig) {
      await prisma.site_configs.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
            "Beauty & Personal Care",
            "Toys & Kids",
          ],

          subCategories: {
            Electronics: [
              "Mobiles",
              "Laptops",
              "Tablets",
              "Accessories",
              "Headphones",
            ],
            Fashion: ["Men Clothing", "Women Clothing", "Footwear", "Watches"],
            "Home & Kitchen": ["Appliances", "Furniture", "Decor", "Cookware"],
            "Sports & Fitness": ["Gym Equipment", "Cricket", "Football"],
            "Beauty & Personal Care": [
              "Makeup",
              "Skincare",
              "Hair Care",
              "Fragrances",
            ],
            "Toys & Kids": ["Soft Toys", "Educational Toys", "Kids Clothing"],
          },

          brands: [
            "Samsung",
            "Apple",
            "Sony",
            "Nike",
            "Adidas",
            "LG",
            "Lenovo",
            "Xiaomi",
            "Puma",
          ],

          colors: [
            { name: "Red", hex: "#FF0000" },
            { name: "Blue", hex: "#0000FF" },
            { name: "Green", hex: "#008000" },
            { name: "Black", hex: "#000000" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Yellow", hex: "#FFFF00" },
          ],

          sizes: ["S", "M", "L", "XL", "XXL"],

          priceRanges: [
            { label: "Under $50", min: 0, max: 50 },
            { label: "$50 - $200", min: 50, max: 200 },
            { label: "$200 - $500", min: 200, max: 500 },
            { label: "Above $500", min: 500, max: 10000 },
          ],

          deliveryOptions: [
            { name: "Standard Delivery", estimatedDays: 3 },
            { name: "Express Delivery", estimatedDays: 1 },
            { name: "Same Day Delivery", estimatedDays: 0 },
          ],

          paymentMethods: [
            "Cash on Delivery",
            "Credit Card",
            "Debit Card",
            "Bkash",
            "Nagad",
            "Paypal",
          ],

          appSettings: {
            theme: "light",
            currency: "USD",
            language: "en",
            contactEmail: "support@example.com",
            contactPhone: "+1 234 567 890",
          },

          socialLinks: {
            facebook: "https://facebook.com/myshop",
            instagram: "https://instagram.com/myshop",
            youtube: "https://youtube.com/@myshop",
          },

          banners: [
            {
              id: 1,
              title: "Big Summer Sale",
              image: "/banners/summer-sale.jpg",
              link: "/sale",
            },
            {
              id: 2,
              title: "Trending Electronics",
              image: "/banners/electronics.jpg",
              link: "/electronics",
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error initializing site_configs:", error);
  } finally {
    await prisma.$disconnect();
  }
};

export default initializeSiteConfig;
