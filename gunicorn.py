# Gunicorn configuration settings.

bind = ":8080"
workers = 2
# Give workers an expiry:
max_requests = 2048
max_requests_jitter = 256
preload_app = True
# Disable access logging.
accesslog = None
