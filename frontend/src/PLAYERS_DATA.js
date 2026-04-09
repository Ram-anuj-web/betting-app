// IPL 2026 - Squad Data for 8 teams (CSK, MI, RCB, KKR, SRH, DC, LSG, RR)
// Photos sourced from official IPL website (iplt20.com)
// URL pattern: https://documents.iplt20.com/ipl/IPLHeadshot2026/{player_id}.png
// Role: BAT | BOWL | AR (All-Rounder) | WK (Wicketkeeper-Batter)
// ✅ Verified against iplt20.com official squad pages (April 2026)

const BASE = "https://documents.iplt20.com/ipl/IPLHeadshot2026/";
const p = (id) => `${BASE}${id}.png`;

const PLAYERS_DATA = {
  CSK: {
    name: "Chennai Super Kings",
    shortName: "CSK",
    color: "#F9CD1C",
    textColor: "#1A1A1A",
    players: [
      // Batters
      { name: "Ruturaj Gaikwad",    role: "BAT",  photo: p(5443)  },
      { name: "MS Dhoni",           role: "WK",   photo: p(1)     },
      { name: "Sanju Samson",       role: "WK",   photo: p(258)   },
      { name: "Dewald Brevis",      role: "BAT",  photo: p(20593) },
      { name: "Ayush Mhatre",       role: "BAT",  photo: p(22377) },
      { name: "Kartik Sharma",      role: "WK",   photo: p(23012) }, // WK-Batter (₹14.20cr uncapped)
      { name: "Sarfaraz Khan",      role: "BAT",  photo: p(1564)  },
      { name: "Urvil Patel",        role: "WK",   photo: p(5653)  },
      // All Rounders
      { name: "Jamie Overton",      role: "AR",   photo: p(22109) },
      { name: "Ramakrishna Ghosh",  role: "AR",   photo: p(22153) },
      { name: "Prashant Veer",      role: "AR",   photo: p(23008) }, // ₹14.20cr uncapped
      { name: "Matthew Short",      role: "AR",   photo: p(2032)  },
      { name: "Aman Khan",          role: "AR",   photo: p(20581) },
      { name: "Zak Foulkes",        role: "AR",   photo: p(23022) },
      { name: "Shivam Dube",        role: "AR",   photo: p(5431)  },
      // Bowlers
      { name: "Khaleel Ahmed",      role: "BOWL", photo: p(2964)  },
      { name: "Noor Ahmad",         role: "BOWL", photo: p(20590) },
      { name: "Anshul Kamboj",      role: "BOWL", photo: p(20702) }, // ✅ BOWL not AR
      { name: "Mukesh Choudhary",   role: "BOWL", photo: p(20575) },
      { name: "Shreyas Gopal",      role: "BOWL", photo: p(20696) },
      { name: "Gurjapneet Singh",   role: "BOWL", photo: p(22032) },
      { name: "Akeal Hosein",       role: "BOWL", photo: p(5608)  },
      { name: "Matt Henry",         role: "BOWL", photo: p(1505)  },
      { name: "Rahul Chahar",       role: "BOWL", photo: p(3763)  },
      { name: "Spencer Johnson",    role: "BOWL", photo: p(20699) }, // ✅ Replaces Nathan Ellis
    ],
  },

  MI: {
    name: "Mumbai Indians",
    shortName: "MI",
    color: "#004BA0",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "Rohit Sharma",        role: "BAT",  photo: p(107)   },
      { name: "Suryakumar Yadav",    role: "BAT",  photo: p(108)   },
      { name: "Robin Minz",          role: "WK",   photo: p(20707) },
      { name: "Sherfane Rutherford", role: "BAT",  photo: p(5396)  },
      { name: "Ryan Rickelton",      role: "WK",   photo: p(22003) },
      { name: "Quinton de Kock",     role: "WK",   photo: p(834)   },
      { name: "Danish Malewar",      role: "BAT",  photo: p(23031) },
      { name: "Tilak Varma",         role: "BAT",  photo: p(20594) },
      // All Rounders
      { name: "Hardik Pandya",       role: "AR",   photo: p(2740)  },
      { name: "Naman Dhir",          role: "AR",   photo: p(20701) },
      { name: "Mitchell Santner",    role: "AR",   photo: p(1903)  },
      { name: "Raj Angad Bawa",      role: "AR",   photo: p(20601) },
      { name: "Atharva Ankolekar",   role: "AR",   photo: p(23108) },
      { name: "Mayank Rawat",        role: "AR",   photo: p(23038) },
      { name: "Corbin Bosch",        role: "AR",   photo: p(20680) },
      { name: "Will Jacks",          role: "AR",   photo: p(5629)  },
      { name: "Shardul Thakur",      role: "AR",   photo: p(1745)  },
      // Bowlers
      { name: "Trent Boult",         role: "BOWL", photo: p(969)   },
      { name: "Mayank Markande",     role: "BOWL", photo: p(4951)  },
      { name: "Deepak Chahar",       role: "BOWL", photo: p(140)   },
      { name: "Ashwani Kumar",       role: "BOWL", photo: p(22030) },
      { name: "Raghu Sharma",        role: "BOWL", photo: p(22379) }, // ✅ Added
      { name: "Mohammad Izhar",      role: "BOWL", photo: p(23045) }, // ✅ Added
      { name: "Allah Ghazanfar",     role: "BOWL", photo: p(20725) }, // ✅ Added
      { name: "Jasprit Bumrah",      role: "BOWL", photo: p(1124)  },
    ],
  },

  RCB: {
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    color: "#EC1C24",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "Rajat Patidar",      role: "BAT",  photo: p(5471)  },
      { name: "Devdutt Padikkal",   role: "BAT",  photo: p(5430)  },
      { name: "Virat Kohli",        role: "BAT",  photo: p(164)   },
      { name: "Phil Salt",          role: "WK",   photo: p(5606)  },
      { name: "Jitesh Sharma",      role: "WK",   photo: p(3185)  },
      { name: "Jordan Cox",         role: "WK",   photo: p(23023) },
      // All Rounders
      { name: "Krunal Pandya",      role: "AR",   photo: p(3183)  },
      { name: "Swapnil Singh",      role: "AR",   photo: p(3180)  }, // ✅ Added
      { name: "Tim David",          role: "AR",   photo: p(4524)  },
      { name: "Romario Shepherd",   role: "AR",   photo: p(20609) },
      { name: "Jacob Bethell",      role: "AR",   photo: p(22074) },
      { name: "Venkatesh Iyer",     role: "AR",   photo: p(8540)  },
      { name: "Satvik Deswal",      role: "AR",   photo: p(23036) }, // ✅ Added
      { name: "Mangesh Yadav",      role: "AR",   photo: p(23040) },
      { name: "Vicky Ostwal",       role: "AR",   photo: p(20624) },
      { name: "Vihaan Malhotra",    role: "AR",   photo: p(23150) }, // ✅ Added
      { name: "Kanishk Chouhan",    role: "AR",   photo: p(23168) }, // ✅ Added
      // Bowlers
      { name: "Josh Hazlewood",     role: "BOWL", photo: p(857)   },
      { name: "Rasikh Dar",         role: "BOWL", photo: p(20577) },
      { name: "Suyash Sharma",      role: "BOWL", photo: p(5668)  },
      { name: "Bhuvneshwar Kumar",  role: "BOWL", photo: p(116)   },
      { name: "Nuwan Thushara",     role: "BOWL", photo: p(20700) },
      { name: "Abhinandan Singh",   role: "BOWL", photo: p(22136) }, // ✅ Added
      { name: "Jacob Duffy",        role: "BOWL", photo: p(23003) },
      { name: "Yash Dayal",         role: "BOWL", photo: p(20591) },
    ],
  },

  KKR: {
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    color: "#3A225D",
    textColor: "#F2C94C",
    players: [
      // Batters
      { name: "Ajinkya Rahane",       role: "BAT",  photo: p(135)   },
      { name: "Rinku Singh",          role: "BAT",  photo: p(3830)  },
      { name: "Angkrish Raghuvanshi", role: "BAT",  photo: p(20690) },
      { name: "Manish Pandey",        role: "BAT",  photo: p(123)   },
      { name: "Cameron Green",        role: "BAT",  photo: p(5602)  },
      { name: "Finn Allen",           role: "WK",   photo: p(3020)  },
      { name: "Rahul Tripathi",       role: "BAT",  photo: p(3838)  },
      { name: "Tim Seifert",          role: "WK",   photo: p(1619)  },
      { name: "Rovman Powell",        role: "BAT",  photo: p(3333)  },
      // All Rounders
      { name: "Anukul Roy",           role: "AR",   photo: p(3774)  },
      { name: "Rachin Ravindra",      role: "AR",   photo: p(20684) },
      { name: "Ramandeep Singh",      role: "AR",   photo: p(20595) },
      // Bowlers  ✅ Sunil Narine listed as BOWL on official site; Varun Chakravarthy BOWL
      { name: "Vaibhav Arora",        role: "BOWL", photo: p(14859) },
      { name: "Matheesha Pathirana",  role: "BOWL", photo: p(20627) },
      { name: "Kartik Tyagi",         role: "BOWL", photo: p(10059) },
      { name: "Prashant Solanki",     role: "BOWL", photo: p(20576) }, // ✅ Replaces Umran Malik (not in official squad)
      { name: "Akash Deep",           role: "BOWL", photo: p(14800) }, // ✅ Added
      { name: "Harshit Rana",         role: "BOWL", photo: p(20626) },
      { name: "Umran Malik",          role: "BOWL", photo: p(15154) },
      { name: "Sunil Narine",         role: "BOWL", photo: p(203)   }, // ✅ BOWL per official site
      { name: "Varun Chakravarthy",   role: "BOWL", photo: p(5432)  },
    ],
  },

  SRH: {
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    color: "#F26522",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "Ishan Kishan",       role: "WK",   photo: p(2975)  },
      { name: "Aniket Verma",       role: "BAT",  photo: p(22082) },
      { name: "Smaran Ravichandran",role: "BAT",  photo: p(22378) }, // ✅ Added
      { name: "Salil Arora",        role: "WK",   photo: p(23041) }, // ✅ Added
      { name: "Heinrich Klaasen",   role: "WK",   photo: p(3869)  },
      { name: "Travis Head",        role: "BAT",  photo: p(1020)  },
      // All Rounders
      { name: "Harshal Patel",      role: "AR",   photo: p(157)   },
      { name: "Kamindu Mendis",     role: "AR",   photo: p(22077) },
      { name: "Harsh Dubey",        role: "AR",   photo: p(22381) },
      { name: "Brydon Carse",       role: "AR",   photo: p(22075) },
      { name: "Shivang Kumar",      role: "AR",   photo: p(23006) }, // ✅ Added
      { name: "Liam Livingstone",   role: "AR",   photo: p(3644)  },
      { name: "Jack Edwards",       role: "AR",   photo: p(23200) },
      { name: "Abhishek Sharma",    role: "AR",   photo: p(3760)  },
      { name: "Nitish Kumar Reddy", role: "AR",   photo: p(5711)  },
      // Bowlers  ✅ Mayank Yadav removed (he's in LSG); added correct SRH bowlers
      { name: "Pat Cummins",        role: "BOWL", photo: p(488)   },
      { name: "Zeeshan Ansari",     role: "BOWL", photo: p(22007) },
      { name: "Jaydev Unadkat",     role: "BOWL", photo: p(86)    },
      { name: "Shivam Mavi",        role: "BOWL", photo: p(3779)  },
    ],
  },

  DC: {
    name: "Delhi Capitals",
    shortName: "DC",
    color: "#00008B",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "KL Rahul",            role: "WK",   photo: p(1125)  },
      { name: "Karun Nair",          role: "BAT",  photo: p(276)   },
      { name: "David Miller",        role: "BAT",  photo: p(187)   },
      { name: "Ben Duckett",         role: "WK",   photo: p(23001) }, // ✅ Added (replaces Tristan Stubbs in batting order)
      { name: "Pathum Nissanka",     role: "BAT",  photo: p(23020) },
      { name: "Sahil Parakh",        role: "BAT",  photo: p(23063) }, // ✅ Added
      { name: "Prithvi Shaw",        role: "BAT",  photo: p(3764)  },
      { name: "Abishek Porel",       role: "WK",   photo: p(33333) },
      { name: "Tristan Stubbs",      role: "WK",   photo: p(20631) },
      // All Rounders
      { name: "Axar Patel",          role: "AR",   photo: p(1113)  },
      { name: "Sameer Rizvi",        role: "AR",   photo: p(20689) },
      { name: "Ashutosh Sharma",     role: "AR",   photo: p(20703) },
      { name: "Vipraj Nigam",        role: "AR",   photo: p(22053) },
      { name: "Ajay Mandal",         role: "AR",   photo: p(5811)  }, // ✅ Added
      { name: "Tripurana Vijay",     role: "AR",   photo: p(22252) }, // ✅ Added
      { name: "Madhav Tiwari",       role: "AR",   photo: p(22259) }, // ✅ Added
      { name: "Auqib Dar",           role: "AR",   photo: p(23005) }, // ✅ Added
      { name: "Nitish Rana",         role: "AR",   photo: p(2738)  },
      // Bowlers  ✅ Kuldeep Yadav confirmed; removed Kyle Jamieson (not in official list now)
      { name: "Mitchell Starc",      role: "BOWL", photo: p(490)   },
      { name: "T. Natarajan",        role: "BOWL", photo: p(3831)  },
      { name: "Mukesh Kumar",        role: "BOWL", photo: p(5622)  },
      { name: "Dushmantha Chameera", role: "BOWL", photo: p(817)   },
      { name: "Lungi Ngidi",         role: "BOWL", photo: p(3746)  },
      { name: "Kyle Jamieson",       role: "BOWL", photo: p(1616)  },
      { name: "Kuldeep Yadav",       role: "BOWL", photo: p(261)   },
    ],
  },

  LSG: {
    name: "Lucknow Super Giants",
    shortName: "LSG",
    color: "#A72056",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "Rishabh Pant",        role: "WK",   photo: p(2972)  },
      { name: "Aiden Markram",       role: "BAT",  photo: p(1667)  },
      { name: "Himmat Singh",        role: "BAT",  photo: p(5434)  },
      { name: "Matthew Breetzke",    role: "BAT",  photo: p(22375) }, // ✅ Replaces Nicholas Pooran as BAT
      { name: "Mukul Choudhary",     role: "WK",   photo: p(23010) }, // ✅ Added WK
      { name: "Akshat Raghuwanshi", role: "BAT",  photo: p(23035) },
      { name: "Josh Inglis",         role: "WK",   photo: p(22372) },
      { name: "Nicholas Pooran",     role: "WK",   photo: p(1703)  },
      // All Rounders
      { name: "Mitchell Marsh",      role: "AR",   photo: p(221)   },
      { name: "Abdul Samad",         role: "AR",   photo: p(19352) },
      { name: "Shahbaz Ahmed",       role: "AR",   photo: p(13803) },
      { name: "Arshin Kulkarni",     role: "AR",   photo: p(20691) },
      { name: "Wanindu Hasaranga",   role: "AR",   photo: p(3082)  },
      { name: "Ayush Badoni",        role: "AR",   photo: p(20586) },
      // Bowlers  ✅ Removed Mohsin Khan (not on official squad page); added M. Siddharth, Akash Singh, Prince Yadav, Naman Tiwari
      { name: "Mohammad Shami",      role: "BOWL", photo: p(94)    },
      { name: "Avesh Khan",          role: "BOWL", photo: p(1561)  },
      { name: "M. Siddharth",        role: "BOWL", photo: p(7119)  }, // ✅ Added
      { name: "Digvesh Singh",       role: "BOWL", photo: p(5847)  },
      { name: "Akash Singh",         role: "BOWL", photo: p(12585) }, // ✅ Added
      { name: "Prince Yadav",        role: "BOWL", photo: p(22097) }, // ✅ Added
      { name: "Arjun Tendulkar",     role: "BOWL", photo: p(10244) },
      { name: "Anrich Nortje",       role: "BOWL", photo: p(5433)  },
      { name: "Naman Tiwari",        role: "BOWL", photo: p(23015) }, // ✅ Added
      { name: "Mayank Yadav",        role: "BOWL", photo: p(20585) }, // ✅ Mayank Yadav is in LSG, not SRH
      { name: "Mohsin Khan",         role: "BOWL", photo: p(4952)  },
    ],
  },

  RR: {
    name: "Rajasthan Royals",
    shortName: "RR",
    color: "#254AA5",
    textColor: "#FFFFFF",
    players: [
      // Batters
      { name: "Riyan Parag",          role: "BAT",  photo: p(4445)  },
      { name: "Shubham Dubey",        role: "BAT",  photo: p(20688) },
      { name: "Vaibhav Suryavanshi",  role: "BAT",  photo: p(22203) },
      { name: "Donovan Ferreira",     role: "WK",   photo: p(5652)  },
      { name: "Lhuan-dre Pretorius",  role: "BAT",  photo: p(22383) }, // ✅ Added (Yashasvi Jaiswal confirmed below)
      { name: "Shimron Hetmyer",      role: "BAT",  photo: p(1705)  },
      { name: "Yashasvi Jaiswal",     role: "BAT",  photo: p(13538) },
      { name: "Dhruv Jurel",          role: "WK",   photo: p(20620) },
      // All Rounders
      { name: "Yudhvir Singh Charak", role: "AR",   photo: p(10842) },
      { name: "Ravindra Jadeja",      role: "AR",   photo: p(9)     },
      { name: "Sam Curran",           role: "AR",   photo: p(2939)  },
      // Bowlers  ✅ Removed Nandre Burger/Kuldeep Sen/Sandeep Sharma -> confirmed on official; removed Ravi Bishnoi (not listed on official page for 2026)
      { name: "Jofra Archer",         role: "BOWL", photo: p(3502)  },
      { name: "Tushar Deshpande",     role: "BOWL", photo: p(3257)  },
      { name: "Kwena Maphaka",        role: "BOWL", photo: p(20724) },
      { name: "Ravi Bishnoi",         role: "BOWL", photo: p(19351) },
      { name: "Sushant Mishra",       role: "BOWL", photo: p(20695) }, // ✅ Added
      { name: "Vignesh Puthur",       role: "BOWL", photo: p(22266) }, // ✅ Added
      { name: "Adam Milne",           role: "BOWL", photo: p(434)   },
      { name: "Kuldeep Sen",          role: "BOWL", photo: p(20616) },
      { name: "Sandeep Sharma",       role: "BOWL", photo: p(1112)  },
      { name: "Nandre Burger",        role: "BOWL", photo: p(20716) },
    ],
  },
};

// Helper: get all players for a specific team
export function getTeamPlayers(teamCode) {
  return PLAYERS_DATA[teamCode]?.players || [];
}

// Helper: get players for both teams in a match
export function getMatchPlayers(team1Code, team2Code) {
  const t1 = PLAYERS_DATA[team1Code];
  const t2 = PLAYERS_DATA[team2Code];
  return {
    team1: { ...t1, code: team1Code },
    team2: { ...t2, code: team2Code },
    allPlayers: [
      ...(t1?.players || []).map(p => ({ ...p, team: team1Code, teamName: t1?.shortName })),
      ...(t2?.players || []).map(p => ({ ...p, team: team2Code, teamName: t2?.shortName })),
    ],
  };
}

// Helper: get role display label
export function getRoleLabel(role) {
  return { BAT: "Batsman", BOWL: "Bowler", AR: "All-Rounder", WK: "Wicketkeeper" }[role] || role;
}

// Helper: get role color
export function getRoleColor(role) {
  return { BAT: "#1D9E75", BOWL: "#E24B4A", AR: "#7F77DD", WK: "#F5A623" }[role] || "#888780";
}

export default PLAYERS_DATA;