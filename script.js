// Gem data for calculations
const gemData = {
    level1: {
        basePower: 10,
        multiplier: 1.0,
        rarity: "Common",
        goldCost: 100,
        dustCost: 5,
        crystalCost: 0,
        craftTime: 1
    },
    level2: {
        basePower: 25,
        multiplier: 1.2,
        rarity: "Uncommon",
        goldCost: 250,
        dustCost: 15,
        crystalCost: 1,
        craftTime: 5
    },
    level3: {
        basePower: 60,
        multiplier: 1.5,
        rarity: "Rare",
        goldCost: 600,
        dustCost: 30,
        crystalCost: 3,
        craftTime: 15
    },
    level4: {
        basePower: 150,
        multiplier: 2.0,
        rarity: "Epic",
        goldCost: 1500,
        dustCost: 75,
        crystalCost: 8,
        craftTime: 30
    },
    level5: {
        basePower: 400,
        multiplier: 3.0,
        rarity: "Legendary",
        goldCost: 4000,
        dustCost: 200,
        crystalCost: 20,
        craftTime: 60
    }
};

// Load JSON data
let gloveData = {};
let mineData = {};
let upgradeData = [];

// DOM elements
const gloveTypeSelect = document.getElementById('gloveType');
const daysInput = document.getElementById('days');
const minesPerDayInput = document.getElementById('minesPerDay');
const maxQuotaInput = document.getElementById('maxQuota');
const calculateBtn = document.getElementById('calculateBtn');

// Stats elements
const startGloveElement = document.getElementById('startGlove');
const endGloveElement = document.getElementById('endGlove');
const totalUpgradesElement = document.getElementById('totalUpgrades');
const finalScoreElement = document.getElementById('finalScore');

// Progress table
const progressTableElement = document.getElementById('progressTable');

// Chart variables
let progressChart = null;
const chartCtx = document.getElementById('progressChart').getContext('2d');

// Constants
const DEFAULT_MINES_PER_DAY = 10; // Default number of mining operations per day

// Function to load all JSON data
async function loadAllData() {
    try {
        // Load Glove data
        const gloveResponse = await fetch('data/Glove.json');
        gloveData = await gloveResponse.json();
        
        // Load Mine data
        const mineResponse = await fetch('data/Mine.json');
        mineData = await mineResponse.json();
        
        // Load Upgrade data
        const upgradeResponse = await fetch('data/Upgrade.json');
        upgradeData = await upgradeResponse.json();
        
        // Enable calculate button once data is loaded
        calculateBtn.disabled = false;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please check console for details.');
    }
}

// Function to find the best deposit zone for a given score
function findBestDepositZone(score) {
    const zones = Object.keys(mineData.zones)
        .map(zone => parseInt(zone.split('_')[1]))
        .filter(zoneScore => score >= zoneScore)
        .sort((a, b) => b - a);
    
    return zones.length > 0 ? `zone_${zones[0]}` : 'zone_0';
}

// Function to calculate the average score for a gem in a zone
function calculateAverageGemScore(zone, rarity, gemName) {
    if (!mineData.zones[zone] || !mineData.zones[zone][rarity] || !mineData.zones[zone][rarity][gemName]) {
        return 0;
    }
    
    const [min, max] = mineData.zones[zone][rarity][gemName];
    return (min + max) / 2;
}

// Function to calculate the expected score per mine operation for a given glove
function calculateExpectedScorePerMine(gloveType, zone) {
    if (!gloveData[gloveType] || !mineData.zones[zone]) {
        return 0;
    }
    
    let totalScore = 0;
    
    // Calculate for each rarity level
    for (const rarity in gloveData[gloveType]) {
        const rarityData = gloveData[gloveType][rarity];
        const rarityRate = rarityData.rate / 100; // Convert percentage to decimal
        
        if (rarity === 'หายากมาก' && mineData.zones[zone][rarity].hasOwnProperty('ticket')) {
            // Skip ticket items as they don't contribute to score
            continue;
        }
        
        // Calculate weighted score for each gem in this rarity
        let rarityScore = 0;
        let totalWeight = 0;
        
        for (const gemName in rarityData.items) {
            const weight = rarityData.items[gemName];
            totalWeight += weight;
            
            // Get average score for this gem
            const avgScore = calculateAverageGemScore(zone, rarity, gemName);
            rarityScore += avgScore * weight;
        }
        
        // Calculate weighted average for this rarity level
        if (totalWeight > 0) {
            rarityScore = rarityScore / totalWeight;
        }
        
        // Add to total score, weighted by rarity rate
        totalScore += rarityScore * rarityRate;
    }
    
    return totalScore;
}

