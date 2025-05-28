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

// DOM elements
const gemTypeSelect = document.getElementById('gemType');
const quantityInput = document.getElementById('quantity');
const calculateBtn = document.getElementById('calculateBtn');

// Stats elements
const basePowerElement = document.getElementById('basePower');
const multiplierElement = document.getElementById('multiplier');
const rarityElement = document.getElementById('rarity');

// Resource elements
const goldRequiredElement = document.getElementById('goldRequired');
const dustRequiredElement = document.getElementById('dustRequired');
const crystalsRequiredElement = document.getElementById('crystalsRequired');

// Output elements
const totalPowerElement = document.getElementById('totalPower');
const costEfficiencyElement = document.getElementById('costEfficiency');
const timeToCraftElement = document.getElementById('timeToCraft');

// Chart variables
let gemComparisonChart = null;
const chartCtx = document.getElementById('gemComparisonChart').getContext('2d');

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

// Event listeners
calculateBtn.addEventListener('click', calculateGemStats);
gemTypeSelect.addEventListener('change', updateComparisonChart);
quantityInput.addEventListener('input', updateComparisonChart);

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
    
    // Calculate initial stats
    calculateGemStats();
    
    // Initialize the comparison chart
    updateComparisonChart();
});
