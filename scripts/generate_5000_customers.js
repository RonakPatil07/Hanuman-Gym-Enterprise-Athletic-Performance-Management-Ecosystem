/**
 * ==============================================================================
 * HANUMAN GYM - 5,000 PRODUCTION CUSTOMER & ACTIVITY DATA GENERATOR
 * ==============================================================================
 * Generates 5,000 realistic Indian athletic customer records and associated
 * store orders, memberships, payments, workout logs, and inquiries.
 */

const fs = require('fs');
const path = require('path');

const FIRST_NAMES_MALE = [
    "Aarav", "Aditya", "Amit", "Anand", "Aniket", "Aniruddha", "Arjun", "Ashwin",
    "Chetan", "Darshan", "Deepak", "Devendra", "Gaurav", "Harsh", "Jayesh", "Karan",
    "Kedar", "Kishore", "Krunal", "Mandar", "Manish", "Mayur", "Nikhil", "Nilesh",
    "Omkar", "Pankaj", "Pradeep", "Prakash", "Prasad", "Prathamesh", "Rahul", "Rajesh",
    "Rakesh", "Rohan", "Rohit", "Sachin", "Sagar", "Sahil", "Sameer", "Sandeep",
    "Sanket", "Santosh", "Satyam", "Saurabh", "Shailesh", "Shashank", "Shravan", "Shrikant",
    "Siddharth", "Sumit", "Suraj", "Swapnil", "Tejas", "Tushar", "Vaibhav", "Varun",
    "Vikas", "Vikram", "Vinay", "Vinayak", "Vipul", "Vishal", "Vivek", "Yash"
];

const FIRST_NAMES_FEMALE = [
    "Aadhya", "Aishwarya", "Akshata", "Amruta", "Ananya", "Ankita", "Anushka", "Aparna",
    "Archana", "Ashwini", "Bhakti", "Deepali", "Disha", "Divya", "Gauri", "Gayatri",
    "Ishita", "Janhavi", "Jyoti", "Kalyani", "Kavita", "Ketaki", "Madhuri", "Manasi",
    "Mayuri", "Meera", "Mugdha", "Neha", "Nikita", "Pallavi", "Pooja", "Prachi",
    "Prajakta", "Pranali", "Pranita", "Priya", "Priyanka", "Radhika", "Rakhi", "Rashmi",
    "Riddhi", "Rohini", "Ruchira", "Rupali", "Sakshi", "Samruddhi", "Sayali", "Sheetal",
    "Shreya", "Shraddha", "Shruti", "Sneha", "Snehal", "Sonali", "Swati", "Tanvi",
    "Tejaswini", "Trisha", "Urmila", "Vaishnavi", "Varsha", "Vidya", "Yogita"
];

const LAST_NAMES = [
    "Patil", "Deshmukh", "Joshi", "Kulkarni", "Malhotra", "Iyer", "Nair", "Shinde",
    "More", "Pawar", "Chavan", "Jadhav", "Bhosale", "Gaikwad", "Sawant", "Kadam",
    "Salunkhe", "Mane", "Kamble", "Shetty", "Reddy", "Mehta", "Shah", "Agarwal",
    "Verma", "Sharma", "Gupta", "Singh", "Pandey", "Mishra", "Thakur", "Rane",
    "Shedge", "Ghuge", "Ghadge", "Wagh", "Babar", "Gore", "Bhandari", "Sargar"
];

const BRANCHES = [
    { id: "pune-central", name: "Pune Central", city: "Pune" },
    { id: "mumbai-bandra", name: "Mumbai Bandra", city: "Mumbai" },
    { id: "thane-mega", name: "Thane Mega Center", city: "Thane" },
    { id: "kalyan-flagship", name: "Kalyan Flagship", city: "Kalyan" },
    { id: "dadar-elite", name: "Dadar Elite Lab", city: "Mumbai" },
    { id: "vashi-power", name: "Vashi Power Center", city: "Navi Mumbai" },
    { id: "ambernath", name: "Ambernath Branch", city: "Ambernath" },
    { id: "titwala", name: "Titwala Branch", city: "Titwala" },
    { id: "dombivali", name: "Dombivali Branch", city: "Dombivali" },
    { id: "badlapur", name: "Badlapur Branch", city: "Badlapur" }
];

const MEMBERSHIP_PLANS = [
    { name: "Standard All-Access", price: 3500, cycle: "Monthly" },
    { name: "Pro Performance", price: 5500, cycle: "Monthly" },
    { name: "Elite Black Pass", price: 14999, cycle: "Annual" },
    { name: "Championship VIP Pass", price: 24999, cycle: "Annual" }
];

const TRAINERS = [
    "Vikram Malhotra", "Shravan K", "Prachi Patil", "Pradeep Sargar",
    "Rakhi Sawant", "Krunal K", "Satyam M", "Tanvi S", "Yash S",
    "Sahil P", "Sumit S", "Shruti M"
];

