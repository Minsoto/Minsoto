import multiprocessing
import os

# Gunicorn configuration tailored for the production environment

# Bind to the standard port
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Worker processes and threads
# Formula: (2 x $num_cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1
threads = 4

# Maximum number of pending connections
backlog = 2048

# Workers silent for more than this many seconds are killed and restarted
timeout = 120

# Application configuration
wsgi_app = "minsoto_backend.wsgi:application"

# Logging functionality
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Preload application code before the worker processes are forked
preload_app = True