// Function to find the next upgrade for a glove
function findNextUpgrade(currentGlove, currentScore) {
    const possibleUpgrades = upgradeData.filter(upgrade => 
        upgrade.from === currentGlove && 
        upgrade.weight_required <= currentScore
    );
    
    // Sort by weight required in descending order to get the highest upgrade possible
    return possibleUpgrades.sort((a, b) => b.weight_required - a.weight_required)[0];
}

// Main calculation function
function calculateGloveProgression() {
    // Get input values
    const startingGlove = gloveTypeSelect.value;
    const days = parseInt(daysInput.value, 10);
    const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
    const maxQuota = parseInt(maxQuotaInput.value, 10) || 0; // 0 means no limit
    
    // Validate inputs
    if (isNaN(days) || days < 1) {
        alert('Please enter a valid number of days (minimum 1)');
        daysInput.value = 1;
        return;
    }
    
    if (isNaN(minesPerDay) || minesPerDay < 1 || minesPerDay > 20) {
        alert('Please enter a valid number of mines per day (between 1 and 20)');
        minesPerDayInput.value = DEFAULT_MINES_PER_DAY;
        return;
    }
    
    if (isNaN(maxQuota) || maxQuota < 0) {
        alert('Please enter a valid max quota (minimum 0)');
        maxQuotaInput.value = 0;
        return;
    }
    
    // Initialize variables
    let currentGlove = startingGlove;
    let totalScore = 0;
    let dailyResults = [];
    let remainingQuota = maxQuota > 0 ? maxQuota : Number.MAX_SAFE_INTEGER; // Use MAX_SAFE_INTEGER if no limit
      // Calculate progression for each day
    for (let day = 1; day <= days; day++) {
        // Find the best deposit zone for current total score
        const bestZone = findBestDepositZone(totalScore);
        
        // Calculate expected score for this day
        const expectedScorePerMine = calculateExpectedScorePerMine(currentGlove, bestZone);
        
        // Calculate actual mines based on remaining quota
        const actualMines = maxQuota > 0 ? Math.min(minesPerDay, remainingQuota) : minesPerDay;
        
        // Skip this day if no quota left
        if (actualMines <= 0) {
            dailyResults.push({
                day,
                gloveType: currentGlove,
                scoreGained: 0,
                totalScore: Math.round(totalScore),
                zone: bestZone,
                upgrade: false,
                quotaReached: true
            });
            continue;
        }
        
        // Calculate daily score
        const dailyScore = expectedScorePerMine * actualMines;
        totalScore += dailyScore;
        
        // Check if we can upgrade the glove
        const upgrade = findNextUpgrade(currentGlove, totalScore);
        
        // Store daily results
        dailyResults.push({
            day,
            gloveType: currentGlove,
            scoreGained: Math.round(dailyScore),
            totalScore: Math.round(totalScore),
            zone: bestZone,
            upgrade: upgrade ? true : false,
            quotaReached: maxQuota > 0 && actualMines < minesPerDay,
            actualMines: actualMines
        });
        
        // Apply upgrade if available
        if (upgrade) {
            currentGlove = upgrade.to;
        }
        
        // Update remaining quota
        if (maxQuota > 0) {
            remainingQuota -= actualMines;
        }
    }
    
    // Update UI with results
    updateUI(startingGlove, currentGlove, dailyResults);
}

