# passwordcards

[![Latest Version](https://img.shields.io/github/release/raphiz/passwordcards.svg?style=flat-square)](https://github.com/raphiz/passwordcards/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![wercker status](https://app.wercker.com/status/6bb146084db30e23f4d09b20a32ac058/s "wercker status")](https://app.wercker.com/project/bykey/6bb146084db30e23f4d09b20a32ac058)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/raphiz/passwordcards/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/raphiz/passwordcards/?branch=master)
[![Code Climate](https://codeclimate.com/github/raphiz/passwordcards/badges/gpa.svg)](https://codeclimate.com/github/raphiz/passwordcards)
[![Test Coverage](https://codeclimate.com/github/raphiz/passwordcards/badges/coverage.svg)](https://codeclimate.com/github/raphiz/passwordcards)
[![Dependency Status](https://www.versioneye.com/user/projects/5506fc2766e561bb9b00016e/badge.svg?style=flat)](https://www.versioneye.com/user/projects/5506fc2766e561bb9b00016e)
[![SensioLabsInsight](https://insight.sensiolabs.com/projects/6152eda9-0cd1-41a3-84fb-9601d0996a86/mini.png)](https://insight.sensiolabs.com/projects/6152eda9-0cd1-41a3-84fb-9601d0996a86)

This tool allows you to generate customized password cards in the spirit of Qwertycards.com.

If you like the concept, please buy a card from their website.

## Docker Deployment

This application can be deployed using Docker and docker-compose. 

### Environment Configuration

The application supports several environment variables for configuration. You can set these in a `.env` file or directly in `docker-compose.yml`.

#### Creating a .env File

Copy the example configuration:

```bash
cp .env.example .env
```

Then edit `.env` to customize the values:

```bash
# Apache .htaccess mode: 'dev' for development, 'prod' for production
HTACCESS_MODE=dev

# Bypass password for rate limiting
BYPASS_PASSWORD=letmein

# Card generation limit (number of cards before timeout)
CARD_GENERATION_LIMIT=5

# Card generation timeout (in seconds)
CARD_GENERATION_TIMEOUT=300
```

#### Environment Variables

- **`HTACCESS_MODE`** (default: `dev`): Controls Apache .htaccess configuration
  - `dev`: Relaxed rules for local development (no HTTPS, no path restrictions)
  - `prod`: Strict security rules for production (HTTPS enforced, HSTS enabled, path restrictions)

- **`BYPASS_PASSWORD`** (default: `letmein`): Password to bypass rate limiting
  - When users hit the rate limit, they can enter this password to continue generating cards immediately

- **`CARD_GENERATION_LIMIT`** (default: `5`): Number of cards that can be generated before rate limiting kicks in

- **`CARD_GENERATION_TIMEOUT`** (default: `300`): Time in seconds users must wait after hitting the rate limit (300 = 5 minutes)

### Rate Limiting & Bypass

The application includes rate limiting to prevent spam:
- Users can generate up to `CARD_GENERATION_LIMIT` cards (default: 5)
- After reaching the limit, they must wait `CARD_GENERATION_TIMEOUT` seconds (default: 5 minutes)
- Users can bypass the wait by entering the `BYPASS_PASSWORD` when prompted

### Usage

#### Local Development

For local development, use the default `dev` mode:

```bash
docker-compose up -d
```

Or explicitly set it in `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - HTACCESS_MODE=dev
```

Access the application at: http://localhost:8080

#### Production Deployment

For production, set `HTACCESS_MODE=prod`:

```yaml
services:
  web:
    environment:
      - HTACCESS_MODE=prod
```

Or via command line:

```bash
HTACCESS_MODE=prod docker-compose up -d
```

Alternatively, you can create a `.env` file:

```bash
echo "HTACCESS_MODE=prod" > .env
docker-compose up -d
```

**Important**: When using production mode, ensure:
- Your domain has a valid SSL certificate configured
- Your reverse proxy or load balancer handles HTTPS termination, OR
- Apache is configured with SSL certificates

### Recommendations

- **Always use `prod` mode for internet-facing deployments** to ensure proper security
- **Use `dev` mode only for local development** where HTTPS is not configured
- **Change the default `BYPASS_PASSWORD`** in production to a secure value
- The mode can be changed at any time by updating the environment variable and restarting the container

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email mister.norbert ät gmail.com instead of using the issue tracker.


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
