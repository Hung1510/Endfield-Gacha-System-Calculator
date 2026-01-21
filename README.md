# Endfield Gacha Calculator

Calculators using TypeScript for Endfield character and weapon gacha probabilities.

## Features

- **Character Calculator**: Calculate the probability of obtaining a specific number of featured characters
- **Weapon Calculator**: Calculate the probability of obtaining a specific number of featured weapons
- **Statistics**: Shows percentiles, averages, and success rates

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Character Calculator
```bash
npm run character
```

You'll be prompted to enter:
- Number of copies you want (1-6)
- Your pull budget

The calculator will show:
- Success rate percentage
- Pull statistics (minimum, maximum, average, percentiles)
- Recommendations based on your budget

### Weapon Calculator
```bash
npm run weapon
```

Same interface as the character calculator, but for weapons.

## Alternative: Running with ts-node directly

```bash
# Character calculator
npx ts-node endfield-character-calculator.ts

# Weapon calculator
npx ts-node endfield-weapon-calculator.ts
```

## Alternative: Running with Deno (no npm install needed)

```bash
# Character calculator
deno run --allow-read endfield-character-calculator.ts

# Weapon calculator
deno run --allow-read endfield-weapon-calculator.ts
```

## Example Output

```

   ENDFIELD CHARACTER GACHA CALCULATOR

   How many copies do you want? (1-6): 1
   What is your pull budget? (e.g., 100, 300, 500): 150

   Running 10000 simulations...


   RESULTS FOR 1 COPY/COPIES

   Your Budget: 150 pulls
   Success Rate: 8542 out of 10000 (85.42%)

   PULL STATISTICS:
   Best case (minimum):     10 pulls
   5th percentile:          20 pulls
   25th percentile:         45 pulls
   Median (50th):           75 pulls
   Average:                 89.34 pulls
   75th percentile:         120 pulls
   95th percentile:         180 pulls
   Worst case (maximum):    450 pulls


   RECOMMENDATIONS:
      You have a ~75% chance of getting 1 copy/copies!

   To guarantee 1 copy/copies, budget: 180 pulls (95% safe)
   For 50% chance: 75 pulls
```

## How It Works

Both calculators run 10,000 simulations of the gacha system to determine:
- The probability of getting your desired number of copies within your budget
- Statistical distribution of pulls needed
- Safe budgets for different confidence levels (50%, 75%, 95%)

### Character Banner System
- Base 6★ rate: 0.8%
- Pity starts at pull 66 (increases by 5% per pull)
- Hard pity at 80 pulls
- 120 pull guarantee for first copy
- 240 pull guarantee system
- 50% chance for rate-up character on 6★

### Weapon Banner System
- Base 6★ rate: 4%
- Rate-up chance: 25%
- Pulls in sets of 10
- Guaranteed 6★ between pulls 31-40
- First rate-up guaranteed by pull 80
- Extra guaranteed rate-ups at 180, 340, 500, 660, 820 pulls
