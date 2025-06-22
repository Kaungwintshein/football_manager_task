# API Key Setup Guide

## BallDontLie API Configuration

This application requires an API key to fetch teams data from the BallDontLie API.

### In-App Settings

1. Log into the application
2. Navigate to the "Settings" tab
3. Enter your API key in the provided field
4. Click "Save API Key"

### Getting Your API Key

1. Visit [BallDontLie API](https://www.balldontlie.io/)
2. Sign up for an account
3. Generate an API key from your dashboard
4. Copy the key and use it in the application

### API Endpoints Used

- **Teams**: `GET https://api.balldontlie.io/epl/v1/teams?season=2024`
- **Team Players**: `GET https://api.balldontlie.io/epl/v1/teams/:id/players?season=2024`
- **All Players**: `GET https://www.balldontlie.io/api/v1/players`

### Features

- **API Teams**: Fetched from BallDontLie API with authentication
- **Team Players**: View players for each specific team
- **Local Teams**: Create and manage your own teams
- **Player Management**: Add players from the global pool to local teams

### Security Notes

- API keys are stored locally in localStorage
- Keys are never sent to our servers
- Use environment variables for production deployments
