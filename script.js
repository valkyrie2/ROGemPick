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
const gemTypeSelect = document.getElementById('gemType');
const quantityInput = document.getElementById('quantity');
const calculateBtn = document.getElementById('calculateBtn');
const gloveTypeSelect = document.getElementById('gloveType');
const daysInput = document.getElementById('days');

// Stats elements
const basePowerElement = document.getElementById('basePower');
const multiplierElement = document.getElementById('multiplier');
const rarityElement = document.getElementById('rarity');
const startGloveElement = document.getElementById('startGlove');
const endGloveElement = document.getElementById('endGlove');
const totalUpgradesElement = document.getElementById('totalUpgrades');

// Resource elements
const goldRequiredElement = document.getElementById('goldRequired');
const dustRequiredElement = document.getElementById('dustRequired');
const crystalsRequiredElement = document.getElementById('crystalsRequired');

// Output elements
const totalPowerElement = document.getElementById('totalPower');
const costEfficiencyElement = document.getElementById('costEfficiency');
const timeToCraftElement = document.getElementById('timeToCraft');

// Progress table
const progressTableElement = document.getElementById('progressTable');

// Chart variables
let gemComparisonChart = null;
const chartCtx = document.getElementById('gemComparisonChart').getContext('2d');
let progressChart = null;
const progressChartCtx = document.getElementById('progressChart').getContext('2d');

