import * as readline from 'readline';

// Base rates and constants
const BASE_SIX_STAR_RATE = 0.008;
const PITY_START = 66;
const PITY_INCREMENT = 0.05;
const MAX_PITY = 80;

const GUARANTEE_120 = 120;
const RATE_UP_240 = 240;

const BASE_FIVE_STAR_RATE = 0.08;
const BASE_FOUR_STAR_RATE = 0.912;

// ARSENAL TICKETS
const TICKETS_SIX_STAR = 2000;
const TICKETS_FIVE_STAR = 200;
const TICKETS_FOUR_STAR = 20;

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

// 6★ chance function with pity
function sixStarChance(pity: number): number {
  if (pity < PITY_START) {
    return BASE_SIX_STAR_RATE;
  }
  return Math.min(1.0, BASE_SIX_STAR_RATE + (pity - 65) * PITY_INCREMENT);
}

// Experiment result type
interface ExperimentResult {
  pulls: number;
  ticketsTotal: number;
}

// Run a single experiment for N copies
function runExperiment(targetCopies: number): ExperimentResult {
  let pulls = 0;
  let sixStarPity = 0;
  let fiveStarPity = 0;
  let rateUpCount = 0;
  let ticketsTotal = 0;

  while (rateUpCount < targetCopies) {
    pulls++;
    sixStarPity++;
    fiveStarPity++;

    const currentSixStarRate = sixStarChance(sixStarPity);
    const remainingRate = 1.0 - currentSixStarRate;
    const currentFiveStarRate = BASE_FIVE_STAR_RATE * remainingRate;

    const guaranteed5Star = fiveStarPity === 10;
    const roll = Math.random();

    // --- Hard pity ---
    if (sixStarPity >= MAX_PITY) {
      sixStarPity = 0;
      fiveStarPity = 0;
      ticketsTotal += TICKETS_SIX_STAR;
      if (Math.random() < 0.5) {
        rateUpCount++;
      }
      continue;
    }

    // --- 240 guaranteed ---
    if (pulls % RATE_UP_240 === 0) {
      rateUpCount++;
      ticketsTotal += 0; // NO TICKETS GAINED FOR POTENTIAL TOKEN
      sixStarPity = 0;
      fiveStarPity = 0;
      continue;
    }

    // --- 120 guaranteed first ---
    if (pulls >= GUARANTEE_120 && rateUpCount === 0) {
      rateUpCount++;
      ticketsTotal += TICKETS_SIX_STAR;
      sixStarPity = 0;
      fiveStarPity = 0;
      continue;
    }

    // --- Normal roll ---
    if (roll < currentSixStarRate) {
      sixStarPity = 0;
      fiveStarPity = 0;
      ticketsTotal += TICKETS_SIX_STAR;
      if (Math.random() < 0.5) {
        rateUpCount++;
      }
    } else if (roll < currentSixStarRate + currentFiveStarRate || guaranteed5Star) {
      fiveStarPity = 0;
      ticketsTotal += TICKETS_FIVE_STAR;
    } else {
      ticketsTotal += TICKETS_FOUR_STAR;
    }
  }

  return {
    pulls,
    ticketsTotal
  };
}

// Calculate probability of getting character within budget
function calculateProbability(budget: number, targetCopies: number): void {
  console.log(`\n Running ${EXPERIMENTS} simulations...`);
  
  const pullsList: number[] = [];
  const ticketsList: number[] = [];
  let successCount = 0;

  for (let i = 0; i < EXPERIMENTS; i++) {
    const result = runExperiment(targetCopies);
    pullsList.push(result.pulls);
    ticketsList.push(result.ticketsTotal);
    
    if (result.pulls <= budget) {
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
  console.log(` RESULTS FOR ${targetCopies} COPY/COPIES`);
  console.log("=".repeat(60));
  
  console.log(`\n Your Budget: ${budget} pulls`);
  console.log(` Success Rate: ${successCount} out of ${EXPERIMENTS} (${probability.toFixed(2)}%)`);
  
  console.log("\n PULL STATISTICS:");
  console.log(`   Best case (minimum):     ${best} pulls`);
  console.log(`   5th percentile:          ${p5} pulls`);
  console.log(`   25th percentile:         ${p25} pulls`);
  console.log(`   Median (50th):           ${Math.floor(medianPulls)} pulls`);
  console.log(`   Average:                 ${avg.toFixed(2)} pulls`);
  console.log(`   75th percentile:         ${p75} pulls`);
  console.log(`   95th percentile:         ${p95} pulls`);
  console.log(`   Worst case (maximum):    ${worst} pulls`);
  
  console.log("\n RECOMMENDATIONS:");
  if (budget >= p95) {
    console.log(`    You have a ~95% chance of getting ${targetCopies} copy/copies!`);
  } else if (budget >= p75) {
    console.log(`    You have a ~75% chance of getting ${targetCopies} copy/copies!`);
  } else if (budget >= medianPulls) {
    console.log(`    You have a ~50% chance of getting ${targetCopies} copy/copies!`);
  } else if (budget >= p25) {
    console.log(`    You have a ~25% chance of getting ${targetCopies} copy/copies!`);
  } else {
    console.log(`    Your budget is below average - consider saving more pulls!`);
  }
  
  console.log(`\n To guarantee ${targetCopies} copy/copies, budget: ${p95} pulls (95% safe)`);
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
  console.log(" ENDFIELD CHARACTER GACHA CALCULATOR");
  console.log("=".repeat(60));
  
  try {
    // Get number of copies
    const copiesInput = await question('\n How many copies do you want? (1-6): ');
    const targetCopies = parseInt(copiesInput);
    
    if (isNaN(targetCopies) || targetCopies < 1 || targetCopies > 6) {
      console.log(' Invalid input! Please enter a number between 1 and 6.');
      rl.close();
      return;
    }
    
    // Get budget
    const budgetInput = await question(' What is your pull budget? (e.g., 100, 300, 500): ');
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
