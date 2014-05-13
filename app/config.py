import os

#
# Blog Settings
# Configure the specifics of your blog here.
#
BLOG_TITLE = ""
BLOG_TAGLINE = ""
POSTS_PER_PAGE = 5
CODE_LINE_NUMBERS = False

HASH_KEY_1 = ""
HASH_KEY_2 = ""
ENCRYPTION_KEY = ""
ENCRYPTION_IV = ""



#
# Environment Configuration
# The primary changes you would make here would be
# the ENV variable, as well as the specific
# environment settings, such as port and IP bindings.
#
ROOT_PATH          = os.path.abspath(os.path.dirname(__file__))
APP_PATH           = ROOT_PATH
WWW_PATH           = os.path.join(APP_PATH, "www")
CONTROLLER_PATH    = os.path.join(WWW_PATH, "controllers")
STATIC_PATH        = os.path.join(WWW_PATH, "static")
BASE_TEMPLATE_PATH = os.path.join(WWW_PATH, "views")
THEME_PATH         = os.path.join(WWW_PATH, "themes")
SESSION_PATH       = os.path.join(WWW_PATH, "sessions")
UPLOAD_PATH        = os.path.join(WWW_PATH, "uploads")
TIMEZONE           = "UTC"

ENVIRONMENT = {
	"DOMAIN": "localhost",
	"BIND_TO_HOST": "localhost",
	"BIND_TO_PORT": 8080,
	"SESSION_URL": "",
	"DB_HOST": "",
	"DB_NAME": "",
	"DB_PORT": 3306,
	"DB_USER": "",
	"DB_PASSWORD": "",
	"PROCESS_NAME": "texocms",
	"PIDFILE": "texocms-pid",
	"NUM_WORKER_PROCESSES": 4,
}

SESSION_OPTS = {
	"session.type"              : "ext:database",
	"session.url"               : ENVIRONMENT["SESSION_URL"],
	"session.cookie_expires"    : 14400,
	"session.auto"              : True,
	"session.lock_dir"          : os.path.join(SESSION_PATH, "lock"),
	"session.invalidate_corrupt": True,
}

CACHE_OPTS = {
	"cache.type"    : "ext:database",
	"cache.url"     : ENVIRONMENT["SESSION_URL"],
	"cache.lock_dir": os.path.join(SESSION_PATH, "lock"),
}