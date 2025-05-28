# ROGemPick Calculator

A web-based calculator for ROGemPick event progression, helping players plan their glove upgrades and mining strategy.

## Features

- Select starting glove type
- Input number of days to play the event
- View progression details:
  - Daily score acquisition
  - Glove upgrades over time
  - Best mining zones for each day
- Interactive chart showing score progression and upgrade points
- Detailed table with daily progress information

## Data Structure

The application uses three JSON data files:

- `Glove.json`: Contains information about different glove types and their gem drop rates
- `Mine.json`: Contains information about different deposit zones and their score values
- `Upgrade.json`: Contains information about glove upgrade requirements

## How It Works

1. The calculator uses the starting glove type and simulates mining operations each day
2. It automatically selects the best deposit zone based on your current score
3. When enough score is accumulated for an upgrade, it applies the upgrade immediately
4. The process continues for the specified number of days
5. Results are displayed in a chart and detailed table

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla)
- Bootstrap 5 for responsive layout and styling
- Chart.js for data visualization

## Getting Started

1. Clone this repository
   ```
   git clone https://github.com/valkyrie2/ROGemPick.git
   ```
2. Open `index.html` in your browser
3. Select a starting glove type and number of days
4. Click "Calculate" to see the results

## Live Demo

This project is deployed on GitHub Pages. You can access it at: https://valkyrie2.github.io/ROGemPick/

## CI/CD

This project uses GitHub Actions for continuous integration and deployment to GitHub Pages. The workflow is defined in `.github/workflows/deploy.yml`. Any push to the main branch will automatically trigger a deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests.
