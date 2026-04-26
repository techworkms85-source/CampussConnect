require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const FoodOutlet = require('./models/FoodOutlet');

const ADMIN = {
  name: 'Admin',
  email: 'admin@campus.com',
  password: 'Admin@1234',
  role: 'admin',
  enrollmentNo: 'ADMIN001',
  semester: 1,
  branch: 'CSE',
};

const CLUBS = [
  // Technical
  {
    name: 'Full Stack Club',
    description: 'A community of developers passionate about building end-to-end web applications. We cover frontend, backend, databases, DevOps, and everything in between through workshops, hackathons, and project collaborations.',
    category: 'Technical',
    coordinator: 'President: Aryan Mehta | Vice President: Priya Sharma | Advisor: Dr. Neha Gupta',
    email: 'fullstack@campus.com',
    instagram: '@fullstack_club',
  },
  {
    name: 'Google Developers Club (GDG)',
    description: 'Official Google Developers Group on campus. We host tech talks, study jams, solution challenges, and connect students with the global Google developer ecosystem.',
    category: 'Technical',
    coordinator: 'President: Rohan Verma | Vice President: Ananya Singh | Advisor: Dr. Vikram Joshi',
    email: 'gdg@campus.com',
    instagram: '@gdg_campus',
  },
  {
    name: 'Alt Reality',
    description: 'Exploring the frontiers of Augmented Reality, Virtual Reality, and Mixed Reality. We build immersive experiences, experiment with AR/VR hardware, and push the boundaries of digital interaction.',
    category: 'Technical',
    coordinator: 'President: Kabir Nair | Vice President: Ishita Patel | Advisor: Prof. Sanjay Rao',
  },
  // Cultural
  {
    name: 'Rivaaz',
    description: 'Celebrating the rich tapestry of Indian classical and folk traditions. Rivaaz brings together students passionate about classical dance, folk music, and traditional art forms.',
    category: 'Cultural',
    coordinator: 'President: Meera Iyer | Vice President: Aditya Kulkarni | Advisor: Dr. Sunita Desai',
    email: 'rivaaz@campus.com',
    instagram: '@rivaaz_official',
  },
  {
    name: 'Ansh',
    description: 'A drama and theatre collective that explores storytelling through stage performances, street plays, and experimental theatre. We believe every story deserves to be told.',
    category: 'Cultural',
    coordinator: 'President: Tanya Bose | Vice President: Nikhil Sharma | Advisor: Prof. Rekha Menon',
    email: 'ansh@campus.com',
    instagram: '@ansh_theatre',
  },
  {
    name: 'Verve',
    description: 'The ultimate dance club on campus covering all styles — hip-hop, contemporary, Bollywood, freestyle, and more. Verve is where passion meets performance.',
    category: 'Cultural',
    coordinator: 'President: Riya Kapoor | Vice President: Arjun Das | Advisor: Ms. Pooja Nair',
    email: 'verve@campus.com',
    instagram: '@verve_dance',
  },
  {
    name: 'Advaita',
    description: 'A music collective that unites vocalists, instrumentalists, and composers. From classical ragas to indie fusion, Advaita is the heartbeat of campus music culture.',
    category: 'Cultural',
    coordinator: 'President: Siddharth Rao | Vice President: Kavya Menon | Advisor: Dr. Amit Trivedi',
    email: 'advaita@campus.com',
    instagram: '@advaita_music',
  },
];

