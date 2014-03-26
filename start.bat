set PYTHONPATH=.\;.\app
set PYTHONDONTWRITEBYTECODE=True

call env\Scripts\activate.bat
python -B app\www\mblog.py
deactivate
