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
let dailyScoreChart = null;
const dailyScoreCtx = document.getElementById('dailyScoreChart').getContext('2d');

// Constants
const DEFAULT_MINES_PER_DAY = 10; // Default number of mining operations per day
const MAX_MINES_PER_DAY = 250; // Maximum mines per day

// Function to load all JSON data
async function loadAllData() {
    try {
        console.log('Loading JSON data files...');
        
        // Load Glove data
        const gloveResponse = await fetch('data/Glove.json');
        if (!gloveResponse.ok) {
            throw new Error(`Failed to load Glove.json: ${gloveResponse.status} ${gloveResponse.statusText}`);
        }
        gloveData = await gloveResponse.json();
        console.log('Glove data loaded successfully');
        
        // Load Mine data
        const mineResponse = await fetch('data/Mine.json');
        if (!mineResponse.ok) {
            throw new Error(`Failed to load Mine.json: ${mineResponse.status} ${mineResponse.statusText}`);
        }
        mineData = await mineResponse.json();
        console.log('Mine data loaded successfully');
        
        // Load Upgrade data
        const upgradeResponse = await fetch('data/Upgrade.json');
        if (!upgradeResponse.ok) {
            throw new Error(`Failed to load Upgrade.json: ${upgradeResponse.status} ${upgradeResponse.statusText}`);
        }
        upgradeData = await upgradeResponse.json();
        console.log('Upgrade data loaded successfully');
        
        // Enable calculate button once data is loaded
        calculateBtn.disabled = false;
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data: ' + error.message + '\n\nPlease make sure you are running this on a web server and not directly from the file system. See console for details.');
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
function findNextUpgrade(currentGlove, currentScore, startingGlove) {
    console.log(`upgradeData:`, upgradeData);
    let possibleUpgrades = upgradeData.filter(upgrade => 
        upgrade.from === currentGlove
    );
    console.log(`Possible upgrades for ${currentGlove} with score ${currentScore}:`, possibleUpgrades);
    
    // Special handling for Glove Pick I (Rare) based on starting glove
    if (currentGlove === "Glove Pick I (Rare)" && startingGlove === "Glove Pick I (Rare)") {
        // If the starting glove was "Glove Pick I (Rare)", use the path with 3600 weight
        // If the starting glove was something else (like "Glove Pick I (Normal)"), use the 14400 weight path
        const weightToFind = 3600;
        possibleUpgrades = possibleUpgrades.filter(upgrade => 
            weightToFind <= currentScore
        );
    }
    else{
        possibleUpgrades = possibleUpgrades.filter(upgrade => 
            upgrade.weight_required <= currentScore
        );
    }
    
    // Sort by weight required in descending order to get the highest upgrade possible
    return possibleUpgrades.sort((a, b) => b.weight_required - a.weight_required)[0];
}

// Function to select a random gem based on glove probabilities
function selectRandomGem(gloveType, zone) {
    if (!gloveData[gloveType] || !mineData.zones[zone]) {
        return null;
    }
    
    // First, determine the rarity based on the glove's rarity rates
    let rarityRandom = Math.random() * 100;
    let selectedRarity = null;
    let cumulativeRate = 0;
    
    for (const rarity in gloveData[gloveType]) {
        cumulativeRate += gloveData[gloveType][rarity].rate;
        if (rarityRandom <= cumulativeRate) {
            selectedRarity = rarity;
            break;
        }
    }
    
    if (!selectedRarity || !mineData.zones[zone][selectedRarity]) {
        return null;
    }
      // Handle ticket items for very rare category
    if (selectedRarity === 'หายากมาก' && mineData.zones[zone][selectedRarity].hasOwnProperty('ticket')) {
        const availableGems = Object.keys(mineData.zones[zone][selectedRarity])
            .filter(key => key !== 'ticket');
        
        if (availableGems.length === 0) {
            return null;
        }
        
        // Select a random gem from available ones
        const randomGem = availableGems[Math.floor(Math.random() * availableGems.length)];
        
        // Return gem data with ticket information
        return { 
            rarity: selectedRarity, 
            gemName: randomGem,
            scoreRange: mineData.zones[zone][selectedRarity][randomGem],
            hasTicket: true,
            ticketName: 'ticket' // This could be replaced with actual ticket name if available
        };
    }
    
    // For normal categories, select based on weight in the glove data
    const rarityData = gloveData[gloveType][selectedRarity];
    const availableGems = Object.keys(rarityData.items)
        .filter(gemName => mineData.zones[zone][selectedRarity] && 
                         mineData.zones[zone][selectedRarity][gemName]);
    
    if (availableGems.length === 0) {
        return null;
    }
    
    // Create a weighted selection based on the item weights
    const totalWeight = availableGems.reduce((sum, gemName) => sum + rarityData.items[gemName], 0);
    let random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const gemName of availableGems) {
        cumulativeWeight += rarityData.items[gemName];
        if (random <= cumulativeWeight) {
            return { 
                rarity: selectedRarity, 
                gemName: gemName,
                scoreRange: mineData.zones[zone][selectedRarity][gemName]
            };
        }
    }
    
    // Fallback to a random selection if something went wrong
    const randomGem = availableGems[Math.floor(Math.random() * availableGems.length)];
    return { 
        rarity: selectedRarity, 
        gemName: randomGem,
        scoreRange: mineData.zones[zone][selectedRarity][randomGem]
    };
}

// Function to perform a single mining operation
function performMining(gloveType, zone) {
    const gem = selectRandomGem(gloveType, zone);
    if (!gem) {
        return { score: 0 };
    }
    
    // Calculate a random score within the range
    const [min, max] = gem.scoreRange;
    const score = Math.floor(min + Math.random() * (max - min + 1));
    
    // Return both score and ticket information if available
    return { 
        score: score,
        hasTicket: gem.hasTicket || false,
        ticketName: gem.ticketName || null,
        rarity: gem.rarity
    };
}

// Main calculation function
function calculateGloveProgression() {
    // Show loading spinner directly without using Bootstrap modal
    document.getElementById('spinner-overlay').style.display = 'flex';
    console.log('Starting calculation...');
    
    // Use setTimeout to allow UI to update before starting calculations
    setTimeout(() => {
        try {            // Get input values
            const startingGlove = gloveTypeSelect.value;
            const days = parseInt(daysInput.value, 10);
            const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
            
            console.log('Input values:', { startingGlove, days, minesPerDay });
            
            // Validate inputs
            if (isNaN(days) || days < 1) {
                alert('Please enter a valid number of days (minimum 1)');
                daysInput.value = 1;
                loadingModal.hide();
                return;
            }
            
            if (isNaN(minesPerDay) || minesPerDay < 1 || minesPerDay > MAX_MINES_PER_DAY) {
                alert(`Please enter a valid number of mines per day (between 1 and ${MAX_MINES_PER_DAY})`);
                minesPerDayInput.value = DEFAULT_MINES_PER_DAY;
                loadingModal.hide();
                return;
            }            // Initialize variables
            let currentGlove = startingGlove;
            let totalScore = 0;
            let dailyResults = [];
            
            // Calculate progression for each day
            for (let day = 1; day <= days; day++) {
                // Find the best deposit zone for current total score
                const bestZone = findBestDepositZone(totalScore);
                  // Simulate actual mining operations for this day
                let dailyScore = 0;
                let upgradesInDay = [];
                  // We'll check for upgrades after each mining operation
                for (let i = 0; i < minesPerDay; i++) {
                    // Perform a single mining operation
                    const miningResult = performMining(currentGlove, bestZone);
                    dailyScore += miningResult.score;
                    totalScore += miningResult.score;
                    
                    // Track tickets found during mining
                    if (miningResult.hasTicket) {
                        // Initialize ticket tracking if not already done
                        if (!upgradesInDay.tickets) {
                            upgradesInDay.tickets = [];
                        }
                        
                        upgradesInDay.tickets.push({
                            mineNumber: i + 1,
                            ticketName: miningResult.ticketName,
                            rarity: miningResult.rarity
                        });
                    }
                    
                    // Check if we can upgrade after this mining operation
                    let keepUpgrading = true;
                    let tempCurrentGlove = currentGlove;
                    
                    while (keepUpgrading) {
                        const upgrade = findNextUpgrade(tempCurrentGlove, totalScore, startingGlove);
                        
                        if (upgrade) {
                            upgradesInDay.push({
                                from: tempCurrentGlove,
                                to: upgrade.to,
                                afterMineNumber: i + 1,
                                totalScore: Math.round(totalScore)
                            });
                            
                            // Update current glove for future mining operations
                            tempCurrentGlove = upgrade.to;
                            currentGlove = upgrade.to;
                        } else {
                            keepUpgrading = false;
                        }
                    }
                }                // Store daily results - capturing all glove changes
                const firstGloveOfDay = upgradesInDay.length > 0 ? upgradesInDay[0].from : currentGlove;
                const lastGloveOfDay = upgradesInDay.length > 0 ? upgradesInDay[upgradesInDay.length - 1].to : currentGlove;
                const hadUpgrade = upgradesInDay.length > 0;
                
                // Count tickets
                const ticketsFound = upgradesInDay.tickets ? upgradesInDay.tickets.length : 0;
                
                // Calculate total tickets so far
                const previousTotalTickets = dailyResults.length > 0 
                    ? dailyResults[dailyResults.length - 1].totalTickets 
                    : 0;
                const totalTickets = previousTotalTickets + ticketsFound;
                
                dailyResults.push({
                    day,
                    gloveType: firstGloveOfDay,
                    scoreGained: Math.round(dailyScore),
                    totalScore: Math.round(totalScore),
                    zone: bestZone,
                    upgrade: hadUpgrade,
                    upgradeSequence: upgradesInDay,
                    actualMines: minesPerDay,
                    finalGlove: lastGloveOfDay,
                    tickets: ticketsFound,
                    ticketDetails: upgradesInDay.tickets || [],
                    totalTickets: totalTickets
                });
                
                // No need to apply upgrades at the end of the day, as we've already updated currentGlove during mining
            }            // Update UI with results
            updateUI(startingGlove, currentGlove, dailyResults);
            
            // Store the results for export
            window.lastCalculatedResults = dailyResults;
            
            console.log('Calculation completed successfully');
            console.log('Results:', { 
                startGlove: startingGlove, 
                endGlove: currentGlove, 
                totalDays: days, 
                finalScore: dailyResults[dailyResults.length - 1].totalScore,
                totalUpgrades: dailyResults.filter(result => result.upgrade).length
            });
            
            // Hide loading spinner
            document.getElementById('spinner-overlay').style.display = 'none';
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred during calculation: ' + error.message + '\n\nPlease check console for details.');
            // Hide loading spinner
            document.getElementById('spinner-overlay').style.display = 'none';
        }
    }, 100);
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
      // Calculate total mines used
    const totalMines = dailyResults.reduce((total, result) => total + (result.actualMines || 0), 0);
    document.getElementById('totalMines').textContent = totalMines.toLocaleString();
    
    // Calculate total tickets found
    const totalTickets = dailyResults.reduce((total, result) => total + (result.tickets || 0), 0);
    document.getElementById('totalTickets').textContent = totalTickets.toLocaleString();
    
    // Clear existing progress table
    progressTableElement.innerHTML = '';    // Populate progress table
    dailyResults.forEach((result, index) => {
        const row = document.createElement('tr');
          // Add highlight class if there was an upgrade
        if (result.upgrade) {
            row.classList.add('table-success');
        }
        
        // Add highlight for ticket days
        if (result.tickets && result.tickets > 0) {
            // Use a different class or add a specific style
            row.classList.add('ticket-day');
            // If there's already an upgrade class, don't override it
            if (!result.upgrade) {
                row.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
            }
        }
          // Format zone name for display
        const zoneDisplay = result.zone.replace('zone_', '') + ' pts';
          // Build upgrade display text with mining operation numbers
        let upgradeDisplay = '';
        if (result.upgrade && result.upgradeSequence && result.upgradeSequence.length > 0) {
            if (result.upgradeSequence.length === 1) {
                // Single upgrade
                const upgrade = result.upgradeSequence[0];
                upgradeDisplay = ` → ${upgrade.to} (after mine #${upgrade.afterMineNumber})`;
            } else {
                // Multiple upgrades - create a more detailed display
                upgradeDisplay = result.upgradeSequence.map(u => 
                    ` → ${u.to} (after mine #${u.afterMineNumber})`
                ).join('');
            }
        }
          // Create tooltip for more detailed upgrade and ticket information
        let tooltipContent = '';
        let hasTooltip = false;
        
        // Add upgrade information to tooltip
        if (result.upgrade && result.upgradeSequence && result.upgradeSequence.length > 0) {
            tooltipContent = result.upgradeSequence.map(upgrade => 
                `${upgrade.from} → ${upgrade.to} (after mine #${upgrade.afterMineNumber}, score: ${upgrade.totalScore})`
            ).join('<br>');
            hasTooltip = true;
        }
        
        // Add ticket information to tooltip
        if (result.ticketDetails && result.ticketDetails.length > 0) {
            if (hasTooltip) {
                tooltipContent += '<br><br>Tickets found:<br>';
            } else {
                tooltipContent = 'Tickets found:<br>';
            }
            
            tooltipContent += result.ticketDetails.map(ticket => 
                `Ticket: ${ticket.ticketName} (mine #${ticket.mineNumber}, rarity: ${ticket.rarity})`
            ).join('<br>');
            
            hasTooltip = true;
        }
        
        // Set tooltip data attribute if there's content
        if (hasTooltip) {
            row.setAttribute('data-bs-toggle', 'tooltip');
            row.setAttribute('data-bs-html', 'true');
            row.setAttribute('title', tooltipContent);
        }
          // Format ticket display
        let ticketDisplay = result.tickets > 0 ? 
            `${result.tickets} <i class="bi bi-ticket-perforated-fill text-warning"></i>` : 
            '0';
        
        row.innerHTML = `
            <td>${result.day}</td>
            <td>${result.gloveType}${upgradeDisplay}</td>
            <td>${result.scoreGained.toLocaleString()}</td>
            <td>${result.totalScore.toLocaleString()}</td>
            <td>${zoneDisplay}</td>
            <td>${ticketDisplay}</td>
            <td>${result.totalTickets}</td>
        `;
        
        progressTableElement.appendChild(row);
    });
    
    // Initialize tooltips for the table rows
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
    
    // Update chart
    updateProgressChart(dailyResults);
}

// Update progress chart
function updateProgressChart(dailyResults) {    // Extract data for chart
    const days = dailyResults.map(result => `Day ${result.day}`);
    const scores = dailyResults.map(result => result.totalScore);
    
    // Create upgrade markers
    const upgradePoints = dailyResults.map((result, index) => 
        result.upgrade ? scores[index] : null
    );
    
    // Create ticket markers
    const ticketPoints = dailyResults.map((result, index) => 
        (result.tickets && result.tickets > 0) ? scores[index] : null
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
                },
                {
                    label: 'Tickets',
                    data: ticketPoints,
                    pointBackgroundColor: 'rgba(255, 193, 7, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    pointStyle: 'triangle'
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
                            
                            // For ticket points
                            if (datasetIndex === 2 && ticketPoints[index] !== null) {
                                const result = dailyResults[index];
                                let info = [`Score: ${scores[index].toLocaleString()}`];
                                info.push(`Tickets: ${result.tickets}`);
                                
                                // Add ticket details
                                if (result.ticketDetails && result.ticketDetails.length > 0) {
                                    result.ticketDetails.forEach((ticket, idx) => {
                                        info.push(`Ticket ${idx + 1}: Found at mine #${ticket.mineNumber}`);
                                    });
                                }
                                
                                return info;
                            } else if (datasetIndex === 1 && upgradePoints[index] !== null) {
                                // For upgrade points, show the upgrade info
                                const result = dailyResults[index];
                                let info = [`Score: ${scores[index].toLocaleString()}`];
                                
                                // Add ticket information if any
                                if (result.tickets && result.tickets > 0) {
                                    info.push(`Tickets: ${result.tickets}`);
                                }
                                
                                if (result.upgradeSequence && result.upgradeSequence.length > 0) {
                                    if (result.upgradeSequence.length === 1) {
                                        // Single upgrade with mining operation information
                                        const upgrade = result.upgradeSequence[0];
                                        info.push(`Upgrade: ${upgrade.from} → ${upgrade.to} (after mine #${upgrade.afterMineNumber})`);
                                    } else {
                                        // Multiple upgrades with mining operation information
                                        info.push(`Upgrades (${result.upgradeSequence.length}):`);
                                        result.upgradeSequence.forEach((upgrade, idx) => {
                                            info.push(`${idx + 1}. ${upgrade.from} → ${upgrade.to} (after mine #${upgrade.afterMineNumber})`);
                                        });
                                    }
                                }
                                
                                return info;                            } else {                                // Regular score point
                                let info = [`Score: ${scores[index].toLocaleString()}`];
                                
                                // Add ticket information if any
                                if (dailyResults[index].tickets && dailyResults[index].tickets > 0) {
                                    info.push(`Tickets: ${dailyResults[index].tickets}`);
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
    
    // Update daily score chart
    updateDailyScoreChart(dailyResults);
}

// Update daily score gain chart
function updateDailyScoreChart(dailyResults) {
    // Extract data for chart
    const days = dailyResults.map(result => `Day ${result.day}`);
    const dailyScores = dailyResults.map(result => result.scoreGained);    // Create upgrade markers
    const upgradePoints = dailyResults.map((result, index) => 
        result.upgrade ? dailyScores[index] : null
    );
    
    // Create ticket markers
    const ticketPoints = dailyResults.map((result, index) => 
        (result.tickets && result.tickets > 0) ? dailyScores[index] : null
    );
    
    // Destroy existing chart if it exists
    if (dailyScoreChart !== null) {
        dailyScoreChart.destroy();
    }
    
    // Create new chart
    dailyScoreChart = new Chart(dailyScoreCtx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Daily Score Gain',
                    data: dailyScores,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Upgrade Days',                    data: upgradePoints,                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Ticket Days',
                    data: ticketPoints,
                    backgroundColor: 'rgba(255, 193, 7, 0.6)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
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
                        text: 'Daily Score'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const datasetIndex = context.datasetIndex;
                            
                            if (datasetIndex === 0) {
                                // Regular score point
                                let info = [`Score: ${dailyScores[index].toLocaleString()}`];
                                
                                // Add mines info if available
                                if (dailyResults[index].hasOwnProperty('actualMines')) {
                                    const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
                                    info.push(`Mines: ${dailyResults[index].actualMines}/${minesPerDay}`);
                                }
                                
                                return info;                            } else if (datasetIndex === 1 && upgradePoints[index] !== null) {
                                // For upgrade days                                const result = dailyResults[index];
                                let info = [`Score: ${dailyScores[index].toLocaleString()}`];
                                
                                // Add ticket information
                                if (result.tickets && result.tickets > 0) {
                                    info.push(`Tickets: ${result.tickets}`);
                                }
                                
                                if (result.upgradeSequence && result.upgradeSequence.length > 0) {
                                    if (result.upgradeSequence.length === 1) {
                                        // Single upgrade
                                        const upgrade = result.upgradeSequence[0];
                                        info.push(`Upgrade: ${upgrade.from} → ${upgrade.to} (after mine #${upgrade.afterMineNumber})`);
                                    } else {
                                        // Multiple upgrades
                                        info.push(`Upgrades (${result.upgradeSequence.length}):`);
                                        result.upgradeSequence.forEach((upgrade, idx) => {
                                            info.push(`${idx + 1}. ${upgrade.from} → ${upgrade.to} (after mine #${upgrade.afterMineNumber})`);
                                        });
                                    }
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

// Function to export results to CSV
function exportResultsToCSV(dailyResults) {
    if (!dailyResults || dailyResults.length === 0) {
        alert('No data to export');
        return;
    }    // Create CSV header
    let csvContent = "Day,Glove Type,Score Gained,Total Score,Deposit Zone,Upgrade,Upgrade Sequence,Mines Used,Tickets Found,Ticket Details\n";
    
    // Add data rows
    dailyResults.forEach(result => {
        // Format upgrade sequence
        let upgradeSequenceText = '';
        if (result.upgradeSequence && result.upgradeSequence.length > 0) {
            upgradeSequenceText = result.upgradeSequence.map(u => 
                `${u.from} → ${u.to} (after mine #${u.afterMineNumber}, score: ${u.totalScore})`
            ).join('; ');
        }
        
        // Format ticket details
        let ticketDetailsText = '';
        if (result.ticketDetails && result.ticketDetails.length > 0) {
            ticketDetailsText = result.ticketDetails.map(ticket => 
                `Ticket at mine #${ticket.mineNumber} (${ticket.rarity})`
            ).join('; ');
        }
        
        const row = [
            result.day,
            `"${result.gloveType}"`,
            result.scoreGained,
            result.totalScore,
            `"${result.zone}"`,
            result.upgrade ? 'Yes' : 'No',
            `"${upgradeSequenceText}"`,
            result.actualMines || 0,
            result.tickets || 0,
            `"${ticketDetailsText}"`
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ROGemPick_Results.csv');
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Function to run multiple simulations and calculate average results
async function runMultipleSimulations(numberOfRuns = 50) {
    // Show loading spinner
    document.getElementById('spinner-overlay').style.display = 'flex';
    document.getElementById('spinner-overlay').querySelector('p').textContent = `Running ${numberOfRuns} Simulations...`;
    
    // Use setTimeout to allow UI to update before starting simulations
    setTimeout(async () => {
        try {
            const startingGlove = gloveTypeSelect.value;
            const days = parseInt(daysInput.value, 10);
            const minesPerDay = parseInt(minesPerDayInput.value, 10) || DEFAULT_MINES_PER_DAY;
            
            console.log(`Starting ${numberOfRuns} simulations with:`, { startingGlove, days, minesPerDay });
            
            // Store results from all simulations
            const allResults = [];
            
            // Run simulations
            for (let i = 0; i < numberOfRuns; i++) {
                // Update spinner text to show progress
                document.getElementById('spinner-overlay').querySelector('p').textContent = 
                    `Running Simulation ${i+1}/${numberOfRuns}...`;
                
                // Run a single simulation
                const result = await runSingleSimulation(startingGlove, days, minesPerDay);
                allResults.push(result);
                
                // Small delay to allow UI updates
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Process and display results
            processSimulationResults(allResults);
            
            // Hide loading spinner
            document.getElementById('spinner-overlay').style.display = 'none';
            
        } catch (error) {
            console.error('Simulation error:', error);
            alert('An error occurred during simulation: ' + error.message);
            document.getElementById('spinner-overlay').style.display = 'none';
        }
    }, 100);
}

// Function to run a single simulation
async function runSingleSimulation(startingGlove, days, minesPerDay) {
    // Create a copy of the starting values to avoid interference with UI
    let currentGlove = startingGlove;
    let totalScore = 0;
    let dailyResults = [];
    
    // Calculate progression for each day
    for (let day = 1; day <= days; day++) {
        // Find the best deposit zone for current total score
        const bestZone = findBestDepositZone(totalScore);
        
        // Simulate actual mining operations for this day
        let dailyScore = 0;
        let upgradesInDay = [];
        
        // We'll check for upgrades after each mining operation
        for (let i = 0; i < minesPerDay; i++) {
            // Perform a single mining operation
            const miningResult = performMining(currentGlove, bestZone);
            dailyScore += miningResult.score;
            totalScore += miningResult.score;
            
            // Track tickets found during mining
            if (miningResult.hasTicket) {
                // Initialize ticket tracking if not already done
                if (!upgradesInDay.tickets) {
                    upgradesInDay.tickets = [];
                }
                
                upgradesInDay.tickets.push({
                    mineNumber: i + 1,
                    ticketName: miningResult.ticketName,
                    rarity: miningResult.rarity
                });
            }
            
            // Check if we can upgrade after this mining operation
            let keepUpgrading = true;
            let tempCurrentGlove = currentGlove;
            
            while (keepUpgrading) {
                const upgrade = findNextUpgrade(tempCurrentGlove, totalScore, startingGlove);
                
                if (upgrade) {
                    upgradesInDay.push({
                        from: tempCurrentGlove,
                        to: upgrade.to,
                        afterMineNumber: i + 1,
                        totalScore: Math.round(totalScore)
                    });
                    
                    // Update current glove for future mining operations
                    tempCurrentGlove = upgrade.to;
                    currentGlove = upgrade.to;
                } else {
                    keepUpgrading = false;
                }
            }
        }
        
        // Count tickets
        const ticketsFound = upgradesInDay.tickets ? upgradesInDay.tickets.length : 0;
        
        // Calculate total tickets so far
        const previousTotalTickets = dailyResults.length > 0 
            ? dailyResults[dailyResults.length - 1].totalTickets 
            : 0;
        const totalTickets = previousTotalTickets + ticketsFound;
        
        // Store daily results - capturing all glove changes
        dailyResults.push({
            day,
            gloveType: currentGlove,
            scoreGained: Math.round(dailyScore),
            totalScore: Math.round(totalScore),
            tickets: ticketsFound,
            totalTickets: totalTickets,
            upgradeCount: upgradesInDay.length
        });
    }
    
    // Return final simulation results
    return {
        startGlove: startingGlove,
        endGlove: currentGlove,
        finalScore: Math.round(totalScore),
        totalUpgrades: dailyResults.reduce((total, day) => total + day.upgradeCount, 0),
        totalTickets: dailyResults.length > 0 ? dailyResults[dailyResults.length - 1].totalTickets : 0,
        dailyResults: dailyResults
    };
}

// Function to process and display simulation results
function processSimulationResults(allResults) {
    console.log(`Processing ${allResults.length} simulation results`);
    
    // Calculate statistics
    const stats = {
        finalScore: calculateStats(allResults.map(r => r.finalScore)),
        totalUpgrades: calculateStats(allResults.map(r => r.totalUpgrades)),
        totalTickets: calculateStats(allResults.map(r => r.totalTickets)),
        endGloves: {}
    };
    
    // Count occurrences of each end glove type
    allResults.forEach(result => {
        if (!stats.endGloves[result.endGlove]) {
            stats.endGloves[result.endGlove] = 0;
        }
        stats.endGloves[result.endGlove]++;
    });
    
    // Sort end gloves by frequency
    const sortedEndGloves = Object.entries(stats.endGloves)
        .sort((a, b) => b[1] - a[1])
        .map(([glove, count]) => ({
            glove,
            count,
            percentage: (count / allResults.length * 100).toFixed(1) + '%'
        }));
    
    // Find most common end glove
    const mostCommonEndGlove = sortedEndGloves.length > 0 ? sortedEndGloves[0] : null;
    
    // Display results in the simulation summary table
    const summaryTable = document.getElementById('simulationSummaryTable');
    summaryTable.innerHTML = '';
    
    // Add rows for each metric
    addSimulationRow(summaryTable, 'Final Score', stats.finalScore);
    addSimulationRow(summaryTable, 'Total Upgrades', stats.totalUpgrades);
    addSimulationRow(summaryTable, 'Total Tickets', stats.totalTickets);
    
    // Add most common end glove
    if (mostCommonEndGlove) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Most Common End Glove</td>
            <td colspan="3">${mostCommonEndGlove.glove} (${mostCommonEndGlove.percentage})</td>
        `;
        summaryTable.appendChild(row);
    }
    
    // Add all end gloves
    const endGlovesRow = document.createElement('tr');
    endGlovesRow.innerHTML = `
        <td>End Glove Distribution</td>
        <td colspan="3">
            ${sortedEndGloves.map(g => `${g.glove}: ${g.count} (${g.percentage})`).join('<br>')}
        </td>
    `;
    summaryTable.appendChild(endGlovesRow);
    
    // Show the simulation summary container
    document.getElementById('simulationSummaryContainer').style.display = 'block';
}

// Helper function to calculate statistics (avg, min, max)
function calculateStats(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max };
}

// Helper function to add a row to the simulation summary table
function addSimulationRow(table, metricName, stats) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${metricName}</td>
        <td>${Math.round(stats.avg).toLocaleString()}</td>
        <td>${stats.min.toLocaleString()}</td>
        <td>${stats.max.toLocaleString()}</td>
    `;
    table.appendChild(row);
}

// Event listeners
calculateBtn.addEventListener('click', calculateGloveProgression);
gloveTypeSelect.addEventListener('change', calculateGloveProgression);
daysInput.addEventListener('change', calculateGloveProgression);
minesPerDayInput.addEventListener('change', calculateGloveProgression);

// Add simulation button event listener
document.getElementById('simulateBtn').addEventListener('click', function() {
    runMultipleSimulations(50);
});

// Add export button event listener
document.getElementById('exportBtn').addEventListener('click', function() {
    // Get the current dailyResults from the last calculation
    const progressTable = document.getElementById('progressTable');
    if (!progressTable.children.length) {
        alert('No data to export. Please calculate first.');
        return;
    }
    
    // Use the global dailyResults that was last calculated
    // This ensures we have all the detailed upgrade information
    if (window.lastCalculatedResults && window.lastCalculatedResults.length > 0) {
        exportResultsToCSV(window.lastCalculatedResults);
    } else {
        alert('No calculation data available. Please calculate first.');
    }
});

// Initialize with default values and load data
window.addEventListener('DOMContentLoaded', () => {    // Set default values
    gloveTypeSelect.value = 'Glove Pick I (Normal)';
    daysInput.value = 7;
    minesPerDayInput.value = 10;
    
    // Disable calculate button until data is loaded
    calculateBtn.disabled = true;
    
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Make sure spinner is hidden initially
    document.getElementById('spinner-overlay').style.display = 'none';
    
    // Load JSON data
    loadAllData().then(() => {
        // Initial calculation
        calculateGloveProgression();
    });
});
