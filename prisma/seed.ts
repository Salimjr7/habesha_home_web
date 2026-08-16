import { PrismaClient, PropertyType, ListingType, PropertyStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Habesha Home database seed...");

  // 1. Clean existing data (in dependency order)
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.payoutAccount.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.propertyAvailability.deleteMany({});
  await prisma.propertyAmenity.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.country.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned old database records.");

  // 2. Create Country
  const ethiopia = await prisma.country.create({
    data: {
      name: "Ethiopia",
      code: "ET",
      currency: "ETB",
    },
  });

  // 3. Create Ethiopian Cities
  const citiesData = [
    {
      name: "Addis Ababa",
      slug: "addis-ababa",
      countryId: ethiopia.id,
      description: "The vibrant diplomatic capital of Africa, featuring luxury apartments, modern high-rises, and serene residential compounds in Bole, Kazanchis, and Old Airport.",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
      latitude: 9.032,
      longitude: 38.7469,
      featured: true,
    },
    {
      name: "Bishoftu (Debre Zeyit)",
      slug: "bishoftu",
      countryId: ethiopia.id,
      description: "Picturesque crater lake resort city just 45 minutes from Addis, famous for lakeside villas, weekend getaways, and aquatic recreation.",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      latitude: 8.7523,
      longitude: 38.9785,
      featured: true,
    },
    {
      name: "Hawassa",
      slug: "hawassa",
      countryId: ethiopia.id,
      description: "Lakeside paradise with palm-lined avenues, sunset boat rides, fresh tilapia, and modern holiday retreats along the Rift Valley.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      latitude: 7.0504,
      longitude: 38.4955,
      featured: true,
    },
    {
      name: "Bahir Dar",
      slug: "bahir-dar",
      countryId: ethiopia.id,
      description: "Majestic city on the southern shore of Lake Tana, gateway to the Blue Nile Falls and ancient island monasteries with tranquil waterfront lodges.",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
      latitude: 11.5742,
      longitude: 37.3614,
      featured: true,
    },
    {
      name: "Gondar",
      slug: "gondar",
      countryId: ethiopia.id,
      description: "The Camelot of Africa, surrounded by royal 17th-century stone castles, Emperor Fasilides bath, and stunning mountain landscape homes.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      latitude: 12.6075,
      longitude: 37.4578,
      featured: false,
    },
    {
      name: "Dire Dawa",
      slug: "dire-dawa",
      countryId: ethiopia.id,
      description: "Historic Franco-Ethiopian railway hub featuring broad leafy boulevards, colonial architecture in Kezira, and warm eastern hospitality.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      latitude: 9.6009,
      longitude: 41.8501,
      featured: false,
    },
  ];

  const createdCities: Record<string, string> = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    createdCities[c.slug] = city.id;
  }
  console.log(`📍 Created ${citiesData.length} Ethiopian destination cities.`);

  // 4. Create Essential Amenities
  const amenitiesData = [
    { name: "24/7 Backup Generator", slug: "backup-generator", icon: "Zap", category: "Utilities" },
    { name: "Continuous Water Tank (Reserve)", slug: "water-tank", icon: "Droplets", category: "Utilities" },
    { name: "High-Speed Wi-Fi (Fiber)", slug: "wifi", icon: "Wifi", category: "Connectivity" },
    { name: "24/7 Gated Security & Guard", slug: "security", icon: "ShieldCheck", category: "Safety" },
    { name: "Dedicated Free Parking", slug: "parking", icon: "Car", category: "Facilities" },
    { name: "Fully Equipped Kitchen", slug: "kitchen", icon: "Utensils", category: "Living" },
    { name: "Traditional Coffee Ceremony Set", slug: "coffee-ceremony", icon: "Coffee", category: "Habesha Living" },
    { name: "Smart TV with DSTV & Canal+", slug: "smart-tv", icon: "Tv", category: "Entertainment" },
    { name: "Automatic Washing Machine", slug: "washing-machine", icon: "Shirt", category: "Living" },
    { name: "Air Conditioning", slug: "ac", icon: "Wind", category: "Comfort" },
    { name: "Modern Elevator / Lift", slug: "elevator", icon: "ArrowUpDown", category: "Facilities" },
    { name: "Workstation / Ergonomic Desk", slug: "workspace", icon: "Laptop", category: "Work" },
    { name: "Private Balcony with City View", slug: "balcony", icon: "Sun", category: "Outdoor" },
    { name: "Swimming Pool", slug: "pool", icon: "Waves", category: "Luxury" },
    { name: "Compound Gym & Fitness", slug: "gym", icon: "Dumbbell", category: "Wellness" },
  ];

  const createdAmenities: Record<string, string> = {};
  for (const a of amenitiesData) {
    const amenity = await prisma.amenity.create({ data: a });
    createdAmenities[a.slug] = amenity.id;
  }
  console.log(`✨ Created ${amenitiesData.length} localized Ethiopian amenities.`);

  // 5. Create Seed Users
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      name: "Habesha Home Admin",
      email: "admin@habeshahome.et",
      role: UserRole.ADMIN,
      emailVerified: true,
      phone: "+251911223344",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      profile: {
        create: {
          bio: "Head Administrator at Habesha Home Ethiopia.",
          city: "Addis Ababa",
          currency: "ETB",
        },
      },
      wallet: {
        create: {
          currency: "ETB",
        },
      },
    },
  });

  // Owner 1: Dawit Haile (Bole & Kazanchis Luxury properties)
  const ownerDawit = await prisma.user.create({
    data: {
      name: "Dawit Haile",
      email: "dawit@habeshahome.et",
      role: UserRole.OWNER,
      emailVerified: true,
      phone: "+251911456789",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      profile: {
        create: {
          bio: "Superhost with 5+ years of hosting experience in Addis Ababa & Bishoftu. Dedicated to five-star hospitality.",
          city: "Addis Ababa",
          currency: "ETB",
        },
      },
      wallet: {
        create: {
          availableBalance: 4500000, // ETB 45,000.00
          pendingBalance: 1200000,   // ETB 12,000.00
          totalEarnings: 8900000,    // ETB 89,000.00
          currency: "ETB",
        },
      },
      payoutAccounts: {
        create: [
          {
            provider: "telebirr",
            accountName: "Dawit Haile",
            accountNumber: "+251911456789",
            isDefault: true,
          },
          {
            provider: "bank",
            accountName: "Dawit Haile",
            accountNumber: "1000123456789",
            bankName: "Commercial Bank of Ethiopia (CBE)",
            isDefault: false,
          },
        ],
      },
    },
  });

  // Owner 2: Selamawit Tadesse (Bishoftu lake villas & CMC family homes)
  const ownerSelam = await prisma.user.create({
    data: {
      name: "Selamawit Tadesse",
      email: "selam@habeshahome.et",
      role: UserRole.OWNER,
      emailVerified: true,
      phone: "+251922334455",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
      profile: {
        create: {
          bio: "Architect & real-estate designer managing boutique villas in Bishoftu and luxury condos in Addis Ababa.",
          city: "Bishoftu",
          currency: "ETB",
        },
      },
      wallet: {
        create: {
          availableBalance: 7800000,
          pendingBalance: 2400000,
          totalEarnings: 15400000,
          currency: "ETB",
        },
      },
    },
  });

  // Renter 1: Abebe Kebede
  const renterAbebe = await prisma.user.create({
    data: {
      name: "Abebe Kebede",
      email: "renter@habeshahome.et",
      role: UserRole.RENTER,
      emailVerified: true,
      phone: "+251933557799",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      profile: {
        create: {
          bio: "Tech entrepreneur traveling frequently between Addis Ababa and Hawassa.",
          city: "Addis Ababa",
          currency: "ETB",
        },
      },
    },
  });

  console.log("👤 Created sample Ethiopian Admins, Owners, and Renters.");

  // 6. Create Realistic Ethiopian Properties
  const propertiesData = [
    {
      title: "Bole Atlas Executive Penthouse with Panoramic City Views",
      slug: "bole-atlas-executive-penthouse",
      description: "Experience modern luxury in the heart of Bole Atlas. This 3-bedroom penthouse offers floor-to-ceiling windows with breathtaking sunset vistas of Addis Ababa. Features 24/7 backup power generator, dual water reserve tanks, fiber-optic internet, and a dedicated security team. Walking distance to world-class restaurants, cafes, and Bole International Airport.",
      propertyType: PropertyType.PENTHOUSE,
      listingType: ListingType.SHORT_TERM,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["addis-ababa"],
      address: "Bole Atlas, behind Edna Mall, Addis Ababa",
      bedrooms: 3,
      bathrooms: 3,
      beds: 3,
      maxGuests: 6,
      pricePerNight: 850000, // ETB 8,500
      cleaningFee: 100000,   // ETB 1,000
      serviceFee: 42500,     // ETB 425
      weeklyDiscount: 10,
      monthlyDiscount: 25,
      instantBooking: true,
      verified: true,
      featured: true,
      avgRating: 4.95,
      reviewCount: 28,
      ownerId: ownerDawit.id,
      images: [
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Living room with skyline view" },
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Master bedroom" },
        { url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 2, alt: "Gourmet kitchen" },
        { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 3, alt: "Modern bathroom" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "parking", "kitchen", "coffee-ceremony", "smart-tv", "elevator", "balcony", "workspace"],
    },
    {
      title: "Lake Babogaya Luxury Waterfront Villa with Private Pier",
      slug: "lake-babogaya-waterfront-villa",
      description: "Serene lakeside oasis on the pristine waters of Lake Babogaya in Bishoftu. Designed for families and romantic weekend retreats. Includes private deck, lush botanical gardens, barbecue grill, and daily housekeeping. Only 40 minutes via the Addis-Adama expressway.",
      propertyType: PropertyType.VILLA,
      listingType: ListingType.SHORT_TERM,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["bishoftu"],
      address: "Lake Babogaya shoreline, Bishoftu",
      bedrooms: 4,
      bathrooms: 4,
      beds: 5,
      maxGuests: 8,
      pricePerNight: 1200000, // ETB 12,000
      cleaningFee: 150000,
      serviceFee: 60000,
      weeklyDiscount: 15,
      monthlyDiscount: 30,
      instantBooking: true,
      verified: true,
      featured: true,
      avgRating: 4.98,
      reviewCount: 34,
      ownerId: ownerSelam.id,
      images: [
        { url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Lakeside villa facade" },
        { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Lakeside patio" },
        { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 2, alt: "Spacious master suite" },
        { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 3, alt: "Private swimming pool" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "parking", "kitchen", "coffee-ceremony", "smart-tv", "pool", "balcony"],
    },
    {
      title: "Kazanchis UN-Hub Modern Studio for Business Travelers",
      slug: "kazanchis-un-hub-studio",
      description: "Sophisticated and quiet studio apartment located adjacent to ECA (United Nations Economic Commission for Africa) and InterLuxury Hotel. High-speed 50Mbps fiber internet, dedicated ergonomic workstation, blackout blinds, and 24/7 power backup. Ideal for expats and conference delegates.",
      propertyType: PropertyType.STUDIO,
      listingType: ListingType.BOTH,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["addis-ababa"],
      address: "Kazanchis, Guinea Conakry St, Addis Ababa",
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      maxGuests: 2,
      pricePerNight: 420000, // ETB 4,200
      cleaningFee: 50000,
      serviceFee: 21000,
      weeklyDiscount: 8,
      monthlyDiscount: 20,
      instantBooking: true,
      verified: true,
      featured: true,
      avgRating: 4.88,
      reviewCount: 42,
      ownerId: ownerDawit.id,
      images: [
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Cozy modern studio interior" },
        { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Ergonomic work area" },
        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 2, alt: "Compact kitchenette" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "elevator", "workspace", "smart-tv", "ac"],
    },
    {
      title: "Old Airport Diplomatic Villa with Gated Lush Garden",
      slug: "old-airport-diplomatic-villa",
      description: "Prestigious 5-bedroom residence in the exclusive Old Airport diplomatic quarter. Features private security guardhouse, high stone walls, spacious manicured lawn, self-contained maids quarters, two-car garage, and traditional Ethiopian coffee pavilion.",
      propertyType: PropertyType.VILLA,
      listingType: ListingType.BOTH,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["addis-ababa"],
      address: "Old Airport, Near ICS International Community School, Addis Ababa",
      bedrooms: 5,
      bathrooms: 5,
      beds: 6,
      maxGuests: 10,
      pricePerNight: 1600000, // ETB 16,000
      cleaningFee: 200000,
      serviceFee: 80000,
      weeklyDiscount: 12,
      monthlyDiscount: 35,
      instantBooking: false,
      verified: true,
      featured: true,
      avgRating: 4.97,
      reviewCount: 19,
      ownerId: ownerDawit.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Front garden and villa facade" },
        { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Grand salon" },
        { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 2, alt: "Dining area" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "parking", "kitchen", "coffee-ceremony", "smart-tv", "washing-machine", "balcony"],
    },
    {
      title: "Hawassa Lakeview Resort Condo with Sunset Deck",
      slug: "hawassa-lakeview-resort-condo",
      description: "Relax in this peaceful 2-bedroom condo overlooking Lake Hawassa. Watch fishermen and aquatic birds from your private balcony. Minutes away from the famous Fish Market and Haile Resort. Features continuous hot water, standby generator, and private parking.",
      propertyType: PropertyType.CONDO,
      listingType: ListingType.SHORT_TERM,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["hawassa"],
      address: "Lakeside Boulevard, Hawassa",
      bedrooms: 2,
      bathrooms: 2,
      beds: 2,
      maxGuests: 4,
      pricePerNight: 550000, // ETB 5,500
      cleaningFee: 60000,
      serviceFee: 27500,
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      instantBooking: true,
      verified: true,
      featured: true,
      avgRating: 4.91,
      reviewCount: 22,
      ownerId: ownerSelam.id,
      images: [
        { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Waterfront balcony view" },
        { url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Comfortable bedroom" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "parking", "kitchen", "smart-tv", "balcony"],
    },
    {
      title: "CMC Summit Spacious 4-Bedroom Family Residence",
      slug: "cmc-summit-family-residence",
      description: "Spacious, secure, and fully furnished two-story home inside a gated Summit/CMC compound. Perfect for large families visiting relatives in Addis Ababa. Includes modern kitchen, children play area, solar water heating, and standby generator.",
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.BOTH,
      status: PropertyStatus.PUBLISHED,
      cityId: createdCities["addis-ababa"],
      address: "CMC Summit Gated Compound, Addis Ababa",
      bedrooms: 4,
      bathrooms: 3,
      beds: 5,
      maxGuests: 8,
      pricePerNight: 780000, // ETB 7,800
      cleaningFee: 120000,
      serviceFee: 39000,
      weeklyDiscount: 12,
      monthlyDiscount: 28,
      instantBooking: true,
      verified: true,
      featured: false,
      avgRating: 4.85,
      reviewCount: 16,
      ownerId: ownerSelam.id,
      images: [
        { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80", isCover: true, order: 0, alt: "Residence exterior" },
        { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80", isCover: false, order: 1, alt: "Living room" },
      ],
      amenitySlugs: ["backup-generator", "water-tank", "wifi", "security", "parking", "kitchen", "coffee-ceremony", "smart-tv", "washing-machine"],
    },
  ];

  for (const p of propertiesData) {
    const { images, amenitySlugs, ...propData } = p;
    const property = await prisma.property.create({
      data: {
        ...propData,
        images: {
          create: images,
        },
        amenities: {
          create: amenitySlugs.map((slug) => ({
            amenity: { connect: { id: createdAmenities[slug] } },
          })),
        },
      },
    });

    // Add a sample completed booking and review for each property
    const sampleBooking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        renterId: renterAbebe.id,
        checkIn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        checkOut: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        guests: 2,
        status: "COMPLETED",
        basePrice: property.pricePerNight * 4,
        cleaningFee: property.cleaningFee,
        serviceFee: property.serviceFee,
        tax: Math.round((property.pricePerNight * 4 + property.cleaningFee + property.serviceFee) * 0.15),
        totalPrice: Math.round((property.pricePerNight * 4 + property.cleaningFee + property.serviceFee) * 1.15),
        currency: "ETB",
      },
    });

    await prisma.review.create({
      data: {
        propertyId: property.id,
        bookingId: sampleBooking.id,
        authorId: renterAbebe.id,
        rating: 5,
        comment: "Betam arif bota new! The backup generator and water reservoir worked flawlessly. The host was incredibly welcoming with traditional coffee. Highly recommended for anyone visiting Ethiopia.",
        cleanliness: 5,
        location: 5,
        communication: 5,
        accuracy: 5,
        value: 5,
      },
    });
  }

  console.log(`🏡 Created ${propertiesData.length} featured Ethiopian properties with images, amenities, and verified reviews.`);
  console.log("✅ Habesha Home database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
