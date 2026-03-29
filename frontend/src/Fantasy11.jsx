import React, { useState, useEffect } from "react";

const API = "https://betting-backend-xq1q.onrender.com";

const SQUADS = {
  MI: [
    { name: "Jasprit Bumrah",      role: "BOWL", credits: 11,   team: "MI" },
    { name: "Suryakumar Yadav",    role: "BAT",  credits: 10.5, team: "MI" },
    { name: "Hardik Pandya",       role: "AR",   credits: 10.5, team: "MI" },
    { name: "Trent Boult",         role: "BOWL", credits: 10,   team: "MI" },
    { name: "Tilak Varma",         role: "BAT",  credits: 10,   team: "MI" },
    { name: "Rohit Sharma",        role: "BAT",  credits: 10,   team: "MI" },
    { name: "Naman Dhir",          role: "AR",   credits: 9.5,  team: "MI" },
    { name: "Deepak Chahar",       role: "BOWL", credits: 9.5,  team: "MI" },
    { name: "Shardul Thakur",      role: "AR",   credits: 9,    team: "MI" },
    { name: "Ryan Rickelton",      role: "WK",   credits: 9,    team: "MI" },
    { name: "Ashwani Kumar",       role: "BOWL", credits: 8.5,  team: "MI" },
    { name: "Sherfane Rutherford", role: "BAT",  credits: 8,    team: "MI" },
    { name: "Quinton de Kock",     role: "WK",   credits: 8,    team: "MI" },
    { name: "Atharva Ankolekar",   role: "AR",   credits: 7.5,  team: "MI" },
    { name: "Raj Bawa",            role: "AR",   credits: 7.5,  team: "MI" },
    { name: "Mayank Rawat",        role: "BAT",  credits: 7.5,  team: "MI" },
    { name: "Corbin Bosch",        role: "AR",   credits: 7.5,  team: "MI" },
    { name: "Mayank Markande",     role: "BOWL", credits: 7.5,  team: "MI" },
    { name: "Ali Ghazanfar",       role: "BOWL", credits: 7,    team: "MI" },
  ],
  KKR: [
    { name: "Sunil Narine",          role: "AR",   credits: 10.5, team: "KKR" },
    { name: "Varun Chakaravarthy",   role: "BOWL", credits: 10,   team: "KKR" },
    { name: "Matheesha Pathirana",   role: "BOWL", credits: 9,    team: "KKR" },
    { name: "Vaibhav Arora",         role: "BOWL", credits: 9,    team: "KKR" },
    { name: "Harshit Rana",          role: "BOWL", credits: 9,    team: "KKR" },
    { name: "Rachin Ravindra",       role: "BAT",  credits: 9,    team: "KKR" },
    { name: "Rinku Singh",           role: "BAT",  credits: 9,    team: "KKR" },
    { name: "Angkrish Raghuvanshi",  role: "BAT",  credits: 9,    team: "KKR" },
    { name: "Ajinkya Rahane",        role: "BAT",  credits: 9,    team: "KKR" },
    { name: "Manish Pandey",         role: "BAT",  credits: 8,    team: "KKR" },
    { name: "Cameron Green",         role: "AR",   credits: 8,    team: "KKR" },
    { name: "Blessing Muzarabani",   role: "BOWL", credits: 7.5,  team: "KKR" },
    { name: "Navdeep Saini",         role: "BOWL", credits: 7.5,  team: "KKR" },
    { name: "Daksh Kamra",           role: "BOWL", credits: 7.5,  team: "KKR" },
    { name: "Sarthak Ranjan",        role: "WK",   credits: 7.5,  team: "KKR" },
    { name: "Anukul Roy",            role: "AR",   credits: 7.5,  team: "KKR" },
    { name: "Umran Malik",           role: "BOWL", credits: 7.5,  team: "KKR" },
    { name: "Akash Deep",            role: "BOWL", credits: 7.5,  team: "KKR" },
    { name: "Ramandeep Singh",       role: "AR",   credits: 7.5,  team: "KKR" },
    { name: "Tim Seifert",           role: "WK",   credits: 7.5,  team: "KKR" },
    { name: "Finn Allen",            role: "WK",   credits: 7,    team: "KKR" },
    { name: "Kartik Tyagi",          role: "BOWL", credits: 7,    team: "KKR" },
  ],
  CSK: [
    { name: "Shivam Dube",       role: "AR",   credits: 10,  team: "CSK" },
    { name: "Khaleel Ahmed",     role: "BOWL", credits: 9.5, team: "CSK" },
    { name: "Sanju Samson",      role: "WK",   credits: 9.5, team: "CSK" },
    { name: "Ayush Mhatre",      role: "BAT",  credits: 9,   team: "CSK" },
    { name: "Dewald Brevis",     role: "BAT",  credits: 9,   team: "CSK" },
    { name: "Noor Ahmad",        role: "BOWL", credits: 9,   team: "CSK" },
    { name: "Ruturaj Gaikwad",   role: "BAT",  credits: 9,   team: "CSK" },
    { name: "Anshul Kamboj",     role: "BOWL", credits: 8.5, team: "CSK" },
    { name: "MS Dhoni",          role: "WK",   credits: 8.5, team: "CSK" },
    { name: "Jamie Overton",     role: "AR",   credits: 8,   team: "CSK" },
    { name: "Zakary Foulkes",    role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Aman Khan",         role: "BAT",  credits: 7.5, team: "CSK" },
    { name: "Matthew Short",     role: "AR",   credits: 7.5, team: "CSK" },
    { name: "Shreyas Gopal",     role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Akeal Hosein",      role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Kartik Sharma",     role: "AR",   credits: 7.5, team: "CSK" },
    { name: "Mukesh Choudhary",  role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Nathan Ellis",      role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Matt Henry",        role: "BOWL", credits: 7.5, team: "CSK" },
    { name: "Spencer Johnson",   role: "BOWL", credits: 7,   team: "CSK" },
    { name: "Rahul Chahar",      role: "BOWL", credits: 7,   team: "CSK" },
    { name: "Sarfaraz Khan",     role: "BAT",  credits: 7,   team: "CSK" },
  ],
  DC: [
    { name: "Mitchell Starc",       role: "BOWL", credits: 10,  team: "DC" },
    { name: "KL Rahul",             role: "WK",   credits: 10,  team: "DC" },
    { name: "Kuldeep Yadav",        role: "BOWL", credits: 9.5, team: "DC" },
    { name: "Axar Patel",           role: "AR",   credits: 9.5, team: "DC" },
    { name: "Vipraj Nigam",         role: "BAT",  credits: 9,   team: "DC" },
    { name: "Ashutosh Sharma",      role: "BAT",  credits: 9,   team: "DC" },
    { name: "David Miller",         role: "BAT",  credits: 9,   team: "DC" },
    { name: "Tristan Stubbs",       role: "BAT",  credits: 9,   team: "DC" },
    { name: "Sameer Rizvi",         role: "BAT",  credits: 8.5, team: "DC" },
    { name: "Mukesh Kumar",         role: "BOWL", credits: 8.5, team: "DC" },
    { name: "Dushmantha Chameera",  role: "BOWL", credits: 8,   team: "DC" },
    { name: "Kyle Jamieson",        role: "AR",   credits: 8,   team: "DC" },
    { name: "Karun Nair",           role: "BAT",  credits: 8,   team: "DC" },
    { name: "Lungi Ngidi",          role: "BOWL", credits: 8,   team: "DC" },
    { name: "Tripurana Vijay",      role: "BAT",  credits: 7.5, team: "DC" },
    { name: "Madhav Tiwari",        role: "BAT",  credits: 7.5, team: "DC" },
    { name: "Ajay Mandal",          role: "AR",   credits: 7.5, team: "DC" },
    { name: "Auqib Nabi",           role: "BOWL", credits: 7.5, team: "DC" },
    { name: "T Natarajan",          role: "BOWL", credits: 7.5, team: "DC" },
    { name: "Prithvi Shaw",         role: "BAT",  credits: 7.5, team: "DC" },
    { name: "Pathum Nissanka",      role: "BAT",  credits: 7,   team: "DC" },
  ],
  GT: [
    { name: "Jos Buttler",         role: "WK",   credits: 10,  team: "GT" },
    { name: "Sai Sudharsan",       role: "BAT",  credits: 10,  team: "GT" },
    { name: "Shubman Gill",        role: "BAT",  credits: 10,  team: "GT" },
    { name: "Sai Kishore",         role: "BOWL", credits: 9.5, team: "GT" },
    { name: "Mohammed Siraj",      role: "BOWL", credits: 9.5, team: "GT" },
    { name: "Rashid Khan",         role: "BOWL", credits: 9.5, team: "GT" },
    { name: "Rahul Tewatia",       role: "AR",   credits: 9,   team: "GT" },
    { name: "Prasidh Krishna",     role: "BOWL", credits: 9,   team: "GT" },
    { name: "Shahrukh Khan",       role: "BAT",  credits: 8.5, team: "GT" },
    { name: "Washington Sundar",   role: "AR",   credits: 8.5, team: "GT" },
    { name: "Jason Holder",        role: "AR",   credits: 8,   team: "GT" },
    { name: "Glenn Phillips",      role: "WK",   credits: 8,   team: "GT" },
    { name: "Nishant Sindhu",      role: "AR",   credits: 7.5, team: "GT" },
    { name: "Kagiso Rabada",       role: "BOWL", credits: 7.5, team: "GT" },
    { name: "Kulwant Khejroliya",  role: "BOWL", credits: 7,   team: "GT" },
    { name: "Manav Suthar",        role: "BOWL", credits: 7,   team: "GT" },
    { name: "Anuj Rawat",          role: "WK",   credits: 7,   team: "GT" },
    { name: "Ashok Sharma",        role: "BOWL", credits: 7,   team: "GT" },
  ],
  LSG: [
    { name: "Nicholas Pooran",      role: "WK",   credits: 10.5, team: "LSG" },
    { name: "Mitchell Marsh",       role: "AR",   credits: 10,   team: "LSG" },
    { name: "Aiden Markram",        role: "AR",   credits: 10,   team: "LSG" },
    { name: "Rishabh Pant",         role: "WK",   credits: 9.5,  team: "LSG" },
    { name: "Wanindu Hasaranga",    role: "AR",   credits: 9,    team: "LSG" },
    { name: "Ayush Badoni",         role: "BAT",  credits: 9,    team: "LSG" },
    { name: "Digvesh Singh",        role: "BOWL", credits: 9,    team: "LSG" },
    { name: "Josh Inglis",          role: "WK",   credits: 8.5,  team: "LSG" },
    { name: "Mohammad Shami",       role: "BOWL", credits: 8.5,  team: "LSG" },
    { name: "Arshin Kulkarni",      role: "AR",   credits: 8,    team: "LSG" },
    { name: "Abdul Samad",          role: "BAT",  credits: 8,    team: "LSG" },
    { name: "Avesh Khan",           role: "BOWL", credits: 8,    team: "LSG" },
    { name: "Manimaran Siddharth",  role: "BOWL", credits: 7.5,  team: "LSG" },
    { name: "Mohsin Khan",          role: "BOWL", credits: 7.5,  team: "LSG" },
    { name: "Mayank Yadav",         role: "BOWL", credits: 7.5,  team: "LSG" },
    { name: "Arjun Tendulkar",      role: "AR",   credits: 7,    team: "LSG" },
    { name: "Himmat Singh",         role: "BAT",  credits: 7,    team: "LSG" },
    { name: "Annrich Nortje",       role: "BOWL", credits: 7,    team: "LSG" },
  ],
  RCB: [
    { name: "Virat Kohli",        role: "BAT",  credits: 11,  team: "RCB" },
    { name: "Phil Salt",          role: "WK",   credits: 9.5, team: "RCB" },
    { name: "Devdutt Padikkal",   role: "BAT",  credits: 9,   team: "RCB" },
    { name: "Rajat Patidar",      role: "BAT",  credits: 9,   team: "RCB" },
    { name: "Krunal Pandya",      role: "AR",   credits: 9,   team: "RCB" },
    { name: "Venkatesh Iyer",     role: "AR",   credits: 9,   team: "RCB" },
    { name: "Tim David",          role: "BAT",  credits: 9,   team: "RCB" },
    { name: "Jitesh Sharma",      role: "WK",   credits: 9,   team: "RCB" },
    { name: "Josh Hazlewood",     role: "BOWL", credits: 10,  team: "RCB" },
    { name: "Bhuvneshwar Kumar",  role: "BOWL", credits: 9,   team: "RCB" },
    { name: "Romario Shepherd",   role: "AR",   credits: 8.5, team: "RCB" },
    { name: "Suyash Sharma",      role: "BOWL", credits: 8,   team: "RCB" },
    { name: "Yash Dayal",         role: "BOWL", credits: 8,   team: "RCB" },
    { name: "Nuwan Thushara",     role: "BOWL", credits: 7.5, team: "RCB" },
    { name: "Rasikh Salam",       role: "BOWL", credits: 7.5, team: "RCB" },
    { name: "Mangesh Yadav",      role: "BOWL", credits: 7.5, team: "RCB" },
    { name: "Kanishk Chouhan",    role: "BAT",  credits: 7.5, team: "RCB" },
    { name: "Vihaan Malhotra",    role: "BAT",  credits: 7.5, team: "RCB" },
    { name: "Swapnil Singh",      role: "AR",   credits: 7.5, team: "RCB" },
    { name: "Abhinandan Singh",   role: "BAT",  credits: 7,   team: "RCB" },
    { name: "Jacob Duffy",        role: "BOWL", credits: 7,   team: "RCB" },
    { name: "Jordan Cox",         role: "WK",   credits: 7,   team: "RCB" },
    { name: "Vicky Ostwal",       role: "BOWL", credits: 7,   team: "RCB" },
  ],
  SRH: [
    { name: "Ishan Kishan",        role: "WK",   credits: 10.5, team: "SRH" },
    { name: "Abhishek Sharma",     role: "AR",   credits: 10.5, team: "SRH" },
    { name: "Heinrich Klaasen",    role: "WK",   credits: 10,   team: "SRH" },
    { name: "Travis Head",         role: "BAT",  credits: 10,   team: "SRH" },
    { name: "Pat Cummins",         role: "AR",   credits: 9.5,  team: "SRH" },
    { name: "Aniket Verma",        role: "BAT",  credits: 9,    team: "SRH" },
    { name: "Nitish Kumar Reddy",  role: "AR",   credits: 9,    team: "SRH" },
    { name: "Liam Livingstone",    role: "AR",   credits: 9,    team: "SRH" },
    { name: "Kamindu Mendis",      role: "AR",   credits: 8.5,  team: "SRH" },
    { name: "Eshan Malinga",       role: "BOWL", credits: 8.5,  team: "SRH" },
    { name: "Jack Edwards",        role: "AR",   credits: 7.5,  team: "SRH" },
    { name: "Shivang Kumar",       role: "BOWL", credits: 7.5,  team: "SRH" },
    { name: "David Payne",         role: "BOWL", credits: 7,    team: "SRH" },
    { name: "Salil Arora",         role: "BOWL", credits: 7,    team: "SRH" },
    { name: "Onkar Tarmale",       role: "BAT",  credits: 7,    team: "SRH" },
    { name: "Praful Hinge",        role: "BOWL", credits: 7,    team: "SRH" },
    { name: "Amit Kumar",          role: "BOWL", credits: 7,    team: "SRH" },
    { name: "Brydon Carse",        role: "AR",   credits: 7,    team: "SRH" },
    { name: "Ravichandran Smaran", role: "BAT",  credits: 7,    team: "SRH" },
    { name: "Sakib Hussain",       role: "BOWL", credits: 7,    team: "SRH" },
  ],
  RR: [
    { name: "Ravindra Jadeja",      role: "AR",   credits: 10.5, team: "RR" },
    { name: "Yashasvi Jaiswal",     role: "BAT",  credits: 10,   team: "RR" },
    { name: "Jofra Archer",         role: "BOWL", credits: 9.5,  team: "RR" },
    { name: "Shimron Hetmyer",      role: "BAT",  credits: 9.5,  team: "RR" },
    { name: "Dhruv Jurel",          role: "WK",   credits: 9,    team: "RR" },
    { name: "Riyan Parag",          role: "BAT",  credits: 9,    team: "RR" },
    { name: "Vaibhav Sooryavanshi", role: "BAT",  credits: 9,    team: "RR" },
    { name: "Tushar Deshpande",     role: "BOWL", credits: 8.5,  team: "RR" },
    { name: "Sam Curran",           role: "AR",   credits: 8.5,  team: "RR" },
    { name: "Ravi Bishnoi",         role: "BOWL", credits: 8.5,  team: "RR" },
    { name: "Sandeep Sharma",       role: "BOWL", credits: 8,    team: "RR" },
    { name: "Yudhvir Singh",        role: "BOWL", credits: 7.5,  team: "RR" },
    { name: "Donovan Ferreira",     role: "BAT",  credits: 7.5,  team: "RR" },
    { name: "Kuldeep Sen",          role: "BOWL", credits: 7.5,  team: "RR" },
    { name: "Shubham Dubey",        role: "AR",   credits: 7.5,  team: "RR" },
    { name: "Yash Punja",           role: "BAT",  credits: 7,    team: "RR" },
    { name: "Sushant Mishra",       role: "BOWL", credits: 7,    team: "RR" },
    { name: "Brijesh Sharma",       role: "BOWL", credits: 7,    team: "RR" },
    { name: "Lhuan-dre Pretorius",  role: "AR",   credits: 7,    team: "RR" },
    { name: "Ravi Singh",           role: "BOWL", credits: 7,    team: "RR" },
    { name: "Aman Perala",          role: "BAT",  credits: 7,    team: "RR" },
    { name: "Nandre Burger",        role: "BOWL", credits: 7,    team: "RR" },
    { name: "Adam Milne",           role: "BOWL", credits: 7,    team: "RR" },
    { name: "Kwena Maphaka",        role: "BOWL", credits: 7,    team: "RR" },
  ],
  PBKS: [
    { name: "Shreyas Iyer",        role: "BAT",  credits: 10.5, team: "PBKS" },
    { name: "Arshdeep Singh",      role: "BOWL", credits: 10,   team: "PBKS" },
    { name: "Nehal Wadhera",       role: "BAT",  credits: 9.5,  team: "PBKS" },
    { name: "Yuzvendra Chahal",    role: "BOWL", credits: 9.5,  team: "PBKS" },
    { name: "Marco Jansen",        role: "AR",   credits: 9.5,  team: "PBKS" },
    { name: "Priyansh Arya",       role: "BAT",  credits: 9.5,  team: "PBKS" },
    { name: "Azmatullah Omarzai",  role: "AR",   credits: 9,    team: "PBKS" },
    { name: "Marcus Stoinis",      role: "AR",   credits: 9,    team: "PBKS" },
    { name: "Shashank Singh",      role: "BAT",  credits: 9,    team: "PBKS" },
    { name: "Prabhsimran Singh",   role: "WK",   credits: 9,    team: "PBKS" },
    { name: "Lockie Ferguson",     role: "BOWL", credits: 8,    team: "PBKS" },
    { name: "Ben Dwarshuis",       role: "BOWL", credits: 7.5,  team: "PBKS" },
    { name: "Suryansh Shedge",     role: "BAT",  credits: 7.5,  team: "PBKS" },
    { name: "Musheer Khan",        role: "BAT",  credits: 7.5,  team: "PBKS" },
    { name: "Cooper Connolly",     role: "AR",   credits: 7.5,  team: "PBKS" },
    { name: "Mitchell Owen",       role: "BAT",  credits: 7.5,  team: "PBKS" },
    { name: "Vishal Nishad",       role: "WK",   credits: 7,    team: "PBKS" },
    { name: "Vishnu Vinod",        role: "WK",   credits: 7,    team: "PBKS" },
    { name: "Praveen Dubey",       role: "BOWL", credits: 7,    team: "PBKS" },
    { name: "Harnoor Singh",       role: "BAT",  credits: 7,    team: "PBKS" },
    { name: "Yash Thakur",         role: "BOWL", credits: 7,    team: "PBKS" },
    { name: "Xavier Bartlett",     role: "BOWL", credits: 7,    team: "PBKS" },
  ],
};

const TEAM_COLORS = {
  MI:   { primary: "#004BA0", accent: "#00A0E3" },
  KKR:  { primary: "#3A225D", accent: "#B08C2C" },
  CSK:  { primary: "#F5A623", accent: "#1E3A5F" },
  DC:   { primary: "#17479E", accent: "#EF1C25" },
  GT:   { primary: "#1C2B5E", accent: "#C8A951" },
  LSG:  { primary: "#00539B", accent: "#A2AAAD" },
  RCB:  { primary: "#C8102E", accent: "#FFD700" },
  SRH:  { primary: "#F7A721", accent: "#232323" },
  RR:   { primary: "#EA1A8A", accent: "#254AA5" },
  PBKS: { primary: "#AA1D23", accent: "#DCDDDF" },
};

const ROLE_COLORS = {
  WK:   { text: "#7B68EE", border: "#7B68EE" },
  BAT:  { text: "#00C896", border: "#00C896" },
  AR:   { text: "#F0A500", border: "#F0A500" },
  BOWL: { text: "#FF6B6B", border: "#FF6B6B" },
};

const ROLE_FULL = { WK: "Wicket-Keeper", BAT: "Batter", AR: "All-Rounder", BOWL: "Bowler" };
const MAX_CREDITS = 100;
const MAX_PLAYERS = 11;
const MAX_PER_TEAM = 7;
const ROLE_LIMITS = { WK: [1, 4], BAT: [1, 4], AR: [1, 4], BOWL: [3, 6] };

export default function Fantasy11({ username, matchInfo, matchStatus }) {
  const [step, setStep] = useState("pick");
  const [selected, setSelected] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("credits");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingTeam, setExistingTeam] = useState(null);
  const [myTeamPoints, setMyTeamPoints] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const team1 = matchInfo?.teams?.[0];
  const team2 = matchInfo?.teams?.[1];
  const matchId = matchInfo?.matchId;
  const allPlayers = [...(SQUADS[team1] || []), ...(SQUADS[team2] || [])];

  const usedCredits = selected.reduce((s, p) => s + p.credits, 0);
  const remainingCredits = MAX_CREDITS - usedCredits;
  const teamCount = (t) => selected.filter(p => p.team === t).length;
  const roleCount = (r) => selected.filter(p => p.role === r).length;

  useEffect(() => {
    setSelected([]); setCaptain(null); setViceCaptain(null);
    setExistingTeam(null); setStep("pick"); setError("");
    if (!username || !matchId) { setCheckingExisting(false); return; }
    setCheckingExisting(true);
    const players = [...(SQUADS[team1] || []), ...(SQUADS[team2] || [])];
    fetch(`${API}/fantasy11/team/${username}/${matchId}`)
      .then(r => r.json())
      .then(data => {
        if (data.team) {
          setExistingTeam(data.team);
          const rebuilt = (data.team.players || []).map(n => players.find(p => p.name === n)).filter(Boolean);
          setSelected(rebuilt);
          setCaptain(players.find(p => p.name === data.team.captain) || null);
          setViceCaptain(players.find(p => p.name === data.team.viceCaptain) || null);
          setMyTeamPoints(data.team.fantasyPoints ?? null);
          setStep("done");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingExisting(false));
  }, [matchId, username]);

  const filtered = allPlayers
    .filter(p => roleFilter === "ALL" || p.role === roleFilter)
    .filter(p => teamFilter === "ALL" || p.team === teamFilter)
    .sort((a, b) => sortBy === "credits" ? b.credits - a.credits : a.name.localeCompare(b.name));

  const togglePlayer = (player) => {
    setError("");
    if (isLocked) { setError("Team is locked — match has started!"); return; }
    const isSel = selected.find(p => p.name === player.name);
    if (isSel) {
      setSelected(s => s.filter(p => p.name !== player.name));
      if (captain?.name === player.name) setCaptain(null);
      if (viceCaptain?.name === player.name) setViceCaptain(null);
      return;
    }
    if (selected.length >= MAX_PLAYERS) { setError("Team full! Remove a player first."); return; }
    if (usedCredits + player.credits > MAX_CREDITS) { setError(`Not enough credits! Need ${player.credits}, have ${remainingCredits.toFixed(1)}.`); return; }
    if (teamCount(player.team) >= MAX_PER_TEAM) { setError(`Max ${MAX_PER_TEAM} players from one team.`); return; }
    const [, max] = ROLE_LIMITS[player.role];
    if (roleCount(player.role) >= max) { setError(`Max ${max} ${ROLE_FULL[player.role]}s allowed.`); return; }
    setSelected(s => [...s, player]);
  };

  const canProceed = () =>
    selected.length === MAX_PLAYERS &&
    roleCount("WK") >= 1 && roleCount("BAT") >= 1 &&
    roleCount("AR") >= 1 && roleCount("BOWL") >= 3;

  const submitTeam = async () => {
    if (!captain || !viceCaptain) { setError("Pick a captain and vice-captain!"); return; }
    if (isLocked) { setError("Team locked — match already started!"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/fantasy11/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username, matchId, matchLabel: matchInfo?.matchLabel,
          players: selected.map(p => p.name),
          captain: captain.name, viceCaptain: viceCaptain.name,
        }),
      });
      const data = await res.json();
      if (res.ok) { setExistingTeam(data.team); setStep("done"); }
      else setError(data.message || "Failed to save team.");
    } catch { setError("Server error. Please try again."); }
    setLoading(false);
  };

  const isLocked = matchStatus === "live" || matchStatus === "completed";

  // ── no match ─────────────────────────────────────────────────────────────
  if (!matchInfo) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
      <p style={{ color: "#7d8590", fontSize: 15 }}>
        Go to the <b style={{ color: "#ffd166" }}>IPL</b> tab and click
        <b style={{ color: "#ffd166" }}> Fantasy 11</b> on a match!
      </p>
    </div>
  );

  if (checkingExisting) return (
    <div style={{ textAlign: "center", padding: 60, color: "#7d8590" }}>Loading your team...</div>
  );

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === "done" && existingTeam) return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      <div style={c.hdr}>
        <div>
          <div style={c.ttl}>🏏 Your Fantasy 11</div>
          <div style={c.sub}>{matchInfo?.matchLabel}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {myTeamPoints !== null && (
            <div style={{ fontSize: 28, fontWeight: 700, color: "#ffd166" }}>
              {myTeamPoints} <span style={{ fontSize: 14, color: "#7d8590" }}>pts</span>
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: isLocked ? "#ff6b6b" : "#00C896" }}>
            {isLocked ? "🔒 TEAM LOCKED" : "✓ TEAM SAVED"}
          </div>
        </div>
      </div>
      <PitchView selected={selected} captain={captain} viceCaptain={viceCaptain} />
      {!isLocked && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button style={c.btn("#ffd166")} onClick={() => { setStep("pick"); setExistingTeam(null); }}>Edit Team</button>
        </div>
      )}
    </div>
  );

  // ── CAPTAIN ───────────────────────────────────────────────────────────────
  if (step === "captain") return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      <div style={c.hdr}>
        <div>
          <div style={c.ttl}>Choose C &amp; VC</div>
          <div style={c.sub}>Captain 2x · Vice-captain 1.5x</div>
        </div>
        <button style={c.back} onClick={() => setStep("pick")}>← Back</button>
      </div>
      {error && <div style={c.err}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(255px,1fr))", gap: 10, marginBottom: 20 }}>
        {selected.map(p => {
          const isCap = captain?.name === p.name;
          const isVC = viceCaptain?.name === p.name;
          return (
            <div key={p.name} style={{
              background: isCap ? "#ffd16615" : isVC ? "#7B68EE15" : "#161b22",
              border: `1px solid ${isCap ? "#ffd166" : isVC ? "#7B68EE" : "#30363d"}`,
              borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#e6edf3" }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span style={c.role(p.role)}>{p.role}</span>
                  <span style={c.team(p.team)}>{p.team}</span>
                </div>
              </div>
              <button onClick={() => { setCaptain(isCap ? null : p); if (p.name === viceCaptain?.name) setViceCaptain(null); }}
                style={{ background: isCap ? "#ffd166" : "#1e1e1e", color: isCap ? "#000" : "#ffd166",
                  border: `1px solid ${isCap ? "#ffd166" : "#444"}`, borderRadius: 8,
                  padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>C</button>
              <button onClick={() => { setViceCaptain(isVC ? null : p); if (p.name === captain?.name) setCaptain(null); }}
                style={{ background: isVC ? "#7B68EE" : "#1e1e1e", color: isVC ? "#fff" : "#7B68EE",
                  border: `1px solid ${isVC ? "#7B68EE" : "#444"}`, borderRadius: 8,
                  padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>VC</button>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={c.btn("#00C896", !captain || !viceCaptain)}
          disabled={!captain || !viceCaptain} onClick={() => setStep("confirm")}>
          Preview Team →
        </button>
      </div>
    </div>
  );

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (step === "confirm") return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      <div style={c.hdr}>
        <div>
          <div style={c.ttl}>Preview &amp; Lock</div>
          <div style={c.sub}>{matchInfo?.matchLabel}</div>
        </div>
        <button style={c.back} onClick={() => setStep("captain")}>← Back</button>
      </div>
      {isLocked && <div style={c.lock}>🔒 Match has started — team cannot be changed.</div>}
      <PitchView selected={selected} captain={captain} viceCaptain={viceCaptain} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button style={c.btn("#ffd166", isLocked || loading)} disabled={isLocked || loading} onClick={submitTeam}>
          {loading ? "Saving..." : "🔒 Lock My Team"}
        </button>
      </div>
      {error && <div style={{ ...c.err, marginTop: 12 }}>{error}</div>}
    </div>
  );

  // ── PICK (main) ───────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 80 }}>
      <div style={c.hdr}>
        <div>
          <div style={c.ttl}>🏏 Create Fantasy 11</div>
          <div style={c.sub}>{matchInfo?.matchLabel} · Budget: 100 credits</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: remainingCredits < 10 ? "#ff6b6b" : "#00C896" }}>
            {remainingCredits.toFixed(1)} <span style={{ fontSize: 12, color: "#7d8590" }}>cr left</span>
          </div>
          <div style={{ fontSize: 13, color: "#7d8590" }}>{selected.length}/{MAX_PLAYERS} players</div>
        </div>
      </div>

      {isLocked && <div style={c.lock}>🔒 Match started — team creation locked.</div>}

      {/* Progress bar */}
      <div style={{ background: "#161b22", borderRadius: 12, padding: "12px 18px", marginBottom: 14, border: "1px solid #30363d" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#7d8590", flexWrap: "wrap", gap: 6 }}>
          <span>Used: <b style={{ color: "#ffd166" }}>{usedCredits.toFixed(1)}</b></span>
          <span style={{ display: "flex", gap: 10 }}>
            {["WK","BAT","AR","BOWL"].map(r => (
              <span key={r} style={{ color: ROLE_COLORS[r].text }}>{r}: <b>{roleCount(r)}</b>/{ROLE_LIMITS[r][1]}</span>
            ))}
          </span>
          <span>Left: <b style={{ color: "#00C896" }}>{remainingCredits.toFixed(1)}</b></span>
        </div>
        <div style={{ height: 6, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(usedCredits / MAX_CREDITS) * 100}%`,
            background: usedCredits > 90 ? "#ff6b6b" : "#00C896", transition: "width .2s", borderRadius: 3 }} />
        </div>
      </div>

      {/* Role filters */}
      <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
        {["ALL","WK","BAT","AR","BOWL"].map(r => (
          <button key={r} style={c.chip(roleFilter === r, ROLE_COLORS[r]?.border || "#7d8590")}
            onClick={() => setRoleFilter(r)}>
            {r === "ALL" ? "All Roles" : ROLE_FULL[r]}
          </button>
        ))}
      </div>

      {/* Team filters + sort */}
      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["ALL", team1, team2].filter(Boolean).map(t => (
          <button key={t} style={c.chip(teamFilter === t, TEAM_COLORS[t]?.primary || "#7d8590")}
            onClick={() => setTeamFilter(t)}>{t === "ALL" ? "Both Teams" : t}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
          <button style={c.chip(sortBy === "credits", "#ffd166")} onClick={() => setSortBy("credits")}>Credits</button>
          <button style={c.chip(sortBy === "name", "#7B68EE")} onClick={() => setSortBy("name")}>A–Z</button>
        </div>
      </div>

      {error && <div style={c.err}>{error}</div>}

      {/* Player grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(245px,1fr))", gap: 8, marginBottom: 20 }}>
        {filtered.map(player => {
          const isSel = !!selected.find(p => p.name === player.name);
          const canAfford = usedCredits + player.credits <= MAX_CREDITS || isSel;
          const tc = TEAM_COLORS[player.team] || {};
          return (
            <div key={player.name} onClick={() => togglePlayer(player)} style={{
              background: isSel ? (tc.primary || "#333") + "20" : "#161b22",
              border: `1px solid ${isSel ? (tc.primary || "#555") : "#30363d"}`,
              borderRadius: 10, padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "border-color .1s",
              opacity: !canAfford && !isSel ? 0.4 : 1,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: tc.primary || "#333", borderRadius: "10px 0 0 10px" }} />
              <div style={{ flex: 1, paddingLeft: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#e6edf3" }}>{player.name}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 4, alignItems: "center" }}>
                  <span style={c.role(player.role)}>{player.role}</span>
                  <span style={c.team(player.team)}>{player.team}</span>
                  <span style={{ fontSize: 11, color: "#7d8590" }}>{player.credits} cr</span>
                </div>
              </div>
              {isSel
                ? <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#00C896",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#000", flexShrink: 0 }}>✓</div>
                : <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #30363d",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#30363d", fontSize: 16 }}>+</div>
              }
            </div>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div style={{ position: "sticky", bottom: 0, background: "#0d1117",
        borderTop: "1px solid #30363d", padding: "12px 4px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "#7d8590" }}>
          {selected.length === MAX_PLAYERS
            ? <span style={{ color: "#00C896", fontWeight: 600 }}>✓ Team complete! Pick C &amp; VC next.</span>
            : <span>Pick <b style={{ color: "#ffd166" }}>{MAX_PLAYERS - selected.length}</b> more</span>
          }
        </div>
        <button style={c.btn("#ffd166", !canProceed() || isLocked)}
          disabled={!canProceed() || isLocked}
          onClick={() => { setError(""); setStep("captain"); }}>
          Next: Pick Captain →
        </button>
      </div>
    </div>
  );
}

// ── shared style helpers ──────────────────────────────────────────────────────
const c = {
  hdr: {
    background: "linear-gradient(135deg,#0d1117,#161b22,#1a2236)",
    borderRadius: 16, padding: "18px 22px", marginBottom: 14,
    border: "1px solid #30363d",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    flexWrap: "wrap", gap: 10,
  },
  ttl: { fontSize: 20, fontWeight: 700, color: "#ffd166", letterSpacing: 1 },
  sub: { fontSize: 13, color: "#7d8590", marginTop: 4 },
  back: { background: "none", border: "1px solid #30363d", color: "#7d8590", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
  btn: (color, disabled) => ({
    background: disabled ? "#2a2a2a" : color, color: disabled ? "#555" : "#000",
    border: "none", borderRadius: 10, padding: "12px 26px",
    fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
  }),
  chip: (active, color) => ({
    background: active ? color + "33" : "#161b22",
    border: `1px solid ${active ? color : "#30363d"}`,
    color: active ? color : "#7d8590",
    borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  }),
  role: (r) => ({
    background: ROLE_COLORS[r].border + "22", border: `1px solid ${ROLE_COLORS[r].border}`,
    color: ROLE_COLORS[r].text, borderRadius: 6, padding: "2px 6px", fontSize: 11, fontWeight: 700,
  }),
  team: (t) => ({
    background: (TEAM_COLORS[t]?.primary || "#333") + "44",
    color: TEAM_COLORS[t]?.accent || "#ccc",
    borderRadius: 5, padding: "2px 6px", fontSize: 10, fontWeight: 700,
  }),
  err:  { background: "#300", border: "1px solid #a32d2d", borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#ff6b6b", fontSize: 13 },
  lock: { background: "#1a0000", border: "1px solid #a32d2d", borderRadius: 10, padding: "11px 16px", marginBottom: 12, color: "#ff6b6b", fontSize: 13 },
};

// ── Pitch View ────────────────────────────────────────────────────────────────
function PitchView({ selected, captain, viceCaptain }) {
  const rows = [
    { label: "Bowlers",        players: selected.filter(p => p.role === "BOWL") },
    { label: "All-Rounders",   players: selected.filter(p => p.role === "AR")   },
    { label: "Batters",        players: selected.filter(p => p.role === "BAT")  },
    { label: "Wicket-Keeper",  players: selected.filter(p => p.role === "WK")   },
  ];
  return (
    <div style={{ background: "linear-gradient(180deg,#0a4d1f,#0d6626,#0a4d1f)", borderRadius: 16, padding: "18px 12px", border: "2px solid #1a7a32", minHeight: 290 }}>
      {rows.map(({ label, players }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>{label}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {players.map(p => {
              const isCap = captain?.name === p.name;
              const isVC  = viceCaptain?.name === p.name;
              const tc    = TEAM_COLORS[p.team] || {};
              return (
                <div key={p.name} style={{ textAlign: "center", width: 60 }}>
                  <div style={{ position: "relative", width: 42, height: 42, margin: "0 auto 3px", borderRadius: "50%",
                    background: `linear-gradient(135deg,${tc.primary || "#333"},${tc.accent || "#555"})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff",
                    boxShadow: isCap ? "0 0 0 2px #ffd166" : isVC ? "0 0 0 2px #7B68EE" : "0 0 0 1px rgba(255,255,255,.15)",
                  }}>
                    {p.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                    {(isCap || isVC) && (
                      <div style={{ position: "absolute", bottom: -3, right: -2, width: 14, height: 14, borderRadius: "50%",
                        background: isCap ? "#ffd166" : "#7B68EE",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 800, color: isCap ? "#000" : "#fff",
                        border: "1px solid #0a4d1f",
                      }}>{isCap ? "C" : "VC"}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: "#e6edf3", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name.split(" ").slice(-1)[0]}
                  </div>
                  <div style={{ fontSize: 8, color: tc.accent || "#7d8590", fontWeight: 600 }}>{p.team}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}