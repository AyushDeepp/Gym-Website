import mongoose from "mongoose";
import dotenv from "dotenv";
import Exercise from "../models/Exercise.js";

dotenv.config();

const demoExercises = [
  {
    name: "Barbell Bench Press",
    slug: "barbell-bench-press",
    muscleGroup: "chest",
    subMuscles: ["upper chest", "middle chest", "lower chest"],
    equipment: ["barbell"],
    movementType: "push",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "The barbell bench press is a compound exercise that primarily targets the chest, shoulders, and triceps. It's one of the most effective exercises for building upper body strength and muscle mass.",
    instructions: [
      "Lie flat on a bench with your feet firmly on the ground.",
      "Grip the barbell slightly wider than shoulder-width apart.",
      "Unrack the bar and hold it directly over your chest with arms extended.",
      "Lower the bar to your chest with control, keeping your elbows at a 45-degree angle.",
      "Press the bar back up explosively until your arms are fully extended.",
      "Keep your core tight and maintain a slight arch in your back throughout the movement.",
    ],
    cues: [
      "Retract your shoulder blades before unracking.",
      "Keep your wrists straight and grip tight.",
      "Control the descent - 2-3 seconds down.",
      "Drive through your feet for stability.",
      "Squeeze your chest at the top of the movement.",
    ],
    setsReps: {
      strength: "3-5 sets × 3–5 reps",
      hypertrophy: "3–4 × 8–12",
      endurance: "2–3 × 15–20",
    },
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    commonMistakes: [
      "Bouncing the bar off the chest",
      "Flaring elbows too wide (should be 45 degrees)",
      "Lifting feet off the ground",
      "Not controlling the descent",
      "Arching back excessively",
    ],
    variations: [
      "Incline Bench Press (upper chest focus)",
      "Decline Bench Press (lower chest focus)",
      "Dumbbell Bench Press (greater range of motion)",
      "Close-Grip Bench Press (triceps focus)",
    ],
    alternativeNames: ["Flat Bench Press", "BB Bench Press"],
    safetyTips: [
      "Always use a spotter when lifting heavy weights",
      "Use safety bars or spotters in a power rack",
      "Start with lighter weights to perfect form",
      "Warm up thoroughly before heavy sets",
    ],
    suggestedWarmups: [
      "Light bench press (50% of working weight)",
      "Push-ups",
      "Shoulder mobility exercises",
    ],
  },
  {
    name: "Barbell Back Squat",
    slug: "barbell-back-squat",
    muscleGroup: "legs",
    subMuscles: ["quads", "glutes", "hamstrings"],
    equipment: ["barbell"],
    movementType: "squat",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "The barbell squat is the king of leg exercises, targeting your quadriceps, hamstrings, glutes, and core. It's essential for building lower body strength and power.",
    instructions: [
      "Position the barbell on your upper back, resting on your traps.",
      "Stand with feet shoulder-width apart, toes slightly pointed out.",
      "Keep your chest up and core engaged.",
      "Lower your body by bending your knees and pushing your hips back.",
      "Descend until your thighs are parallel to the floor or lower.",
      "Drive through your heels to return to the starting position.",
      "Keep your knees tracking over your toes throughout.",
    ],
    cues: [
      "Break at the hips first, then knees",
      "Keep your chest up throughout",
      "Drive your knees out, not in",
      "Push through your heels, not toes",
      "Breathe in on the way down, out on the way up",
    ],
    setsReps: {
      strength: "3-5 sets × 3–5 reps",
      hypertrophy: "3–4 × 8–12",
      endurance: "2–3 × 15–20",
    },
    videoUrl: "https://www.youtube.com/embed/Dy28eq2PjcM",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    commonMistakes: [
      "Knees caving inward",
      "Leaning too far forward",
      "Not going deep enough",
      "Rising onto toes",
      "Losing core tension",
    ],
    variations: [
      "Front Squat (more quad focus)",
      "Goblet Squat (beginner-friendly)",
      "Bulgarian Split Squat (unilateral)",
      "Box Squat (depth control)",
    ],
    alternativeNames: ["Back Squat", "BB Squat", "High Bar Squat"],
    safetyTips: [
      "Use safety bars in a power rack",
      "Start with bodyweight or light weight to perfect form",
      "Warm up your hips and ankles before squatting",
      "Don't sacrifice depth for weight",
    ],
    suggestedWarmups: [
      "Bodyweight squats",
      "Leg swings",
      "Hip mobility exercises",
      "Light squats with empty bar",
    ],
  },
  {
    name: "Conventional Deadlift",
    slug: "conventional-deadlift",
    muscleGroup: "back",
    subMuscles: ["lats", "traps", "lower back", "upper back"],
    equipment: ["barbell"],
    movementType: "hinge",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "The deadlift is a fundamental compound movement that works your entire posterior chain, including your back, glutes, and hamstrings. It's one of the best exercises for overall strength.",
    instructions: [
      "Stand with feet hip-width apart, bar over the middle of your feet.",
      "Bend at the hips and knees to grip the bar with hands just outside your legs.",
      "Keep your back straight and chest up.",
      "Take a deep breath and brace your core.",
      "Drive through your heels and extend your hips and knees simultaneously.",
      "Stand tall with the bar at hip level, shoulders back.",
      "Lower the bar by pushing your hips back and bending your knees.",
    ],
    cues: [
      "Keep the bar close to your body throughout",
      "Pull the slack out of the bar before lifting",
      "Drive your hips forward, not pull with your back",
      "Keep your lats engaged (shoulders back)",
      "Finish by squeezing your glutes at the top",
    ],
    setsReps: {
      strength: "3-5 sets × 3–5 reps",
      hypertrophy: "3–4 × 6–10",
      endurance: "2–3 × 12–15",
    },
    videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    commonMistakes: [
      "Rounding the back",
      "Bar drifting away from body",
      "Hips rising too fast",
      "Not bracing the core",
      "Hyperextending at the top",
    ],
    variations: [
      "Romanian Deadlift (RDL) - hamstring focus",
      "Sumo Deadlift - wider stance",
      "Trap Bar Deadlift - easier on lower back",
      "Stiff Leg Deadlift - hamstring emphasis",
    ],
    alternativeNames: ["Deadlift", "DL", "Conventional DL"],
    safetyTips: [
      "Always use proper form over heavy weight",
      "Use a mixed grip for heavy weights (one over, one under)",
      "Keep the bar close - it should scrape your shins",
      "Don't round your back - maintain neutral spine",
    ],
    suggestedWarmups: [
      "Light deadlifts (50% of working weight)",
      "Romanian deadlifts with light weight",
      "Hip mobility exercises",
      "Lower back stretches",
    ],
  },
  {
    name: "Pull-Ups",
    slug: "pull-ups",
    muscleGroup: "back",
    subMuscles: ["lats", "upper back", "traps"],
    equipment: ["bodyweight"],
    movementType: "pull",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "Pull-ups are an excellent bodyweight exercise for building upper body strength, particularly targeting your back, biceps, and shoulders.",
    instructions: [
      "Hang from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width.",
      "Engage your core and keep your body straight.",
      "Pull your body up until your chin clears the bar.",
      "Lower yourself with control until your arms are fully extended.",
      "Repeat for the desired number of reps.",
    ],
    cues: [
      "Pull with your back, not just your arms",
      "Keep your shoulders down and away from your ears",
      "Squeeze your lats at the top",
      "Control the descent - don't drop",
      "Keep your core tight throughout",
    ],
    setsReps: {
      strength: "3-5 sets × 3–8 reps",
      hypertrophy: "3–4 × 8–12",
      endurance: "2–3 × 15–20",
    },
    videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    commonMistakes: [
      "Swinging or using momentum",
      "Not going full range of motion",
      "Pulling with arms only",
      "Shrugging shoulders",
      "Not controlling the negative",
    ],
    variations: [
      "Assisted Pull-Ups (using band or machine)",
      "Chin-Ups (underhand grip)",
      "Wide-Grip Pull-Ups",
      "Weighted Pull-Ups",
    ],
    alternativeNames: ["Pullups", "Chin-Ups (when using underhand grip)"],
    safetyTips: [
      "Start with assisted pull-ups if you can't do full reps",
      "Use proper grip - don't grip too wide",
      "Warm up your shoulders before",
      "Stop if you feel shoulder pain",
    ],
    suggestedWarmups: [
      "Scapular wall slides",
      "Hanging from bar (dead hang)",
      "Band pull-aparts",
      "Light rows",
    ],
  },
  {
    name: "Dumbbell Bicep Curls",
    slug: "dumbbell-bicep-curls",
    muscleGroup: "arms",
    subMuscles: ["biceps"],
    equipment: ["dumbbell"],
    movementType: "pull",
    difficulty: "beginner",
    goals: ["muscle building"],
    exerciseType: "isolation",
    description:
      "Dumbbell bicep curls are an isolation exercise that specifically targets the biceps brachii, helping to build arm strength and muscle definition.",
    instructions: [
      "Stand with feet shoulder-width apart, holding dumbbells at your sides.",
      "Keep your elbows close to your torso and palms facing forward.",
      "Curl the weights while contracting your biceps.",
      "Continue to raise the weights until your biceps are fully contracted.",
      "Slowly lower the dumbbells back to the starting position.",
      "Keep your upper arms stationary throughout.",
    ],
    cues: [
      "Squeeze your biceps at the top",
      "Control the weight on the way down",
      "Don't swing your body",
      "Keep your core engaged",
      "Focus on the mind-muscle connection",
    ],
    setsReps: {
      strength: "3-4 sets × 6–8 reps",
      hypertrophy: "3–4 × 10–15",
      endurance: "2–3 × 15–20",
    },
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    commonMistakes: [
      "Swinging the weights using momentum",
      "Moving the elbows",
      "Not controlling the negative",
      "Using too much weight",
      "Not going through full range of motion",
    ],
    variations: [
      "Hammer Curls (neutral grip)",
      "Concentration Curls (seated, one arm)",
      "Cable Curls",
      "Preacher Curls",
    ],
    alternativeNames: ["Bicep Curls", "DB Curls", "Dumbbell Curls"],
    safetyTips: [
      "Don't use momentum - control the weight",
      "Start with lighter weights to perfect form",
      "Keep your back straight",
      "Don't fully lock out at the bottom",
    ],
    suggestedWarmups: [
      "Light bicep curls (50% of working weight)",
      "Arm circles",
      "Wrist mobility exercises",
    ],
  },
  {
    name: "Overhead Press",
    slug: "overhead-press",
    muscleGroup: "shoulders",
    subMuscles: ["front delts", "lateral delts"],
    equipment: ["barbell", "dumbbell"],
    movementType: "push",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "The overhead press is a compound movement that builds shoulder strength and stability while also engaging your core, triceps, and upper back.",
    instructions: [
      "Stand with feet shoulder-width apart, holding the bar at shoulder height.",
      "Grip the bar slightly wider than shoulder-width.",
      "Keep your core tight and maintain a slight arch in your lower back.",
      "Press the bar straight up until your arms are fully extended overhead.",
      "Lower the bar with control back to shoulder height.",
    ],
    cues: [
      "Press in a straight line, not forward",
      "Keep your core engaged throughout",
      "Breathe out as you press up",
      "Don't lean back excessively",
      "Squeeze your glutes for stability",
    ],
    setsReps: {
      strength: "3-5 sets × 3–6 reps",
      hypertrophy: "3–4 × 8–12",
      endurance: "2–3 × 12–15",
    },
    videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    commonMistakes: [
      "Leaning back too much",
      "Pressing forward instead of up",
      "Not bracing the core",
      "Flaring elbows out",
      "Not going through full range of motion",
    ],
    variations: [
      "Dumbbell Overhead Press",
      "Push Press (uses leg drive)",
      "Seated Overhead Press",
      "Arnold Press",
    ],
    alternativeNames: ["OHP", "Shoulder Press", "Military Press"],
    safetyTips: [
      "Start with lighter weights to perfect form",
      "Warm up your shoulders thoroughly",
      "Use a spotter for heavy weights",
      "Stop if you feel shoulder impingement",
    ],
    suggestedWarmups: [
      "Light overhead press (empty bar)",
      "Shoulder mobility exercises",
      "Band pull-aparts",
      "Arm circles",
    ],
  },
  {
    name: "Plank",
    slug: "plank",
    muscleGroup: "core",
    subMuscles: ["upper abs", "lower abs", "obliques", "stability"],
    equipment: ["bodyweight"],
    movementType: "isometric",
    difficulty: "beginner",
    goals: ["muscle building", "fat loss conditioning", "warm-up activation"],
    exerciseType: "isolation",
    description:
      "The plank is an isometric core exercise that strengthens your entire core, improves posture, and enhances stability. It's a fundamental exercise for core strength.",
    instructions: [
      "Start in a push-up position with your hands directly under your shoulders.",
      "Lower onto your forearms, keeping your elbows aligned with your shoulders.",
      "Keep your body in a straight line from head to heels.",
      "Engage your core and hold the position.",
      "Breathe normally while maintaining the position.",
    ],
    cues: [
      "Keep your hips level - don't let them sag",
      "Engage your entire core, not just your abs",
      "Keep your neck neutral",
      "Breathe normally",
      "Focus on maintaining perfect form",
    ],
    setsReps: {
      strength: "3-4 sets × 30–60 seconds",
      hypertrophy: "3–4 × 45–90 seconds",
      endurance: "2–3 × 60–120 seconds",
    },
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    commonMistakes: [
      "Letting hips sag",
      "Raising hips too high",
      "Looking up (should look down)",
      "Holding breath",
      "Not engaging core properly",
    ],
    variations: [
      "Side Plank",
      "Plank with Leg Lift",
      "Plank with Arm Lift",
      "Weighted Plank",
    ],
    alternativeNames: ["Forearm Plank", "Front Plank"],
    safetyTips: [
      "Start with shorter holds and build up",
      "Stop if you feel lower back pain",
      "Focus on form over duration",
      "Don't hold your breath",
    ],
    suggestedWarmups: [
      "Cat-cow stretches",
      "Light core activation",
      "Hip mobility exercises",
    ],
  },
  {
    name: "Romanian Deadlift",
    slug: "romanian-deadlift",
    muscleGroup: "legs",
    subMuscles: ["hamstrings", "glutes"],
    equipment: ["barbell", "dumbbell"],
    movementType: "hinge",
    difficulty: "intermediate",
    goals: ["muscle building", "strength training"],
    exerciseType: "compound",
    description:
      "The Romanian deadlift (RDL) is a variation of the deadlift that emphasizes the hamstrings and glutes while also working your lower back and core.",
    instructions: [
      "Stand holding a barbell or dumbbells in front of your thighs.",
      "Keep your legs slightly bent and maintain this slight bend throughout.",
      "Hinge at your hips, pushing them back while lowering the weight.",
      "Lower until you feel a stretch in your hamstrings (usually mid-shin level).",
      "Drive your hips forward to return to the starting position.",
      "Keep the weight close to your body throughout.",
    ],
    cues: [
      "Feel the stretch in your hamstrings",
      "Push your hips back, not down",
      "Keep the weight close to your body",
      "Drive your hips forward to stand up",
      "Keep your back neutral",
    ],
    setsReps: {
      strength: "3-4 sets × 6–8 reps",
      hypertrophy: "3–4 × 8–12",
      endurance: "2–3 × 12–15",
    },
    videoUrl: "https://www.youtube.com/embed/JCXUYuzwNrM",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    commonMistakes: [
      "Bending knees too much (becomes a squat)",
      "Rounding the back",
      "Not feeling hamstring stretch",
      "Going too low",
      "Not keeping weight close",
    ],
    variations: [
      "Single-Leg Romanian Deadlift",
      "Dumbbell Romanian Deadlift",
      "Cable Romanian Deadlift",
      "Stiff Leg Deadlift",
    ],
    alternativeNames: ["RDL", "Romanian DL"],
    safetyTips: [
      "Start with lighter weights to feel the movement",
      "Focus on the hamstring stretch",
      "Don't round your back",
      "Keep core engaged",
    ],
    suggestedWarmups: [
      "Light RDLs (empty bar or light weight)",
      "Hip mobility exercises",
      "Hamstring stretches",
    ],
  },
  {
    name: "Push-Ups",
    slug: "push-ups",
    muscleGroup: "chest",
    subMuscles: ["upper chest", "middle chest"],
    equipment: ["bodyweight"],
    movementType: "push",
    difficulty: "beginner",
    goals: ["muscle building", "strength training", "fat loss conditioning"],
    exerciseType: "compound",
    description:
      "Push-ups are a classic bodyweight exercise that builds upper body strength, targeting your chest, shoulders, and triceps. They can be modified for all fitness levels.",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulder-width.",
      "Keep your body in a straight line from head to heels.",
      "Lower your body until your chest nearly touches the floor.",
      "Push back up to the starting position.",
      "Keep your core engaged throughout the movement.",
    ],
    cues: [
      "Keep your elbows at a 45-degree angle",
      "Don't let your hips sag",
      "Lower with control",
      "Push through your palms",
      "Keep your neck neutral",
    ],
    setsReps: {
      strength: "3-4 sets × 5–10 reps",
      hypertrophy: "3–4 × 10–20",
      endurance: "2–3 × 20–30",
    },
    videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    commonMistakes: [
      "Elbows flaring out too wide",
      "Hips sagging",
      "Not going full range of motion",
      "Moving too fast",
      "Not engaging core",
    ],
    variations: [
      "Knee Push-Ups (easier)",
      "Incline Push-Ups (easier)",
      "Decline Push-Ups (harder)",
      "Diamond Push-Ups (triceps focus)",
      "Weighted Push-Ups",
    ],
    alternativeNames: ["Press-Ups"],
    safetyTips: [
      "Start with knee or incline push-ups if needed",
      "Focus on form over quantity",
      "Stop if you feel wrist pain",
      "Warm up your shoulders",
    ],
    suggestedWarmups: [
      "Arm circles",
      "Shoulder mobility exercises",
      "Light push-ups",
    ],
  },
  {
    name: "Running (Treadmill)",
    slug: "running-treadmill",
    muscleGroup: "legs",
    subMuscles: ["quads", "calves", "glutes"],
    equipment: ["cardio machines"],
    movementType: "cardio",
    difficulty: "beginner",
    goals: ["fat loss conditioning", "warm-up activation"],
    exerciseType: "compound",
    description:
      "Running on a treadmill is an excellent cardiovascular exercise that improves heart health, burns calories, and enhances endurance. It's perfect for all fitness levels.",
    instructions: [
      "Start by walking at a comfortable pace for 2-3 minutes to warm up.",
      "Gradually increase the speed to your running pace.",
      "Maintain good posture: keep your head up, shoulders relaxed, and core engaged.",
      "Land on the middle of your foot, not your heel or toes.",
      "Swing your arms naturally at your sides.",
      "Cool down by gradually reducing speed and walking for 2-3 minutes.",
    ],
    cues: [
      "Maintain an upright posture",
      "Land softly on your feet",
      "Keep your stride natural",
      "Breathe rhythmically",
      "Stay relaxed",
    ],
    setsReps: {
      strength: "N/A",
      hypertrophy: "N/A",
      endurance: "20-30 minutes continuous",
    },
    videoUrl: "https://www.youtube.com/embed/ok9D0u7P8-c",
    imageUrl:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
    commonMistakes: [
      "Holding onto the handrails",
      "Overstriding",
      "Running on toes only",
      "Not warming up",
      "Increasing speed too quickly",
    ],
    variations: [
      "Interval Running (HIIT)",
      "Incline Running",
      "Outdoor Running",
      "Sprint Intervals",
    ],
    alternativeNames: ["Treadmill Running", "Cardio Running"],
    safetyTips: [
      "Start slow and gradually increase intensity",
      "Stay hydrated",
      "Wear proper running shoes",
      "Listen to your body and take rest days",
      "Warm up and cool down properly",
    ],
    suggestedWarmups: ["5-minute walk", "Light jogging", "Dynamic stretches"],
  },
];

const seedExercises = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/gym-website"
    );
    console.log("✅ MongoDB Connected");

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log("🗑️  Cleared existing exercises");

    // Insert demo exercises
    const exercises = await Exercise.insertMany(demoExercises);
    console.log(`✅ Successfully seeded ${exercises.length} exercises!`);

    exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (${exercise.muscleGroup})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding exercises:", error);
    process.exit(1);
  }
};

seedExercises();
