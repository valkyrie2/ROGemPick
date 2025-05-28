# ROGemPick Calculator

A simple web-based calculator for analyzing and comparing different gem types and quantities.

## Features

- Select different gem types from a dropdown menu
- Input quantity of gems (minimum 0)
- View gem statistics in three separate tables:
  - Gem Stats: Basic properties of the selected gem
  - Resource Requirements: Resources needed to craft the gems
  - Total Output: Calculated metrics like total power and efficiency
- Interactive data visualization with Chart.js
- Bulk crafting bonuses and discounts
- Responsive design for mobile and desktop

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
3. Select a gem type and quantity
4. Click "Calculate" to see the results

## Live Demo

This project is deployed on GitHub Pages. You can access it at: https://valkyrie2.github.io/ROGemPick/

## GitHub Pages Setup

To set up GitHub Pages for your fork of this project:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions" 
5. The site will be automatically deployed using the workflow in `.github/workflows/deploy.yml`

## CI/CD

This project uses GitHub Actions for continuous integration and deployment to GitHub Pages. The workflow is defined in `.github/workflows/deploy.yml`. Any push to the main branch will automatically trigger a deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests.
