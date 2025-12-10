const admin = require('firebase-admin')

// Initialize Firebase Admin
// You'll need to add your firebase-service-account.json file to the root directory
// You can download it from Firebase Console > Project Settings > Service Accounts
try {
  const serviceAccount = require('../firebase-service-account.json')
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
} catch (error) {
  console.error('❌ Firebase service account key not found!')
  console.log('Please download your Firebase service account key from:')
  console.log('Firebase Console > Project Settings > Service Accounts > Generate new private key')
  console.log('Then save it as firebase-service-account.json in the root directory.')
  process.exit(1)
}

const db = admin.firestore()

// Sample questions data - Expanded to 50+ questions
const questions = [
  // Math - Easy (10 questions)
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "2 + 2 equals 4. This is basic arithmetic addition.",
  },
  {
    question: "What is 10 - 3?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "10 - 3 equals 7. This is basic subtraction.",
  },
  {
    question: "What is 5 × 3?",
    options: ["12", "15", "18", "20"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "5 × 3 equals 15. This is basic multiplication.",
  },
  {
    question: "What is 20 ÷ 4?",
    options: ["4", "5", "6", "7"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "20 ÷ 4 equals 5. This is basic division.",
  },
  {
    question: "What is 7 + 8?",
    options: ["14", "15", "16", "17"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "7 + 8 equals 15.",
  },
  {
    question: "What is 9 × 9?",
    options: ["72", "81", "90", "99"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "9 × 9 equals 81.",
  },
  {
    question: "What is 100 ÷ 10?",
    options: ["5", "10", "15", "20"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "100 ÷ 10 equals 10.",
  },
  {
    question: "What is 6 × 7?",
    options: ["36", "42", "48", "54"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Math",
    explanation: "6 × 7 equals 42.",
  },
  {
    question: "What is 25 - 12?",
    options: ["11", "12", "13", "14"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Math",
    explanation: "25 - 12 equals 13.",
  },
  {
    question: "What is 4 × 4?",
    options: ["12", "14", "16", "18"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Math",
    explanation: "4 × 4 equals 16.",
  },

  // Math - Medium (10 questions)
  {
    question: "What is 15% of 200?",
    options: ["20", "30", "40", "50"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "15% of 200 = (15/100) × 200 = 30",
  },
  {
    question: "Solve for x: 2x + 3 = 7",
    options: ["x = 1", "x = 2", "x = 3", "x = 4"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "2x + 3 = 7 → 2x = 4 → x = 2",
  },
  {
    question: "What is the area of a rectangle with length 8 and width 5?",
    options: ["35", "36", "40", "45"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Math",
    explanation: "Area = length × width = 8 × 5 = 40",
  },
  {
    question: "What is 25% of 80?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "25% of 80 = (25/100) × 80 = 20",
  },
  {
    question: "Solve for y: 3y - 5 = 10",
    options: ["y = 3", "y = 5", "y = 7", "y = 9"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "3y - 5 = 10 → 3y = 15 → y = 5",
  },
  {
    question: "What is the perimeter of a square with side 6?",
    options: ["18", "24", "30", "36"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "Perimeter = 4 × side = 4 × 6 = 24",
  },
  {
    question: "What is 40% of 150?",
    options: ["50", "55", "60", "65"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Math",
    explanation: "40% of 150 = (40/100) × 150 = 60",
  },
  {
    question: "Solve: 5x = 35",
    options: ["x = 5", "x = 6", "x = 7", "x = 8"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Math",
    explanation: "5x = 35 → x = 35 ÷ 5 = 7",
  },
  {
    question: "What is the area of a triangle with base 10 and height 8?",
    options: ["35", "40", "45", "50"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "Area = (base × height) ÷ 2 = (10 × 8) ÷ 2 = 40",
  },
  {
    question: "What is 12.5% of 400?",
    options: ["45", "50", "55", "60"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Math",
    explanation: "12.5% of 400 = (12.5/100) × 400 = 50",
  },

  // Math - Hard (5 questions)
  {
    question: "What is the derivative of x³ + 2x²?",
    options: ["3x² + 4x", "3x² + 2x", "x² + 4x", "3x + 4"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Math",
    explanation: "Using power rule: d/dx(x³) = 3x² and d/dx(2x²) = 4x, so the answer is 3x² + 4x",
  },
  {
    question: "What is the integral of 2x dx?",
    options: ["x²", "x² + C", "2x² + C", "x²/2 + C"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Math",
    explanation: "∫2x dx = x² + C, where C is the constant of integration.",
  },
  {
    question: "What is the derivative of sin(x)?",
    options: ["cos(x)", "-sin(x)", "tan(x)", "-cos(x)"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Math",
    explanation: "The derivative of sin(x) is cos(x).",
  },
  {
    question: "What is the integral of e^x dx?",
    options: ["e^x", "e^x + C", "x e^x", "ln|x| + C"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Math",
    explanation: "∫e^x dx = e^x + C",
  },
  {
    question: "What is the limit of (x² - 1)/(x - 1) as x approaches 1?",
    options: ["0", "1", "2", "undefined"],
    correctAnswer: 2,
    difficulty: "hard",
    category: "Math",
    explanation: "By factoring: (x-1)(x+1)/(x-1) = x+1, so limit is 2",
  },

  // Geography - Easy (8 questions)
  {
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Geography",
    explanation: "Paris is the capital and largest city of France.",
  },
  {
    question: "Which continent is Australia on?",
    options: ["Asia", "Europe", "Australia", "Africa"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Geography",
    explanation: "Australia is both a country and a continent.",
  },
  {
    question: "What is the largest ocean in the world?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Geography",
    explanation: "The Pacific Ocean is the largest ocean, covering about one-third of Earth's surface.",
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Geography",
    explanation: "Tokyo is the capital of Japan.",
  },
  {
    question: "Which is the longest river in Asia?",
    options: ["Ganges", "Yangtze", "Mekong", "Indus"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Geography",
    explanation: "The Yangtze River is the longest river in Asia.",
  },
  {
    question: "What is the capital of Brazil?",
    options: ["Buenos Aires", "Rio de Janeiro", "São Paulo", "Brasília"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Geography",
    explanation: "Brasília is the capital of Brazil.",
  },
  {
    question: "Which continent is known as the 'Dark Continent'?",
    options: ["Asia", "Africa", "South America", "Australia"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Geography",
    explanation: "Africa is sometimes called the 'Dark Continent' due to its mysterious interior in early exploration.",
  },
  {
    question: "What is the capital of Canada?",
    options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Geography",
    explanation: "Ottawa is the capital of Canada.",
  },

  // Geography - Medium (6 questions)
  {
    question: "Which river is the longest in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Geography",
    explanation: "The Nile River is generally considered the longest river in the world.",
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Geography",
    explanation: "Vatican City is the smallest country in the world by land area.",
  },
  {
    question: "Which desert is the largest in the world?",
    options: ["Sahara", "Gobi", "Kalahari", "Atacama"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Geography",
    explanation: "The Sahara Desert is the largest hot desert in the world.",
  },
  {
    question: "What is the highest mountain in the world?",
    options: ["K2", "Kangchenjunga", "Lhotse", "Mount Everest"],
    correctAnswer: 3,
    difficulty: "medium",
    category: "Geography",
    explanation: "Mount Everest is the highest mountain in the world at 8,848 meters.",
  },
  {
    question: "Which lake is the largest by surface area?",
    options: ["Lake Superior", "Caspian Sea", "Lake Victoria", "Lake Huron"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Geography",
    explanation: "The Caspian Sea is the largest lake by surface area.",
  },
  {
    question: "What is the capital of South Africa?",
    options: ["Cape Town", "Johannesburg", "Pretoria", "Durban"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Geography",
    explanation: "Pretoria is one of the three capital cities of South Africa (administrative capital).",
  },

  // Science - Easy (8 questions)
  {
    question: "What planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Science",
    explanation: "Mercury is the smallest and closest planet to the Sun in our solar system.",
  },
  {
    question: "What gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Science",
    explanation: "Plants absorb carbon dioxide during photosynthesis.",
  },
  {
    question: "What is H2O commonly known as?",
    options: ["Salt", "Water", "Sugar", "Acid"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Science",
    explanation: "H2O is the chemical formula for water.",
  },
  {
    question: "How many bones are in the adult human body?",
    options: ["206", "208", "210", "212"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Science",
    explanation: "The adult human body has 206 bones.",
  },
  {
    question: "What is the chemical symbol for oxygen?",
    options: ["O", "Ox", "Oy", "Oz"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Science",
    explanation: "O is the chemical symbol for oxygen.",
  },
  {
    question: "Which organ pumps blood in the human body?",
    options: ["Liver", "Kidney", "Heart", "Lung"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Science",
    explanation: "The heart pumps blood throughout the human body.",
  },
  {
    question: "What is the boiling point of water at sea level?",
    options: ["90°C", "95°C", "100°C", "105°C"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Science",
    explanation: "Water boils at 100°C at standard atmospheric pressure.",
  },
  {
    question: "Which vitamin is produced when skin is exposed to sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Science",
    explanation: "Vitamin D is produced in the skin when exposed to UVB rays from sunlight.",
  },

  // Science - Medium (6 questions)
  {
    question: "Which of these is NOT a renewable energy source?",
    options: ["Solar", "Wind", "Coal", "Hydro"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Science",
    explanation: "Coal is a fossil fuel and non-renewable energy source. Solar, wind, and hydro are renewable.",
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Science",
    explanation: "Au is the chemical symbol for gold, from the Latin word 'aurum'.",
  },
  {
    question: "What is the pH of pure water?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Science",
    explanation: "Pure water has a pH of 7, which is neutral.",
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Beryllium"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Science",
    explanation: "Hydrogen has the atomic number 1.",
  },
  {
    question: "What is the chemical formula for table salt?",
    options: ["NaCl", "KCl", "CaCl2", "MgCl2"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Science",
    explanation: "NaCl is the chemical formula for sodium chloride, which is table salt.",
  },
  {
    question: "Which blood type is known as the universal donor?",
    options: ["A", "B", "AB", "O"],
    correctAnswer: 3,
    difficulty: "medium",
    category: "Science",
    explanation: "Type O negative blood is known as the universal donor.",
  },

  // Science - Hard (4 questions)
  {
    question: "Which process do plants use to convert sunlight into chemical energy?",
    options: ["Respiration", "Photosynthesis", "Fermentation", "Osmosis"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Science",
    explanation: "Photosynthesis is the process where plants convert sunlight into glucose (chemical energy).",
  },
  {
    question: "What is the speed of light in vacuum?",
    options: ["300,000 km/s", "299,792,458 m/s", "150,000 km/s", "186,000 miles/s"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Science",
    explanation: "The speed of light in vacuum is exactly 299,792,458 meters per second.",
  },
  {
    question: "What is Avogadro's number?",
    options: ["6.022 × 10²³", "3.141 × 10²³", "1.602 × 10²³", "9.109 × 10²³"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science",
    explanation: "Avogadro's number is 6.022 × 10²³ particles per mole.",
  },
  {
    question: "Which particle is responsible for mediating the strong nuclear force?",
    options: ["Photon", "Gluon", "W boson", "Graviton"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Science",
    explanation: "Gluons are the particles that mediate the strong nuclear force.",
  },

  // History - Easy (6 questions)
  {
    question: "In what year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "History",
    explanation: "World War II ended in 1945 with the surrender of Japan.",
  },
  {
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "History",
    explanation: "George Washington was the first President of the United States, serving from 1789 to 1797.",
  },
  {
    question: "In what year did the United States declare independence?",
    options: ["1775", "1776", "1777", "1778"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "History",
    explanation: "The United States declared independence from Britain on July 4, 1776.",
  },
  {
    question: "Who was the first man to walk on the moon?",
    options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "History",
    explanation: "Neil Armstrong was the first man to walk on the moon during the Apollo 11 mission in 1969.",
  },
  {
    question: "In what year did Christopher Columbus reach the Americas?",
    options: ["1490", "1492", "1494", "1496"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "History",
    explanation: "Christopher Columbus reached the Americas in 1492.",
  },
  {
    question: "Which ancient civilization built the Colosseum?",
    options: ["Greeks", "Egyptians", "Romans", "Persians"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "History",
    explanation: "The Romans built the Colosseum in Rome.",
  },

  // History - Medium (4 questions)
  {
    question: "In what year did the Titanic sink?",
    options: ["1912", "1915", "1920", "1905"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History",
    explanation: "The RMS Titanic sank in 1912 after hitting an iceberg on April 15.",
  },
  {
    question: "Which ancient civilization built the pyramids at Giza?",
    options: ["Romans", "Greeks", "Egyptians", "Mayans"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "History",
    explanation: "The ancient Egyptians built the pyramids at Giza around 2580–2565 BC.",
  },
  {
    question: "In what year did the Berlin Wall fall?",
    options: ["1987", "1988", "1989", "1990"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "History",
    explanation: "The Berlin Wall fell in 1989, leading to the reunification of Germany.",
  },
  {
    question: "Who was the British Prime Minister during most of World War II?",
    options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "History",
    explanation: "Winston Churchill was the British Prime Minister during most of World War II.",
  },

  // Literature - Easy (4 questions)
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Literature",
    explanation: "William Shakespeare wrote 'Romeo and Juliet' around 1595.",
  },
  {
    question: "What is the name of the lion in 'The Lion, the Witch and the Wardrobe'?",
    options: ["Simba", "Aslan", "Mufasa", "Scar"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Literature",
    explanation: "Aslan is the noble lion in C.S. Lewis's 'The Lion, the Witch and the Wardrobe'.",
  },
  {
    question: "Who wrote 'Harry Potter and the Philosopher's Stone'?",
    options: ["Roald Dahl", "J.K. Rowling", "Enid Blyton", "Beatrix Potter"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Literature",
    explanation: "J.K. Rowling wrote the Harry Potter series.",
  },
  {
    question: "What is the first book in the 'Lord of the Rings' trilogy?",
    options: ["The Two Towers", "The Return of the King", "The Fellowship of the Ring", "The Hobbit"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Literature",
    explanation: "'The Fellowship of the Ring' is the first book in J.R.R. Tolkien's Lord of the Rings trilogy.",
  },

  // Literature - Medium (3 questions)
  {
    question: "Who wrote 'Pride and Prejudice'?",
    options: ["Emily Brontë", "Charlotte Brontë", "Jane Austen", "George Eliot"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Literature",
    explanation: "Jane Austen wrote 'Pride and Prejudice' in 1813.",
  },
  {
    question: "Which poet wrote 'The Road Not Taken'?",
    options: ["Walt Whitman", "Robert Frost", "Emily Dickinson", "Langston Hughes"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Literature",
    explanation: "Robert Frost wrote 'The Road Not Taken' in 1916.",
  },
  {
    question: "Who wrote '1984'?",
    options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "Margaret Atwood"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Literature",
    explanation: "George Orwell wrote '1984' in 1949.",
  },
  {
    question: "Which novel begins with 'Call me Ishmael'?",
    options: ["The Scarlet Letter", "Moby-Dick", "The Great Gatsby", "The Catcher in the Rye"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Literature",
    explanation: "Moby-Dick by Herman Melville begins with 'Call me Ishmael'.",
  },
  {
    question: "Who wrote 'The Great Gatsby'?",
    options: ["Ernest Hemingway", "F. Scott Fitzgerald", "John Steinbeck", "William Faulkner"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "Literature",
    explanation: "F. Scott Fitzgerald wrote 'The Great Gatsby' in 1925.",
  },

  // Literature - Hard (3 questions)
  {
    question: "Who wrote 'One Hundred Years of Solitude'?",
    options: ["Jorge Luis Borges", "Gabriel García Márquez", "Pablo Neruda", "Julio Cortázar"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Literature",
    explanation: "'One Hundred Years of Solitude' is a masterpiece by Colombian author Gabriel García Márquez.",
  },
  {
    question: "Which author wrote 'Ulysses'?",
    options: ["T.S. Eliot", "Ezra Pound", "James Joyce", "Virginia Woolf"],
    correctAnswer: 2,
    difficulty: "hard",
    category: "Literature",
    explanation: "James Joyce wrote 'Ulysses' in 1922.",
  },
  {
    question: "Who wrote 'The Sound and the Fury'?",
    options: ["Ernest Hemingway", "John Steinbeck", "William Faulkner", "John Dos Passos"],
    correctAnswer: 2,
    difficulty: "hard",
    category: "Literature",
    explanation: "William Faulkner wrote 'The Sound and the Fury' in 1929.",
  },

  // Programming - Easy (8 questions)
  {
    question: "What does HTML stand for?",
    options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Programming",
    explanation: "HTML stands for HyperText Markup Language, the standard markup language for creating web pages.",
  },
  {
    question: "Which symbol is used for comments in JavaScript?",
    options: ["//", "/*", "#", "<!--"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Programming",
    explanation: "// is used for single-line comments in JavaScript.",
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "Programming",
    explanation: "CSS stands for Cascading Style Sheets, used for describing the presentation of web pages.",
  },
  {
    question: "Which of these is a JavaScript data type?",
    options: ["string", "boolean", "number", "All of the above"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Programming",
    explanation: "JavaScript has primitive data types including string, boolean, and number.",
  },
  {
    question: "What is the correct way to declare a variable in JavaScript?",
    options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Programming",
    explanation: "In JavaScript, variables can be declared using var, let, or const keywords.",
  },
  {
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Programming",
    explanation: "The <a> tag (anchor tag) is used to create hyperlinks in HTML.",
  },
  {
    question: "What does SQL stand for?",
    options: ["Simple Query Language", "Structured Query Language", "Standard Query Language", "System Query Language"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "Programming",
    explanation: "SQL stands for Structured Query Language, used for managing relational databases.",
  },
  {
    question: "Which programming paradigm does JavaScript primarily follow?",
    options: ["Object-oriented", "Functional", "Procedural", "All of the above"],
    correctAnswer: 3,
    difficulty: "easy",
    category: "Programming",
    explanation: "JavaScript supports multiple programming paradigms including object-oriented, functional, and procedural programming.",
  },

  // Programming - Medium (6 questions)
  {
    question: "Which of these is NOT a JavaScript data type?",
    options: ["string", "boolean", "integer", "undefined"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Programming",
    explanation: "JavaScript has number type, not integer. The others (string, boolean, undefined) are valid data types.",
  },
  {
    question: "What is the purpose of the 'use strict' directive in JavaScript?",
    options: ["Enables strict mode", "Disables error checking", "Speeds up execution", "Enables debugging"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Programming",
    explanation: "'use strict' enables strict mode in JavaScript, which catches common coding mistakes and prevents certain actions.",
  },
  {
    question: "Which HTTP method is used to retrieve data from a server?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Programming",
    explanation: "The GET method is used to retrieve data from a server.",
  },
  {
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Interface"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Programming",
    explanation: "API stands for Application Programming Interface, a set of rules and protocols for accessing a software application.",
  },
  {
    question: "Which CSS property is used to change the text color?",
    options: ["font-color", "text-color", "color", "foreground-color"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Programming",
    explanation: "The 'color' property is used to set the color of text in CSS.",
  },
  {
    question: "What is the difference between '==' and '===' in JavaScript?",
    options: ["No difference", "=== is for strings only", "'==' compares values, '===' compares values and types", "'===' is deprecated"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "Programming",
    explanation: "'==' performs type coercion while comparing, '===' compares both value and type without coercion.",
  },

  // Programming - Hard (4 questions)
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Programming",
    explanation: "Binary search has O(log n) time complexity as it divides the search space in half each time.",
  },
  {
    question: "Which sorting algorithm has the best average case time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Programming",
    explanation: "Quick Sort has an average time complexity of O(n log n), which is optimal for comparison-based sorting.",
  },
  {
    question: "What is a closure in JavaScript?",
    options: ["A way to close browser windows", "A function that has access to variables in its outer scope", "A method to close database connections", "A type of loop"],
    correctAnswer: 1,
    difficulty: "hard",
    category: "Programming",
    explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
  },
  {
    question: "What is the purpose of the 'async' and 'await' keywords in JavaScript?",
    options: ["To create asynchronous functions", "To handle promises synchronously", "Both A and B", "To create multi-threaded code"],
    correctAnswer: 2,
    difficulty: "hard",
    category: "Programming",
    explanation: "'async' and 'await' are used to work with asynchronous code and promises in a synchronous-like manner.",
  },

  // General Knowledge - Easy (5 questions)
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "General Knowledge",
    explanation: "There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Australia, and South America.",
  },
  {
    question: "What is the currency used in Japan?",
    options: ["Won", "Yen", "Ringgit", "Baht"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "General Knowledge",
    explanation: "The Japanese Yen (¥) is the official currency of Japan.",
  },
  {
    question: "Which sport is known as 'America's Pastime'?",
    options: ["Basketball", "Football", "Baseball", "Soccer"],
    correctAnswer: 2,
    difficulty: "easy",
    category: "General Knowledge",
    explanation: "Baseball is often called 'America's Pastime' due to its long history and popularity in the United States.",
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "General Knowledge",
    explanation: "The Blue Whale is the largest mammal, growing up to 100 feet long and weighing up to 200 tons.",
  },
  {
    question: "Which planet is known as the 'Red Planet'?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    difficulty: "easy",
    category: "General Knowledge",
    explanation: "Mars is known as the 'Red Planet' due to its reddish appearance caused by iron oxide on its surface.",
  },

  // General Knowledge - Medium (4 questions)
  {
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "General Knowledge",
    explanation: "Canberra is the capital city of Australia.",
  },
  {
    question: "Which element has the chemical symbol 'Fe'?",
    options: ["Fluorine", "Iron", "Fermium", "Francium"],
    correctAnswer: 1,
    difficulty: "medium",
    category: "General Knowledge",
    explanation: "Fe is the chemical symbol for Iron.",
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "General Knowledge",
    explanation: "Diamond is the hardest natural substance on Earth.",
  },
  {
    question: "Which country is known as the 'Land of the Rising Sun'?",
    options: ["China", "Thailand", "Japan", "South Korea"],
    correctAnswer: 2,
    difficulty: "medium",
    category: "General Knowledge",
    explanation: "Japan is known as the 'Land of the Rising Sun'.",
  },

  // General Knowledge - Hard (3 questions)
  {
    question: "What is the smallest bone in the human body?",
    options: ["Stapes", "Incus", "Malleus", "Femur"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "General Knowledge",
    explanation: "The stapes is the smallest bone in the human body, located in the middle ear.",
  },
  {
    question: "Which country has the most natural lakes?",
    options: ["Canada", "Russia", "Finland", "Sweden"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "General Knowledge",
    explanation: "Canada has the most natural lakes in the world, with over 30,000 lakes.",
  },
  {
    question: "What is the rarest blood type?",
    options: ["A", "B", "AB", "AB negative"],
    correctAnswer: 3,
    difficulty: "hard",
    category: "General Knowledge",
    explanation: "AB negative is the rarest blood type, occurring in only about 0.6% of the population.",
  },
]

async function seedQuestions() {
  console.log('🌱 Starting to seed questions...')

  try {
    const batch = db.batch()
    const questionsRef = db.collection('questions')

    questions.forEach((question) => {
      const docRef = questionsRef.doc()
      batch.set(docRef, {
        ...question,
        createdAt: admin.firestore.Timestamp.now(),
      })
    })

    await batch.commit()
    console.log(`✅ Successfully seeded ${questions.length} questions!`)
  } catch (error) {
    console.error('❌ Error seeding questions:', error)
  }
}

// Run the seeder
seedQuestions()
  .then(() => {
    console.log('🎉 Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