const now = new Date();
const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const past = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const EVENTS = [
  {
    title: 'Full Stack Bootcamp 2025',
    description: 'A 2-day intensive bootcamp covering React, Node.js, MongoDB, and deployment. Hands-on projects and mentorship from industry professionals.',
    category: 'Workshop',
    date: future(10),
    endDate: future(11),
    venue: 'Lab Block 3, Room 301',
    organizer: 'Full Stack Club',
    maxParticipants: 60,
    tags: ['react', 'nodejs', 'mongodb', 'webdev'],
  },
  {
    title: 'Hackathon: Build for Campus',
    description: 'A 24-hour hackathon where teams build solutions for real campus problems. Open to all branches. Prizes worth ₹50,000 up for grabs.',
    category: 'Technical',
    date: future(20),
    endDate: future(21),
    venue: 'Main Auditorium',
    organizer: 'Full Stack Club & GDG',
    maxParticipants: 120,
    tags: ['hackathon', 'coding', 'prizes'],
  },
  {
    title: 'GDG DevFest Campus Edition',
    description: 'Annual developer festival featuring talks on AI/ML, Cloud, Flutter, and Android. Guest speakers from Google and top tech companies.',
    category: 'Technical',
    date: future(15),
    venue: 'Seminar Hall A',
    organizer: 'Google Developers Club (GDG)',
    maxParticipants: 200,
    tags: ['google', 'devfest', 'cloud', 'flutter'],
  },
  {
    title: 'AR/VR Experience Day',
    description: 'Try cutting-edge AR and VR demos built by Alt Reality club members. Experience immersive environments, 3D art, and interactive simulations.',
    category: 'Technical',
    date: future(7),
    venue: 'Innovation Hub, Ground Floor',
    organizer: 'Alt Reality',
    maxParticipants: 80,
    tags: ['ar', 'vr', 'immersive', 'demo'],
  },
  {
    title: 'Rivaaz — Rang Utsav',
    description: 'A vibrant showcase of Indian classical and folk dance forms. Performances by students trained in Bharatanatyam, Kathak, Garba, and more.',
    category: 'Cultural',
    date: future(25),
    venue: 'Open Air Amphitheatre',
    organizer: 'Rivaaz',
    maxParticipants: 500,
    tags: ['dance', 'classical', 'folk', 'cultural'],
  },
  {
    title: 'Ansh — Street Play Festival',
    description: 'A series of hard-hitting street plays on social issues performed across campus. Come watch, feel, and reflect.',
    category: 'Cultural',
    date: future(12),
    venue: 'Campus Grounds (Multiple Spots)',
    organizer: 'Ansh',
    maxParticipants: 0,
    tags: ['theatre', 'streetplay', 'drama'],
  },
  {
    title: 'Verve Dance Battle',
    description: 'The most electrifying dance competition of the year. Solo and crew battles across hip-hop, contemporary, and freestyle categories. Register your crew now.',
    category: 'Cultural',
    date: future(18),
    venue: 'Main Auditorium',
    organizer: 'Verve',
    maxParticipants: 150,
    tags: ['dance', 'battle', 'hiphop', 'freestyle'],
  },
  {
    title: 'Advaita — Unplugged Night',
    description: 'An intimate acoustic music evening featuring original compositions and covers by campus musicians. Bring your instruments or just your ears.',
    category: 'Cultural',
    date: future(30),
    venue: 'College Lawn',
    organizer: 'Advaita',
    maxParticipants: 300,
    tags: ['music', 'acoustic', 'live', 'unplugged'],
  },
  {
    title: 'Web Dev Study Jam',
    description: 'A Google-style study jam focused on web technologies. Learn at your own pace with guided codelabs and peer support from GDG mentors.',
    category: 'Workshop',
    date: future(5),
    venue: 'Computer Lab 2',
    organizer: 'Google Developers Club (GDG)',
    maxParticipants: 40,
    tags: ['studyjam', 'webdev', 'google'],
  },
  {
    title: 'Ansh Annual Play — "Ek Baar Phir"',
    description: 'Ansh presents its annual full-length stage production — a gripping story of identity, belonging, and second chances. Tickets free for students.',
    category: 'Cultural',
    date: past(5),
    venue: 'Main Auditorium',
    organizer: 'Ansh',
    maxParticipants: 400,
    tags: ['theatre', 'annual', 'play'],
  },
];

