# ROGemPick Calculator

A web-based calculator for ROGemPick event progression, helping players plan their glove upgrades and mining strategy.

## Features

- Select starting glove type
- Input number of days to play the event
- Configure mines per day
- View progression details:
  - Daily score acquisition
  - Glove upgrades during mining operations
  - Best mining zones for each day
- Interactive charts showing:
  - Total score progression and upgrade points
  - Daily score gains with upgrade indicators
- Detailed table with daily progress information including when upgrades occur
- Export results to CSV for further analysis
- Calculate total mines used throughout the event

## Data Structure

The application uses three JSON data files:

- `Glove.json`: Contains information about different glove types and their gem drop rates
- `Mine.json`: Contains information about different deposit zones and their score values
- `Upgrade.json`: Contains information about glove upgrade requirements

## How It Works

1. The calculator uses the starting glove type and simulates mining operations each day
2. It automatically selects the best deposit zone based on your current score
3. After each mining operation, it checks if enough score is accumulated for an upgrade
4. If an upgrade is available, it immediately applies the upgrade to subsequent mining operations
5. The process continues for the specified number of days
6. Results are displayed in charts and a detailed table
7. Color coding helps identify upgrade days (green)
8. Tooltips provide detailed information about when upgrades occurred during mining

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla)
- Bootstrap 5 for responsive layout and styling
- Chart.js for data visualization
- Bootstrap Icons for enhanced UI

## Getting Started

1. Clone this repository
   ```
   git clone https://github.com/valkyrie2/ROGemPick.git
   ```
2. Open `index.html` in your browser
3. Select a starting glove type and number of days
4. Configure mines per day
5. Click "Calculate" to see the results
6. Use the "Export Results" button to download the data as CSV

## Live Demo

This project is deployed on GitHub Pages. You can access it at: https://valkyrie2.github.io/ROGemPick/

## CI/CD

This project uses GitHub Actions for continuous integration and deployment to GitHub Pages. The workflow is defined in `.github/workflows/deploy.yml`. Any push to the main branch will automatically trigger a deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests.

This project is deployed on GitHub Pages. You can access it at: https://valkyrie2.github.io/ROGemPick/

## CI/CD

This project uses GitHub Actions for continuous integration and deployment to GitHub Pages. The workflow is defined in `.github/workflows/deploy.yml`. Any push to the main branch will automatically trigger a deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests.
