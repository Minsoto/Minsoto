# Contributing to Minsoto

First off, thank you for considering contributing to Minsoto! 🎉

## How Can I Contribute?

### Reporting Bugs
- Check if the issue already exists in GitHub Issues.
- If not, open a new issue with a clear title and description.
- Include steps to reproduce, expected behavior, and screenshots if applicable.

### Suggesting Features
- Open a GitHub Discussion or Issue with the tag `enhancement`.
- Describe the feature, its use case, and how it aligns with Minsoto's philosophy of mindful productivity.

### Pull Requests
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description.

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (or use Neon serverless)

### Frontend
```bash
cd minsoto-frontend
npm install
cp .env.local.example .env.local  # Configure your environment variables
npm run dev
```

### Backend
```bash
cd minsoto-backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
python manage.py migrate
python manage.py runserver
```

## Code Style
- **Frontend**: Follow the existing TypeScript/React patterns. Use Tailwind CSS for styling.
- **Backend**: Follow PEP 8. Use Django REST Framework conventions.

## Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests

## Code of Conduct
Please be respectful and constructive. We want Minsoto's community to be welcoming to everyone.

---

Thank you for helping make Minsoto better! 🙏