const FOOD_OUTLETS = [
  {
    name: 'Dominos',
    description: 'Classic pizzas, garlic breads and pasta — your go-to for a quick cheesy fix on campus.',
    location: 'Ground Floor, Block A',
    timings: '10:00 AM – 10:00 PM',
    isOpen: true,
    menu: [
      { name: 'Margherita Pizza (Regular)', price: 149, category: 'Pizza', isVeg: true },
      { name: 'Peppy Paneer Pizza (Regular)', price: 179, category: 'Pizza', isVeg: true },
      { name: 'Chicken Dominator (Regular)', price: 219, category: 'Pizza', isVeg: false },
      { name: 'Farmhouse Pizza (Regular)', price: 189, category: 'Pizza', isVeg: true },
      { name: 'Garlic Breadsticks', price: 99, category: 'Sides', isVeg: true },
      { name: 'Pasta Italiano White', price: 129, category: 'Pasta', isVeg: true },
      { name: 'Choco Lava Cake', price: 89, category: 'Dessert', isVeg: true },
      { name: 'Coke (250ml)', price: 49, category: 'Drinks', isVeg: true },
    ],
  },
  {
    name: 'Hotspot',
    description: 'Campus favourite for burgers, wraps and loaded fries. Fast, filling and affordable.',
    location: 'Food Court, Block B',
    timings: '9:00 AM – 9:00 PM',
    isOpen: true,
    menu: [
      { name: 'Classic Veg Burger', price: 79, category: 'Burger', isVeg: true },
      { name: 'Spicy Chicken Burger', price: 109, category: 'Burger', isVeg: false },
      { name: 'Paneer Tikka Wrap', price: 99, category: 'Wrap', isVeg: true },
      { name: 'Chicken Kathi Roll', price: 119, category: 'Wrap', isVeg: false },
      { name: 'Loaded Cheese Fries', price: 89, category: 'Sides', isVeg: true },
      { name: 'Masala Fries', price: 69, category: 'Sides', isVeg: true },
      { name: 'Cold Coffee', price: 59, category: 'Drinks', isVeg: true },
      { name: 'Fresh Lime Soda', price: 49, category: 'Drinks', isVeg: true },
    ],
  },
  {
    name: 'Sothern',
    description: 'Authentic South Indian comfort food — dosas, idlis and filter coffee done right.',
    location: 'Canteen Block, Ground Floor',
    timings: '7:30 AM – 4:00 PM',
    isOpen: true,
    menu: [
      { name: 'Plain Dosa', price: 49, category: 'Dosa', isVeg: true },
      { name: 'Masala Dosa', price: 69, category: 'Dosa', isVeg: true },
      { name: 'Rava Dosa', price: 79, category: 'Dosa', isVeg: true },
      { name: 'Idli (2 pcs)', price: 39, category: 'Breakfast', isVeg: true },
      { name: 'Vada (2 pcs)', price: 45, category: 'Breakfast', isVeg: true },
      { name: 'Sambar Rice', price: 59, category: 'Rice', isVeg: true },
      { name: 'Curd Rice', price: 55, category: 'Rice', isVeg: true },
      { name: 'Filter Coffee', price: 29, category: 'Drinks', isVeg: true },
    ],
  },
  {
    name: 'House of Chow',
    description: 'Indo-Chinese street food — noodles, momos and fried rice that hit the spot every time.',
    location: 'Food Court, Block C',
    timings: '11:00 AM – 9:30 PM',
    isOpen: true,
    menu: [
      { name: 'Veg Hakka Noodles', price: 89, category: 'Noodles', isVeg: true },
      { name: 'Chicken Chow Mein', price: 119, category: 'Noodles', isVeg: false },
      { name: 'Veg Fried Rice', price: 79, category: 'Rice', isVeg: true },
      { name: 'Egg Fried Rice', price: 99, category: 'Rice', isVeg: false },
      { name: 'Veg Momos (6 pcs)', price: 79, category: 'Momos', isVeg: true },
      { name: 'Chicken Momos (6 pcs)', price: 109, category: 'Momos', isVeg: false },
      { name: 'Manchurian (Dry)', price: 99, category: 'Starters', isVeg: true },
      { name: 'Chilli Chicken', price: 139, category: 'Starters', isVeg: false },
    ],
  },
  {
    name: 'Quench',
    description: 'Fresh juices, smoothies, shakes and healthy bites to keep you energised through the day.',
    location: 'Near Main Gate',
    timings: '8:00 AM – 8:00 PM',
    isOpen: true,
    menu: [
      { name: 'Fresh Orange Juice', price: 59, category: 'Juice', isVeg: true },
      { name: 'Watermelon Juice', price: 49, category: 'Juice', isVeg: true },
      { name: 'Mixed Fruit Smoothie', price: 89, category: 'Smoothie', isVeg: true },
      { name: 'Mango Shake', price: 79, category: 'Shake', isVeg: true },
      { name: 'Chocolate Shake', price: 89, category: 'Shake', isVeg: true },
      { name: 'Fruit Bowl', price: 69, category: 'Snacks', isVeg: true },
      { name: 'Granola Bar', price: 39, category: 'Snacks', isVeg: true },
      { name: 'Lemonade', price: 39, category: 'Juice', isVeg: true },
    ],
  },
  {
    name: 'Snapeates',
    description: 'Quick bites, sandwiches, rolls and chai — perfect for a snack between classes.',
    location: 'Block D, Near Library',
    timings: '8:00 AM – 7:00 PM',
    isOpen: true,
    menu: [
      { name: 'Veg Club Sandwich', price: 69, category: 'Sandwich', isVeg: true },
      { name: 'Chicken Sandwich', price: 89, category: 'Sandwich', isVeg: false },
      { name: 'Paneer Roll', price: 79, category: 'Roll', isVeg: true },
      { name: 'Egg Roll', price: 69, category: 'Roll', isVeg: false },
      { name: 'Samosa (2 pcs)', price: 29, category: 'Snacks', isVeg: true },
      { name: 'Bread Pakora', price: 35, category: 'Snacks', isVeg: true },
      { name: 'Masala Chai', price: 19, category: 'Drinks', isVeg: true },
      { name: 'Maggi', price: 49, category: 'Snacks', isVeg: true },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let admin = await User.findOne({ email: ADMIN.email });
  if (!admin) {
    admin = await User.create(ADMIN);
    console.log('Admin created:', ADMIN.email, '| Password:', ADMIN.password);
  } else {
    console.log('Admin already exists:', admin.email);
  }

  await Club.deleteMany({});
  await Event.deleteMany({});
  await FoodOutlet.deleteMany({});
  console.log('Cleared existing clubs, events and food outlets');

  const clubs = await Club.insertMany(CLUBS.map(c => ({ ...c, createdBy: admin._id })));
  console.log(`Seeded ${clubs.length} clubs`);

  const events = await Event.insertMany(EVENTS.map(e => ({ ...e, createdBy: admin._id })));
  console.log(`Seeded ${events.length} events`);

  const outlets = await FoodOutlet.insertMany(FOOD_OUTLETS.map(f => ({ ...f, createdBy: admin._id })));
  console.log(`Seeded ${outlets.length} food outlets`);

  console.log('\n--- DONE ---');
  console.log('Admin Login -> Email:', ADMIN.email, '| Password:', ADMIN.password);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
