Markdown

# 🚀 NOHASub — Digital Utility & VTU Platform

NOHASub is a Nigerian VTU monorepo with:

- **Frontend:** React + Vite + Tailwind CSS + Lucide icons
- **Backend:** Django 6 + Django REST Framework + Token auth + SQLite (local demo)

This repository is a **monorepo**:

```text
.
├── backend/          # Django API
├── src/              # React frontend (Vite root)
├── package.json
├── README.md
└── ...
If your frontend lives at repo root (not inside /frontend), use the commands below as written.
If you renamed the React app folder to frontend/, run frontend commands from frontend/ instead.

Features
User registration/login (DRF Token)
Wallet + virtual accounts (Moniepoint/Wema demo)
Airtime, Data, Cable TV, Electricity (mock fulfillment)
Transaction history + receipt download/share (PNG/PDF)
Profile (photo optional, username, PIN, password)
Reseller upgrade (wallet debit + PIN)
Dark mode + mobile-friendly dashboard shell
Demo CLI tools: seed catalogs + fund wallet
Requirements
Node.js 20+ recommended
Python 3.12+ / 3.14 OK (project tested with Django 6.1)
Git
Windows PowerShell, macOS/Linux terminal
1) Clone / pull
PowerShell

git pull origin main
2) Backend setup (Django API)
PowerShell

cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_services
python manage.py runserver
Backend URL: http://127.0.0.1:8000

Important demo commands
Seed Data / Cable / Electricity catalogs
PowerShell

python manage.py seed_services
Without this, Data/Cable/Electricity dropdowns will be empty on a fresh database.

Fund a demo wallet (no real bank transfer needed)
PowerShell

python manage.py fund_wallet YOUR_USERNAME 5000
Example:

PowerShell

python manage.py fund_wallet hope 5000
3) Frontend setup (React + Vite + Tailwind)
Open a new terminal at the repository root (where package.json is):

PowerShell

npm install
npm run dev
Frontend URL: http://localhost:5173

4) First test flow (partner checklist)
Start backend (runserver)
Start frontend (npm run dev)
Register a new account on the website
In backend terminal (venv active):
PowerShell

python manage.py seed_services
python manage.py fund_wallet YOUR_USERNAME 5000
Refresh the app
Test:
Wallet virtual accounts
Buy Airtime
Buy Data
Cable subscription
Electricity prepaid token
History + receipt download
Profile photo/PIN/password
Reseller upgrade (needs ≥ ₦1,000)
5) API overview (local)
Base URL: http://127.0.0.1:8000/api/auth/

Method	Endpoint	Auth	Purpose
POST	/register/	No	Create account + token
POST	/login/	No	Login + token
GET	/wallet/	Yes	Balance + virtual accounts
POST	/webhook/fund/	No (demo)	Simulate bank funding webhook
POST	/airtime/buy/	Yes	Buy airtime
GET	/data/plans/	Yes	Data catalog
POST	/data/buy/	Yes	Buy data
GET	/cable/plans/	Yes	Cable catalog
POST	/cable/buy/	Yes	Buy cable
GET	/electricity/providers/	Yes	DisCo list
POST	/electricity/buy/	Yes	Pay electricity
GET	/transactions/history/	Yes	Ledger history
GET/PATCH	/profile/	Yes	Profile read/update
POST	/profile/change-pin/	Yes	Change transaction PIN
POST	/profile/change-password/	Yes	Change login password
POST/DELETE	/profile/picture/	Yes	Upload/remove avatar
POST	/profile/upgrade/	Yes	Upgrade to Reseller (₦1,000)
Auth header format:

text

Authorization: Token <your_token_here>
6) Demo vs production
Current demo mode
Wallet funding via CLI / mock webhook
VTU fulfillment is simulated (provider_success = True)
SQLite database for local development
Media files stored locally in backend/media/ (not in Git)
To go live later
Host frontend (Vercel/Netlify)
Host backend (Render/Railway)
Use PostgreSQL instead of SQLite
Connect real payment provider (Monnify/Paystack) for virtual accounts
Connect real VTU provider (VTPass/ClubKonnect/etc.)
Add domain + HTTPS + hardened secrets
7) Common issues
ModuleNotFoundError: rest_framework
Virtualenv not active or dependencies not installed:

PowerShell

cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Data/Cable/Electricity empty or “Failed to load catalog”
Fresh DB has no seeded services:

PowerShell

python manage.py seed_services
Also ensure you are logged in (401 means token missing/invalid).

Unauthorized 401 on wallet/profile
Old token in browser from a previous database.
Fix: logout/login or register a new user.

Profile image 404 (/media/profile_pictures/...)
Normal on new machines. Media files are local and not committed. Re-upload photo in Profile.

Frontend cannot reach backend
Backend must be running on port 8000
CORS is enabled for local demo
Frontend API base URL is http://localhost:8000/api in src/api/axios.js
8) Useful developer commands
Backend
PowerShell

cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_services
python manage.py fund_wallet username 5000
python manage.py runserver
python manage.py createsuperuser
Frontend
PowerShell

npm install
npm run dev
npm run build
Git
PowerShell

git pull
git add .
git commit -m "Your message"
git push origin main
9) Project roles (suggested)
Partner A (Frontend focus): UI pages, Tailwind, mobile UX
Partner B (Backend focus): APIs, ledger, providers, deployment
Shared rule: pull before coding, push small commits, test with seed_services + fund_wallet
10) Security notes (demo)
Do not commit .env secrets
Do not commit venv/, node_modules/, db.sqlite3, or media/
Transaction PIN and login password are hashed
Upgrade/reseller actions require PIN confirmation
© NOHASub — Built for learning, collaboration, and real-world fintech architecture.
