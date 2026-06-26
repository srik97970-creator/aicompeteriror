const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Seed default Admin user
  const adminEmail = 'admin@nethigupta.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('AdminPass123!', salt);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: passwordHash,
        role: 'admin'
      }
    });
    console.log('Seeded default admin user: admin@nethigupta.com / AdminPass123!');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Seed default Products
  const products = [
    {
      name: 'Sole Fitness F63',
      category: 'Treadmills',
      features: '3.0 CHP Motor, 6.5-inch LCD display, 15% Incline, 20" x 60" Cushion Flex Whisper Deck, Foldable with Easy Assist, Integrated tablet holder, Bluetooth speakers, lifetime frame & motor warranty, max user weight 325 lbs.'
    },
    {
      name: 'Schwinn IC4 Indoor Cycling Bike',
      category: 'Exercise Cycles',
      features: 'Full color LCD display, 100 levels of magnetic resistance, dual-link SPD pedals with toe cages, Bluetooth connectivity for Peloton and Zwift apps (stream on your own tablet/phone), includes 3lb dumbbells, no mandatory subscription fee.'
    },
    {
      name: 'DXRacer Formula Series',
      category: 'Gaming Chairs',
      features: '3D Armrests, Conventional tilt mechanism, External headrest and lumbar cushions, Breathable mesh + PU leather, Ergonomic high-back design, Sturdy steel frame, highly competitive price.'
    },
    {
      name: 'Logitech G915 LIGHTSPEED',
      category: 'Gaming Keyboards',
      features: 'Low-profile GL Tactile switches, LIGHTSPEED wireless + Bluetooth, Thin aluminum build, dedicated media controls, up to 30 hours battery life with RGB, onboard profiles, dual wireless connectivity.'
    },
    {
      name: 'HyperX Cloud Alpha Wireless',
      category: 'Gaming Headsets',
      features: 'Unprecedented 300-hour battery life on a single charge, DTS Headphone:X Spatial Audio, Dual Chamber Drivers, Detachable noise-canceling mic, Signature HyperX comfort, budget friendly ($199).'
    },
    {
      name: 'Garmin Fenix 7',
      category: 'Wearables',
      features: 'Up to 18 days battery life in smartwatch mode, solar charging options, rugged titanium bezel, preloaded TopoActive maps, robust offline navigation, extensive sports telemetry, water-resistant 10 ATM.'
    },
    {
      name: 'Sony WH-1000XM5',
      category: 'Audio',
      features: 'Industry-leading dual-processor ANC, 30-hour battery life, Speak-to-Chat smart pause, multipoint Bluetooth connection, outstanding 8-mic call arrays, lightweight premium design.'
    },
    {
      name: 'Roborock Q Revo',
      category: 'Smart Home',
      features: 'Dual spinning mops with automatic lifting, 5500Pa suction power, multifunctional dock that washes/dries mop pads with warm air and empties dust, LiDAR navigation, highly competitive price.'
    },
    {
      name: 'Breville Barista Express',
      category: 'Kitchen Appliances',
      features: 'Integrated conical burr grinder (16 grind settings), digital temperature control (PID) for perfect extraction, manual microfoam milk texturing, dedicated hot water outlet, 15-bar Italian pump.'
    }
  ];

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name }
    });
    if (!existingProduct) {
      await prisma.product.create({ data: product });
      console.log(`Seeded product: ${product.name}`);
    }
  }

  // 3. Seed default Templates
  const templates = [
    {
      name: 'Gym Treadmill Comparison',
      competitorProduct: 'Carbon T7',
      competitorBrand: 'ProForm',
      competitorFeatures: '3.0 CHP Motor, 7-inch Touchscreen, 10% Incline, 20" x 55" Tread Belt, Foldable design, iFit compatibility (membership required), max user weight 300 lbs.',
      customerRequirements: 'concerned about deck cushioning, warranty length, and long-term durability on a budget of around $1000.',
      ourProduct: 'Sole Fitness F63',
      ourFeatures: '3.0 CHP Motor, 6.5-inch LCD display, 15% Incline, 20" x 60" Cushion Flex Whisper Deck, Foldable with Easy Assist, Integrated tablet holder, Bluetooth speakers, lifetime frame & motor warranty, max user weight 325 lbs.',
      additionalNotes: 'Customer is comparing lifetime durability and doesn\'t want locked-in monthly subscriptions.'
    },
    {
      name: 'Exercise Cycle Comparison',
      competitorProduct: 'Peloton Bike',
      competitorBrand: 'Peloton',
      competitorFeatures: '21.5" HD Touchscreen, Manual resistance knob, Clip-in pedals, Subscription streaming classes required ($44/mo), Sleek modern design.',
      customerRequirements: 'loves the Peloton software classes but hates the high price tag and mandatory ongoing subscription fee.',
      ourProduct: 'Schwinn IC4 Indoor Cycling Bike',
      ourFeatures: 'Full color LCD display, 100 levels of magnetic resistance, dual-link SPD pedals with toe cages, Bluetooth connectivity for Peloton and Zwift apps (stream on your own tablet/phone), includes 3lb dumbbells, no mandatory subscription fee.',
      additionalNotes: 'Stocked product is much cheaper and offers app connectivity to use their own iPad.'
    },
    {
      name: 'Gaming Chair Comparison',
      competitorProduct: 'TITAN Evo',
      competitorBrand: 'Secretlab',
      competitorFeatures: '4D Armrests, Magnetic neck pillow, L-ADAPT integrated lumbar support, PU Leather material, Recline up to 165 degrees, Premium price point.',
      customerRequirements: 'wants a highly ergonomic chair for long coding/gaming sessions, but finds the Secretlab price too high.',
      ourProduct: 'DXRacer Formula Series',
      ourFeatures: '3D Armrests, Conventional tilt mechanism, External headrest and lumbar cushions, Breathable mesh + PU leather, Ergonomic high-back design, Sturdy steel frame, highly competitive price.',
      additionalNotes: 'Focus on budget-friendly posture support.'
    },
    {
      name: 'Gaming Keyboard Comparison',
      competitorProduct: 'BlackWidow V4 Pro',
      competitorBrand: 'Razer',
      competitorFeatures: 'Green Clicky mechanical switches, Per-key Chroma RGB, Dedicated macro keys, Multi-function dial, Plush wrist rest, Razer Synapse software dependency.',
      customerRequirements: 'wants a premium keyboard, prefers wireless connectivity and clean desk aesthetics with minimal cable clutter.',
      ourProduct: 'Logitech G915 LIGHTSPEED',
      ourFeatures: 'Low-profile GL Tactile switches, LIGHTSPEED wireless + Bluetooth, Thin aluminum build, dedicated media controls, up to 30 hours battery life with RGB, onboard profiles, dual wireless connectivity.',
      additionalNotes: 'Razer is wired and requires constant app updates, Logitech has lightspeed wireless.'
    },
    {
      name: 'Gaming Headset Comparison',
      competitorProduct: 'Arctis Nova Pro Wireless',
      competitorBrand: 'SteelSeries',
      competitorFeatures: 'Active Noise Cancellation, Dual Audio Streams, Hot-swappable dual battery system, GameDAC Gen 2, High fidelity audio, Premium pricing ($350).',
      customerRequirements: 'looking for a wireless headset and is annoyed by having to charge batteries constantly.',
      ourProduct: 'HyperX Cloud Alpha Wireless',
      ourFeatures: 'Unprecedented 300-hour battery life on a single charge, DTS Headphone:X Spatial Audio, Dual Chamber Drivers, Detachable noise-canceling mic, Signature HyperX comfort, budget friendly ($199).',
      additionalNotes: 'Sound comfort and battery are top priorities.'
    },
    {
      name: 'Outdoor Smartwatch Comparison',
      competitorProduct: 'Apple Watch Series 9',
      competitorBrand: 'Apple',
      competitorFeatures: '18-hour battery life, Always-On Retina OLED screen, sleek lifestyle design, extensive smart app ecosystem, aluminum casing, standard GPS navigation.',
      customerRequirements: 'wants long battery life (over a week) for hiking and rugged outdoor durability, but is attracted to Apple\'s smart features.',
      ourProduct: 'Garmin Fenix 7',
      ourFeatures: 'Up to 18 days battery life in smartwatch mode, solar charging options, rugged titanium bezel, preloaded TopoActive maps, robust offline navigation, extensive sports telemetry, water-resistant 10 ATM.',
      additionalNotes: 'Garmin handles weeks of camping whereas Apple requires daily charging, making it impractical for trails.'
    },
    {
      name: 'Noise Cancelling Audio Comparison',
      competitorProduct: 'QuietComfort Ultra',
      competitorBrand: 'Bose',
      competitorFeatures: 'Excellent custom ANC, immersive audio mode, folding design, premium Bose sound signature, 24-hour battery life.',
      customerRequirements: 'wants top-tier active noise cancellation and clear call quality for work calls, but is undecided on comfort and smart features.',
      ourProduct: 'Sony WH-1000XM5',
      ourFeatures: 'Industry-leading dual-processor ANC, 30-hour battery life, Speak-to-Chat smart pause, multipoint Bluetooth connection, outstanding 8-mic call arrays, lightweight premium design.',
      additionalNotes: 'XM5 has longer battery life (30h vs 24h) and advanced smart features like speak-to-chat.'
    },
    {
      name: 'Smart Vacuum Mop Comparison',
      competitorProduct: 'Roomba Combo j9+',
      competitorBrand: 'iRobot',
      competitorFeatures: 'Premium auto-retract mop, obstacle avoidance, automatic dirt disposal, proprietary clean base, high brand recognition, pricing around $1399.',
      customerRequirements: 'wants a reliable hands-free cleaning device that vacuums and mops, but wants to avoid constant maintenance and high pricing.',
      ourProduct: 'Roborock Q Revo',
      ourFeatures: 'Dual spinning mops with automatic lifting, 5500Pa suction power, multifunctional dock that washes/dries mop pads with warm air and empties dust, LiDAR navigation, highly competitive price.',
      additionalNotes: 'Q Revo offers hot air mop drying and spinning mops at a much lower price ($899 vs $1399).'
    },
    {
      name: 'Premium Coffee Maker Comparison',
      competitorProduct: 'La Specialista Prestigio',
      competitorBrand: 'DeLonghi',
      competitorFeatures: 'Sensor grinding technology, smart tamping station, active temperature control, professional steam wand, high-end stainless steel design.',
      customerRequirements: 'wants an authentic cafe-quality espresso experience at home with built-in grinding, without complex manual setup.',
      ourProduct: 'Breville Barista Express',
      ourFeatures: 'Integrated conical burr grinder (16 grind settings), digital temperature control (PID) for perfect extraction, manual microfoam milk texturing, dedicated hot water outlet, 15-bar Italian pump.',
      additionalNotes: 'Breville is the industry gold standard and provides far superior microfoam milk texturing for latte art.'
    }
  ];

  for (const template of templates) {
    const existingTemplate = await prisma.template.findUnique({
      where: { name: template.name }
    });
    if (!existingTemplate) {
      await prisma.template.create({ data: template });
      console.log(`Seeded template: ${template.name}`);
    }
  }

  // 4. Seed default AI Prompt
  const defaultPromptName = 'default_brief_prompt';
  const existingPrompt = await prisma.aIPrompt.findUnique({
    where: { name: defaultPromptName }
  });

  if (!existingPrompt) {
    await prisma.aIPrompt.create({
      data: {
        name: defaultPromptName,
        systemPrompt: 'You are a professional sales enablement expert. Create a persuasive but factual competitor comparison brief. Highlight strengths of our product while remaining truthful and professional. Format output using sections, tables, bullet points, and sales recommendations.',
        isActive: true
      }
    });
    console.log('Seeded default AI system prompt.');
  } else {
    console.log('Default AI system prompt already exists.');
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
