# 1capital
# setuprepo1cap

This repository contains a Django backend and a Vite+React frontend located in the `frontend/` folder. The React app is configured to work with the Django API and can be served by Django in production.

Quick start (development):

1. Start the Django backend
   - python -m venv .venv
   - source .venv/bin/activate
   - pip install -r requirements.txt
   - python manage.py migrate
   - python manage.py createsuperuser (optional)
   - python manage.py runserver

2. Start the React frontend (dev server with proxy to Django):
   - cd frontend
   - npm install
   - npm run dev
   - Open http://localhost:5173 (requests to /api/* will be proxied to http://127.0.0.1:8000)

Production build and serve via Django:

- cd frontend && npm run build
- python manage.py collectstatic --noinput
- python manage.py runserver 0.0.0.0:8000
- Visit http://127.0.0.1:8000/app/ to open the SPA served by Django

Notes:
- The frontend build step includes a postbuild script that copies the generated main JS/CSS into `dist/assets/index.js` and `dist/assets/index.css` so the Django template `core/templates/spa_index.html` can reference them via `{% static 'assets/index.js' %}`.
- Existing Django template routes (e.g., `/mutual-funds/`, `/pms-aif/`) still work. The React app provides equivalent routes under `/app/` (e.g., `/app/mf`, `/app/pms`) during migration.