const STORE_PRODUCTS = [
    { name: "Hanuman Heavyweight Pump Cover", price: 1499, category: "Apparel" },
    { name: "10mm Lever Competition Belt", price: 4999, category: "Equipment" },
    { name: "7mm Neoprene Knee Sleeves", price: 2299, category: "Equipment" },
    { name: "Pure Hydrolyzed Whey Isolate 1kg", price: 3499, category: "Supplements" },
    { name: "Creatine Monohydrate 250g", price: 999, category: "Supplements" },
    { name: "Performance Lifting Straps", price: 699, category: "Accessories" },
    { name: "Hanuman Oversized Acid-Wash Hoodie", price: 2499, category: "Apparel" },
    { name: "Pre-Workout Ignition Fuel 300g", price: 1899, category: "Supplements" },
    { name: "Stainless Steel Athlete Shaker 750ml", price: 899, category: "Accessories" },
    { name: "High-Top Deadlift Shoes", price: 3999, category: "Footwear" }
];

const EXERCISES = [
    { name: "Barbell Bench Press", focus: "Chest", weightRange: [60, 140] },
    { name: "Barbell Back Squat", focus: "Quads", weightRange: [70, 180] },
    { name: "Conventional Deadlift", focus: "Back", weightRange: [90, 220] },
    { name: "Overhead Military Press", focus: "Delts", weightRange: [40, 90] },
    { name: "Weighted Pull-ups", focus: "Back", weightRange: [10, 40] },
    { name: "Romanian Deadlift", focus: "Hamstrings", weightRange: [60, 140] },
    { name: "Incline Dumbbell Press", focus: "Chest", weightRange: [24, 48] },
    { name: "Barbell Bicep Curl", focus: "Arms", weightRange: [25, 55] },
    { name: "Tricep Rope Pushdown", focus: "Arms", weightRange: [20, 50] },
    { name: "Hanging Leg Raises", focus: "Core", weightRange: [0, 10] }
];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDatePast(daysAgoMax = 365) {
    const d = new Date();
    const pastDays = randomInt(1, daysAgoMax);
    d.setDate(d.getDate() - pastDays);
    d.setHours(randomInt(6, 21), randomInt(0, 59), randomInt(0, 59));
    return d.toISOString();
}

console.log("Generating 5,000 realistic athletic customer profiles & event records...");

const usersMap = {};
const storeOrders = [];
const trainerSubscriptions = [];
const payments = [];
const exerciseLogs = [];
const workoutSessions = [];
const inquiries = [];

const TOTAL_CUSTOMERS = 5000;

