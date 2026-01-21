import * as readline from 'readline';

// Constants
const SIX_STAR_CHANCE = 0.04;
const RATE_UP_CHANCE = 0.25;
const PULLS_PER_SET = 10;
const GUARANTEED_6_START = 31;
const GUARANTEED_6_END = 40;
const FIRST_RATE_UP_PITY_START = 71;
const FIRST_RATE_UP_PITY_END = 80;
const EXTRA_RATE_UPS = [180, 340, 500, 660, 820];

// Simulation parameters
const EXPERIMENTS = 10000;

// Helper functions
function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function median(arr: number[]): number {
  return percentile(arr, 50);
}

// Experiment result type
interface ExperimentResult {
  totalPulls: number;
}

// Run a single experiment for N copies
function runExperiment(targetCopies: number): ExperimentResult {
  let pulls = 0;
  let rateUpCount = 0;
  let sixStarCounter = 0;
  let firstRateUpObtained = false;
  const extraRateUpSchedule = [...EXTRA_RATE_UPS];

  while (rateUpCount < targetCopies) {
    for (let i = 0; i < PULLS_PER_SET; i++) {
      pulls++;
      sixStarCounter++;
      let gotSixStar = false;

      // --- Guaranteed first rate-up (71–80) ---
      if (!firstRateUpObtained && pulls === FIRST_RATE_UP_PITY_END) {
        firstRateUpObtained = true;
        rateUpCount++;
        sixStarCounter = 0;
      } else {
        // --- Guaranteed 6★ between 31–40 ---
        if (sixStarCounter >= GUARANTEED_6_START) {
          if (sixStarCounter >= GUARANTEED_6_END) {
            gotSixStar = true;
            sixStarCounter = 0;
          } else if (Math.random() < SIX_STAR_CHANCE) {
            gotSixStar = true;
            sixStarCounter = 0;
          }
        } else if (Math.random() < SIX_STAR_CHANCE) {
          gotSixStar = true;
          sixStarCounter = 0;
        }

        // --- Rate-up check ---
        if (gotSixStar) {
          if (Math.random() < RATE_UP_CHANCE) {
            rateUpCount++;
            if (!firstRateUpObtained) {
              firstRateUpObtained = true;
            }
          }
        }
      }

      // --- Extra scheduled rate-ups ---
      for (let j = extraRateUpSchedule.length - 1; j >= 0; j--) {
        if (pulls === extraRateUpSchedule[j]) {
          rateUpCount++;
          extraRateUpSchedule.splice(j, 1);
        }
      }

      if (rateUpCount >= targetCopies) {
        break;
      }
    }
  }

  return {
    totalPulls: pulls
  };
}

// Calculate probability of getting weapon within budget
function calculateProbability(budget: number, targetCopies: number): void {
  console.log(`\n Running ${EXPERIMENTS} simulations...`);
  
  const pullsList: number[] = [];
  let successCount = 0;

  for (let i = 0; i < EXPERIMENTS; i++) {
    const result = runExperiment(targetCopies);
    pullsList.push(result.totalPulls);
    
    if (result.totalPulls <= budget) {
      successCount++;
    }
  }

  // Statistics
  const best = Math.min(...pullsList);
  const worst = Math.max(...pullsList);
  const avg = pullsList.reduce((a, b) => a + b, 0) / pullsList.length;
  const medianPulls = median(pullsList);
  const p5 = Math.floor(percentile(pullsList, 5));
  const p25 = Math.floor(percentile(pullsList, 25));
  const p75 = Math.floor(percentile(pullsList, 75));
  const p95 = Math.floor(percentile(pullsList, 95));
  
  const probability = (successCount / EXPERIMENTS) * 100;

  // Display Results
  console.log("\n" + "=".repeat(60));
  console.log(`RESULTS FOR ${targetCopies} WEAPON COPY/COPIES`);
  console.log("=".repeat(60));
  
  console.log(`\nYour Budget: ${budget} pulls`);
  console.log(` Success Rate: ${successCount} out of ${EXPERIMENTS} (${probability.toFixed(2)}%)`);
  
  console.log("\nPULL STATISTICS:");
  console.log(`   Best case (minimum):     ${best} pulls`);
  console.log(`   5th percentile:          ${p5} pulls`);
  console.log(`   25th percentile:         ${p25} pulls`);
  console.log(`   Median (50th):           ${Math.floor(medianPulls)} pulls`);
  console.log(`   Average:                 ${avg.toFixed(2)} pulls`);
  console.log(`   75th percentile:         ${p75} pulls`);
  console.log(`   95th percentile:         ${p95} pulls`);
  console.log(`   Worst case (maximum):    ${worst} pulls`);
  
  console.log("\nRECOMMENDATIONS:");
  if (budget >= p95) {
    console.log(`   You have a ~95% chance of getting ${targetCopies} weapon copy/copies!`);
  } else if (budget >= p75) {
    console.log(`   You have a ~75% chance of getting ${targetCopies} weapon copy/copies!`);
  } else if (budget >= medianPulls) {
    console.log(`   You have a ~50% chance of getting ${targetCopies} weapon copy/copies!`);
  } else if (budget >= p25) {
    console.log(`   You have a ~25% chance of getting ${targetCopies} weapon copy/copies!`);
  } else {
    console.log(`   Your budget is below average - consider saving more pulls!`);
  }
  
  console.log(`\nTo guarantee ${targetCopies} weapon copy/copies, budget: ${p95} pulls (95% safe)`);
  console.log(`   For 50% chance: ${Math.floor(medianPulls)} pulls`);
  console.log("=".repeat(60) + "\n");
}

// User Input Handler
async function getUserInput(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log("\n" + "=".repeat(60));
  console.log(" ENDFIELD WEAPON GACHA CALCULATOR");
  console.log("=".repeat(60));
  
  try {
    // Get number of copies
    const copiesInput = await question('\n  How many weapon copies do you want? (1-6): ');
    const targetCopies = parseInt(copiesInput);
    
    if (isNaN(targetCopies) || targetCopies < 1 || targetCopies > 6) {
      console.log('\Invalid input! Please enter a number between 1 and 6.');
      rl.close();
      return;
    }
    
    // Get budget
    const budgetInput = await question('\ What is your pull budget? (e.g., 100, 300, 500): ');
    const budget = parseInt(budgetInput);
    
    if (isNaN(budget) || budget < 1) {
      console.log(' Invalid input! Please enter a valid number of pulls.');
      rl.close();
      return;
    }
    
    rl.close();
    
    // Run calculation
    calculateProbability(budget, targetCopies);
    
  } catch (error) {
    console.error(' Error:', error);
    rl.close();
  }
}

// Main entry point
getUserInput();