// Calculate function
function calculateGemStats() {
    // Get input values
    const gemType = gemTypeSelect.value;
    const quantity = parseInt(quantityInput.value, 10);
    
    // Validate input
    if (isNaN(quantity) || quantity < 0) {
        alert('Please enter a valid quantity (minimum 0)');
        quantityInput.value = 0;
        return;
    }
    
    // Get gem data
    const gem = gemData[gemType];
    
    // Apply special bonuses based on quantity (bulk crafting bonus)
    let bonusMultiplier = 1.0;
    if (quantity >= 100) {
        bonusMultiplier = 1.25; // 25% bonus for bulk crafting (100+ gems)
    } else if (quantity >= 50) {
        bonusMultiplier = 1.15; // 15% bonus for bulk crafting (50+ gems)
    } else if (quantity >= 10) {
        bonusMultiplier = 1.05; // 5% bonus for bulk crafting (10+ gems)
    }
    
    // Update gem stats table with base values (without quantity effects)
    basePowerElement.textContent = gem.basePower;
    multiplierElement.textContent = gem.multiplier.toFixed(1);
    rarityElement.textContent = gem.rarity;
    
    // Calculate resources needed with possible bulk discount
    let bulkDiscount = quantity >= 20 ? 0.9 : 1.0; // 10% discount for 20+ gems
    const totalGold = Math.round(gem.goldCost * quantity * bulkDiscount);
    const totalDust = Math.round(gem.dustCost * quantity * bulkDiscount);
    const totalCrystals = Math.ceil(gem.crystalCost * quantity * bulkDiscount); // Always round up for crystals
    
    // Update resource table
    goldRequiredElement.textContent = totalGold.toLocaleString();
    dustRequiredElement.textContent = totalDust.toLocaleString();
    crystalsRequiredElement.textContent = totalCrystals.toLocaleString();
    
    // Calculate output metrics with bonus multiplier
    const totalPower = gem.basePower * gem.multiplier * quantity * bonusMultiplier;
    const resourceValue = totalGold + (totalDust * 10) + (totalCrystals * 100);
    const costEfficiency = resourceValue > 0 ? totalPower / resourceValue : 0;
    
    // Calculate time to craft with potential time savings for bulk crafting
    const bulkTimeEfficiency = quantity >= 50 ? 0.8 : (quantity >= 20 ? 0.9 : 1.0); // Up to 20% time savings
    const timeToCraft = Math.ceil(gem.craftTime * quantity * bulkTimeEfficiency);
    
    // Update output table
    totalPowerElement.textContent = totalPower.toLocaleString(undefined, {maximumFractionDigits: 0});
    costEfficiencyElement.textContent = costEfficiency.toFixed(2);
    
    // Format time to craft
    let timeText = '';
    if (timeToCraft < 60) {
        timeText = `${timeToCraft} min`;
    } else if (timeToCraft < 1440) { // Less than a day
        const hours = Math.floor(timeToCraft / 60);
        const minutes = timeToCraft % 60;
        timeText = `${hours}h ${minutes}m`;
    } else { // More than a day
        const days = Math.floor(timeToCraft / 1440);
        const hours = Math.floor((timeToCraft % 1440) / 60);
        const minutes = timeToCraft % 60;
        timeText = `${days}d ${hours}h ${minutes}m`;
    }
    timeToCraftElement.textContent = timeText;
}

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
        
        if (rarity === 'หายากมาก' && 'ticket' in mineData.zones[zone][rarity]) {
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
    
    // Validate inputs
    if (isNaN(days) || days < 1) {
        alert('Please enter a valid number of days (minimum 1)');
        daysInput.value = 1;
        return;
    }
    
    // Initialize variables
    let currentGlove = startingGlove;
    let totalScore = 0;
    let dailyResults = [];
    const minesPerDay = 10; // Assuming 10 mines per day
    
    // Calculate progression for each day
    for (let day = 1; day <= days; day++) {
        // Find the best deposit zone for current total score
        const bestZone = findBestDepositZone(totalScore);
        
        // Calculate expected score for this day
        const expectedScorePerMine = calculateExpectedScorePerMine(currentGlove, bestZone);
        const dailyScore = expectedScorePerMine * minesPerDay;
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
            upgrade: upgrade ? true : false
        });
        
        // Apply upgrade if available
        if (upgrade) {
            currentGlove = upgrade.to;
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
    
    // Clear existing progress table
    progressTableElement.innerHTML = '';
    
    // Populate progress table
    dailyResults.forEach(result => {
        const row = document.createElement('tr');
        
        // Add highlight class if there was an upgrade
        if (result.upgrade) {
            row.classList.add('table-success');
        }
        
        // Format zone name for display
        const zoneDisplay = result.zone.replace('zone_', '') + ' pts';
        
        row.innerHTML = `
            <td>${result.day}</td>
            <td>${result.gloveType}${result.upgrade ? ' → ' + dailyResults[result.day]?.gloveType : ''}</td>
            <td>${result.scoreGained.toLocaleString()}</td>
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
    progressChart = new Chart(progressChartCtx, {
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
                                // For upgrade points, show the upgrade info
                                const prevGlove = dailyResults[index].gloveType;
                                const nextGlove = dailyResults[index + 1]?.gloveType || endGloveElement.textContent;
                                return [`Score: ${scores[index].toLocaleString()}`, `Upgrade: ${prevGlove} → ${nextGlove}`];
                            } else {
                                // Regular score point
                                return `Score: ${scores[index].toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

// Calculate function for gloves
function calculateGloveProgression() {
    // Get input values
    const startingGlove = gloveTypeSelect.value;
    const days = parseInt(daysInput.value, 10);
    
    // Validate inputs
    if (isNaN(days) || days < 1) {
        alert('Please enter a valid number of days (minimum 1)');
        daysInput.value = 1;
        return;
    }
    
    // Initialize variables
    let currentGlove = startingGlove;
    let totalScore = 0;
    let dailyResults = [];
    const minesPerDay = 10; // Assuming 10 mines per day
    
    // Calculate progression for each day
    for (let day = 1; day <= days; day++) {
        // Find the best deposit zone for current total score
        const bestZone = findBestDepositZone(totalScore);
        
        // Calculate expected score for this day
        const expectedScorePerMine = calculateExpectedScorePerMine(currentGlove, bestZone);
        const dailyScore = expectedScorePerMine * minesPerDay;
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
            upgrade: upgrade ? true : false
        });
        
        // Apply upgrade if available
        if (upgrade) {
            currentGlove = upgrade.to;
        }
    }
    
    // Update UI with results
    updateUI(startingGlove, currentGlove, dailyResults);
}

// Update UI with calculation results for gloves
function updateUI(startGlove, endGlove, dailyResults) {
    // Update glove stats
    startGloveElement.textContent = startGlove;
    endGloveElement.textContent = endGlove;
    
    // Count number of upgrades
    const totalUpgrades = dailyResults.filter(result => result.upgrade).length;
    totalUpgradesElement.textContent = totalUpgrades;
    
    // Clear existing progress table
    progressTableElement.innerHTML = '';
    
    // Populate progress table
    dailyResults.forEach(result => {
        const row = document.createElement('tr');
        
        // Add highlight class if there was an upgrade
        if (result.upgrade) {
            row.classList.add('table-success');
        }
        
        // Format zone name for display
        const zoneDisplay = result.zone.replace('zone_', '') + ' pts';
        
        row.innerHTML = `
            <td>${result.day}</td>
            <td>${result.gloveType}${result.upgrade ? ' → ' + dailyResults[result.day]?.gloveType : ''}</td>
            <td>${result.scoreGained.toLocaleString()}</td>
            <td>${result.totalScore.toLocaleString()}</td>
            <td>${zoneDisplay}</td>
        `;
        
        progressTableElement.appendChild(row);
    });
    
    // Update chart
    updateProgressChart(dailyResults);
}

// Update progress chart for gloves
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
    progressChart = new Chart(progressChartCtx, {
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
                                // For upgrade points, show the upgrade info
                                const prevGlove = dailyResults[index].gloveType;
                                const nextGlove = dailyResults[index + 1]?.gloveType || endGloveElement.textContent;
                                return [`Score: ${scores[index].toLocaleString()}`, `Upgrade: ${prevGlove} → ${nextGlove}`];
                            } else {
                                // Regular score point
                                return `Score: ${scores[index].toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

// Event listeners
calculateBtn.addEventListener('click', calculateGemStats);
gemTypeSelect.addEventListener('change', updateComparisonChart);
quantityInput.addEventListener('input', updateComparisonChart);
calculateBtn.addEventListener('click', calculateGloveProgression);

// Function to update the comparison chart
function updateComparisonChart() {
    const quantity = parseInt(quantityInput.value, 10) || 1;
    
    // Prepare data for the chart
    const labels = [];
    const powerData = [];
    const efficiencyData = [];
    const timeData = [];
    
    // Calculate data for each gem type
    for (const type in gemData) {
        const gem = gemData[type];
        labels.push(gem.rarity);
        
        // Apply bonuses based on quantity (similar to calculateGemStats function)
        let bonusMultiplier = 1.0;
        if (quantity >= 100) {
            bonusMultiplier = 1.25;
        } else if (quantity >= 50) {
            bonusMultiplier = 1.15;
        } else if (quantity >= 10) {
            bonusMultiplier = 1.05;
        }
        
        // Calculate metrics
        const totalPower = gem.basePower * gem.multiplier * quantity * bonusMultiplier;
        const bulkDiscount = quantity >= 20 ? 0.9 : 1.0;
        const totalGold = Math.round(gem.goldCost * quantity * bulkDiscount);
        const totalDust = Math.round(gem.dustCost * quantity * bulkDiscount);
        const totalCrystals = Math.ceil(gem.crystalCost * quantity * bulkDiscount);
        const resourceValue = totalGold + (totalDust * 10) + (totalCrystals * 100);
        const costEfficiency = resourceValue > 0 ? totalPower / resourceValue : 0;
        
        // Time calculation
        const bulkTimeEfficiency = quantity >= 50 ? 0.8 : (quantity >= 20 ? 0.9 : 1.0);
        const timeToCraft = Math.ceil(gem.craftTime * quantity * bulkTimeEfficiency);
        
        // Push data to arrays
        powerData.push(totalPower);
        efficiencyData.push(costEfficiency);
        timeData.push(timeToCraft);
    }
    
    // Destroy existing chart if it exists
    if (gemComparisonChart !== null) {
        gemComparisonChart.destroy();
    }
    
    // Create new chart
    gemComparisonChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Power',
                    data: powerData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Cost Efficiency',
                    data: efficiencyData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Power'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cost Efficiency'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Initialize with default values
window.addEventListener('DOMContentLoaded', () => {
    // Set default values
    gemTypeSelect.value = 'level1';
    quantityInput.value = 1;
    gloveTypeSelect.value = 'Glove Pick I (Normal)';
    daysInput.value = 7;
    
    // Disable calculate button until data is loaded
    calculateBtn.disabled = true;
    
    // Load JSON data
    loadAllData().then(() => {
        // Calculate initial stats
        calculateGemStats();
        
        // Initialize the comparison chart
        updateComparisonChart();
        
        // Initial calculation for gloves
        calculateGloveProgression();
    });
});
