# Medical Report Generation System

A full-stack application for generating medical reports from images using AI.

## Features

- Medical image analysis using Google's Gemini AI
- Report generation in multiple languages
- PDF and Word document export
- User authentication and authorization
- Secure API endpoints
- Modern React frontend

## Tech Stack

### Backend

- Django
- Django REST Framework
- Google Gemini AI
- ReportLab (PDF generation)
- python-docx (Word document generation)

### Frontend

- React
- Material-UI
- Axios
- React Router

## Setup Instructions

### Backend Setup

1. Create a virtual environment:

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
   Create a `.env` file in the backend directory with:

```
GOOGLE_AI_API_KEY=your_api_key_here
SECRET_KEY=your_django_secret_key
DEBUG=True
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Start the development server:

```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm start
```

## API Endpoints

- `POST /api/reports/generate/` - Generate a new medical report
- `GET /api/reports/` - List all reports for authenticated user
- `GET /api/reports/{id}/` - Get specific report details

## Security

- JWT authentication
- CORS configuration
- Secure file handling
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