for (let i = 1; i <= TOTAL_CUSTOMERS; i++) {
    const isMale = Math.random() > 0.40;
    const firstName = isMale ? randomChoice(FIRST_NAMES_MALE) : randomChoice(FIRST_NAMES_FEMALE);
    const lastName = randomChoice(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(10, 999)}`;
    const domain = randomChoice(["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "rediffmail.com"]);
    const email = `${emailPrefix}@${domain}`;
    const phone = `+91 ${randomChoice([98, 97, 99, 88, 86, 77, 91])}${randomInt(10000000, 99999999)}`;
    const branch = randomChoice(BRANCHES);
    const joinDate = randomDatePast(365);
    const fitnessGoal = randomChoice(["muscle-gain", "fat-loss", "strength", "hypertrophy", "athletic-conditioning"]);
    
    const currentWeight = isMale ? randomInt(62, 98) : randomInt(48, 75);
    const targetWeight = fitnessGoal === "muscle-gain" ? currentWeight + randomInt(4, 10) : currentWeight - randomInt(3, 8);

    // 1. User Record for Auth & Profile Hydration
    const userId = `usr_${i.toString().padStart(5, '0')}`;
    const userObj = {
        id: userId,
        name: fullName,
        email: email,
        phone: phone,
        address: `${branch.name}, ${branch.city}`,
        current_weight: currentWeight,
        target_weight: targetWeight,
        water_goal: randomChoice([2.5, 3.0, 3.5, 4.0]),
        calorie_goal: isMale ? randomInt(2200, 3200) : randomInt(1700, 2400),
        workout_days: randomChoice([3, 4, 5, 6]),
        fitness_goal: fitnessGoal,
        role: "athlete",
        created_at: joinDate
    };
    usersMap[email] = userObj;

    // 2. Membership Subscription
    const plan = randomChoice(MEMBERSHIP_PLANS);
    const isTrainerBooking = Math.random() > 0.65;
    const trainerName = isTrainerBooking ? randomChoice(TRAINERS) : "Gym General Membership";
    const subId = `sub_${i.toString().padStart(5, '0')}`;
    const paymentId = `pay_sub_${i.toString().padStart(5, '0')}`;

    const subObj = {
        id: subId,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        planName: `${plan.name} (${plan.cycle})`,
        trainerName: trainerName,
        amount: plan.price,
        branch: branch.name,
        paymentId: paymentId,
        createdAt: joinDate
    };
    trainerSubscriptions.push(subObj);

    payments.push({
        id: paymentId,
        amount: plan.price,
        kind: isTrainerBooking ? "trainer_subscription" : "membership_pass",
        customerName: fullName,
        createdAt: joinDate
    });

    // 3. Store Order for ~40% of members
    if (Math.random() < 0.40) {
        const prod = randomChoice(STORE_PRODUCTS);
        const orderId = `ord_${i.toString().padStart(5, '0')}`;
        const orderDate = randomDatePast(180);
        const payStoreId = `pay_store_${i.toString().padStart(5, '0')}`;

        storeOrders.push({
            id: orderId,
            customerName: fullName,
            customerEmail: email,
            customerPhone: phone,
            productName: prod.name,
            amount: prod.price,
            method: randomChoice(["UPI", "Card", "Net Banking"]),
            addressLine: `Flat ${randomInt(101, 904)}, Sai Residency`,
            city: branch.city,
            pincode: `${randomInt(400001, 411058)}`,
            items: [{ name: prod.name, price: prod.price, qty: 1 }],
            createdAt: orderDate
        });

        payments.push({
            id: payStoreId,
            amount: prod.price,
            kind: "store_checkout",
            customerName: fullName,
            createdAt: orderDate
        });
    }

    // 4. Exercise Logs for active lifters (~50% of members)
    if (Math.random() < 0.50) {
        const ex = randomChoice(EXERCISES);
        const logId = `log_${i.toString().padStart(5, '0')}`;
        const logDate = randomDatePast(60);

        exerciseLogs.push({
            id: logId,
            athleteName: fullName,
            athleteEmail: email,
            exerciseName: ex.name,
            focus: ex.focus,
            sets: randomChoice([3, 4, 5]),
            reps: randomChoice([6, 8, 10, 12]),
            weight: randomInt(ex.weightRange[0], ex.weightRange[1]),
            createdAt: logDate
        });
    }

    // 5. Workout Session (~45% of members)
    if (Math.random() < 0.45) {
        const sessId = `sess_${i.toString().padStart(5, '0')}`;
        const sessDate = randomDatePast(30);

        workoutSessions.push({
            id: sessId,
            athleteName: fullName,
            athleteEmail: email,
            programTitle: randomChoice(["6-Day Push-Pull-Legs", "Arnold Golden Era Hypertrophy", "4-Day Upper/Lower Strength", "3-Day Full Body Conditioning"]),
            durationMin: randomChoice([45, 60, 75, 90]),
            tonnageKg: randomInt(4500, 18500),
            createdAt: sessDate
        });
    }

    // 6. Inquiries (~8% of total volume)
    if (Math.random() < 0.08) {
        const inqId = `inq_${i.toString().padStart(5, '0')}`;
        const inqDate = randomDatePast(90);

        inquiries.push({
            id: inqId,
            fullName: fullName,
            email: email,
            phone: phone,
            branch: branch.name,
            type: randomChoice(["1-Day Free Trial", "Personal Training Consultation", "Corporate Wellness Proposal", "Annual Pass Inquiry"]),
            message: `Interested in joining ${branch.name} for ${fitnessGoal.replace('-', ' ')} training.`,
            createdAt: inqDate
        });
    }
}

// Assemble full central snapshot
const cloudSnapshot = {
    meta: {
        schemaVersion: 2,
        lastUpdated: new Date().toISOString(),
        cloudLabel: "Production Active (5,000 Verified Athletes)",
        totalAthletes: TOTAL_CUSTOMERS,
        note: "Pre-populated franchise production database containing 5,000 customers, store orders, subscriptions, and training telemetry."
    },
    storeOrders: storeOrders,
    trainerSubscriptions: trainerSubscriptions,
    payments: payments,
    exerciseLogs: exerciseLogs,
    workoutSessions: workoutSessions,
    schedules: [
        { name: "Power Yoga & Mobility", trainer: "Krunal", day: "Monday", time: "07:00" },
        { name: "HIIT Conditioning Blast", trainer: "Shruti", day: "Monday", time: "09:00" },
        { name: "Strength & Hypertrophy Max", trainer: "Aniruddha", day: "Monday", time: "18:00" },
        { name: "Olympic Lifting Clinic", trainer: "Vikram Malhotra", day: "Tuesday", time: "07:30" },
        { name: "Zumba Energy Party", trainer: "Tanvi", day: "Tuesday", time: "08:00" },
        { name: "Boxing Pro Drills", trainer: "Sumit", day: "Wednesday", time: "19:00" },
        { name: "Push-Pull-Legs Masterclass", trainer: "Pradeep Sargar", day: "Thursday", time: "18:30" },
        { name: "Glute & Core Aesthetic Lab", trainer: "Prachi Patil", day: "Friday", time: "17:00" }
    ],
    inquiries: inquiries,
    inventory: [
        { id: "EQ-001", name: "Technogym Excite Treadmill Pro", category: "Cardio", status: "Active", lastInspection: "2026-08-10" },
        { id: "EQ-002", name: "Eleiko Olympic Powerlifting Rack", category: "Strength", status: "Active", lastInspection: "2026-08-12" },
        { id: "EQ-003", name: "Concept2 Ergometer Rower", category: "Cardio", status: "Maintenance", lastInspection: "2026-08-15" },
        { id: "EQ-004", name: "Urethane Dumbbell Rack (2.5kg - 60kg)", category: "Strength", status: "Active", lastInspection: "2026-08-01" },
        { id: "EQ-005", name: "Hammer Strength Iso-Lateral Chest Press", category: "Strength", status: "Active", lastInspection: "2026-08-18" },
        { id: "EQ-006", name: "Watson Adjustable Incline Bench", category: "Strength", status: "Active", lastInspection: "2026-08-14" },
        { id: "EQ-007", name: "Peloton Commercial Bike+", category: "Cardio", status: "Repair", lastInspection: "2026-08-19" },
        { id: "EQ-008", name: "Assault AirBike Elite", category: "Cardio", status: "Active", lastInspection: "2026-08-05" }
    ]
};

// Write output files
const sharedDir = path.join(__dirname, '..', 'shared');
const seedJsPath = path.join(sharedDir, 'gym-seed-data.js');

const jsContent = `/**
 * HANUMAN GYM - 5,000 PRODUCTION CUSTOMER & SYSTEM DATASET
 * Auto-injected to hydrate Admin Dashboard, Athlete Directory, and Financials.
 */
(function(global) {
    global.GYM_SEED_DATABASE = ${JSON.stringify(cloudSnapshot)};
    global.GYM_SEED_USERS = ${JSON.stringify(usersMap)};

    // Universal Seeder function
    global.seed5000Records = function(force) {
        try {
            if (typeof localStorage === 'undefined') return;
            var currentMgmt = localStorage.getItem("gym_cloud_mgmt_v1");
            var needsMgmt = force || !currentMgmt;
            if (!needsMgmt && currentMgmt) {
                try {
                    var parsed = JSON.parse(currentMgmt);
                    if (!parsed.trainerSubscriptions || parsed.trainerSubscriptions.length < 1000 || !parsed.storeOrders || parsed.storeOrders.length < 500) {
                        needsMgmt = true;
                    }
                } catch(e) {
                    needsMgmt = true;
                }
            }

            if (needsMgmt) {
                localStorage.setItem("gym_cloud_mgmt_v1", JSON.stringify(global.GYM_SEED_DATABASE));
                console.log("[Seeder] Loaded 5,000 customer & system records into gym_cloud_mgmt_v1");
            }

            var currentUsers = localStorage.getItem("gym_local_users");
            var needsUsers = force || !currentUsers;
            if (!needsUsers && currentUsers) {
                try {
                    var parsedU = JSON.parse(currentUsers);
                    if (Object.keys(parsedU).length < 1000) {
                        needsUsers = true;
                    }
                } catch(e) {
                    needsUsers = true;
                }
            }

            if (needsUsers) {
                localStorage.setItem("gym_local_users", JSON.stringify(global.GYM_SEED_USERS));
                console.log("[Seeder] Loaded 5,000 registered athlete accounts into gym_local_users");
            }

            if (typeof window !== 'undefined' && window.hydrateFromCloud) {
                window.hydrateFromCloud();
            }
        } catch(e) {
            console.warn("[Seeder storage notice]", e.message);
        }
    };

    // Auto-seed on load
    global.seed5000Records(false);
})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync(seedJsPath, jsContent, 'utf8');

console.log(`\n✅ Generated 5,000 Customer Profiles!`);
console.log(`   - Total Members / Subscriptions: ${trainerSubscriptions.length}`);
console.log(`   - Total Store Orders: ${storeOrders.length}`);
console.log(`   - Total Payments: ${payments.length}`);
console.log(`   - Total Exercise Logs: ${exerciseLogs.length}`);
console.log(`   - Total Workout Sessions: ${workoutSessions.length}`);
console.log(`   - Total Inquiries: ${inquiries.length}`);
console.log(`   - Saved to: ${seedJsPath} (${(fs.statSync(seedJsPath).size / 1024 / 1024).toFixed(2)} MB)\n`);
