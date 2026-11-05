/**
 * HANUMAN GYM - WORLD-CLASS WORKOUT PROGRAMS & LIVE FLOOR ENGINE
 * High-performance instant training blueprints, 2-Column Command Hub, Split Matcher,
 * Split Inspector Drawer, Web Audio rest timers, Video Technique HUD, and 1-Click Cloud Sync.
 */

(function () {
  'use strict';

  // 1. MASTER INSTANT WORKOUT BLUEPRINT DATA (7 ELITE TEMPLATES)
  const WORKOUT_BLUEPRINTS = [
    {
      id: 'ppl_hypertrophy',
      name: '6-Day Push-Pull-Legs (PPL) Mass Builder',
      badge: 'Gold Standard',
      muscles: ['Chest', 'Back', 'Delts', 'Quads', 'Arms'],
      category: 'ppl',
      daysPerWeek: '6 Days / Week',
      duration: '60-75 min',
      level: 'Intermediate - Advanced',
      goal: 'Hypertrophy & Density',
      description: 'The golden standard split for maximizing training frequency and localized muscle recovery. Hits every muscle group twice every 7 days.',
      weeklySchedule: [
        {
          day: 'Day 1: Push A (Chest, Shoulders & Triceps Focus)',
          tag: 'Push A',
          exercises: [
            { name: 'Barbell Bench Press', sets: '4 Sets', reps: '6-8 Reps', rest: '120s', video: 'Barbell Bench Press.mp4', cues: 'Retract scapulae, touch lower sternum, drive heels into floor.' },
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Dumbell bench press.mp4', cues: '30-degree bench angle, tuck elbows 45 degrees.' },
            { name: 'Dumbbell Lateral Raises', sets: '4 Sets', reps: '12-15 Reps', rest: '60s', video: 'Lateral Raises.mp4', cues: 'Lead with elbows, slight forward torso lean, pause at top.' },
            { name: 'Overhead Shoulder Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Military Press.mp4', cues: 'Brace core, push head through window at lockout.' },
            { name: 'Triceps Rope Pushdown', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'tricep dips.mp4', cues: 'Spread the rope at bottom extension, keep elbows pinned.' }
          ]
        },
        {
          day: 'Day 2: Pull A (Back, Rear Delts & Biceps Focus)',
          tag: 'Pull A',
          exercises: [
            { name: 'Deadlifts', sets: '4 Sets', reps: '5 Reps', rest: '180s', video: 'deadlift.mp4', cues: 'Engage lats, wedge hips into bar, explode through midfoot.' },
            { name: 'Lat Pulldowns', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'Lat pulldown.mp4', cues: 'Drive elbows down and back, squeeze lower lats at collarbone.' },
            { name: 'Chest Supported Dumbbell Rows', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'double arm dumbell rows.mp4', cues: 'Eliminate momentum, pull toward hip pockets.' },
            { name: 'Face Pulls', sets: '4 Sets', reps: '15-20 Reps', rest: '60s', video: 'Rear Delt Flyes.mp4', cues: 'Pull rope toward eye level with thumbs pointed back.' },
            { name: 'Barbell Bicep Curls', sets: '3 Sets', reps: '10-12 Reps', rest: '60s', video: 'Barbell bicep curls.mp4', cues: 'Supinate fully at peak, strict 2-second eccentric lowering.' }
          ]
        },
        {
          day: 'Day 3: Legs A (Quads & Calves Heavy)',
          tag: 'Legs A',
          exercises: [
            { name: 'Barbell Squat', sets: '4 Sets', reps: '6-8 Reps', rest: '180s', video: 'Squats.mp4', cues: 'Spread floor with feet, break at hips and knees, hit parallel depth.' },
            { name: 'Leg Press', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'Leg Press.mp4', cues: 'Place feet shoulder-width, never lock knees at top.' },
            { name: 'Leg Extensions', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Leg Press.mp4', cues: 'Pause for 1 full second at peak extension.' },
            { name: 'Romanian Deadlifts', sets: '3 Sets', reps: '8-10 Reps', rest: '120s', video: 'Romanian Deadlifts.mp4', cues: 'Push hips back until deep hamstring stretch is felt.' },
            { name: 'Standing Calf Raises', sets: '4 Sets', reps: '15-20 Reps', rest: '60s', video: 'Walking Lunges.mp4', cues: 'Full stretch at bottom, 2-second hold on toes.' }
          ]
        },
        {
          day: 'Day 4: Push B (Upper Chest & Shoulder Hypertrophy)',
          tag: 'Push B',
          exercises: [
            { name: 'Incline Barbell Press', sets: '4 Sets', reps: '8-10 Reps', rest: '120s', video: 'Incline bench press.mp4', cues: 'Target upper chest, controlled 3-second lowering.' },
            { name: 'Cable Chest Flyes', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'cable chest flyes.mp4', cues: 'Maintain slight elbow bend, hug an imaginary tree.' },
            { name: 'Dumbbell Shoulder Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Arnold Press.mp4', cues: 'Press in natural arc without clanking dumbbells.' },
            { name: 'Cable Lateral Raises', sets: '3 Sets', reps: '15 Reps', rest: '60s', video: 'Lateral Raises.mp4', cues: 'Constant tension, lead with side deltoid.' },
            { name: 'Skull Crushers', sets: '3 Sets', reps: '10-12 Reps', rest: '60s', video: 'overhead tricep extension.mp4', cues: 'Lower bar toward hairline, keep elbows vertical.' }
          ]
        },
        {
          day: 'Day 5: Pull B (Upper Back Width & Arm Density)',
          tag: 'Pull B',
          exercises: [
            { name: 'Pull-ups', sets: '4 Sets', reps: '8-10 Reps', rest: '120s', video: 'pull ups.mp4', cues: 'Dead hang stretch, drive chest to bar, full ROM.' },
            { name: 'Barbell Bent Over Rows', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'Landmine rows.mp4', cues: '45-degree torso angle, pull bar to belly button.' },
            { name: 'Single Arm Dumbbell Rows', sets: '3 Sets', reps: '10-12 Reps', rest: '60s', video: 'double arm dumbell rows.mp4', cues: 'Keep spine neutral, stretch forward at bottom.' },
            { name: 'Incline Dumbbell Hammer Curls', sets: '3 Sets', reps: '12 Reps', rest: '60s', video: 'Hammer curl.mp4', cues: 'Neutral grip for brachialis and forearm thickness.' },
            { name: 'Concentration Curls', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'concentration curls.mp4', cues: 'Anchor elbow against inner thigh, peak squeeze.' }
          ]
        },
        {
          day: 'Day 6: Legs B (Posterior Chain & Hamstring Focus)',
          tag: 'Legs B',
          exercises: [
            { name: 'Romanian Deadlifts', sets: '4 Sets', reps: '8-10 Reps', rest: '120s', video: 'Romanian Deadlifts.mp4', cues: 'Slight knee bend, hinge back, load hamstrings.' },
            { name: 'Lying Leg Curls', sets: '4 Sets', reps: '10-12 Reps', rest: '60s', video: 'Romanian Deadlifts.mp4', cues: 'Keep hips pressed into pad, control eccentric phase.' },
            { name: 'Walking Dumbbell Lunges', sets: '3 Sets', reps: '12 Reps/leg', rest: '90s', video: 'Walking Lunges.mp4', cues: 'Long stride for glutes, short stride for quads.' },
            { name: 'Leg Press (High & Wide Foot Placement)', sets: '3 Sets', reps: '12 Reps', rest: '90s', video: 'Leg Press.mp4', cues: 'Recruits gluteus maximus and adductors.' },
            { name: 'Seated Calf Raises', sets: '4 Sets', reps: '15-20 Reps', rest: '60s', video: 'Squats.mp4', cues: 'Isolates soleus muscle with knees bent 90 degrees.' }
          ]
        }
      ]
    },
    {
      id: 'arnold_split',
      name: '6-Day Arnold Golden Era Hypertrophy',
      badge: 'Classic Bodybuilding',
      muscles: ['Chest & Back', 'Shoulders & Arms', 'Legs & Core'],
      category: 'arnold',
      daysPerWeek: '6 Days / Week',
      duration: '70-85 min',
      level: 'Advanced',
      goal: 'V-Taper Mass & Antagonist Pump',
      description: 'The legendary agonist-antagonist split popularized by Arnold Schwarzenegger. Pairs opposing muscle groups for intense metabolic pumps and dense V-tapers.',
      weeklySchedule: [
        {
          day: 'Day 1 & 4: Chest & Back Supersets',
          tag: 'Chest/Back',
          exercises: [
            { name: 'Barbell Bench Press', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'Barbell Bench Press.mp4', cues: 'Heavy antagonist pair with barbell rows.' },
            { name: 'Barbell Bent Over Rows', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'Landmine rows.mp4', cues: 'Squeeze middle trapezius and lat fibers.' },
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '10-12 Reps', rest: '75s', video: 'Dumbell bench press.mp4', cues: 'Upper clavicular head pump.' },
            { name: 'Pull-ups (Wide Grip)', sets: '3 Sets', reps: '10 Reps', rest: '75s', video: 'pull ups.mp4', cues: 'Full vertical stretch.' },
            { name: 'Dumbbell Flyes', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Dumbell flyes.mp4', cues: 'Deep stretch at bottom.' }
          ]
        },
        {
          day: 'Day 2 & 5: Shoulders & Arms High Volume',
          tag: 'Arms/Delts',
          exercises: [
            { name: 'Overhead Shoulder Press', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'Military Press.mp4', cues: 'Explosive overhead thrust.' },
            { name: 'Dumbbell Lateral Raises', sets: '5 Sets', reps: '15 Reps', rest: '45s', video: 'Lateral Raises.mp4', cues: 'Side delt cap isolation.' },
            { name: 'Barbell Bicep Curls', sets: '4 Sets', reps: '10-12 Reps', rest: '60s', video: 'Barbell bicep curls.mp4', cues: 'Strict bicep peak work.' },
            { name: 'Skull Crushers', sets: '4 Sets', reps: '10-12 Reps', rest: '60s', video: 'overhead tricep extension.mp4', cues: 'Triceps long head elongation.' },
            { name: 'Incline Dumbbell Hammer Curls', sets: '3 Sets', reps: '12-15 Reps', rest: '45s', video: 'Hammer curl.mp4', cues: 'Forearms and brachialis pump.' }
          ]
        },
        {
          day: 'Day 3 & 6: Legs & Core Power',
          tag: 'Legs/Core',
          exercises: [
            { name: 'Barbell Squat', sets: '4 Sets', reps: '8-10 Reps', rest: '150s', video: 'Squats.mp4', cues: 'Deep quad recruitment.' },
            { name: 'Romanian Deadlifts', sets: '4 Sets', reps: '10 Reps', rest: '120s', video: 'Romanian Deadlifts.mp4', cues: 'Hamstring loading.' },
            { name: 'Walking Dumbbell Lunges', sets: '3 Sets', reps: '12 Reps/leg', rest: '90s', video: 'Walking Lunges.mp4', cues: 'Glute and quad density.' },
            { name: 'Standing Calf Raises', sets: '5 Sets', reps: '20 Reps', rest: '45s', video: 'Walking Lunges.mp4', cues: 'Full burn on gastrocnemius.' },
            { name: 'Planks', sets: '3 Sets', reps: '60s Hold', rest: '60s', video: 'Planks.mp4', cues: 'Rigid anterior core bracing.' }
          ]
        }
      ]
    },
    {
      id: 'glute_sculpt',
      name: '4-Day Glute, Hamstring & Core Aesthetic Sculpt',
      badge: 'Aesthetic Focus',
      muscles: ['Glutes', 'Hamstrings', 'V-Taper Lats', 'Core'],
      category: 'glute_sculpt',
      daysPerWeek: '4 Days / Week',
      duration: '50-60 min',
      level: 'All Levels',
      goal: 'Posterior Chain Hypertrophy',
      description: 'Lower-body dominant periodized split engineered to maximize glute activation, hamstring sweep, and upper-body postural balance.',
      weeklySchedule: [
        {
          day: 'Day 1: Glute Hypertrophy & Hip Thrust Primary',
          tag: 'Glute Power',
          exercises: [
            { name: 'Hip Thrust / Barbell Glute Bridge', sets: '4 Sets', reps: '10-12 Reps', rest: '120s', video: 'Squats.mp4', cues: 'Drive through heels, pause 2 full seconds at peak lockout.' },
            { name: 'Romanian Deadlifts', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'Romanian Deadlifts.mp4', cues: 'Hinge hips backward, keep dumbbells tight to shins.' },
            { name: 'Bulgarian Split Squats', sets: '3 Sets', reps: '10-12 Reps/leg', rest: '90s', video: 'Walking Lunges.mp4', cues: 'Forward torso lean to shift tension directly onto glute medius.' },
            { name: 'Leg Press (High Stance)', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Leg Press.mp4', cues: 'Feet at top edge of platform for glute-ham recruitment.' }
          ]
        },
        {
          day: 'Day 2: Upper Body Posture & V-Taper Flare',
          tag: 'Upper Posture',
          exercises: [
            { name: 'Lat Pulldowns', sets: '4 Sets', reps: '10-12 Reps', rest: '75s', video: 'Lat pulldown.mp4', cues: 'Retract scapulae to build back width that creates a narrower waist illusion.' },
            { name: 'Dumbbell Shoulder Press', sets: '3 Sets', reps: '10-12 Reps', rest: '60s', video: 'Arnold Press.mp4', cues: 'Controlled pressing mechanics.' },
            { name: 'Dumbbell Lateral Raises', sets: '4 Sets', reps: '15 Reps', rest: '45s', video: 'Lateral Raises.mp4', cues: 'Shoulder width capping.' },
            { name: 'Push-ups', sets: '3 Sets', reps: '12 Reps', rest: '60s', video: 'push ups.mp4', cues: 'Chest and core stability.' }
          ]
        },
        {
          day: 'Day 3: Hamstring Sweep & Posterior Chain Overload',
          tag: 'Hamstring Sweep',
          exercises: [
            { name: 'Deadlifts', sets: '4 Sets', reps: '6-8 Reps', rest: '150s', video: 'deadlift.mp4', cues: 'Total posterior chain recruitment.' },
            { name: 'Walking Dumbbell Lunges', sets: '3 Sets', reps: '15 Reps/leg', rest: '75s', video: 'Walking Lunges.mp4', cues: 'Deep knee flexion.' },
            { name: 'Lying Leg Curls', sets: '4 Sets', reps: '12-15 Reps', rest: '60s', video: 'Romanian Deadlifts.mp4', cues: 'Strict eccentric lowering.' },
            { name: 'Planks', sets: '3 Sets', reps: '60s', rest: '45s', video: 'Planks.mp4', cues: 'Abdominal wall tension.' }
          ]
        },
        {
          day: 'Day 4: Full Body Density & Conditioning',
          tag: 'Full Density',
          exercises: [
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '12 Reps', rest: '60s', video: 'Dumbell bench press.mp4', cues: 'Upper pectoral volume.' },
            { name: 'Chest Supported Dumbbell Rows', sets: '3 Sets', reps: '12 Reps', rest: '60s', video: 'double arm dumbell rows.mp4', cues: 'Rhomboid and lat squeeze.' },
            { name: 'Barbell Bicep Curls', sets: '3 Sets', reps: '12 Reps', rest: '45s', video: 'Barbell bicep curls.mp4', cues: 'Arm tone.' },
            { name: 'Triceps Rope Pushdown', sets: '3 Sets', reps: '15 Reps', rest: '45s', video: 'tricep dips.mp4', cues: 'Tricep tone.' }
          ]
        }
      ]
    },
    {
      id: 'upper_lower',
      name: '4-Day Upper / Lower Power & Hypertrophy',
      badge: 'Work-Life Balance',
      muscles: ['Chest', 'Back', 'Quads', 'Hamstrings', 'Arms'],
      category: 'upper_lower',
      daysPerWeek: '4 Days / Week',
      duration: '55-65 min',
      level: 'Beginner - Intermediate',
      goal: 'Strength & Athletic Physique',
      description: 'Ideal 4-day split offering optimal frequency, high recovery between sessions, and maximum compound strength adaptation.',
      weeklySchedule: [
        {
          day: 'Day 1: Upper Power Focus',
          tag: 'Upper Power',
          exercises: [
            { name: 'Barbell Bench Press', sets: '4 Sets', reps: '5 Reps', rest: '150s', video: 'Barbell Bench Press.mp4', cues: 'Heavy compound power drive.' },
            { name: 'Barbell Bent Over Rows', sets: '4 Sets', reps: '5 Reps', rest: '150s', video: 'Landmine rows.mp4', cues: 'Explosive pull to sternum, controlled lowering.' },
            { name: 'Overhead Shoulder Press', sets: '3 Sets', reps: '6 Reps', rest: '120s', video: 'Military Press.mp4', cues: 'Vertical pressing power.' },
            { name: 'Pull-ups (Weighted or Strict)', sets: '3 Sets', reps: '6-8 Reps', rest: '120s', video: 'pull ups.mp4', cues: 'Full deadhang extension.' },
            { name: 'Barbell Bicep Curls', sets: '3 Sets', reps: '8 Reps', rest: '60s', video: 'Barbell bicep curls.mp4', cues: 'Heavy strict arm work.' },
            { name: 'Skull Crushers', sets: '3 Sets', reps: '8 Reps', rest: '60s', video: 'overhead tricep extension.mp4', cues: 'Strict triceps extension.' }
          ]
        },
        {
          day: 'Day 2: Lower Power Focus',
          tag: 'Lower Power',
          exercises: [
            { name: 'Barbell Squat', sets: '4 Sets', reps: '5 Reps', rest: '180s', video: 'Squats.mp4', cues: 'Deep parallel squat drive.' },
            { name: 'Romanian Deadlifts', sets: '3 Sets', reps: '6-8 Reps', rest: '150s', video: 'Romanian Deadlifts.mp4', cues: 'Posterior chain loading.' },
            { name: 'Leg Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Leg Press.mp4', cues: 'Quad hypertrophy volume.' },
            { name: 'Standing Calf Raises', sets: '4 Sets', reps: '10-12 Reps', rest: '60s', video: 'Walking Lunges.mp4', cues: 'Calf power loading.' }
          ]
        },
        {
          day: 'Day 3: Upper Hypertrophy Focus',
          tag: 'Upper Hyper',
          exercises: [
            { name: 'Incline Dumbbell Press', sets: '4 Sets', reps: '8-12 Reps', rest: '90s', video: 'Dumbell bench press.mp4', cues: 'Upper pectoral mass.' },
            { name: 'Lat Pulldowns', sets: '4 Sets', reps: '10-12 Reps', rest: '90s', video: 'Lat pulldown.mp4', cues: 'Lat width and flare.' },
            { name: 'Dumbbell Lateral Raises', sets: '4 Sets', reps: '12-15 Reps', rest: '60s', video: 'Lateral Raises.mp4', cues: 'Shoulder width capping.' },
            { name: 'Cable Chest Flyes', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'cable chest flyes.mp4', cues: 'Pectoral stretch and peak squeeze.' },
            { name: 'Triceps Rope Pushdown', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'tricep dips.mp4', cues: 'Horseshoe tricep pump.' }
          ]
        },
        {
          day: 'Day 4: Lower Hypertrophy Focus',
          tag: 'Lower Hyper',
          exercises: [
            { name: 'Deadlifts', sets: '3 Sets', reps: '5-6 Reps', rest: '180s', video: 'deadlift.mp4', cues: 'Heavy full-body pull.' },
            { name: 'Leg Extensions', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Leg Press.mp4', cues: 'Quad teardrop definition.' },
            { name: 'Lying Leg Curls', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Romanian Deadlifts.mp4', cues: 'Hamstring isolation.' },
            { name: 'Walking Dumbbell Lunges', sets: '3 Sets', reps: '12 Reps/leg', rest: '90s', video: 'Walking Lunges.mp4', cues: 'Unilateral leg balance.' }
          ]
        }
      ]
    },
    {
      id: 'full_body_compound',
      name: '3-Day Full Body Compound Strength Peak',
      badge: 'Maximum Efficiency',
      muscles: ['Full Body', 'Squat', 'Bench', 'Deadlift', 'Core'],
      category: 'full_body',
      daysPerWeek: '3 Days / Week',
      duration: '50-60 min',
      level: 'All Levels',
      goal: 'Functional Strength',
      description: 'The classic high-stimulus full body routine. Triggers full-body hormonal and metabolic elevation every other day.',
      weeklySchedule: [
        {
          day: 'Day 1: Full Body Compound A',
          tag: 'Full Body A',
          exercises: [
            { name: 'Barbell Squat', sets: '3 Sets', reps: '6-8 Reps', rest: '150s', video: 'Squats.mp4', cues: 'Clean depth, chest proud.' },
            { name: 'Barbell Bench Press', sets: '3 Sets', reps: '6-8 Reps', rest: '120s', video: 'Barbell Bench Press.mp4', cues: 'Solid arch, tight upper back.' },
            { name: 'Pull-ups', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'pull ups.mp4', cues: 'Full vertical pulling mechanics.' },
            { name: 'Overhead Shoulder Press', sets: '3 Sets', reps: '8 Reps', rest: '90s', video: 'Military Press.mp4', cues: 'Overhead lockout stability.' },
            { name: 'Planks', sets: '3 Sets', reps: '60s Hold', rest: '60s', video: 'Planks.mp4', cues: 'Braced abdominal wall.' }
          ]
        },
        {
          day: 'Day 2: Full Body Compound B',
          tag: 'Full Body B',
          exercises: [
            { name: 'Deadlifts', sets: '3 Sets', reps: '5 Reps', rest: '180s', video: 'deadlift.mp4', cues: 'Braced spine, explosive hip drive.' },
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Dumbell bench press.mp4', cues: 'Clavicular chest recruitment.' },
            { name: 'Chest Supported Dumbbell Rows', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'double arm dumbell rows.mp4', cues: 'Mid-back thickness.' },
            { name: 'Leg Press', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'Leg Press.mp4', cues: 'Controlled quad push.' },
            { name: 'Dumbbell Lateral Raises', sets: '3 Sets', reps: '15 Reps', rest: '60s', video: 'Lateral Raises.mp4', cues: 'Lateral deltoid cap.' }
          ]
        },
        {
          day: 'Day 3: Full Body Compound C',
          tag: 'Full Body C',
          exercises: [
            { name: 'Barbell Squat', sets: '3 Sets', reps: '8-10 Reps', rest: '150s', video: 'Squats.mp4', cues: 'Tempo 3-second descent.' },
            { name: 'Dumbbell Shoulder Press', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'Arnold Press.mp4', cues: 'Clean overhead pressing.' },
            { name: 'Lat Pulldowns', sets: '3 Sets', reps: '10-12 Reps', rest: '90s', video: 'Lat pulldown.mp4', cues: 'V-taper lat width.' },
            { name: 'Romanian Deadlifts', sets: '3 Sets', reps: '8-10 Reps', rest: '120s', video: 'Romanian Deadlifts.mp4', cues: 'Hamstring stretch tension.' },
            { name: 'Triceps Rope Pushdown', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'tricep dips.mp4', cues: 'Arm finishing pump.' }
          ]
        }
      ]
    },
    {
      id: 'powerbuilding_5day',
      name: '5-Day Powerbuilding (Heavy 1RM + Volume)',
      badge: 'Strength & Mass',
      muscles: ['Squat', 'Bench', 'Deadlift', 'Delts', 'Arms'],
      category: 'powerbuilding',
      daysPerWeek: '5 Days / Week',
      duration: '70-85 min',
      level: 'Advanced',
      goal: '1RM Peaking & Sarcoplasmic Mass',
      description: 'Combines heavy powerlifting triples on the Big 3 (Squat, Bench, Deadlift) with targeted bodybuilder isolation pumps.',
      weeklySchedule: [
        { day: 'Day 1: Heavy Bench & Chest Volume', tag: 'Heavy Bench', exercises: [
          { name: 'Barbell Bench Press', sets: '5 Sets', reps: '3-5 Reps @ 85%', rest: '180s', video: 'Barbell Bench Press.mp4', cues: 'Competition pause on chest, explosive press.' },
          { name: 'Incline Barbell Press', sets: '4 Sets', reps: '8-10 Reps', rest: '120s', video: 'Incline bench press.mp4', cues: 'Upper pectoral mass.' },
          { name: 'Dumbbell Flyes', sets: '3 Sets', reps: '12-15 Reps', rest: '60s', video: 'Dumbell flyes.mp4', cues: 'Deep stretch at bottom.' },
          { name: 'Dips', sets: '3 Sets', reps: '8-10 Reps', rest: '90s', video: 'tricep dips.mp4', cues: 'Slight forward lean for lower pec drive.' }
        ]},
        { day: 'Day 2: Heavy Squat & Quad Dominance', tag: 'Heavy Squat', exercises: [
          { name: 'Barbell Squat', sets: '5 Sets', reps: '3-5 Reps @ 85%', rest: '200s', video: 'Squats.mp4', cues: 'Braced belt, tight upper back shelf.' },
          { name: 'Leg Press', sets: '4 Sets', reps: '10-12 Reps', rest: '90s', video: 'Leg Press.mp4', cues: 'Heavy quad pushing volume.' },
          { name: 'Leg Extensions', sets: '4 Sets', reps: '15 Reps', rest: '60s', video: 'Leg Press.mp4', cues: 'Squeeze quad lock.' }
        ]},
        { day: 'Day 3: Heavy Deadlift & Back Density', tag: 'Heavy Pull', exercises: [
          { name: 'Deadlifts', sets: '5 Sets', reps: '3-5 Reps @ 85%', rest: '200s', video: 'deadlift.mp4', cues: 'Total body tension, violent hip extension.' },
          { name: 'Barbell Bent Over Rows', sets: '4 Sets', reps: '6-8 Reps', rest: '120s', video: 'Landmine rows.mp4', cues: 'Lat and erector power.' },
          { name: 'Pull-ups', sets: '4 Sets', reps: '8-10 Reps', rest: '90s', video: 'pull ups.mp4', cues: 'V-taper pull.' }
        ]},
        { day: 'Day 4: Overhead Press & Deltoid Armor', tag: 'Heavy Press', exercises: [
          { name: 'Overhead Shoulder Press', sets: '5 Sets', reps: '5 Reps', rest: '150s', video: 'Military Press.mp4', cues: 'Strict overhead power.' },
          { name: 'Dumbbell Lateral Raises', sets: '5 Sets', reps: '15 Reps', rest: '60s', video: 'Lateral Raises.mp4', cues: 'Shoulder width burn.' },
          { name: 'Face Pulls', sets: '4 Sets', reps: '15-20 Reps', rest: '60s', video: 'Rear Delt Flyes.mp4', cues: 'Rear delt and rotator cuff armor.' }
        ]},
        { day: 'Day 5: Hypertrophy Arms & Calves Peak', tag: 'Arm/Calf Peak', exercises: [
          { name: 'Barbell Bicep Curls', sets: '4 Sets', reps: '8-10 Reps', rest: '60s', video: 'Barbell bicep curls.mp4', cues: 'Bicep mass.' },
          { name: 'Skull Crushers', sets: '4 Sets', reps: '8-10 Reps', rest: '60s', video: 'overhead tricep extension.mp4', cues: 'Tricep mass.' },
          { name: 'Hammer Curls', sets: '4 Sets', reps: '12 Reps', rest: '60s', video: 'Hammer curl.mp4', cues: 'Forearm & brachialis.' },
          { name: 'Standing Calf Raises', sets: '5 Sets', reps: '15 Reps', rest: '60s', video: 'Walking Lunges.mp4', cues: 'Full stretch.' }
        ]}
      ]
    },
    {
      id: 'hiit_shred',
      name: '5-Day High-Intensity Shred & Conditioning',
      badge: 'Fat Loss & Cardio',
      muscles: ['Full Body', 'Cardio', 'Core', 'High Reps'],
      category: 'shred',
      daysPerWeek: '5 Days / Week',
      duration: '45-55 min',
      level: 'All Levels',
      goal: 'Sub-10% Body Fat',
      description: 'Combines fast-paced resistance circuits, supersets, and short rest intervals to keep heart rates elevated and incinerate calories.',
      weeklySchedule: [
        { day: 'Day 1: Upper Body Shred Circuit', tag: 'Upper Shred', exercises: [
          { name: 'Incline Dumbbell Press', sets: '4 Sets', reps: '12-15 Reps', rest: '45s', video: 'Dumbell bench press.mp4', cues: 'High tempo, continuous tension.' },
          { name: 'Lat Pulldowns', sets: '4 Sets', reps: '12-15 Reps', rest: '45s', video: 'Lat pulldown.mp4', cues: 'Controlled burn.' },
          { name: 'Dumbbell Shoulder Press', sets: '3 Sets', reps: '12-15 Reps', rest: '45s', video: 'Arnold Press.mp4', cues: 'Quick turn-around.' },
          { name: 'Push-ups', sets: '3 Sets', reps: 'To Failure', rest: '45s', video: 'push ups.mp4', cues: 'Chest to floor.' }
        ]},
        { day: 'Day 2: Lower Body Metabolic Blast', tag: 'Lower Blast', exercises: [
          { name: 'Walking Dumbbell Lunges', sets: '4 Sets', reps: '15 Reps/leg', rest: '45s', video: 'Walking Lunges.mp4', cues: 'High cardiac output.' },
          { name: 'Leg Extensions', sets: '4 Sets', reps: '15-20 Reps', rest: '30s', video: 'Leg Press.mp4', cues: 'Lactic acid buildup.' },
          { name: 'Lying Leg Curls', sets: '4 Sets', reps: '15-20 Reps', rest: '30s', video: 'Romanian Deadlifts.mp4', cues: 'Hamstring pump.' }
        ]},
        { day: 'Day 3: Core & High-Intensity Calisthenics', tag: 'Core/Cardio', exercises: [
          { name: 'Pull-ups', sets: '4 Sets', reps: 'Max Reps', rest: '60s', video: 'pull ups.mp4', cues: 'Explosive pull.' },
          { name: 'Dips', sets: '4 Sets', reps: '15 Reps', rest: '45s', video: 'tricep dips.mp4', cues: 'Upper body power.' },
          { name: 'Hanging Leg Raises', sets: '4 Sets', reps: '15-20 Reps', rest: '45s', video: 'Planks.mp4', cues: 'Strict abdominal curl.' }
        ]},
        { day: 'Day 4: Full Body Density Protocol', tag: 'Full Density', exercises: [
          { name: 'Deadlifts', sets: '4 Sets', reps: '8 Reps', rest: '60s', video: 'deadlift.mp4', cues: 'Fast reset, strong spine.' },
          { name: 'Barbell Bench Press', sets: '4 Sets', reps: '10 Reps', rest: '60s', video: 'Barbell Bench Press.mp4', cues: 'Rhythmic pumping motion.' },
          { name: 'Barbell Squat', sets: '4 Sets', reps: '10 Reps', rest: '60s', video: 'Squats.mp4', cues: 'Cardio stamina.' }
        ]},
        { day: 'Day 5: Arm & Deltoid High-Rep Finisher', tag: 'Arm Pump', exercises: [
          { name: 'Dumbbell Lateral Raises', sets: '5 Sets', reps: '20 Reps', rest: '30s', video: 'Lateral Raises.mp4', cues: 'Metabolic shoulder pump.' },
          { name: 'Barbell Bicep Curls', sets: '4 Sets', reps: '15 Reps', rest: '30s', video: 'Barbell bicep curls.mp4', cues: 'Bicep burn.' },
          { name: 'Triceps Rope Pushdown', sets: '4 Sets', reps: '15 Reps', rest: '30s', video: 'tricep dips.mp4', cues: 'Tricep finish.' }
        ]}
      ]
    }
  ];

  // 2. WEB AUDIO SYNTHESIZER FOR REST TIMER CHIMES
  let audioCtx = null;
  function playBeep(frequency, duration, type = 'sine') {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Audio chime unavailable:', e.message);
    }
  }

  function playRestCompleteChime() {
    playBeep(587.33, 0.15); // D5
    setTimeout(() => playBeep(880, 0.35), 160); // A5
  }

  // 3. STATE & CONTROLLER
  let activeFilter = 'all';
  let activeQuickMatch = 'all';
  let liveTimerInterval = null;
  let liveSecondsRemaining = 0;
  let activeBlueprintForLive = null;
  let activeDayIndex = 0;
  let activeDrawerBlueprint = null;
  let activeDrawerDayIndex = 0;
  let activeDrawerMesocycle = 'vol';

  // 4. RENDER SPOTLIGHT PROGRAM CARDS
  function renderBlueprints() {
    const container = document.getElementById('workoutProgramsGrid');
    if (!container) return;

    let filtered = WORKOUT_BLUEPRINTS;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(b => b.category === activeFilter);
    }

    if (activeQuickMatch === '6days') {
      filtered = filtered.filter(b => b.daysPerWeek.includes('6 Days'));
    } else if (activeQuickMatch === '4days') {
      filtered = filtered.filter(b => b.daysPerWeek.includes('4 Days'));
    } else if (activeQuickMatch === '3days') {
      filtered = filtered.filter(b => b.daysPerWeek.includes('3 Days'));
    } else if (activeQuickMatch === 'hypertrophy') {
      filtered = filtered.filter(b => b.goal.toLowerCase().includes('hypertrophy') || b.goal.toLowerCase().includes('density'));
    } else if (activeQuickMatch === 'strength') {
      filtered = filtered.filter(b => b.goal.toLowerCase().includes('strength') || b.goal.toLowerCase().includes('peaking'));
    } else if (activeQuickMatch === 'shred') {
      filtered = filtered.filter(b => b.category === 'shred' || b.goal.toLowerCase().includes('fat'));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px; background:#111; border-radius:16px; border:1px dashed var(--border-gold);">
          <i class="fa-solid fa-dumbbell text-gold" style="font-size:40px; margin-bottom:14px;"></i>
          <h3 style="font-size:24px; color:#FFF;">No Exact Blueprint Match Found</h3>
          <p style="color:var(--text-dark); margin:8px 0 20px;">Try selecting "All Splits" or generate a custom AI plan tailored to you.</p>
          <button class="btn btn-primary" onclick="window.WorkoutEngine.quickMatch('all', null)">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(b => {
      return `
        <div class="workout-card" data-id="${b.id}">
          <div class="workout-card-head">
            <div class="card-title-block">
              <div class="workout-badge-row">
                <span class="workout-badge"><i class="fa-solid fa-crown text-gold"></i> ${b.badge}</span>
                ${(b.muscles || []).map(m => `<span class="workout-muscle-tag">${m}</span>`).join('')}
              </div>
              <h2 class="workout-title">${b.name}</h2>
            </div>
            <span class="workout-days-pill"><i class="fa-solid fa-calendar-days text-gold"></i> ${b.daysPerWeek}</span>
          </div>

          <p class="workout-desc">${b.description}</p>

          <!-- WEEKLY SPLIT TIMELINE -->
          <div class="weekly-split-timeline">
            ${b.weeklySchedule.map((dayObj, dIdx) => `
              <div class="timeline-day-pill">
                <div class="timeline-day-title">Day ${dIdx + 1}</div>
                <div class="timeline-day-label" title="${dayObj.day}">${dayObj.tag || `Routine ${dIdx + 1}`}</div>
              </div>
            `).join('')}
          </div>

          <!-- 3-COLUMN BENTO METRICS -->
          <div class="workout-bento-metrics">
            <div class="bento-metric-cell">
              <span class="bento-metric-label"><i class="fa-solid fa-bullseye text-gold"></i> Focus</span>
              <span class="bento-metric-val">${b.goal}</span>
            </div>
            <div class="bento-metric-cell">
              <span class="bento-metric-label"><i class="fa-solid fa-signal text-gold"></i> Level</span>
              <span class="bento-metric-val">${b.level}</span>
            </div>
            <div class="bento-metric-cell">
              <span class="bento-metric-label"><i class="fa-solid fa-stopwatch text-gold"></i> Session</span>
              <span class="bento-metric-val">${b.duration}</span>
            </div>
          </div>

          <!-- CARD ACTION BUTTONS -->
          <div class="workout-card-actions">
            <button class="btn btn-primary" onclick="window.WorkoutEngine.openInspectorDrawer('${b.id}')">
              <i class="fa-solid fa-list-check"></i> Explore Split (${b.weeklySchedule.length} Days)
            </button>
            <button class="btn btn-ghost" onclick="window.WorkoutEngine.startLiveSession('${b.id}')" title="Start live workout session">
              <i class="fa-solid fa-play text-gold"></i> Live Floor
            </button>
            <button class="btn btn-ghost" onclick="window.WorkoutEngine.pushToMySpace('${b.id}')" title="Sync this routine to My Space Dashboard">
              <i class="fa-solid fa-cloud-arrow-up"></i> Sync
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. WORKOUT CONTROLLER OBJECT
  window.WorkoutEngine = {
    init: function () {
      renderBlueprints();
      this.initFilterChips();
    },

    initFilterChips: function () {
      const chips = document.querySelectorAll('.split-filter-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          activeFilter = chip.dataset.filter || 'all';
          renderBlueprints();
        });
      });
    },

    switchHeroTab: function (tabName, btn) {
      const tabBtns = document.querySelectorAll('.command-tab-btn');
      const tabContents = document.querySelectorAll('.command-tab-content');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      if (btn) btn.classList.add('active');
      const activeEl = document.getElementById(`heroTab-${tabName}`);
      if (activeEl) activeEl.classList.add('active');
    },

    quickMatch: function (criteria, btn) {
      activeQuickMatch = criteria;
      const btns = document.querySelectorAll('.matcher-btn');
      btns.forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      else {
        const defaultBtn = document.querySelector('.matcher-btn[data-match="all"]');
        if (defaultBtn) defaultBtn.classList.add('active');
      }
      renderBlueprints();

      const catalog = document.getElementById('programCatalog');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // FULLSCREEN / SLIDE-OVER SPLIT INSPECTOR DRAWER
    openInspectorDrawer: function (blueprintId) {
      const bp = WORKOUT_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!bp) return;

      activeDrawerBlueprint = bp;
      activeDrawerDayIndex = 0;
      activeDrawerMesocycle = 'vol';
      this.renderDrawerContent();

      const drawer = document.getElementById('splitInspectorDrawer');
      if (drawer) drawer.classList.add('show');
    },

    closeInspectorDrawer: function () {
      const drawer = document.getElementById('splitInspectorDrawer');
      if (drawer) drawer.classList.remove('show');
    },

    setDrawerDay: function (dayIdx) {
      activeDrawerDayIndex = dayIdx;
      this.renderDrawerContent();
    },

    setDrawerMesocycle: function (meso) {
      activeDrawerMesocycle = meso;
      this.renderDrawerContent();
    },

    renderDrawerContent: function () {
      if (!activeDrawerBlueprint) return;
      const bp = activeDrawerBlueprint;
      const curDayObj = bp.weeklySchedule[activeDrawerDayIndex] || bp.weeklySchedule[0];

      const titleEl = document.getElementById('drawerProgramTitle');
      const subtitleEl = document.getElementById('drawerProgramSubtitle');
      const tabsEl = document.getElementById('drawerDayTabsContainer');
      const mesoEl = document.getElementById('drawerMesocycleContainer');
      const exercisesEl = document.getElementById('drawerExercisesContainer');

      if (titleEl) titleEl.textContent = bp.name;
      if (subtitleEl) subtitleEl.textContent = `${bp.daysPerWeek} • ${bp.goal} • ${curDayObj.day}`;

      if (tabsEl) {
        tabsEl.innerHTML = bp.weeklySchedule.map((d, idx) => `
          <button class="drawer-day-tab-btn ${idx === activeDrawerDayIndex ? 'active' : ''}" onclick="window.WorkoutEngine.setDrawerDay(${idx})">
            Day ${idx + 1}: ${d.tag || d.day.split(':')[0]}
          </button>
        `).join('');
      }

      if (mesoEl) {
        mesoEl.innerHTML = `
          <button class="meso-pill ${activeDrawerMesocycle === 'vol' ? 'active' : ''}" onclick="window.WorkoutEngine.setDrawerMesocycle('vol')">Volume (8-12)</button>
          <button class="meso-pill ${activeDrawerMesocycle === 'str' ? 'active' : ''}" onclick="window.WorkoutEngine.setDrawerMesocycle('str')">Strength (5-8)</button>
          <button class="meso-pill ${activeDrawerMesocycle === 'peak' ? 'active' : ''}" onclick="window.WorkoutEngine.setDrawerMesocycle('peak')">Peaking (3-5)</button>
        `;
      }

      if (exercisesEl) {
        exercisesEl.innerHTML = curDayObj.exercises.map(ex => {
          let repText = ex.reps;
          if (activeDrawerMesocycle === 'str') repText = '5-8 Reps';
          else if (activeDrawerMesocycle === 'peak') repText = '3-5 Reps';

          return `
            <div class="drawer-exercise-item">
              <div class="drawer-ex-row">
                <div class="drawer-ex-title" onclick="window.WorkoutEngine.openVideoPreview('${ex.name}', '${ex.video}', '${ex.cues}')">
                  <i class="fa-solid fa-circle-play text-gold" style="font-size:20px;"></i>
                  <span>${ex.name}</span>
                </div>
                <div class="drawer-ex-badges">
                  <span class="drawer-ex-sets">${ex.sets} × ${repText}</span>
                  <span class="drawer-ex-rest"><i class="fa-solid fa-stopwatch text-gold"></i> ${ex.rest}</span>
                  <button class="btn btn-ghost btn-sm" style="padding:4px 10px; font-size:11px;" onclick="window.WorkoutEngine.openVideoPreview('${ex.name}', '${ex.video}', '${ex.cues}')">
                    <i class="fa-solid fa-video text-gold"></i> Form
                  </button>
                </div>
              </div>
              <div style="font-size:12.5px; color:var(--text-dark); line-height:1.4;">
                <i class="fa-solid fa-circle-info text-gold"></i> ${ex.cues}
              </div>
            </div>
          `;
        }).join('');
      }
    },

    startLiveFromDrawer: function () {
      if (!activeDrawerBlueprint) return;
      const bpId = activeDrawerBlueprint.id;
      const dayIdx = activeDrawerDayIndex;
      this.closeInspectorDrawer();
      this.startLiveSession(bpId, dayIdx);
    },

    pushFromDrawer: function () {
      if (!activeDrawerBlueprint) return;
      this.pushToMySpace(activeDrawerBlueprint.id);
    },

    // TECHNIQUE VIDEO MODAL
    openVideoPreview: function (name, videoFile, cues) {
      const modal = document.getElementById('exerciseVideoModal');
      const title = document.getElementById('videoModalExerciseName');
      const videoEl = document.getElementById('videoModalPlayer');
      const cuesEl = document.getElementById('videoModalCues');

      if (modal && videoEl) {
        if (title) title.textContent = name;
        if (cuesEl) cuesEl.textContent = cues || 'Focus on controlled eccentric lowering and explosive contraction.';
        
        videoEl.src = `../Form module/${videoFile}`;
        videoEl.load();
        modal.classList.add('show');
      }
    },

    closeVideoModal: function () {
      const modal = document.getElementById('exerciseVideoModal');
      const videoEl = document.getElementById('videoModalPlayer');
      if (modal) modal.classList.remove('show');
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
    },

    // LIVE FLOOR WORKOUT RUNNER
    startLiveSession: function (blueprintId, initialDayIdx = 0) {
      const bp = WORKOUT_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!bp) return;

      activeBlueprintForLive = bp;
      activeDayIndex = initialDayIdx;
      this.renderLiveModal();

      const modal = document.getElementById('liveWorkoutModal');
      if (modal) modal.classList.add('show');
    },

    renderLiveModal: function () {
      if (!activeBlueprintForLive) return;
      const dayObj = activeBlueprintForLive.weeklySchedule[activeDayIndex];
      const titleEl = document.getElementById('liveModalTitle');
      const subtitleEl = document.getElementById('liveModalSubtitle');
      const bodyEl = document.getElementById('liveModalExercisesContainer');
      const dayTabsEl = document.getElementById('liveModalDayTabs');

      if (titleEl) titleEl.textContent = activeBlueprintForLive.name;
      if (subtitleEl) subtitleEl.textContent = dayObj.day;

      if (dayTabsEl) {
        dayTabsEl.innerHTML = activeBlueprintForLive.weeklySchedule.map((d, idx) => `
          <button class="day-tab-pill ${idx === activeDayIndex ? 'active' : ''}" onclick="window.WorkoutEngine.switchLiveDay(${idx})">
            Day ${idx + 1}
          </button>
        `).join('');
      }

      if (bodyEl) {
        bodyEl.innerHTML = dayObj.exercises.map((ex, eIdx) => `
          <div class="live-exercise-card">
            <div class="live-exercise-header">
              <div>
                <strong style="font-size:17px; color:#FFF;">${ex.name}</strong>
                <div style="font-size:12.5px; color:var(--text-dark); margin-top:2px;">Target: ${ex.sets} × ${ex.reps} | Rest: ${ex.rest}</div>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="window.WorkoutEngine.openVideoPreview('${ex.name}', '${ex.video}', '${ex.cues}')">
                <i class="fa-solid fa-video text-gold"></i> Form
              </button>
            </div>

            <div class="live-sets-checklist">
              ${Array.from({ length: parseInt(ex.sets) || 3 }).map((_, sIdx) => `
                <label class="set-check-item">
                  <input type="checkbox" onchange="window.WorkoutEngine.handleSetCompleted(this, '${ex.rest}')" />
                  <span>Set ${sIdx + 1}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('');
      }
    },

    switchLiveDay: function (idx) {
      activeDayIndex = idx;
      this.renderLiveModal();
    },

    handleSetCompleted: function (checkbox, restText) {
      const parent = checkbox.closest('.set-check-item');
      if (checkbox.checked) {
        if (parent) parent.classList.add('completed');
        playBeep(587.33, 0.12);
        const seconds = parseInt(restText) || 90;
        this.startRestTimer(seconds);
      } else {
        if (parent) parent.classList.remove('completed');
      }
    },

    startRestTimer: function (seconds) {
      if (liveTimerInterval) clearInterval(liveTimerInterval);
      liveSecondsRemaining = seconds;
      this.updateTimerDisplay();

      const bar = document.getElementById('timerProgressBar');
      const totalSeconds = seconds;

      liveTimerInterval = setInterval(() => {
        liveSecondsRemaining--;
        this.updateTimerDisplay();

        if (bar) {
          const pct = ((totalSeconds - liveSecondsRemaining) / totalSeconds) * 100;
          bar.style.width = `${pct}%`;
        }

        if (liveSecondsRemaining <= 3 && liveSecondsRemaining > 0) {
          playBeep(440, 0.08);
        }

        if (liveSecondsRemaining <= 0) {
          clearInterval(liveTimerInterval);
          liveTimerInterval = null;
          playRestCompleteChime();
          this.showNotificationToast('🔔 Rest Time Complete! Begin Next Set!');
        }
      }, 1000);
    },

    updateTimerDisplay: function () {
      const displayEl = document.getElementById('restTimerDisplay');
      if (displayEl) {
        const mins = Math.floor(liveSecondsRemaining / 60);
        const secs = liveSecondsRemaining % 60;
        displayEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    },

    stopRestTimer: function () {
      if (liveTimerInterval) {
        clearInterval(liveTimerInterval);
        liveTimerInterval = null;
      }
      liveSecondsRemaining = 0;
      this.updateTimerDisplay();
      const bar = document.getElementById('timerProgressBar');
      if (bar) bar.style.width = '0%';
    },

    closeLiveModal: function () {
      const modal = document.getElementById('liveWorkoutModal');
      if (modal) modal.classList.remove('show');
      this.stopRestTimer();
    },

    // 1RM & BARBELL PLATE CALCULATOR
    openOneRepMaxModal: function () {
      const modal = document.getElementById('oneRepMaxModal');
      if (modal) {
        modal.classList.add('show');
        this.calculateOneRepMax();
      }
    },

    closeOneRepMaxModal: function () {
      const modal = document.getElementById('oneRepMaxModal');
      if (modal) modal.classList.remove('show');
    },

    calculateOneRepMax: function () {
      const weightInput = document.getElementById('calcWeightInput');
      const repsInput = document.getElementById('calcRepsInput');
      const barSelect = document.getElementById('calcBarWeight');
      const resultEl = document.getElementById('calcOneRmResult');
      const targetLabel = document.getElementById('barbellTargetWeight');
      const rackEl = document.getElementById('plateRackVisualizer');

      if (!weightInput || !repsInput || !resultEl) return;

      const w = parseFloat(weightInput.value) || 0;
      const r = Math.min(15, Math.max(1, parseInt(repsInput.value) || 1));
      const barW = parseFloat(barSelect?.value || 20);

      if (w <= 0) return;

      const epley = w * (1 + r / 30);
      const brzycki = w * (36 / (37 - r));
      const oneRm = r === 1 ? w : Math.round(((epley + brzycki) / 2) * 10) / 10;

      resultEl.textContent = `${oneRm.toFixed(1)} kg`;
      if (targetLabel) targetLabel.textContent = w.toFixed(1);

      const p95 = document.getElementById('pct95');
      const p90 = document.getElementById('pct90');
      const p85 = document.getElementById('pct85');
      const p80 = document.getElementById('pct80');
      const p75 = document.getElementById('pct75');

      if (p95) p95.textContent = `${(oneRm * 0.95).toFixed(1)} kg`;
      if (p90) p90.textContent = `${(oneRm * 0.90).toFixed(1)} kg`;
      if (p85) p85.textContent = `${(oneRm * 0.85).toFixed(1)} kg`;
      if (p80) p80.textContent = `${(oneRm * 0.80).toFixed(1)} kg`;
      if (p75) p75.textContent = `${(oneRm * 0.75).toFixed(1)} kg`;

      if (rackEl) {
        let weightPerSide = Math.max(0, (w - barW) / 2);
        const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
        const loadedPlates = [];

        for (let plate of availablePlates) {
          while (weightPerSide >= plate) {
            loadedPlates.push(plate);
            weightPerSide = Math.round((weightPerSide - plate) * 100) / 100;
          }
        }

        if (loadedPlates.length === 0) {
          rackEl.innerHTML = '<span style="font-size:12px; color:var(--text-dark);">Empty Barbell (No extra plates needed)</span>';
        } else {
          rackEl.innerHTML = loadedPlates.map(p => `
            <span class="plate-badge" style="${p >= 20 ? 'border-color:var(--accent-gold); color:var(--accent-gold);' : ''}">
              ${p} kg
            </span>
          `).join('') + ` <span style="font-size:11.5px; color:var(--text-dark); margin-left:6px;">per side</span>`;
        }
      }
    },

    // DYNAMIC WARM-UP PROTOCOL
    openWarmupModal: function () {
      const modal = document.getElementById('warmupModal');
      if (modal) modal.classList.add('show');
    },

    closeWarmupModal: function () {
      const modal = document.getElementById('warmupModal');
      if (modal) modal.classList.remove('show');
    },

    pushToMySpace: function (blueprintId) {
      const bp = WORKOUT_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!bp) return;

      localStorage.setItem('custom_workout_plan', JSON.stringify({
        plan: {
          title: bp.name,
          goal: bp.goal,
          daysPerWeek: bp.daysPerWeek,
          weeklySchedule: bp.weeklySchedule
        },
        savedAt: new Date().toISOString()
      }));

      if (window.GymCloudStore && typeof window.GymCloudStore.recordWorkoutSession === 'function') {
        const today = new Date().toISOString().split('T')[0];
        bp.weeklySchedule[0].exercises.forEach(ex => {
          GymCloudStore.recordWorkoutSession({
            workout_date: today,
            exercise_name: ex.name,
            sets: parseInt(ex.sets) || 3,
            reps: parseInt(ex.reps) || 10,
            weight: 60,
            water_intake: 2.5,
            calories_consumed: 2200
          });
        });
      }

      this.showNotificationToast(`⚡ "${bp.name}" pushed to My Space!`);
    },

    showNotificationToast: function (msg) {
      let toast = document.getElementById('workoutToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'workoutToast';
        toast.className = 'workout-toast';
        document.body.appendChild(toast);
      }
      toast.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> ${msg}`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.WorkoutEngine.init());
  } else {
    window.WorkoutEngine.init();
  }
})();