// Update UI with calculation results
function updateUI(startGlove, endGlove, dailyResults) {
    // Update glove stats
    startGloveElement.textContent = startGlove;
    endGloveElement.textContent = endGlove;
    
    // Count number of upgrades
    const totalUpgrades = dailyResults.filter(result => result.upgrade).length;
    totalUpgradesElement.textContent = totalUpgrades;
    
    // Set final score
    const finalScore = dailyResults.length > 0 ? dailyResults[dailyResults.length - 1].totalScore : 0;
    finalScoreElement.textContent = finalScore.toLocaleString();
    
    // Clear existing progress table
    progressTableElement.innerHTML = '';
      // Populate progress table
    dailyResults.forEach((result, index) => {
        const row = document.createElement('tr');
        
        // Add highlight class if there was an upgrade or quota was reached
        if (result.upgrade) {
            row.classList.add('table-success');
        } else if (result.quotaReached) {
            row.classList.add('table-warning');
        }
        
        // Format zone name for display
        const zoneDisplay = result.zone.replace('zone_', '') + ' pts';
        
        // Get the next glove type after upgrade
        let nextGloveDisplay = '';
        if (result.upgrade && index + 1 < dailyResults.length) {
            nextGloveDisplay = ` → ${dailyResults[index + 1].gloveType}`;
        }
        
        // Show mines info if quota is active
        let minesInfo = '';
        if (result.hasOwnProperty('actualMines')) {
            const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
            minesInfo = `<span class="text-muted">(${result.actualMines}/${minesPerDay})</span>`;
        }
        
        row.innerHTML = `
            <td>${result.day}</td>
            <td>${result.gloveType}${result.upgrade ? nextGloveDisplay : ''}</td>
            <td>${result.scoreGained.toLocaleString()} ${minesInfo}</td>
            <td>${result.totalScore.toLocaleString()}</td>
            <td>${zoneDisplay}</td>
        `;
        
        progressTableElement.appendChild(row);
    });
    
    // Update chart
    updateProgressChart(dailyResults);
}

// Update progress chart
function updateProgressChart(dailyResults) {
    // Extract data for chart
    const days = dailyResults.map(result => `Day ${result.day}`);
    const scores = dailyResults.map(result => result.totalScore);
    
    // Create upgrade markers
    const upgradePoints = dailyResults.map((result, index) => 
        result.upgrade ? scores[index] : null
    );
    
    // Destroy existing chart if it exists
    if (progressChart !== null) {
        progressChart.destroy();
    }
    
    // Create new chart
    progressChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Total Score',
                    data: scores,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Upgrades',
                    data: upgradePoints,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false,
                    pointStyle: 'star'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Score'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const datasetIndex = context.datasetIndex;
                            
                            if (datasetIndex === 1 && upgradePoints[index] !== null) {
                                // For upgrade points, show the upgrade info                                const prevGlove = dailyResults[index].gloveType;
                                let nextGlove = '';
                                if (index + 1 < dailyResults.length) {
                                    nextGlove = dailyResults[index + 1].gloveType;
                                } else {
                                    nextGlove = endGloveElement.textContent;
                                }
                                return [`Score: ${scores[index].toLocaleString()}`, `Upgrade: ${prevGlove} → ${nextGlove}`];
                            } else {
                                // Regular score point
                                let info = [`Score: ${scores[index].toLocaleString()}`];
                                
                                // Add quota info if available
                                if (dailyResults[index].quotaReached) {
                                    info.push(`Quota limit reached`);
                                }
                                
                                if (dailyResults[index].hasOwnProperty('actualMines')) {
                                    const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
                                    info.push(`Mines: ${dailyResults[index].actualMines}/${minesPerDay}`);
                                }
                                
                                return info;
                            }
                        }
                    }
                }
            }
        }
    });
}

// Event listeners
calculateBtn.addEventListener('click', calculateGloveProgression);
gloveTypeSelect.addEventListener('change', calculateGloveProgression);
daysInput.addEventListener('change', calculateGloveProgression);
minesPerDayInput.addEventListener('change', calculateGloveProgression);
maxQuotaInput.addEventListener('change', calculateGloveProgression);

// Initialize with default values and load data
window.addEventListener('DOMContentLoaded', () => {
    // Set default values
    gloveTypeSelect.value = 'Glove Pick I (Normal)';
    daysInput.value = 7;
    minesPerDayInput.value = 10;
    maxQuotaInput.value = 0;
    
    // Disable calculate button until data is loaded
    calculateBtn.disabled = true;
    
    // Load JSON data
    loadAllData().then(() => {
        // Initial calculation
        calculateGloveProgression();
    });
});
