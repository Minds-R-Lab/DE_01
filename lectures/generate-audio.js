#!/usr/bin/env node
/**
 * ElevenLabs Audio Generator for Lecture Voiceovers
 * ==================================================
 *
 * Run this script ONCE to generate all audio files.
 * They'll be saved as MP3s in the audio/ folder, then commit them to the repo.
 *
 * Usage:
 *   node generate-audio.js <your-elevenlabs-api-key> [lecture-prefix]
 *
 * Examples:
 *   node generate-audio.js sk_abc123                     # generates all lectures
 *   node generate-audio.js sk_abc123 ch1-separable       # generates only ch1-separable
 *
 * Prerequisites:
 *   - Node.js 18+ (for native fetch)
 *   - ElevenLabs API key (free tier: ~10,000 chars/month at elevenlabs.io)
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIG ───
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel — clear British male
const MODEL_ID = 'eleven_multilingual_v2';
const AUDIO_DIR = path.join(__dirname, 'audio');

// ─── LECTURE NARRATIONS ───
// Add new lectures here. Each key matches the lecture HTML filename (without .html).
const LECTURES = {
  'ch1-separable': [
    // Slide 0: Title
    `Separable Differential Equations. The Separation of Variables Technique. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is a separable equation? A separable differential equation is one where we can put all y terms on one side and all x terms on the other. Formally, a first-order ODE is separable if it can be written as: dy dx equals f of x, times g of y. Equivalently, we rewrite this as: one over g of y, dy, equals f of x, dx. Now the variables are separated — all y terms on the left, all x terms on the right.`,

    // Slide 2: Identifying
    `How do we identify separable equations? The key test is: can you write the right-hand side as a product of a function of x alone, times a function of y alone? For example, dy dx equals x y is separable — it factors as x times y. And dy dx equals e to the power x plus y is also separable, because it equals e to the x, times e to the y. However, dy dx equals x plus y is NOT separable — it's a sum, not a product. And e to the x y is NOT separable either, because the product x y sits inside the exponent and cannot be split.`,

    // Slide 3: Technique
    `Here's the core separation technique. Starting from dy dx equals f of x times g of y: Step 1, divide both sides by g of y, assuming g of y is not zero. This gives one over g of y, times dy dx, equals f of x. Step 2, rewrite in differential form: one over g of y, dy, equals f of x, dx. Step 3, integrate both sides. The integral of one over g of y, dy, equals the integral of f of x, dx, plus C. This is the master formula for solving separable equations.`,

    // Slide 4: 6-Step Method
    `Let's organize this into a complete six-step solution method. Step 1: Write the equation in separable form. Step 2: Separate the variables. Step 3: Integrate both sides. Step 4: Solve for y explicitly, if possible — otherwise, leave the answer in implicit form. Step 5: Apply any given initial conditions to find the constant C. And critically, Step 6: Check for equilibrium solutions by setting g of y equal to zero. These constant solutions can easily be lost during the separation process.`,

    // Slide 5: Example setup
    `Let's work through a complete example. Solve: dy dx equals x y, with the initial condition y of zero equals 2. Steps 1 and 2: Separate the variables. We get dy over y equals x dx. Step 3: Integrate both sides. The integral of dy over y equals the integral of x dx. This gives us: natural log of the absolute value of y, equals x squared over 2, plus C. Step 4: Solve for y. Exponentiating both sides, we get y equals A times e to the x squared over 2, where A is plus or minus e to the C.`,

    // Slide 6: Example final
    `Now we apply the initial condition y of zero equals 2. Substituting into y equals A times e to the x squared over 2: 2 equals A times e to the zero, which means A equals 2. So our particular solution is: y equals 2 e to the x squared over 2. For Step 6, the equilibrium check: g of y equals y, so y equals zero is an equilibrium solution. But our initial condition is y of zero equals 2, which is not zero, so the equilibrium doesn't apply here. The solution is valid for all real values of x — we have global existence.`,

    // Slide 7: Warning
    `An important warning about lost solutions. When we divide by g of y, we assume g of y is not zero. The values where g of y equals zero give equilibrium, or constant, solutions — and these can be completely lost during the separation process. For example, consider dy dx equals y times the quantity 1 minus y. After separating and integrating, we get the general family of logistic curves. But we've missed the constant solutions: y equals 0, and y equals 1, which come from setting g of y equal to zero. Always check for these separately!`,

    // Slide 8: Implicit vs Explicit
    `Sometimes after integration, we can't solve for y explicitly — and that's perfectly fine. An explicit solution writes y directly as a function of x, like y equals 2 e to the x squared over 2. You can plug in any x and immediately get y. An implicit solution is an equation relating x and y together, like y squared plus sine of y equals x cubed plus C. We can't isolate y, but it's still a completely valid solution. To verify an implicit solution, use implicit differentiation: differentiate both sides with respect to x, and confirm you recover the original ODE.`,

    // Slide 9: Takeaways
    `Let's recap the key takeaways. First: recognize separable form. The right-hand side must factor as a function of x, times a function of y. Second: separate, then integrate. Move all y's to one side, all x's to the other, and integrate. Don't forget the plus C! Third: never lose equilibrium solutions. When dividing by g of y, always check g of y equals zero separately. These constant solutions are easy to miss. And finally: always verify your answer by substituting back into the original equation. The complete workflow is: identify it's separable, separate, integrate, solve, and verify.`
  ]

  // ─── ADD MORE LECTURES HERE ───
  // 'ch1-linear': [ ... ],
  // 'ch1-exact': [ ... ],
};

// ─── MAIN ───
async function main() {
  const apiKey = process.argv[2];
  const filterLecture = process.argv[3];

  if (!apiKey) {
    console.error('\n  Usage: node generate-audio.js <elevenlabs-api-key> [lecture-prefix]\n');
    console.error('  Get your free API key at https://elevenlabs.io\n');
    process.exit(1);
  }

  // Ensure audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const lectures = filterLecture
    ? { [filterLecture]: LECTURES[filterLecture] }
    : LECTURES;

  for (const [lectureName, slides] of Object.entries(lectures)) {
    if (!slides) {
      console.error(`  Unknown lecture: ${lectureName}`);
      continue;
    }

    console.log(`\n📚 Generating audio for: ${lectureName}`);
    console.log(`   ${slides.length} slides, ~${slides.join('').length} characters total\n`);

    for (let i = 0; i < slides.length; i++) {
      const outFile = path.join(AUDIO_DIR, `${lectureName}-${i}.mp3`);

      // Skip if already generated
      if (fs.existsSync(outFile)) {
        console.log(`   ✓ Slide ${i + 1}/${slides.length} — already exists, skipping`);
        continue;
      }

      process.stdout.write(`   ⏳ Slide ${i + 1}/${slides.length} — generating...`);

      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: slides[i],
            model_id: MODEL_ID,
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
              style: 0.2
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.log(` ✗ Error ${res.status}: ${errText.slice(0, 100)}`);
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(outFile, buffer);
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        console.log(` ✓ ${sizeMB} MB`);

        // Small delay to avoid rate limits
        if (i < slides.length - 1) await sleep(500);

      } catch (err) {
        console.log(` ✗ ${err.message}`);
      }
    }
  }

  console.log('\n✅ Done! Now commit the audio/ folder and push to GitHub.\n');
  console.log('   git add lectures/audio/');
  console.log('   git commit -m "Add voiceover audio for lectures"');
  console.log('   git push\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => { console.error(err); process.exit(1); });
