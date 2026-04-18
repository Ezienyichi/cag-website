export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number; // in Naira
  image: string;
  gallery: string[];
  category: string;
  ageRange: string;
  type: 'physical' | 'digital';
  tag?: string;
  features: string[];
  store: 'workbooks' | 'homeschooling' | 'digital';
}

export const ALL_PRODUCTS: StoreProduct[] = [
  // ============================================
  // SCHOOL WORKBOOKS (Physical)
  // ============================================
  {
    id: 'nursery-1-workbook',
    name: 'Creative Arts Studies — Nursery 1',
    description: 'Montessori-approved workbook for ages 2–3 covering music, folktales, and handicraft activities.',
    longDescription: 'This beautifully crafted workbook introduces children aged 2–3 to the world of creative arts through the Montessori curriculum. It covers preliminary introductions to music, African folktales, and hands-on handicraft activities. Each book includes an assignment allocation record sheet for parents and guardians, plus exclusive access to YouTube practice class videos. Designed and published by Change Art Gallerie, approved by NERDC.',
    price: 3500,
    image: '/images/color-alchemist.png',
    gallery: ['/images/nursery1-page1.png', '/images/nursery1-page2.png', '/images/nursery1-page3.png', '/images/nursery1-page4.png'],
    category: 'Nursery 1',
    ageRange: '2–3',
    type: 'physical',
    tag: 'Best Seller',
    features: ['Montessori curriculum aligned', 'YouTube practice videos included', 'Assignment record sheet', 'Music & folktale activities', 'Handicraft projects', 'NERDC approved'],
    store: 'workbooks',
  },
  {
    id: 'nursery-2-workbook',
    name: 'Creative Arts Studies — Nursery 2',
    description: 'Building on Nursery 1 with more advanced colour theory, African storytelling, and creative expression.',
    longDescription: 'The Nursery 2 workbook takes children aged 3–4 deeper into creative arts with advanced colour theory, richer African storytelling, and more complex handicraft activities. Building on the foundation of Nursery 1, this book introduces guided drawing, pattern recognition, and collaborative art projects. Includes assignment record sheets and exclusive YouTube video access.',
    price: 3500,
    image: '/images/color-alchemist.png',
    gallery: ['/images/nursery2-page1.png', '/images/nursery2-page2.png', '/images/nursery2-page3.png', '/images/nursery2-page4.png'],
    category: 'Nursery 2',
    ageRange: '3–4',
    type: 'physical',
    features: ['Advanced colour theory', 'Guided drawing exercises', 'Pattern recognition', 'Collaborative art projects', 'YouTube practice videos', 'Assignment record sheet'],
    store: 'workbooks',
  },
  {
    id: 'nursery-3-workbook',
    name: 'Creative Arts Studies — Nursery 3',
    description: 'The most advanced nursery workbook with full Montessori curriculum integration and guided art projects.',
    longDescription: 'Our most comprehensive workbook for children aged 4–5. Nursery 3 covers music notation basics, advanced handicraft techniques, extended folktale comprehension, and guided creative projects. This book prepares children for primary school arts education while maintaining the joy and playfulness of the Montessori approach. Includes assignment record sheets and exclusive YouTube video access.',
    price: 4000,
    image: '/images/color-alchemist.png',
    gallery: ['/images/nursery3-page1.png', '/images/nursery3-page2.png', '/images/nursery3-page3.png', '/images/nursery3-page4.png'],
    category: 'Nursery 3',
    ageRange: '4–5',
    type: 'physical',
    tag: 'New',
    features: ['Music notation basics', 'Advanced handicraft techniques', 'Extended folktale comprehension', 'Primary school preparation', 'YouTube practice videos', 'Assignment record sheet'],
    store: 'workbooks',
  },

  // ============================================
  // HOMESCHOOLING RESOURCES (Digital)
  // ============================================
  {
    id: 'hs-nursery1-pack',
    name: 'Homeschool Starter Pack — Ages 2–3',
    description: 'Printable activity sheets, colouring pages, and guided lesson plans for Nursery 1 level.',
    longDescription: 'Everything you need to teach creative arts at home for ages 2–3. This downloadable pack includes printable activity sheets, colouring pages, and step-by-step lesson plans aligned with the Nursery 1 Montessori curriculum. Print at home and start teaching immediately. Perfect for parents who want to supplement school learning or fully homeschool their children.',
    price: 2000,
    image: '/images/shape-master.png',
    gallery: ['/images/shape-master.png'],
    category: 'Nursery 1',
    ageRange: '2–3',
    type: 'digital',
    tag: 'Popular',
    features: ['Printable activity sheets', 'Colouring pages', 'Step-by-step lesson plans', 'Montessori aligned', 'Instant download', 'Print at home'],
    store: 'homeschooling',
  },
  {
    id: 'hs-nursery2-pack',
    name: 'Homeschool Activity Pack — Ages 3–4',
    description: 'Downloadable worksheets covering shapes, colours, African folktales, and early writing practice.',
    longDescription: 'A comprehensive homeschooling resource pack for Nursery 2 level. Covers shapes, colours, African folktales, and early writing practice through engaging printable worksheets. Each activity is designed to be completed in 15–20 minutes, making it easy to fit into your daily routine.',
    price: 2000,
    image: '/images/shape-master.png',
    gallery: ['/images/shape-master.png'],
    category: 'Nursery 2',
    ageRange: '3–4',
    type: 'digital',
    features: ['Shapes and colours worksheets', 'African folktale activities', 'Early writing practice', '15–20 min activities', 'Instant download', 'Print at home'],
    store: 'homeschooling',
  },
  {
    id: 'hs-nursery3-pack',
    name: 'Homeschool Complete Pack — Ages 4–6',
    description: 'Advanced homeschooling resources with music activities, handicraft guides, and comprehensive lesson plans.',
    longDescription: 'The most advanced homeschooling pack covering ages 4–6. Includes music activities, detailed handicraft guides with material lists, comprehensive lesson plans, and progress tracking sheets. Prepares children for primary school while keeping learning fun and creative.',
    price: 2500,
    image: '/images/shape-master.png',
    gallery: ['/images/shape-master.png'],
    category: 'Nursery 3',
    ageRange: '4–6',
    type: 'digital',
    tag: 'New',
    features: ['Music activities', 'Handicraft guides with material lists', 'Comprehensive lesson plans', 'Progress tracking sheets', 'Instant download', 'Primary school preparation'],
    store: 'homeschooling',
  },
  {
    id: 'hs-full-bundle',
    name: 'Full Homeschool Bundle — All Ages',
    description: 'Complete downloadable homeschooling resource pack for ages 2–6. All three levels plus bonus parent guides.',
    longDescription: 'The ultimate homeschooling bundle — all three nursery levels in one package at a 25% discount. Includes every worksheet, lesson plan, and activity from the Nursery 1, 2, and 3 packs, plus bonus parent guides with teaching tips and activity scheduling templates.',
    price: 5000,
    image: '/images/shape-master.png',
    gallery: ['/images/shape-master.png'],
    category: 'Bundle',
    ageRange: '2–6',
    type: 'digital',
    tag: 'Best Value',
    features: ['All 3 nursery levels', '25% bundle discount', 'Bonus parent guides', 'Teaching tips included', 'Activity scheduling templates', 'Instant download'],
    store: 'homeschooling',
  },

  // ============================================
  // DIGITAL STORYBOOKS
  // ============================================
  {
    id: 'ds-bible-stories',
    name: 'Bible Stories for Little Ones',
    description: 'Beautifully illustrated Christian storybook with 20 Bible stories retold for children ages 2–5.',
    longDescription: 'A lovingly illustrated digital storybook featuring 20 of the most beloved Bible stories, retold in simple, engaging language for children ages 2–5. From Creation to the story of David and Goliath, each story includes colourful illustrations and discussion questions for parents. PDF format — read on any device or print at home.',
    price: 1500,
    image: '/images/nature-sketchbook.png',
    gallery: ['/images/nature-sketchbook.png'],
    category: 'Christian',
    ageRange: '2–5',
    type: 'digital',
    tag: 'Popular',
    features: ['20 Bible stories', 'Simple child-friendly language', 'Colourful illustrations', 'Discussion questions', 'PDF format', 'Read on any device'],
    store: 'digital',
  },
  {
    id: 'ds-african-folktales',
    name: 'African Folktales Collection',
    description: 'A colourful collection of 15 African folktales with moral lessons for young readers.',
    longDescription: '15 traditional African folktales beautifully illustrated and retold for children ages 3–6. Each story teaches important moral lessons about kindness, honesty, courage, and community. Includes discussion prompts and simple comprehension questions. PDF format — perfect for bedtime reading or classroom use.',
    price: 1500,
    image: '/images/nature-sketchbook.png',
    gallery: ['/images/nature-sketchbook.png'],
    category: 'Folktales',
    ageRange: '3–6',
    type: 'digital',
    features: ['15 African folktales', 'Moral lessons', 'Discussion prompts', 'Comprehension questions', 'PDF format', 'Great for bedtime reading'],
    store: 'digital',
  },
  {
    id: 'ds-full-digital-bundle',
    name: 'Complete Digital Library Bundle',
    description: 'All digital storybooks in one bundle. Save 40% on the complete collection.',
    longDescription: 'Get every digital storybook we offer in one discounted bundle — Bible stories, African folktales, and all future additions. Save 40% compared to buying individually. Instant download in PDF format, readable on any device.',
    price: 2500,
    image: '/images/nature-sketchbook.png',
    gallery: ['/images/nature-sketchbook.png'],
    category: 'Bundle',
    ageRange: '2–6',
    type: 'digital',
    tag: 'Best Value',
    features: ['All storybooks included', '40% bundle discount', 'Future additions included', 'Instant download', 'PDF format', 'Read on any device'],
    store: 'digital',
  },
];

export function getProductById(id: string) {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByStore(store: string) {
  return ALL_PRODUCTS.filter((p) => p.store === store);
}
